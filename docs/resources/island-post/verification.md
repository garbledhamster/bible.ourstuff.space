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

Turn **Sound** on in the [player demo](../../island-post/) or the [Sandbox](../../island-post/sandbox/). Both open with sound off. In the Sandbox, choose the start that matches the cue, then use the real movement controls. Reset brings back the starting parcel and stops the current effect or line. The rain and score continue between attempts.

| Cue ID | Game event and Sandbox start | Sound and source | On-screen feedback |
| --- | --- | --- | --- |
| `dock-rain` | Loops while Sound is on and the page is visible. | A 10.2-second mono loop from soundrecorder7's “Light Rain” preview, with a 0.8-second crossfade at the join. [Recording and CC0 credit](https://freesound.org/people/soundrecorder7/sounds/167034/) | Rain ripples in the dock art. |
| `dock-score` | Loops on the Dock while Sound is on and the page is visible. It drops under either handoff and rises when the line ends or the player retries. | Original four-bar electric piano motif for the Island Post demo, synthesized at 64 BPM for use in this demo. It uses no third-party samples or recordings. [Editable score and renderer](https://github.com/garbledhamster/bible.ourstuff.space/blob/main/examples/island-post/assets/audio/render-dock-score.py) | The dock and handoff remain playable without music. |
| `puddle-splash` | A dry parcel becomes soaked. Choose **Puddle** and move right. | A short water splash by qubodup. The demo uses an edited mono WAV made from the Freesound preview. [Recording and CC0 credit](https://freesound.org/people/qubodup/sounds/737234/) | Splash animation and soaked parcel indicator. |
| `mina-dry` | Mina receives a dry parcel. Choose **Dry handoff** and move up. | “Made it through the rain!” Kokoro `af_heart`, speed 0.95. | The line and **Play Again**. |
| `mina-soaked` | Mina receives a soaked parcel. Choose **Soaked handoff** and move up. | “Try the lower boardwalk.” Same voice and settings. | The line and **Retry**. |

Mina's lines use Kokoro ONNX 0.6.1 with the Kokoro v1.0 int8 model. Both exports are 24 kHz mono WAVs. The voice has a −3 dB high shelf at 4 kHz and two quiet copies delayed by 32 ms and 67 ms, at 8.5% and 2.7% of the direct signal. The rain runs at 0.12, splash at 0.65, and voice at 0.85. The score is a 15-second mono WAV. Its level goes from 0.11 to 0.038 over 75 ms when a line starts, then back over 260 ms when it ends or gets cut off. These are Phaser playback gains for the files in this build. [Kokoro model and license](https://huggingface.co/hexgrad/Kokoro-82M) · [Voice generation recipe](../game-bible-guide.md#generate-spoken-dialogue-locally)

Phaser 4.2.1 loads the five WAV files from the build. The splash plays when a parcel becomes soaked. The matching voice and text play at each handoff. Retry, Play Again, and Sandbox Reset stop the current effect or line. Turning Sound off or hiding the page stops the Dock audio. Returning to the Dock with Sound on starts both loops again without replaying the line. Missing audio leaves movement and visible feedback available.

**Browser checks · November 14, 2026.** Desktop Chrome and iPhone 13 emulation in Chromium and WebKit played the splash and both lines through the game controls in the player and Sandbox. Both loops started once after Sound On and stayed running through Retry, Play Again, and Sandbox Reset. The score dropped for each line and returned after a line finished or the player retried. Both loops stopped on mute or a simulated page hide. They came back once on return with Sound on. The wet route worked with sound off and with both background files blocked. The source levels leave at least 1 dB of peak headroom even if a voice, the splash, rain, and score peak together. A listen on a physical phone speaker is still open.

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
