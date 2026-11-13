---
name: project-bible
description: Use when planning, resuming, or verifying a game or software project with Joe’s Project Bible, from chapter work and release scope through launch, updates, and feedback.
---

# Project Bible

## Read the current chapter

Open the [live agent resource index](https://bible.ourstuff.space/resources/agent-index.md) for the current templates, tickets, skills, and examples. Read [Joe’s Notes](https://bible.ourstuff.space/resources/joes-notes.md) when designing or reviewing a user interface.

Read the [published chapter guide](https://bible.ourstuff.space/resources/game-bible-guide.md) at the start of each invocation. The [Project Bible site](https://bible.ourstuff.space/) renders its open chapters from this Markdown. Use the guide for chapter instructions, examples, and completion checks. If the user asks to work against an unpublished revision, read the guide from that revision and identify it in the handoff. If the current guide is unavailable, state that before relying on a user-supplied or cached copy.

## Update an existing Project Bible

Use the [setup and refresh instructions](https://bible.ourstuff.space/AGENTS.md) or the equivalent command in the project README. Refresh shared files separately from the project Markdown and saves. Check the project checkout for local edits before updating; preserve them. Compare the project record with its current configuration, runnable build, or deployment. Record confirmed changes in the existing chapter and keep open checks visible.

In a project reader, use **Project Bible** as the main heading and put the project's name directly underneath. Use the shared masthead stylesheet and keep the project name in the local reader.

## Work the chapter

1. Identify the project, release scope, and active chapter from the user's request and project records. Resume from the last recorded decision or check. For a new project, start with Vision & Scope and the [Bible template](https://bible.ourstuff.space/resources/game-bible-template.md).
2. Use the active chapter to identify the decision or artifact and what proves it. For a design decision, use the [playbook's staged conversation](https://bible.ourstuff.space/resources/game-development-playbook.md) when the user wants to work through options. For assigned build work, use the [release spec](https://bible.ourstuff.space/resources/game-spec-template.md) and the relevant [starter ticket](https://bible.ourstuff.space/resources/game-tickets/) when the project needs them.
3. Work within the requested scope. Record the observed result, applicable build or revision, target, and artifact link in the project's existing evidence record. Report missing evidence as unverified and name the next action it blocks or informs. Carry feedback into the next scope decision when the evidence warrants a change.

For Chapter 4, build one dedicated development scene before assembling player scenes. Make it a playable simulation where developers move through the scene and use objects or controls to trigger the actual game rules and see what the player would see. Put the current release’s mechanics, assets, controls, objects, and outcomes within reach. Document the development entry point or test-build shortcut, the named starting states, and how to reset and play each case again.

Give every release mechanic a playable case. In games with NPCs, include a roster picker for every release NPC and make every branch of their dialogue trees playable from the states that unlock it. Use the guide's list of checks to decide what else the release needs.

Use the [Development Sandbox chapter](https://bible.ourstuff.space/resources/game-bible-guide.md#development-sandbox) for the completion checks.

## Work the chapters for software

When Joe invokes the Bible for an app, site, or other software project, read the same published guide and use its chapter order. Identify the user, the workflow they need, the release scope, and the active chapter. For a new project, start at Vision & Scope. For work in progress, pick up at the last recorded decision or check.

Translate each chapter into the decision, deliverable, and completion evidence that make sense for this release. For an inventory app, write the stock adjustment workflow and rules in Design Document. Choose the stack and gather UI assets in Engine & Assets. Prove stock adjustments in a dedicated development screen with realistic sample data you can reset. In Scene Scripts & Playtests, specify the screens and handoffs, then test adding, adjusting, and reconciling inventory. Verify the deployed app through its normal entry point in Build & Play the Game. Carry the remaining chapters through user help, launch and pricing when applicable, contributor training, updates, and feedback.

Use the project's own terms and existing artifacts. When a chapter has no equivalent for the release, record why and move to the next chapter. Record the observed result, revision, target, and artifact link using the same evidence standard as for games.

## Showcase the work

When building the [Island Post example](https://bible.ourstuff.space/resources/island-post-example.md), capture screenshots and link the actual outputs as each chapter develops. Show the design record in planning chapters, the runnable checks and gameplay in production chapters, and the release materials and feedback when available. Identify the release and label the evidence with its status so readers can see what the team has verified.
