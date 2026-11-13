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
| Soaked handoff | Move up toward Mina | Mina responds to the soaked parcel and offers Retry. |
| Reset | Press Reset after each action | The original position and parcel condition return, with the delivery cleared. |
| Mina roster | Select Mina; play the dry and soaked starts | Both handoffs can be reached with the player controls. |

[Sandbox capture](evidence/dock-sandbox.webp) · [Grayscale capture](evidence/sandbox-grayscale.webp)

## Scene script and playtest

The courier starts one step from the pickup marker. After pickup the puddle sits directly ahead, and the longer boardwalk runs below it. The player steps onto Mina’s square to hand over the parcel. Mina says “Try the lower boardwalk” after a soaked handoff and “Made it through the rain!” after a dry one. Retry starts at the fork; Play Again returns to the opening.

**Scripted result:** With keyboard and emulated touch, the run passed pickup, opening and closing help without moving the courier, puddle and soaked handoff, Retry, the dry detour, and Play Again. The test also confirmed focus moves to the result action. [Phone result capture](evidence/dock-phone-retry.webp)

**First-time task:** Say “Bring Mina a dry parcel.” Observe without coaching. Record the input, route, hesitations, and how the player handles a wet parcel if they encounter one. Ask what made them choose their route. A physical phone and independent first-time players still need to be checked.

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
