# Game spec template

Copy this file when an idea is ready to become a build. Use the filled-in Project Bible for decisions and reference material. Use this spec to define the current release and what will prove it works.

- Game and release or iteration: [name]
- Project Bible, decisions, and prior evidence: [links]
- Project repository and README folder map: [links]
- Owner and intended audience: [names or roles]
- Tracker or local ticket folder: [location]
- Current chapter and next decision: [chapter, decision]

## Problem and solution

Describe what the intended players want to do or experience, what you know about them, and the smallest game that delivers that experience. State the target devices, inputs, and how players will get the release.

- Player promise: [one observable outcome]
- Core loop: [entry → player action → feedback → outcome → retry or next action]
- Included scenes and mechanics: [list]
- Out of scope for this release: [list and reason]
- Assumptions and unresolved decisions: [decision, owner, and which work it blocks]

## Player stories

Give each story an ID so a ticket and a test can point to it. Add stories for relevant success, failure, recovery, and input differences.

1. **S01** As a [player], I want to [action], so that [benefit]. Done when [observable result].
2. **S02** As a [player or contributor], I want to [action], so that [benefit]. Done when [observable result].

## Implementation and testing decisions

- Engine, supported targets, controls, and shared systems: [decisions and reasons]
- How to start the game and open the dedicated sandbox scene: [player entry and development entry or test-build shortcut]
- Highest practical test seam: [game entry, sandbox scenario, or public interface that exposes the behavior]
- Repeatable checks: [starting state, action, expected result, and command or steps]
- Playtest and device checks: [task, target device or input, observer, and pass criteria]
- Build and play check: [build or export steps, package or test URL, clean install or launch, and core playthrough by target]
- Release check: [candidate ID, delivery path, and what a fresh player must complete]
- Evidence record: [build or revision, target, check, observed result, status, and artifact link]

Use automation for rules and regressions that can be checked reliably. Use a real player or device when the result depends on discovery, feel, or hardware. Set acceptance criteria before running the checks. Record **Pass**, **Fail**, **Unverified**, or **N/A** with a reason. A required check needs passing evidence before the chapter closes.

## Chapter completion plan

Replace the starter criteria with measurable checks for this game. Add the evidence link and result as work finishes. Use the same chapter numbers in the tickets.

| Chapter | Output for this release | Starter completion check | Evidence and status |
| --- | --- | --- | --- |
| 01 · Vision & Scope | Git repository, folder map, player promise, audience, target, smallest release | The planning notes are in Git and a contributor can find the source, assets, and docs. The owner can name who the game is for, what a player can complete, and what the release includes. Scope decisions that block design are resolved. | [link and status] |
| 02 · Design Document | Core workflow, rules, failure and recovery, screens or scenes | Each rule in scope has an observable expected result, and each screen or scene names what it needs. | [link and status] |
| 03 · UI & UX Design | Core workflow sketch or prototype and project interface standards | The next action, status, and recovery are visible where needed on intended screen sizes. List UI artwork and its states. Record how you’ll check accessibility, supported inputs, and unprompted task completion. | [link and status] |
| 04 · Engine & Assets | Runnable project and assets for the next slice | A contributor can launch a clean checkout on the target and see one real interaction with its representative assets. Link the authored UI files and the states they serve. | [link and status] |
| 05 · Audio Engineering | Music plan or decision to go without music, cue list, representative mix, settings, and listening record | Play one encounter on target devices with sound on and off. Verify cue timing, priorities, mute, and loop cleanup. If the release calls for silence, record the decision and verify the other feedback. | [link and status] |
| 06 · Development Sandbox | One dedicated development scene with cases and results for the release’s mechanics, assets, controls, objects, and outcomes | A contributor can play every release mechanic and the applicable sandbox checks through the actual game rules. For games with NPCs, the roster picker gives access to every dialogue branch for each release NPC. Verify the outcomes and reset to named starting states before player-scene assembly. | [link and status] |
| 07 · Scene Scripts & Playtests | Scene scripts, playable scenes, and playtest notes | Each scene can be played from entry to outcome on its intended controls. Transitions and recovery pass, and a playtest checks the intended experience. | [link and status] |
| 08 · Build & Play the Game | Repeatable build steps, a versioned package or staged web build, and playthrough results | On each target in scope, a fresh player can install or open the build, start a new game, and complete the core loop across scenes. | [link and status] |
| 09 · Demo, Manual & Wiki | Playable demo, passing sandbox cases, help links, and capture plan | A first-time user can complete and retry the demo, follow the help, and repeat the workflow unaided. The verified demo is ready to capture and share. | [link and status] |
| 10 · Release, Pricing & Marketing | Release candidate, launch materials, and distribution decision | The exact candidate launches through the intended delivery path. Its listing or page describes the actual game, and the payment flow passes if the release requires one. | [link and status] |
| 11 · Contributor Training | Setup, first change, and verification guide | Someone starting fresh can run the game and sandbox, make a representative change, and verify it using the guide. | [link and status] |
| 12 · Multiplayer & Multi-user Support | Mode, shared rules, playable encounter, and hosting runbook or N/A | Players complete and retry the encounter on supported devices. Remote joining, shared outcomes, recovery, and any promised capacity or persistence have recorded evidence. | [link and status] |
| 13 · Updates & DLC | Update approach and an example change | An agreed update is rehearsed or delivered. Affected behavior, existing progress, and access are checked where relevant, and release notes and help reflect the change. | [link and status] |
| 14 · Intake & Feedback | Intake channel, feedback review, and next scope decision | A real or rehearsal message can be received, recorded, and answered. The owner reviews available evidence and records what returns to Chapter 01, including a goal or a reason to hold scope. | [link and status] |

## Turn this spec into tickets

1. Start with the [preset ticket list](game-tickets/README.md). Link each ticket to the spec chapter and any story IDs it serves.
2. Turn each chapter into verifiable slices. A playable ticket should take one behavior from player action to outcome, with a repeatable check. Split work when a ticket covers multiple behaviors that can be demonstrated separately.
3. Name the tickets that genuinely block each slice. Keep the chapter completion checks in sequence. Prepare work early when useful, such as a feedback channel before a playtest.
4. Give each ticket enough context for a fresh agent. Record its result and evidence in the chapter before moving to the next completion check.

## Worked check · Island Post

**S02 / Chapter 06.** A player can recover after soaking a parcel. In the sandbox, start with a dry parcel, walk through a puddle, and choose Retry. The run passes when the player returns to the dock with a fresh parcel. Record the build and observed result before opening the dependent dock scene ticket. For Chapter 07, ask a first-time phone player to find Retry without prompting.
