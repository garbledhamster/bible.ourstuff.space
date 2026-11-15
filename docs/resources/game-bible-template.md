# Project Bible template

Game:

**Current phase:** Grilling

Current chapter:
Next decision or check:

For each chapter, record the earlier input, the expected player experience or decision, and the output someone can open or run. Link the completion check, what you observed, and the build and target when applicable. Record the next unmet check and its owner. If a chapter does not apply to this release, record why. Embed generated images beside the decisions they illustrate. Include alt text, purpose, status, and a source or prompt link. Reuse the same files in later chapters.

Start in **1. Grilling** using the [Work modes](project-phases.md) page. In the [chapter guide](game-bible-guide.md), read **Work mode instructions** in each applicable chapter and link the output from the current mode here.

## Vision and Scope

Link the creator’s confirmed moment and the scope decision Design Document will use.

- Project folder and Git repository, including the remote and visibility if used:
- README folder map and first saved planning commit:
- Player promise, intended audience, platforms, and single-player or multiplayer scope:

### Visual Vision

- Ask the creator, “Picture one moment that shows what you're trying to make. What do you see in your mind’s eye?” Save their description of one scene or screen and any references, with the details they want to carry forward.
- Show one sheet with six labeled art styles for the same scene. Record what the creator picked and why. Make the next six-panel sheet with variations on that direction until the creator confirms the look. Link the sheets, feedback, and approved style.
- Embed the chosen image and record the details to carry into UI & UX Design and Engine & Assets. If you pause before the creator confirms it, mark the latest image as a draft and record what still needs their reaction.

### Gameplay showcase

Fill this in when you have a playable build. Use five in-game screenshots and link the build you captured.

- **Main screenshot.** Put one large image at the top. Show the most compelling part of the game with enough of the scene to understand it. Put one starshot caption on that image only. Set it next to the detail it calls out, in open space where it leaves the action visible.
- **Four mechanic screenshots.** Arrange four smaller shots below in a two-by-two grid. Show one mechanic in each shot and put a short caption beneath it explaining the action or result.

