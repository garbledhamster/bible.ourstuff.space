# Preset Game Bible tickets

Copy these drafts into the game’s tracker or keep them as local Markdown tickets. Fill the [game spec template](../game-spec-template.md) first, then give each ticket the actual project, release, story IDs, and acceptance criteria. The chapter checks run in this order. Split large tickets into smaller slices and make the parent chapter depend on the slices that prove its result.

| ID | Chapter ticket | Blocked by | What the agent can demonstrate |
| --- | --- | --- | --- |
| 01 | [Define the first release](01-vision-and-scope.md) | None | The owner can explain the player promise, audience, target, and first playable. |
| 02 | [Specify the game loop and scenes](02-game-design-document.md) | 01 | The core loop has observable rules and a rough scene roadmap. |
| 03 | [Run the first interaction on the target](03-engine-and-assets.md) | 02 | A fresh checkout runs a representative interaction using its assets. |
| 04 | [Prove the mechanics in the sandbox](04-development-sandbox.md) | 03 | Required rules, inputs, and recovery can be exercised from known states. |
| 05 | [Assemble and playtest each scene](05-scene-scripts-and-playtests.md) | 04 | A player can enter, complete, and exit each in-scope scene. |
| 06 | [Build and play the game](06-build-and-play-the-game.md) | 05 | A player can install or open the build on the target and complete the core loop. |
| 07 | [Write and verify player help](07-player-manual-and-wiki.md) | 06 | A fresh player can find and use help that matches the build. |
| 08 | [Verify the release candidate](08-release-pricing-and-marketing.md) | 07 | The exact candidate works from the planned delivery entry point. |
| 09 | [Walk a new contributor through a change](09-contributor-training.md) | 08 | A contributor can run, change, and verify the released workflow. |
| 10 | [Rehearse or deliver an update](10-updates-and-dlc.md) | 09 | One change goes through the affected checks and documentation. |
| 11 | [Review feedback and plan the next cycle](11-intake-and-feedback.md) | 10 | Feedback reaches an owner and produces a next-cycle scope decision. |

Start with the earliest ticket whose blockers are complete. Some preparation can start sooner. Draft the help outline during design and open an intake channel before a playtest or launch. Treat that preparation as a separate task. Start each chapter ticket after its listed blocker is complete.

## Ticket fields to fill in

- **Spec and story:** link to the relevant chapter, story IDs, and decisions.
- **What to build:** one result a player or contributor can exercise or review.
- **Blocked by:** use the copied ticket IDs or replace them with tracker IDs.
- **Acceptance:** use a known starting state, an action, and an observable outcome where applicable.
- **Evidence:** record the build or revision, target, verification steps and result, and links to observations or outputs.
- **Handoff:** link to the finished work, note any unresolved items, and name the next unblocked ticket.

When Chapter 11 changes the game, open a new Chapter 01 for the next cycle and link back to the evidence. Keep each release’s dependency list in order.
