# Dock 1.0 design record

[Back to the Island Post case study](../island-post-example.md)

## Scope brief

A casual puzzle player opens the Dock, picks up Mina’s parcel, and chooses a route. They can hand it over dry or soaked, then retry or replay. The public example is one browser delivery. Phone touch and desktop keyboard use the same rules. Later routes, parcel wrapping, accounts, saves, and paid content are outside this release.

**Design prediction to test.** A new casual puzzle player can look at the fork, choose the dry boardwalk, and explain which cue helped them work out the route. If they choose dry by chance or only notice the puddle after a soak, look at what they can see before the choice. See the [early playtest plan](#early-playtest-plan) for how to check that before making the full Dock.

For the first-time playtest, ask one person on a phone and one on desktop to bring Mina a dry parcel without coaching. Record where they pause, which route they choose, and what led them to that choice. If they soak the parcel, watch whether they find Retry on their own. If both take the dry route, mark Retry discoverability unobserved.

The Bible repository keeps the public build in `examples/island-post/`, art in its `assets/` folder, and this record in `docs/resources/island-post/`. The private project is the reference for the Dock idea; the public edition has its own art and implementation.

### Sources and similar projects

| Source | What we used |
| --- | --- |
| Island Post’s original Dock preview, pickup through both handoffs | Keep the fork, parcel state change, and two outcomes. The public build uses new artwork and code. |
| [Nintendo’s Captain Toad: Treasure Tracker page](https://www.nintendo.com/us/store/products/captain-toad-treasure-tracker-switch/), course screenshots and overview | A small puzzle can give players a reason to read the terrain. Keep Mina and both routes visible together so the Dock puzzle fits on one screen. |
| [Phaser 4.2.1 release](https://phaser.io/download/release/v4.2.1), npm section | Pin the engine version and build the example as static browser files. |

## Dock map and rules

```text
           Mina's hut
                  │
Start → Pickup → Puddle → Boards → Mina
          │                        ↑
          └────── dry boardwalk ───┘
```

| Action | State and feedback |
| --- | --- |
| Step toward open water or a crate | Stay on the current square. Show a short bump and “Path blocked.” |
| Step onto the parcel | Pick up a dry parcel. Remove the parcel from the board and show Dry in the HUD. |
| Enter the puddle holding a dry parcel | Show a splash and switch the parcel to Soaked. It stays soaked until Retry. |
| Reach Mina with a soaked parcel | Mina suggests the lower boardwalk. Retry starts on the pickup square with a fresh parcel. |
| Reach Mina with a dry parcel | Show Delivered dry. Play Again returns to the opening before pickup. |

The map and state changes live in `examples/island-post/rules.js`. The Sandbox and demo both call the same movement function. This delivery has one NPC with two responses based on parcel condition.

## Early playtest plan

**Proposed paper test.** The question is whether the player can work out a dry route from what they see at the fork. Do this before drawing the full Dock if the answer could change how you show the paths. The published build's [first-time playtest](verification.md#scene-script-and-playtest) still has its own open checks.

1. Sketch the playable squares from the [Dock map](#dock-map-and-rules). Put a courier token at the fork with a Dry card, show both paths, and mark Mina's square. Draw the puddle as the player would see it. Keep the solution and the map's rule labels on your side of the table.
2. Tell a casual puzzle player who hasn't seen the layout, “Bring Mina a dry parcel.” Let them move one square at a time. If they enter the puddle, switch the card to Soaked. Both paths end at Mina. For a soaked handoff, show Mina's response and offer Retry at the fork with a fresh parcel. For a dry handoff, show Delivered dry and end the attempt.
3. Note the route, any pause or help, and what the player says led to their choice. If they can point to the cue they used before moving, take that cue into the rough playable scene. If they guessed or missed the puddle, try one clearer way of showing it from the same starting state with a fresh player. If the scene player sees the dry route and means to take it but moves the wrong way, try the intended controls in a rough browser build to check what happened. If they never soak the parcel, Retry discovery remains open.

Save what the player did, what you think explains it, and what you'd keep or try next. The paper version can test route reading. The browser scene is where you can observe actual movement and whether a player finds the on-screen Retry action after a wet delivery.

## HUD sketch and standards

```text
Island Post                    [parcel] Dry
Bring Mina a dry parcel.

╭─────────────────────────────────────────╮
│           Dock map and courier          │
╰─────────────────────────────────────────╯

Move cue                 [↑] [←] [↓] [→]

After a soaked handoff:
Parcel soaked                     [Retry]
Mina: “Try the lower boardwalk.”
```

Keep the parcel chip visible during play. Use the dry and soaked icons with labels so color is one of several cues. Keep the board free of overlays. When the player reaches Mina, replace the direction strip with the result and its action. Move keyboard focus to Retry or Play Again, and return it to the board when a run restarts. Put the route explanation and parcel details in How to Play.

[See the phone result with the current UI art](evidence/ui-phone-retry.jpg) · [See the grayscale Sandbox capture](evidence/sandbox-grayscale.webp)

## Asset ledger

| Asset | Used for | Source in `examples/island-post/` |
| --- | --- | --- |
| Dock illustration | Boardwalk, water, puddle ripples, hut and blocked crate | `assets/dock.svg` |
| Courier in a yellow raincoat | Player position and movement | `assets/courier.svg` |
| Mina in a red cap | Delivery square and recipient | `assets/mina.svg` |
| Dry and soaked parcels | Pickup marker and the two HUD conditions | `assets/parcel.svg`, `assets/parcel-soaked.svg` |
| Direction buttons | Four rotations of one arrow key with idle and highlighted artwork | `assets/ui/direction-idle.svg`, `assets/ui/direction-active.svg` |
| Brass action | Retry, Play Again, and sandbox Reset share one button face and its highlighted state | `assets/ui/button-brass.svg`, `assets/ui/button-brass-active.svg` |
| Dock frames | Frame around the board, Help, parcel HUD and response, with a soaked variant for the HUD and response | `assets/ui/frame-dry.svg`, `assets/ui/frame-soaked.svg` |
| Splash effect | Phaser animates the expanding ring when the courier steps in the puddle | `dock.js` |
| Sound | The preview is silent. The HUD and map carry the cues. | No audio assets |

[See the UI art and how it is wired](ui-art.md). The runtime loads SVGs as files so Phaser can decode them in the production build. The [puddle capture](evidence/ui-splash.jpg) shows the map, splash, and changed parcel icon together.