[See the Island Post gameplay showcase](https://bible.ourstuff.space/read.html?file=/resources/island-post-example.md#gameplay-showcase)

### Research and Source Collection

Start during kickoff. Link the source record, including original notes, text files, PDFs, datasets, videos, recordings, or transcripts where relevant. For each useful source, record its origin and locator, what it contributes, any reuse limits, and which decision it informs. Mark what is queued for review.

### Similar Projects

Include relevant open-source and closed-source games, apps, products, or services. For each one, record its name and source link, what it has in common with this project, what you want to learn, and the chapter or decision that research will inform. Link to source, docs, or tests for open-source examples and to a demo, help page, or other public evidence for closed-source examples.

### First playable milestone and release scope

- First playable milestone and release scope:
- Intended experience at the defining moment, expected player behavior, and an observation that would reopen a decision:
- Open decisions and Wayfinder map link, if used:

## Design Document

Link a walkthrough of the choice, outcome, and recovery. Name the cues UI & UX Design needs.

- Core workflow and intended experience:
- Main choice: what the player knows before acting, what each option gains or costs, and what the outcome teaches. Check how the rule, story, presentation, and technology support that moment.
- For each rule or interaction: input, rule, feedback, success, failure, and recovery:
- Screens or scenes and their dependencies:
- If repeated play drives the experience: early loop, later loop with changed stakes, and a point to finish or return.
- Open design decisions and links to any decision tickets. For a question that could change dependent work, link the smallest early test and record what to keep, change, or verify next.

## UI and UX Design

Link the target-size check and the file or state list Engine & Assets will use.


- Main workflow and what the person needs at each step:
- Sketch or prototype at the intended screen sizes:
- Where frequent actions, status, and recovery appear:
- Project standards for alignment, spacing, visual hierarchy, labels, and controls:
- Interface artwork needed for buttons, icons, HUDs, and frames, including the states each needs:
- Items shown in a menu and in play. Mark where players inspect the full static illustration and where they see the matching compact gameplay sprite or HUD icon:
- Checks for supported inputs, accessibility, and a first-time user completing the workflow:
- For a live design decision, record the chosen behavior, reason, comparison evidence, and the sandbox or playtest check that follows:

### Start screen

- Title, lead art, and any opening animation:
- First action for a new player and its destination:
- Continue or resume behavior for a returning player:
- Phone, desktop, and supported input checks:

### Credits screen

- Menu entry and return destination:
- Contributors, asset attribution, and required notices:
- Readability, scrolling, and input checks:

## Engine and Assets

Link the runnable slice and at-size capture for the Sandbox. Give Audio Engineering the scene events.

- Engine and launch instructions:
- Maps, characters, objects, interface, art, and sound:
- Vision or UI reference → authored runtime file → scene or state → result at play size. Embed the source images and representative engine capture.
- Asset locations and readiness:
- Props. Link one sheet per prop with its base frame, named appearance variants and states, cell size, and ground anchor. If the same sheet is drawn in multiple art styles, use the same frame order, scale, and position:
- Interactive objects and editable asset inventory spreadsheet. Link separate runtime assets, game size, collision and interaction points, matching character actions, and readiness evidence:
- UI asset ledger linking editable sources, build files, controls, states, and the sandbox cases that exercise them:
- Menu and gameplay art for each item. Link the shared reference, inventory illustration, gameplay sprite or sheet, and the side-by-side check at their display sizes. For animated items, record the required actions and directions, frame order, timing, return pose, and anchor:

- Animated characters: source frame, embedded sheet, cell size or atlas, common action checklist and two or three personal idle habits; action/direction frame map, trigger/delay, interruption, return pose, anchor, collision shape, and in-engine checks. Track each required action as Needed, Drawn, Wired, or Verified. Use the [sprite sheet workflow](sprite-sheets.md).

## Audio Engineering

Link the mix or silence decision and the repeatable watching and listening check for the Sandbox.


- What players should hear, what each cue communicates, and which feedback they need with sound off:
- Cue list with game events, priority, playback and stop behavior, source masters, build assets, and rights or credits:
- Music decision for this release, including where you want silence and why:
- For music you will use: purpose, style, scene placement, start, loop, transitions and stop behavior, level beside key cues and dialogue, source and rights or credits:
- Sound effects to record, make, or source, with variants and loops where useful:
- Dialogue sheet with line IDs, speaker, words, delivery notes, selected takes, permissions, and captions or prompts:
- Export formats and which files the scene loads before play:
- Mix and player settings, including how mute and any volume controls carry across sessions:
- Playback ownership, startup, pause, resume, and scene exits:
- Resettable listening cases and target devices, including mute, repeat input, and an interruption:
- Build, device, listening results, and remaining checks:
- If the release calls for silence, record the decision and how the player gets the feedback:

## Development Sandbox

Link the passing cases a scene can reuse. Name each failure’s owning chapter and the affected scene.

- Dedicated development scene to build before player-scene assembly:
- Release mechanics, assets, controls, objects, and outcomes reachable from that scene:
- Development entry point or test-build shortcut:
- NPC roster picker and dialogue branches to exercise, including the states that change each conversation:
- Playable cases for every release mechanic and the other applicable checks from the Development Sandbox chapter:
- For each case, record the named starting state, the object or control to use in the scene, what the player should see, and how to reset:
- For interactive objects, show independent placement, approach and collision, pose fit and draw order, exit to movement, and reset. Link the matching inventory rows and in-engine captures:
- Record build, platform, observed result, and evidence:
- Open failures and next checks:

## Scene Scripts and Playtests

Link the playable scene, observed task, and retest for the next build.

- For each scene: entry, player objective, actions, dialogue, outcomes, and transitions:
- Mechanics and assets used:
- Playtest: link the prediction and any early test. Record player fit, task, build, device and input, observed actions or words, help, and what you kept, changed, or will retest.

## Build and Play the Game

Link the exact candidate, clean launch, and core playthrough evidence for the demo.

- Startup scene, build targets, source revision, and build or export steps:
- Versioned installer, app package, or staged browser build:
- Clean install or fresh launch, core playthrough, and results by target:

## Demo, Manual and Wiki

Link the demo, help, unprompted attempt, and captures for the release.


Copy these prompts for each workflow you want to showcase.

- Audience and outcome. Who is trying it, and what can they do by the end?
- Showcase. What does the workflow help someone understand about the project?
- Sandbox evidence. Link the passing cases for the action, result, and recovery. Record the build and target.
- Demo entry and setup. Where do people start, and what sample data, objects, or progress do they need?
- Actions and feedback. What do people do with the real controls, and what result can they see?
- Recovery and replay. How do people retry, resume, or continue into the project?
- Manual and wiki. Link the walkthrough, lookup pages, and practice steps. Show how someone gets back to the task.
- Capture. List the moments to record, the verified build, and the link viewers use to try it.
- Release check. Record the first-time user’s task, build, device, observations, and any checks to repeat.

## Release Pricing and Marketing

Link the tested delivery path and candidate. Give Contributor Training the shipped setup.

- Release scope, delivery platform, price, and payment:
- Readiness checks and release evidence:
- Store copy, screenshots, pitch scripts, and distribution links:

## Contributor Training

Link the first-change exercise and a contributor’s result. Carry that setup into multiplayer or update work.

- Setup, first task, and verification instructions:
- Decisions and references a contributor needs:

## Multiplayer and Multi-user Support

Link the two-client observation and recovery runbook for release and updates, or explain scope.

- Scope: single-player / shared screen / split screen / online co-op / PvP / persistent world; player count and targets:
- Earlier chapter decisions and two-player Sandbox evidence, or N/A with reason:
- Shared rules, identity, state ownership, coordinates, persistence, and reconnect behavior:
- Independent input, cameras, HUD, join/leave flow, and complete encounter:
- Local, private remote, and cloud join instructions; pinned versions and verified endpoints:
- Hosting owner, budget, health/logs, restart, backup/restore, updates, and shutdown runbook:
- Separate-device, simultaneous-action, disconnect, invalid-input, and capacity results:
- Build/server revision, observed result, remaining failures, and next check:

## Updates and DLC

Link the previous revision, update and compatibility result. Give Engagement and Feedback the shipped change.

- Proposed changes, affected players, and release approach:
- Sandbox, scene, and compatibility checks:
- Manual, wiki, and release note updates:

## Engagement and Feedback

### Engagement

Once the release is built, decide how we'll keep talking with people who use it.

- Who will do the talking, and who do we want to talk with?
- Why are we talking with them, and what will we share or ask about?
- Where will we talk, in what format, and what will we use to help the conversation?
- What prompts us to reach out, how often will we do it, and how much time can we give it?
- Who reads replies and follows up, and when?
Link a conversation and follow-up, or a rehearsal.

### Feedback

Append each item when entered, in order, with a timestamp that includes its time zone. Update the project Changelog when finishing a meaningful change and link feedback that prompted it.

- Project Changelog Markdown file:

- Project Feedback Markdown file:
- What did people or agents say during development or after launch?
- What follow-up or change to the project, process, or next scope did it inform?

## Scaling

Link the current release or process, the promise in Vision & Scope, and the demand or adoption evidence in Engagement & Feedback. Copy the record below for each increment. Keep the previous records so you can see what changed.

### Scale trial record

- **What will grow:** Unit, audience or location, current size, next size, and evidence people will use it.
- **What has to keep working:** User outcome, what must stay consistent, and what the next operator can adapt.
- **Baseline:** Usable results, waiting and rework, and cost or time per unit. Link the evidence and note the measurement period and peak conditions.
- **Constraint and change:** What limits the outcome, how you checked it, and the smallest change to try. Link the steps, shared dependencies, and operator handoff.
- **Trial:** Batch or cohort, duration and conditions, owner, decision date, expected result, quality floor, and cost or workload ceiling.
- **Stop and recover:** Who watches which signals, when they act, and how they protect and recover work in progress. Link the rehearsal.
- **Result and decision:** Actual results against the limits, tested size and conditions, evidence links, and why you will expand, hold, or back out. Record the next constraint or check and who owns it.
