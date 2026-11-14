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

In a project reader, use **Project Bible** as the main heading and put the project's name directly underneath. Use the shared masthead stylesheet. Link the reader and active chapter when showing the user an update.

## Work the chapter

1. Identify the project, release scope, and active chapter from the user's request and project records. Resume from the last recorded decision or check. For a new project, start with Vision & Scope and the [Bible template](../game-bible-template.md).
2. In Vision & Scope, begin [research and source collection](../game-bible-guide.md#vision--scope) during kickoff. Record what you reviewed, what it tells you, and which open decisions it informs. Start with the project's own material and gather examples from Similar Projects alongside it.
3. Use the active chapter to identify the decision or artifact and what proves it.
   - Use Grill with Docs to work through a decision with the project owner.
   - Bring in [Wayfinder](../game-development-playbook.md#work-through-open-decisions) when related questions span sessions or block other decisions. Link one map from the project Bible.
   - Bring in [Design Wayfinder](../game-development-playbook.md#try-one-live-design-decision) when an interface question needs a live prototype. Reuse the existing decision ticket when there is one. Exercise the prototype on the supported screens and inputs and get the owner's reaction.
   - Record the accepted decision, reason, and evidence in the relevant Bible chapter. Close any decision ticket with a link to that record. For assigned build work, use the [release spec](../game-spec-template.md) and the relevant [starter ticket](../game-tickets/README.md).
4. Work within the requested scope. Record the observed result, applicable build or revision, target, and artifact link in the project's existing evidence record. Report missing evidence as unverified and name the next action it blocks or informs. Carry feedback into the next scope decision when the evidence warrants a change.

Follow [Carry the work through the chapters](../game-bible-guide.md#carry-the-work-through-the-chapters). Start with the earliest unmet chapter for the current playable scope. Before scene assembly, verify that Engine & Assets produced and loaded the main runtime assets derived from the vision, and that Development Sandbox exercised them with the actual mechanics. Return to an earlier chapter when its output is missing or a later check fails.

Save and embed every generated project image in the chapter where it was made or discussed, beside its context. Include alt text, caption, status, and a source or prompt link. Reuse the file across chapters and check the rendered reader.


For Development Sandbox, build one dedicated development scene before assembling player scenes. Make it a playable simulation where developers move through the scene and use objects or controls to trigger the actual game rules and see what the player would see. Put the current release’s mechanics, assets, controls, objects, and outcomes within reach. Document the development entry point or test-build shortcut, the named starting states, and how to reset and play each case again.

Give every release mechanic a playable case. In games with NPCs, include a roster picker for every release NPC and make every branch of their dialogue trees playable from the states that unlock it. Use the guide's list of checks to decide what else the release needs.

Use the [Development Sandbox chapter](../game-bible-guide.md#development-sandbox) for the completion checks.

In [Audio Engineering](../game-bible-guide.md#audio-engineering), plan the music for the release, including any decision to go without it. Then walk one playable encounter and record the events, cues, sources, and mix. Use the project's actual playback engine and version. Add resettable listening cases to the sandbox, then check the mix on target devices and play through with sound off. If the release calls for silence, record the decision in the chapter.

## Coordinate interface work

In [UI & UX Design](../game-bible-guide.md#ui--ux-design), identify the buttons, icons, HUD pieces and frames to author and the states users need. In [Engine & Assets](../game-bible-guide.md#engine--assets), use the available art and engine specialists to make or import the files and wire them to the controls. Use the [Dock samples](../island-post/ui-art.md) when a contributor needs to see the handoff from artwork to behavior. Check the real controls and state changes in the sandbox and built workflow. Keep the asset ledger and test results with the project.

## Work the chapters for software

When Joe invokes the Bible for an app, site, or other software project, read the same chapter guide and use its chapter order. Identify the user, the workflow they need, the release scope, and the active chapter. For a new project, start at Vision & Scope. For work in progress, pick up at the last recorded decision or check.

Translate each chapter into the decision, deliverable, and completion evidence that make sense for this release. For an inventory app, write the stock adjustment workflow and rules in Design Document. In UI & UX Design, sketch the adjustment screens and decide where people see current stock, save the change, and correct an error. Record the project’s interface standards and how you’ll verify them. Choose the stack and gather UI assets in Engine & Assets. Prove stock adjustments in a dedicated development screen with realistic sample data you can reset. In Scene Scripts & Playtests, specify the screens and handoffs, then test adding, adjusting, and reconciling inventory. Verify the deployed app through its normal entry point in Build & Play the Game. Build a hands-on demo from the passing sandbox cases. Connect it to the manual and wiki, then use the verified demo to capture a trailer or walkthrough. Carry the remaining chapters through launch and pricing when applicable, contributor training, updates, and feedback.

Use the project's own terms and existing artifacts. When a chapter has no equivalent for the release, record why and move to the next chapter. Record the observed result, revision, target, and artifact link using the same evidence standard as for games.

## Showcase the work

When building the [Island Post example](../island-post-example.md), capture screenshots and link the actual outputs as each chapter develops. Show the design record in planning chapters, the runnable checks and gameplay in production chapters, and the release materials and feedback when available. Identify the release and label the evidence with its status so readers can see what the team has verified.
