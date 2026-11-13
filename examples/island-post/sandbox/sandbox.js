import { bootDock } from '../dock.js';
import { freshParcel, start } from '../rules.js';

const cases = {
  pickup: [start, 'Move right to pick up the parcel.'],
  puddle: [freshParcel, 'Move right into the puddle.'],
  blocked: [{ x: 1, y: 3, parcel: 'dry' }, 'Move down toward the crate.'],
  dry: [{ x: 5, y: 3, parcel: 'dry' }, 'Move up to hand Mina a dry parcel.'],
  soaked: [{ x: 5, y: 3, parcel: 'soaked' }, 'Move up to hand Mina a soaked parcel.'],
};
const state = document.querySelector('#starting-state');
const roster = document.querySelector('#npc-roster');
const reset = document.querySelector('#reset-case');
const cue = document.querySelector('#case-cue');

bootDock({ onReady(scene) {
  function loadCase() {
    const [initial, instruction] = cases[state.value];
    roster.value = ['dry', 'soaked'].includes(state.value) ? 'mina' : '';
    scene.reset(initial);
    cue.textContent = instruction;
  }

  roster.addEventListener('change', () => {
    state.value = roster.value === 'mina' ? 'dry' : 'pickup';
    loadCase();
  });
  state.addEventListener('change', loadCase);
  reset.addEventListener('click', loadCase);
  for (const input of [state, roster, reset]) input.disabled = false;
  loadCase();
} });
