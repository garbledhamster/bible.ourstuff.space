---
name: game-quality-control
description: Use when building a game from first playable through release, setting game quality gates, or deciding if a game build is ready for its next stage. Defines observable pass criteria, player feedback, and evidence across target devices. Use the relevant specialist for a standalone implementation or playtest request.
---

# Game Quality Control

Decide whether the current build is ready for its next stage. Use one matrix to set and track the quality bar, and one checklist to run it. Use specialists to implement fixes and run playtests; bring their results back to the matrix.

## Set the bar

At the start of the work, or when picking up an existing build, find the current stage and the player promise. Write down the shortest real loop from launch to an outcome and the next action. Identify the audience, what players should be able to do without coaching, and any feel that the game depends on. Read existing project decisions before setting thresholds.

List the promised platforms, input methods, and launch modes. Pick representative configurations by risk: the least capable supported device, distinct inputs, and any runtime or launch mode that can behave differently. Record exactly which configurations you will exercise and why they cover the promise. Treat emulation as evidence for what it exercises; use real hardware when physical input, device performance, or native install and resume are part of the bar. Record unsupported targets as out of scope.

Set each applicable criterion before running the check. Name the player task, observable result, relevant conditions, and any threshold that affects the decision. Use counts, timings or budgets when they help decide; use behavior that an observer can recognize for the rest. For a small prototype, one short loop, one target, and a few observations may be enough. Expand by distinct risk, such as touch versus keyboard, an older GPU, an upgrade from a supported save, or reconnecting to a live match. Keep the project’s existing QA record if it has one.

## Quality matrix

Use these rows as starting points. Make each applicable criterion specific to the game. Split a row in the project record when its scenarios can produce different decisions, so a desktop pass cannot hide a phone gap. Record the earliest stage that needs the result; carry the core checks forward at later stages.

| Check | Observable pass criterion | Evidence to capture |
| --- | --- | --- |
| Entry and learning | From the intended entry with a fresh profile, a representative new player reaches the first meaningful action using the game’s cues within the agreed step or time limit, if one is needed. | Entry path, steps or time, where the player hesitated or needed help, and a clip or screenshot when it explains the problem. |
| Core loop and rules | The player can complete the loop, read the outcome and start the next loop. The key success and failure paths produce the agreed result without a softlock, wrong reward, or double action. | Rule or integration results plus an end-to-end run in the built game. Include input and expected versus observed outcomes for failures. |
| Controls and feel | Each promised input can perform the main actions reliably. When feel matters, representative players show the intended behavior, such as landing a timed action or recovering on their own. Ask how the action felt in their words. Set the task, observation, and sample in advance. | Input tests or traces for mechanics; separate play notes with attempts, misses, stalls, help given, and short player remarks tied to the moment. |
| Feedback and presentation | A player can find the controls and identify important cues and outcomes during play. The intended UI art loads and changes with the control or game state. The HUD, audio, camera, and effects preserve the information they need. Agreed access options work on the supported inputs and layouts. | Captures of meaningful states on relevant layouts, plus task observations or focused checks for timing, cue alternatives, focus, and legibility. |
| Recovery and continuity | Relevant interruptions and failure states let the player resume, retry, or exit as intended. If progress persists, the next launch or upgrade restores the promised state without loss or duplication. | Repro steps and before/after state for pause, retry, resume, save/reload, or upgrade as applicable. |
| Device and performance | The build boots and completes the representative loop on the chosen configurations. The worst supported workload stays within agreed budgets for the metrics that matter to play, such as load time, frame time, or input delay. | Device, OS or browser, input, scenario and duration; a capture or measurement for relevant budgets. Choose the engine’s diagnostics when the cause needs investigation. |
| Scope promises | Each additional feature needed for release meets its own player-facing outcome, including an important failure or edge case. Examples: rejoin a match, finish progression, restore a purchase, or play offline. | A targeted end-to-end run per promise, with state or logs when they explain the result. Use N/A with a reason when there are no additional promises. |
| Release artifact | The exact candidate players will receive installs or loads from the intended entry, shows the expected version, and reaches playable content with its assets and settings. If replacing a live build, the existing recovery or rollback path is identified and usable. | Build ID, source revision, package or release URL, clean launch and short smoke results from the intended delivery path, and a rollback reference when applicable. |

For feel and discoverability, give players a task without explaining how to do it. Watch before offering help, then ask what they expected at the moment they hesitated or missed. Choose enough people to cover the key audience and control differences. A short round can find friction; it does not establish a population-wide success rate. Use earlier feedback to decide what to retest. Use automation to verify mechanics; require fresh player evidence when the decision depends on the experience.

## Checklist

- [ ] **First playable:** Walk the narrowest real loop from launch through success or failure to retry or next action. Use the intended primary input. Check Entry, Core loop, Controls and feel, and any Feedback or Device risk that can invalidate the loop. Observe a representative player on the core action if feel or discovery drives the decision.
- [ ] **Integrated build:** Run the full intended player path with the features and content included in this stage. Check supported input and layout differences, interruptions and recovery, and the riskiest workload on a representative target. Exercise each included Scope promise. Retest changes with players when they affect entry, cues, difficulty, or feel. Advance when the integrated path and its applicable criteria pass.
- [ ] **Release candidate:** Run the Release artifact check and a short end-to-end smoke on the exact candidate for each distinct delivery mode. A clean install or extraction can prove a downloadable package is ready to submit. A hosted game or installable web app also needs a launch through a representative hosted route. If the final listing or URL only exists after publication, record its check separately from preflight. Confirm applicable matrix rows against the agreed target coverage, including upgrades and retained features where promised. Carry forward earlier evidence only when you can explain why the relevant behavior, assets, configuration and delivery path are unaffected. Reopen affected checks after changes and rerun the candidate smoke.
- [ ] **Close the decision at each stage:** Record the stage, build, check, target and input, pass criterion, observed result, and evidence location. Give each check a status: **Pass**, **Fail**, **Unverified** (missing or stale evidence), or **N/A** (reason required). Advance when all required checks for that stage pass. If a required check fails or lacks proof, hold the stage and name the smallest next check or fix, its owner, and the retest. When building the game, do the checks or fixes within scope and update the same record. Record accepted defects outside the required bar with their player impact and the project owner's decision. A readiness decision does not authorize publication.

## Work with specialists

For browser games, use Game Studio for stack and architecture decisions if needed. Use the matching runtime skill, such as Phaser, Three.js or React Three Fiber, and the UI or asset specialist for fixes in those areas. Use `game-studio:game-playtest` for browser runs and visual evidence. On other engines, use the project's engine and platform specialists, test runner, and device tools. If a tool or player is unavailable, collect the evidence you can and leave the missing check Unverified.

If the project uses the Checklist skill, track who is doing what there. Keep pass criteria, evidence, and stage decisions in the quality matrix.
