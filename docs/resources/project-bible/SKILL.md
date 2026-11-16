---
name: project-bible
description: Use when planning, resuming, or verifying a game or software project with Joe’s Project Bible, from chapter work and release scope through launch, updates, and feedback.
---

# Project Bible

## Find the project and its Bible

1. Start from the user's active project checkout. Read its README and agent instructions. Find the project Bible, browser reader, and recorded shared Bible path. Resolve the skill directory link before opening its relative resources. In a clone of the shared Bible, use this checkout's `docs/resources/` and `docs/AGENTS.md`. In a project with a shared submodule, use those same paths inside the submodule.
2. Read `agent-index.md` and the active chapter in `game-bible-guide.md` from that revision. Use their linked templates, tickets, skills, and examples. Read `joes-notes.md` for interface work. If no shared copy exists yet, use the [published resources](https://bible.ourstuff.space/resources/agent-index.md) and [setup instructions](https://bible.ourstuff.space/AGENTS.md).
3. For setup or refresh, follow the project's documented command or the shared Bible's `docs/AGENTS.md`. Initialize a pinned submodule on a fresh checkout. Refresh an existing copy when the user wants newer resources and the submodule is clean. Record the new shared revision with the project.
4. Compare the project's records with its source, runnable build, or deployment. Save project decisions, evidence, and progress in the project’s Bible and existing tracker. The skill and shared checkout hold reusable instructions and samples. Read project state from the project on each invocation.

Keep the project’s purpose and direction in a short paragraph under **Mission**, at the same heading level as the chapters. Follow it with numbered principles people and agents can use to make decisions. Keep it before the first chapter and update it when the project changes.

In a project reader, use **Project Bible** as the main heading and put the project's name directly underneath. Use the shared masthead stylesheet. Link the reader and active chapter when showing the user an update.

## Follow the project’s Work mode

At the start of each turn that works on the project, including when resuming a conversation, reread the Work mode at the top of the project’s Bible. It may have changed in the reader since your last turn. Use the mode the owner selected and the chapter they’re working on. A request in chat to use another mode takes precedence for that work. Suggest a switch when it would help, and save a new mode when the owner asks you to change it.

For a new project, start in **1. Explore** to find where the idea could improve. Follow the [Explore playbook](../project-phases.md#explore) and save the findings in the owning chapter before asking the creator to decide in Grilling. Read the [recommended Work mode order](../project-phases.md) and the active chapter’s **Work mode instructions**. In Grilling, explore options and help the creator reach a decision. In Plan, use Ask Edwards’s gestalt lens to review the whole idea and turn decisions into tasks. Write the first usable draft of the applicable chapters. In [Concept Generation](../project-phases.md#concept-generation), turn every applicable chapter’s desired result into a [concept board](../concept-boards.md). Use one wide lead image above four captioned panels. Save the full-size images, visual specifications, and creator’s approval with the chapter. In Build, implement the approved concepts and run the checks needed to keep working. In Testing, verify the complete candidate. In Maintenance, use feedback to guide and verify updates. Update the owning chapters as the work changes, with the actual result, decisions, and checks. Link larger records and name the next action and owner.

## Use the project task list

When the plan for a feature or side project is settled, use `to-spec` and then `to-tickets` in that order. Save the spec in the owning Project Bible chapter or link its project-owned document from the chapter. Publish the tickets in that Bible's Task List, with links to the spec, current evidence, and any outside tracker the team uses. Agents start from the Bible task.

Give each independently playable or verifiable slice its own task. Put concrete build and verification steps under that task as subtasks. Write them as instructions someone coming into the project can act on. Use the real blockers, and leave a task open until its check has evidence. Update the Bible when a design choice, reference, blocker, or check changes. [Plan and work through tasks](../task-list-workflow.md)


Read [Work through the Task List](../task-list-workflow.md) when picking up or updating tasks. Edit the project’s Markdown file directly. Check the **Blockers** field before starting work, use **In progress** when you pick up a task, and record the result with evidence before marking it **Complete**. Write meaningful verified changes into the project’s Changelog and link the task or its evidence.

- At start, read the checklist recorded in the project README. The default is `docs/task-list.md`. If a project has no checklist, follow the setup instructions and seed it with confirmed work for the active release. In the shared Bible checkout, use [the Island Post checklist](../island-post/task-list.md) for the worked example.
- Group actionable tasks under their Bible chapter headings, in chapter order. For Markdown checklists, use `- [ ]` for open work and `- [x]` for verified work. Keep an existing editable task table and its asset links where the project uses one. Add a short status such as **Ready**, **In progress**, **Waiting**, or **Later** when it helps. For waiting work, say who or what can unblock it. Link existing tickets and completion evidence from the task.
- Update the checklist when work starts, a dependency or owner changes, or a check passes. Before handing off, reread the file and update the affected tasks while preserving other contributors’ entries. Keep completed tasks checked with their evidence. Leave unverified tasks open.
- When someone asks for the task list, read the current file and show its chapter headings and checkboxes inline in chat. Include the relevant statuses, blockers, and the browser link. When the request is about one chapter, show that chapter’s tasks.

## Work the chapter

1. Identify the project, release scope, and active chapter from the user's request and project records. Resume from the last recorded decision or check. For a new project, start with Vision & Scope and the [Bible template](../game-bible-template.md).
2. In Vision & Scope, begin [research and source collection](../game-bible-guide.md#vision--scope) during kickoff. Record what you reviewed, what it tells you, and which open decisions it informs. Start with the project's own material and gather examples from Similar Projects alongside it. Compare art styles with a single six-panel sheet showing the same scene, then make another sheet closer to the creator’s choice. Record the sheets and approved direction in Vision & Scope.
3. Use the active chapter to identify the decision or artifact and what proves it.
   - In Grilling, read [Auto Grill](../auto-grill/SKILL.md) at the start of the session and use Grill with Docs for owner rounds. Keep one record from the first question through review, with questions, recommendations and human and agent answers attributed to their authors. Save the current decisions in their chapters and link the full record from the Bible. Follow Auto Grill for the optional switch, a direct request for agent grilling, or when the owner wants to rejoin or revisit a question. Keep the Work mode in Grilling for review.
   - Bring in [Wayfinder](../game-development-playbook.md#work-through-open-decisions) when related questions span sessions or block other decisions. Link one map from the project Bible.
   - Bring in [Design Wayfinder](../game-development-playbook.md#try-one-live-design-decision) when an interface question needs a live prototype. Reuse the existing decision ticket when there is one. Exercise the prototype on the supported screens and inputs and get the owner's reaction.
   - Record the accepted decision, reason, and evidence in the relevant Bible chapter. Close any decision ticket with a link to that record. For assigned build work, use the [release spec](../game-spec-template.md) and the relevant [starter ticket](../game-tickets/README.md).
4. Work within the requested scope. Record the observed result, applicable build or revision, target, and artifact link in the project's existing evidence record. Report missing evidence as unverified and name the next action it blocks or informs. Carry feedback into the next scope decision when the evidence warrants a change.

Follow [Carry the work through the chapters](../game-bible-guide.md#carry-the-work-through-the-chapters). Start with the earliest unmet chapter for the current playable scope. Before scene assembly, verify that Engine & Assets produced and loaded the main runtime assets derived from the vision, and that Development Sandbox exercised them with the actual mechanics. Return to an earlier chapter when its output is missing or a later check fails.

For a design question, use Ask Schell when available. Link the [player prediction](../game-bible-guide.md#first-playable-milestone-and-release-scope) to the smallest [early test](../game-bible-guide.md#open-design-decisions) when the result could change dependent work. Carry the result into the owning chapter and take any open player question into [Scene Scripts & Playtests](../game-bible-guide.md#scene-scripts--playtests). For any chapter, read its **What to carry forward** and **Complete when** sections. Use them to choose the upstream input, concrete output, check, and next handoff for this release. Record expected and observed results in the owning chapter, with a link to the usable artifact. Use the existing release spec or task list to track the next open check when the project already has one. An asset preview, a passing rule test, and an observed play session show different things. Record what was checked and leave the remaining check open.

For interactive objects, follow [Make objects the player can use](../game-bible-guide.md#make-objects-the-player-can-use). Make separate world objects and link them, their animation fit, and their sandbox evidence in an editable asset inventory spreadsheet. Verify approach, collision, pose alignment, draw order, and exit at play size in the dedicated sandbox before scene assembly.

For decorative or interactive prop variants, follow [Prop sheets and variants](../game-bible-guide.md#prop-sheets-and-variants). Pack one prop per sheet with a base frame and named variants. Keep slots, scale, and ground anchors aligned across style versions.

Save and embed every generated project image in the chapter where it was made or discussed, beside its context, or in the concept page linked from that chapter. Include alt text, caption, status, and a source or prompt link. Reuse the file across chapters and check the rendered reader. Label concept images so they cannot be mistaken for implemented results.


For Development Sandbox, build one dedicated development scene before assembling player scenes. Make it a playable simulation where developers move through the scene and use objects or controls to trigger the actual game rules and see what the player would see. Put the current release’s mechanics, assets, controls, objects, and outcomes within reach. Document the development entry point or test-build shortcut, the named starting states, and how to reset and play each case again.

Give every release mechanic a playable case. In games with NPCs, include a roster picker for every release NPC and make every branch of their dialogue trees playable from the states that unlock it. Use the guide's list of checks to decide what else the release needs.

Use the [Development Sandbox chapter](../game-bible-guide.md#development-sandbox) for the completion checks.

In [Audio Engineering](../game-bible-guide.md#audio-engineering), plan the music for the release, including any decision to go without it. Then walk one playable encounter and record the events, cues, sources, and mix. Use the project's actual playback engine and version. Add resettable listening cases to the sandbox, then check the mix on target devices and play through with sound off. If the release calls for silence, record the decision in the chapter.

For animated characters, use [Sprite sheets](../sprite-sheets.md) with the engine's sprite, loader, and animation references. Plan a complete role-appropriate action set, including base idle/blinking and a few character-specific idle habits, rather than stopping at a walking strip. Track action/direction coverage, timing, interruption, and return poses; cosmetic idle motion must preserve player control and game rules. Keep the source, frame map, exported sheet, and rendered evidence together. For multiplayer or multi-user software, read [Multiplayer & Multi-user Support](../game-bible-guide.md#multiplayer--multi-user-support) and its hosting walkthrough. The chapter sits before Updates & DLC, but a multiplayer vision requires early shared-state design and a two-player Sandbox proof before scene assembly and release. Record N/A for a single-player release. Verify current provider instructions at setup time and distinguish written guidance from a deployed, tested service.

## Run questionnaire rounds

When building or revising a Project Bible questionnaire, follow [Coordinate contributors in rounds](../game-bible-guide.md#coordinate-contributors-in-rounds) for form content, sharing, and Bible records. Apply the [questionnaire style and verification defaults](../game-bible-guide.md#style-project-bible-questionnaires) before handing off the form. Save and link the exact round in the owning Bible before sending, and carry confirmed decisions and follow-up owners back as replies arrive. Keep access links and individual submissions in the authorized private records.

## Coordinate interface work

For new or redesigned game UI in Concept Generation, use **Impeccable to direct and review, and ImageGen to draw concepts on the actual game screen**. Derive the visual language from that game. Compare at play size and save the agreed concept, prompts and state examples in the project. Follow [Make the interface part of the art](../game-bible-guide.md#make-the-interface-part-of-the-art).

Use the [matched button reference](../game-bible-guide.md#generate-resting-and-pressed-button-artwork) in mockup prompts. Generate resting and pressed faces from the approved concept, wire them to real controls, and check the state swap with actual input at mobile play size.

In [UI & UX Design](../game-bible-guide.md#ui--ux-design), identify the buttons, icons, HUD pieces and frames to author and the states users need. In [Engine & Assets](../game-bible-guide.md#engine--assets), use the available art and engine specialists to make or import the files and wire them to the controls. Use the [Dock samples](../island-post/ui-art.md) when a contributor needs to see the handoff from artwork to behavior. Check the real controls and state changes in the sandbox and built workflow. Keep the asset ledger and test results with the project.

When changing what the Bible reader shows, start with [Present chapter data](../game-bible-guide.md#present-chapter-data). Use the design skills linked there to choose the reading order, set the type hierarchy, and verify the result in Open Chapter with real project records.

## Work the chapters for software

When Joe invokes the Bible for an app, site, or other software project, read the same chapter guide and use its chapter order. Identify the user, the workflow they need, the release scope, and the active chapter. For a new project, start at Vision & Scope. For work in progress, pick up at the last recorded decision or check.

Translate each chapter into the decision, deliverable, and completion evidence that make sense for this release. For an inventory app, write the stock adjustment workflow and rules in Design Document. In UI & UX Design, sketch the adjustment screens and decide where people see current stock, save the change, and correct an error. Record the project’s interface standards and how you’ll verify them. Choose the stack and gather UI assets in Engine & Assets. Prove stock adjustments in a dedicated development screen with realistic sample data you can reset. In Scene Scripts & Playtests, specify the screens and handoffs, then test adding, adjusting, and reconciling inventory. Verify the deployed app through its normal entry point in Build & Play the Game. Build a hands-on demo from the passing sandbox cases. Connect it to the manual and wiki, then use the verified demo to capture a trailer or walkthrough. Carry the remaining chapters through launch and pricing when applicable, contributor training, updates, and Engagement & Feedback. In Engagement, define who talks with whom after launch, why, what to discuss, where and how to talk, when and how often, and who follows up. Try a conversation or rehearsal and carry any relevant evidence into the next scope decision. Keep a project-owned Feedback Markdown file for what people and agents say during and after development. Link it from the chapter and connect entries to follow-up when they inform a change.

When a game, app, or other project needs to handle more demand, produce more content, or repeat the concept with another team or location, use [Scaling](../game-bible-guide.md#scaling). Start from a working baseline and record one bounded trial, its stop and recovery plan, and the result. If the project will stay at its current size, record why.

Use the project's own terms and existing artifacts. When a chapter has no equivalent for the release, record why and move to the next chapter. Record the observed result, revision, target, and artifact link using the same evidence standard as for games.

## Keep project records current

Keep project-owned Feedback and Changelog Markdown files and link them from the Bible. Capture every item of human or agent feedback when it comes in, during development and after launch. Append entries in entry order and use an ISO 8601 date and time with a time zone offset. Record the source, context, and what was said. Label paraphrases.

When you finish a meaningful change, append a timestamped changelog entry before handing off the work. Say what changed and how you checked it. Link the feedback entry when it prompted the change. Use the shared Bible’s [Feedback](../feedback.md) and [Changelog](../changelog.md) as examples.

## Showcase the work

When building the [Island Post example](../island-post-example.md), capture screenshots and link the actual outputs as each chapter develops. Show the design record in planning chapters, the runnable checks and gameplay in production chapters, and the release materials and feedback when available. Identify the release and label the evidence with its status so readers can see what the team has verified.
