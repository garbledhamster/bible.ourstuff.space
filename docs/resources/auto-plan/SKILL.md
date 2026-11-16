---
name: auto-plan
description: Use when the user asks for Auto Plan or the Project Bible's Plan workflow to turn settled Grilling decisions into chapter work and prepare Concept Generation.
---

# Auto Plan

Plan the whole release before writing chapter tasks. Carry forward the attributed decisions from Auto Grill or any equivalent Grilling record. An agent recommendation awaiting review stays a proposal.

## Read the release

1. Confirm the active project and release. Read its Bible, Grilling record, Task List, existing development tickets if relevant, and the latest evidence. Read the applicable chapters’ **Work mode instructions** and **Complete when** checks in the [chapter guide](https://bible.ourstuff.space/resources/game-bible-guide.md). Use the project’s pinned shared guide if it has one. Use the project’s own chapter names and completion checks when they differ from the shared guide.
2. Read three independent fields: **Lifecycle level** (Identification, Planning, Staging, Building / Execution, or Closing), **Stage** (the current milestone or progress within that level), and **Work mode** (how to work this turn, such as Plan). Use what the Bible records. If level or stage is missing or conflicts with the evidence, report the gap and propose a value with a reason. Confirm it only where the user has authorized that change. A stage marked “In progress” does not establish any chapter’s readiness.
3. Walk the main user journey from entry to useful outcome, including failure and recovery where they matter. Look across chapters for missing handoffs, conflicting decisions and shared work. Name what is outside this release. If authorized to delegate, give reviewers the same scope and source decisions, then reconcile their findings before saving one plan.

## Plan the chapter work

1. For each applicable chapter, draft what it needs at the current level and stage. Link the stable Grilling question, decision status, decision maker and source. Preserve earlier answers and approvals in the Grilling record. For an unresolved decision, record the question, who can answer it, and which outputs depend on it. Keep independent work moving.
2. Update the project’s existing [chapter Task List](https://bible.ourstuff.space/resources/task-list-workflow.md) in place. Match existing work by ID or outcome before adding an entry. Keep its ID, assignees, status, dependencies and evidence unless the record supports a change and the user has authorized it. When ownership is unknown, mark it unassigned and name who can resolve it if known.
3. Write each chapter task with one concrete output, the next action and owner, decision or evidence links, prerequisites, and the check that would show the output is ready. Separate planned checks from results somebody has observed. Close items only with evidence. Mark out-of-scope chapters with a reason rather than giving them filler tasks. Chapter tasks move the Bible forward at its current stage; link an existing development ticket when useful. Leave creation of implementation tickets to the later spec-to-tickets workflow.

## Prepare Concept Generation

For each chapter that can advance, record the intended result, a wide lead view and four supporting views or details, the source decisions and constraints, the task links, and who reviews the concept. Use diagrams, documents or other technical views where those explain the result better than a screen. Label the brief as a draft; concept approval belongs to the person who gives it. Follow the [chapter concept board guide](https://bible.ourstuff.space/resources/concept-boards.md).

Read back the draft chapters and Task List. Check that the main journey holds together, each task has one home, and each blocker is tied to the work it affects. Report which chapters can go to Concept Generation, which must wait, and the next action and owner. If authorized to save, use the project’s current revision and link the saved chapters; otherwise return a reviewable draft. Leave the saved mode, level and stage in place unless the user asks to change them.

**Example:** A workshop reservation release is at Planning / Release definition, with Work mode Plan. The owner approved Q08: show the session date and cancellation steps after a member reserves. Give UI & UX Design a draft confirmation task and brief for the receipt, with details for the date, cancellation link, phone view and return path. Q12 still needs the product owner to decide whether guests can reserve. Block the guest concept on Q12. Keep an existing sign-in copy task with its designer and report which parts, if any, depend on the guest decision. The confirmation brief can move to review; the guest branch cannot.
