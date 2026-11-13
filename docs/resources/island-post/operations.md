# Island Post: contributor, update, and feedback records

## Contributor exercise

Clone [the public Bible repository](https://github.com/garbledhamster/bible.ourstuff.space) and follow the [build record](verification.md#build-record). Open the player build and the separate Sandbox. In `examples/island-post/sandbox/sandbox.js`, change the Blocked Move cue to say “Try moving down into the crate.” Rebuild, choose Blocked Move, and check the cue. Tap Down, confirm the courier stays put, then Reset. Open the player demo and check that it still starts at pickup. Revert the exercise before opening a change for review.

**Exercise result:** A clean copy with fresh dependencies built successfully. On desktop Chrome and emulated iPhone touch, the new cue appeared, the crate blocked the step, Reset restored the case, and the demo still opened before pickup.

The Sandbox controls how a case starts. The [movement rules](dock-design.md#dock-map-and-rules) control what happens when you move. Changing a cue should leave the shared rules alone.

## Update rehearsal

**Candidate:** Add “from the fork” to the boardwalk instruction in How to Play in a temporary copy of the built demo. This would affect anyone using the help during a delivery. It needs no purchase, save migration, or new route.

**Checks:** Open How to Play and read the revised instruction. Close it on the same square, take the wet path, press Retry, then complete the dry detour. Use the Sandbox puddle case to confirm the parcel still soaks on entry. **Observed:** The revised line appeared on both browser inputs. Closing help preserved the run, the wet and dry handoffs worked, and the Sandbox puddle still soaked the parcel. The rehearsal was kept out of the release. If this change ships later, update the [walkthrough](first-delivery.md) at the same time and replace any capture that shows the old instruction.

## Intake rehearsal

**Report from the scripted build check, November 13, 2026.** In the first staged Dock 1.0 build, the playfield opened, but it stayed on “Loading the Dock…” and the direction buttons never enabled. Desktop Chrome reported an SVG decoding error. The production bundler had inlined small sprites as data URLs the Phaser loader couldn’t decode.

**Response and retest.** Serve the sprites as separate built files and give them intrinsic dimensions so WebGL can draw them. Repeat the original fresh browser launch, check that the courier is visible and the controls enable, and play through both delivery outcomes. The player and Sandbox entries passed after that change on desktop Chrome and iPhone 13 touch emulation. This finding came from a scripted check; it wasn’t a player report.

**Where to send a report.** Use [Project Bible issues](https://github.com/garbledhamster/bible.ourstuff.space/issues). Include your device and browser, the page you opened, what you expected, and the first thing you saw go wrong. Repository maintainers can reproduce the report from the stated entry and follow up on the same issue.

**Back to scope.** Keep one Dock delivery as the release. Add fresh-browser startup to its release checks so a build that can’t accept the first move doesn’t ship. Ask a first-time phone player to try the same opening without coaching and record where they look for the first move.
