# Dock 1.0 verification record

[Back to the Island Post case study](../island-post-example.md)

## Sandbox cases

**Target:** Static Dock 1.0 showcase. **Inputs:** Desktop Chrome keyboard and iPhone 13 emulated touch. Open the [Sandbox](../../island-post/sandbox/) and choose a start.

| Case | Action | Observed on both inputs |
| --- | --- | --- |
| Pickup | Move right | The courier collects a dry parcel. |
| Puddle | Move right | The parcel becomes soaked and the splash appears. |
| Blocked move | Move down toward the crate | The courier stays in place and the parcel condition holds. |
| Dry handoff | Move up toward Mina | Mina accepts the dry parcel and offers Play Again. |
| Soaked handoff and Retry | Move up toward Mina, then activate Retry | Mina’s response and Retry appear in the same row. Retry returns the courier to the fork with a fresh parcel and returns focus to the board. |
| Reset | Press Reset after each action | The original position and parcel condition return, with the delivery cleared. |
| Mina roster | Select Mina; play the dry and soaked starts | Both handoffs can be reached with the player controls. |

[Sandbox capture](evidence/dock-sandbox.webp) · [Grayscale capture](evidence/sandbox-grayscale.webp)

## Interface art check

On November 13, 2026, the production build passed the Dock and Sandbox checks in desktop Chrome with keyboard and Chrome’s iPhone 13 emulation with touch. The direction art loaded, the parcel HUD switched to the soaked frame after the puddle, and Mina’s soaked response showed the brass Retry button. Retry restored a dry parcel and returned focus to the board. The dry route and Play Again still worked. The Sandbox could repeat the soaked handoff and Reset. The phone view fit its 390 CSS pixel viewport. [Desktop Dock](evidence/ui-dock.jpg) · [Phone Retry](evidence/ui-phone-retry.jpg)

First-time player discovery and physical phone testing remain open.

## Audio cues

Turn **Sound** on in the [player demo](../../island-post/) or the [Sandbox](../../island-post/sandbox/). Both open with sound off. In the Sandbox, choose the start that matches the cue, then use the real movement controls. Reset brings back the starting parcel and stops the current sound.

| Cue ID | Game event and Sandbox start | Sound and source | On-screen feedback |
| --- | --- | --- | --- |
| `puddle-splash` | A dry parcel becomes soaked. Choose **Puddle** and move right. | A short water splash by qubodup. The demo uses an edited mono WAV made from the Freesound preview. [Recording and CC0 credit](https://freesound.org/people/qubodup/sounds/737234/) | Splash animation and soaked parcel indicator. |
| `mina-dry` | Mina receives a dry parcel. Choose **Dry handoff** and move up. | “Made it through the rain!” Synthetic demo voice rendered with Piper and the LJSpeech medium voice. [Voice model and dataset credit](https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/en/en_US/ljspeech/medium/MODEL_CARD) | The line and **Play Again**. |
| `mina-soaked` | Mina receives a soaked parcel. Choose **Soaked handoff** and move up. | “Try the lower boardwalk.” The same synthetic voice and settings as the dry line. [Voice model and dataset credit](https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/en/en_US/ljspeech/medium/MODEL_CARD) | The line and **Retry**. |

Phaser 4.2.1 loads three short WAV files from the build. The effect plays on the transition to a soaked parcel. Mina's line plays on the handoff that shows the matching text. The Sound button, Retry, Play Again, and Sandbox Reset can stop the current cue. Missing audio leaves the movement and visible feedback available.

**Browser checks · November 14, 2026.** Desktop Chrome and phone-sized Chromium and WebKit started the right audio buffer for all three cases. The splash played once per parcel, Retry stopped the current line, and Reset let each cue play again. The wet route also worked with sound off and with the splash file blocked. These checks cover playback and game feedback. The mix still needs a listen on a physical phone speaker.

## Scene script and playtest

The courier starts one step from the pickup marker. After pickup the puddle sits directly ahead, and the longer boardwalk runs below it. The player steps onto Mina’s square to hand over the parcel. Mina says “Try the lower boardwalk” after a soaked handoff and “Made it through the rain!” after a dry one. Retry starts at the fork; Play Again returns to the opening.

**Scripted result:** With keyboard and emulated touch, the run passed pickup, opening and closing help without moving the courier, puddle and soaked handoff, Retry, the dry detour, and Play Again. The test also confirmed focus moves to the result action. [Phone result capture](evidence/dock-phone-retry.webp)

**First-time task:** Say “Bring Mina a dry parcel.” Observe without coaching. Record the input, route, and where the player hesitates. If they soak the parcel, watch where they look after Mina responds and whether they find Retry on their own. If they take the dry route, record that Retry discoverability was unobserved. Ask what made them choose their route. A physical phone and independent first-time players still need to be checked. [Read the Retry placement decision](../island-post-example.md#where-should-retry-appear)

## Build record

From the public Bible repository root, use Node.js 24 and Python 3:

```sh
npm ci
node --test examples/island-post/rules.test.js
npm run build
python3 -m http.server 8000 --directory dist
```

The same build command runs in Publish Bible. The player entry is `/island-post/`; the separate developer entry is `/island-post/sandbox/`. Both start at the Dock. The game ships as static files with no account or service dependency.

Open the player entry in a fresh session. Press Right four times to try the puddle route. Choose **Retry**, then Down, Right, Right, Right, Up for the dry route. Choose **Play Again** to return to the opening. The unit checks exercise the state rules; the browser checks exercise the built entries and controls. [Dry result capture](evidence/dock-delivered.webp)
