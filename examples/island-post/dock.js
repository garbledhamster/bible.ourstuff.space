import Phaser from 'phaser';
import { directions, freshParcel, move, start } from './rules.js';
import dockUrl from './assets/dock.svg';
import courierUrl from './assets/courier.svg';
import minaUrl from './assets/mina.svg';
import parcelUrl from './assets/parcel.svg';
import soakedUrl from './assets/parcel-soaked.svg';
import splashAudio from './assets/audio/puddle-splash.wav';
import dryVoice from './assets/audio/mina-dry.wav';
import soakedVoice from './assets/audio/mina-soaked.wav';
import './style.css';

const size = 96;
const position = (index) => (index + .5) * size;
const labels = { none: 'At pickup', dry: 'Dry', soaked: 'Soaked' };
const deliveryLines = {
  dry: 'Made it through the rain!',
  soaked: 'Try the lower boardwalk.',
};
const clips = {
  'puddle-splash': { url: splashAudio, volume: .65 },
  'mina-dry': { url: dryVoice, volume: .85 },
  'mina-soaked': { url: soakedVoice, volume: .85 },
};
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function bootDock({ onReady } = {}) {
  const byId = (id) => document.getElementById(id);
  const board = byId('board');
  const buttons = [...document.querySelectorAll('[data-direction]')];
  const parcelIcon = byId('parcel-icon');
  const condition = byId('parcel-condition');
  const feedback = byId('move-feedback');
  const result = byId('delivery-result');
  const resultTitle = byId('delivery-title');
  const resultMessage = byId('delivery-message');
  const resultAction = byId('delivery-action');
  const soundToggle = byId('dock-sound');
  const soundState = byId('dock-sound-state');
  const assets = { dock: dockUrl, courier: courierUrl, mina: minaUrl, parcel: parcelUrl };

  class DockScene extends Phaser.Scene {
    preload() {
      this.load.on('loaderror', (file) => {
        if (!Object.hasOwn(assets, file.key)) return;
        this.assetsFailed = true;
        feedback.textContent = 'The Dock art couldn’t load. Reload to try again.';
      });
      for (const [key, url] of Object.entries(assets)) this.load.svg(key, url);
      for (const [key, { url }] of Object.entries(clips)) this.load.audio(key, url);
    }

    create() {
      if (this.assetsFailed) return;
      this.add.image(0, 0, 'dock').setOrigin(0).setDisplaySize(672, 576);
      this.pickup = this.add.image(position(2), position(2), 'parcel').setDisplaySize(56, 56);
      this.add.image(position(5), position(2) - 12, 'mina').setDisplaySize(66, 71);
      this.add.text(position(5), position(2) + 32, 'MINA', {
        fontFamily: 'system-ui', fontStyle: 'bold', fontSize: '20px', color: '#fff5d6',
        stroke: '#493a31', strokeThickness: 6,
      }).setOrigin(.5);
      this.splash = this.add.ellipse(0, 0, 43, 25, 0xc3f1e8, .32).setStrokeStyle(4, 0xe2fff5);
      this.courier = this.add.image(0, 0, 'courier').setDisplaySize(68, 73);
      this.clips = new Map();
      for (const [key, { volume }] of Object.entries(clips)) {
        if (this.cache.audio.exists(key)) this.clips.set(key, this.sound.add(key, { volume }));
      }
      this.soundEnabled = false;
      this.reset(start);

      const input = new AbortController();
      const options = { signal: input.signal };
      soundToggle.disabled = this.clips.size === 0;
      soundToggle.addEventListener('click', async () => {
        if (this.soundEnabled) {
          this.soundEnabled = false;
          this.sound.stopAll();
        } else {
          soundToggle.disabled = true;
          soundState.textContent = 'Starting…';
          try {
            const context = this.sound.context;
            if (context && context.state !== 'running') await context.resume();
            if (input.signal.aborted) return;
            this.soundEnabled = true;
          } catch {
            if (input.signal.aborted) return;
          } finally {
            if (!input.signal.aborted) soundToggle.disabled = false;
          }
        }
        soundToggle.setAttribute('aria-pressed', String(this.soundEnabled));
        soundState.textContent = this.soundEnabled ? 'On' : 'Off';
      }, options);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.sound.stopAll();
      }, options);
      window.addEventListener('keydown', (event) => {
        const direction = event.key.startsWith('Arrow') && directions[event.key.slice(5).toLowerCase()];
        if (!direction || event.altKey || event.ctrlKey || event.metaKey ||
            event.target.closest?.('select, details[open], a')) return;
        event.preventDefault();
        if (!event.repeat) this.takeStep(direction);
      }, options);
      for (const button of buttons) {
        button.addEventListener('click', () => this.takeStep(directions[button.dataset.direction]), options);
      }
      resultAction.addEventListener('click', () => {
        this.reset(this.state.delivery === 'soaked' ? freshParcel : start);
        board.focus({ preventScroll: true });
      }, options);
      this.events.once('shutdown', () => {
        input.abort();
        this.sound.stopAll();
        for (const clip of this.clips.values()) clip.destroy();
        soundToggle.disabled = true;
        soundToggle.setAttribute('aria-pressed', 'false');
        soundState.textContent = 'Off';
      });
      onReady?.(this);
    }

    reset(state) {
      this.sound.stopAll();
      this.tweens.killTweensOf([this.courier, this.splash]);
      this.splashTimer?.remove();
      this.splash.setVisible(false);
      board.dataset.splash = 'hidden';
      this.state = { ...state };
      this.courier.setPosition(position(state.x), position(state.y));
      feedback.textContent = state.parcel === 'none' ? 'Collect your parcel.' : 'Choose a route.';
      this.renderStatus();
    }

    takeStep(direction) {
      if (this.state.delivery) return;
      const [dx, dy] = direction;
      const { state, cue } = move(this.state, direction);
      this.state = state;
      this.tweens.killTweensOf(this.courier);
      const x = position(state.x);
      const y = position(state.y) + (state.delivery ? 17 : 0);
      const targetX = x + (state.delivery ? -43 : 0);
      if (dx) this.courier.setFlipX(dx < 0);
      if (reducedMotion) this.courier.setPosition(targetX, y);
      else if (cue === 'blocked') {
        this.courier.setPosition(x, y);
        this.tweens.add({ targets: this.courier, x: x + dx * 9, y: y + dy * 9, yoyo: true, duration: 65 });
      } else this.tweens.add({ targets: this.courier, x: targetX, y, duration: 125, ease: 'Sine.Out' });

      if (cue === 'splash') {
        this.showSplash(x, y);
        this.playCue('puddle-splash');
      }
      if (cue) {
        feedback.textContent = { blocked: 'Path blocked', pickup: 'Parcel picked up', splash: 'Splash. Parcel soaked.' }[cue];
      } else feedback.textContent = '';
      this.renderStatus();
      if (state.delivery) {
        this.playCue(`mina-${state.delivery}`);
        resultAction.focus({ preventScroll: true });
      }
    }

    playCue(key) {
      const ready = this.sound.context ? this.sound.context.state === 'running' : !this.sound.locked;
      if (this.soundEnabled && ready && !document.hidden) this.clips.get(key)?.play();
    }

    renderStatus() {
      const { x, y, parcel, delivery } = this.state;
      this.pickup.setVisible(parcel === 'none');
      Object.assign(board.dataset, { column: x, row: y, parcel, delivery: delivery ?? '' });
      parcelIcon.src = parcel === 'soaked' ? soakedUrl : parcelUrl;
      condition.textContent = labels[parcel];
      for (const button of buttons) button.disabled = Boolean(delivery);
      result.hidden = !delivery;
      if (delivery) {
        result.dataset.outcome = delivery;
        resultTitle.textContent = delivery === 'dry' ? 'Delivered dry' : 'Parcel soaked';
        resultMessage.textContent = `Mina: “${deliveryLines[delivery]}”`;
        resultAction.textContent = delivery === 'dry' ? 'Play Again' : 'Retry';
      }
    }

    showSplash(x, y) {
      this.tweens.killTweensOf(this.splash);
      this.splash.setPosition(x, y + 14).setVisible(true).setScale(1).setAlpha(1);
      board.dataset.splash = 'visible';
      const hide = () => {
        this.splash.setVisible(false);
        board.dataset.splash = 'hidden';
      };
      if (reducedMotion) this.splashTimer = this.time.delayedCall(400, hide);
      else this.tweens.add({ targets: this.splash, scale: 2, alpha: 0, duration: 500, onComplete: hide });
    }
  }

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: board,
    backgroundColor: '#315756',
    input: { keyboard: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 672, height: 576 },
    scene: DockScene,
  });
}
