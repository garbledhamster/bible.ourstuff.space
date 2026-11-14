# 06 · Prove the mechanics in the sandbox

**Chapter** 06
**Blocked by** 05
**Spec and story IDs** [fill in for this release]

## What to build

Build one dedicated development scene during preparation, before assembling the player scenes. Make it playable so a developer can move through the scene, interact with objects or controls, and see the outcomes the same game code produces for a player. Put the release’s mechanics, assets, controls, objects, and outcomes within reach.

## Acceptance checks

- [ ] Open the sandbox from the documented development entry point or test-build shortcut.
- [ ] Play a case for every release mechanic inside the scene using objects or controls that trigger the actual game rules. Check what the player sees, including failure and recovery where they apply.
- [ ] For games with NPCs, pick each release NPC from the roster and play every branch of their dialogue tree. Check which choices appear, what the character says, and what changes in the game.
- [ ] Cover the other checks that apply to this release in the [Development Sandbox chapter](https://bible.ourstuff.space/read.html?file=%2Fresources%2Fgame-bible-guide.md#mechanics-and-other-checks).
- [ ] Exercise the required UI artwork states with real controls and verify focus, readable labels, feedback, and recovery on the supported inputs.
- [ ] Use a named starting state to open each case, then use Reset and play it again.
- [ ] Record passing results for the required cases before assembling the player scenes.

## Evidence and handoff

Expected evidence: Sandbox entry, scenario results, and evidence by build and target.

Record the actual result and its link, any failed or unverified checks, and the next unblocked ticket.
