# Work modes

Choose the Work mode that fits what you want to do now. In a private project reader, open **Work mode** below the project name, choose a mode, and select **Set Work mode**. The reader saves it in the project’s Bible and shows a prompt you can copy into a chat. You can reopen the prompt from the same modal.

A mode tells the agent how to approach the work. A chapter tells you where the decision, task, or result belongs. You can switch from Build back to Grilling to revisit a decision, then return to Build. Use the recorded tasks and evidence to see how far the release has come.

Start a new project in **1. Explore** to learn where the idea could improve. Follow this order as the work calls for it:

1. [Explore](#explore)
2. [Grilling](#grilling)
3. [Plan](#plan)
4. [Concept Generation](#concept-generation)
5. [Build](#build)
6. [Testing](#testing)
7. [Maintenance](#maintenance)

You can switch to any mode at any time. The Work mode lives above the chapters in the project’s Markdown, for example `**Current phase:** Build`. Keeping that field lets older readers display the saved choice.

## Lifecycle level and stage

Record the Bible’s **Lifecycle level** as Identification, Planning, Staging, Building / Execution, or Closing. Record its **Stage** as the current milestone or progress within that level. For example, a release can be at Planning, with the release definition in progress, while the team uses Grilling to resolve one more decision. Use the actual release and evidence to set these fields. Changing Work mode does not change them.

## Choose how to read a chapter

Open a chapter and use **Layout** in **Review**. **Default** opens the regular chapter view. **Editorial brief** puts the prose and a section index together. **Illustrative** gives the chapter’s existing images, media, and linked resources more room. **Architect** lets you expand and collapse sections. **Build handoff** puts the task sheet first so you can see what’s remaining or complete.

Use **Work queue** to pick up open work or see what’s waiting. It brings recorded assignments and blockers alongside the ticket. Use **Marketing brief** to jump to sections named for topics such as audience, release scope, and store copy, with the full chapter below.

In **Work queue** or **Build handoff**, select a ticket ID to read the ticket in a callout. The pointer stays aimed at the ticket as the card moves to fit the available space. Scroll inside the card for longer tickets. Close it with **×**, Escape, or a click outside the card.

When you see a ticket ID in chapter text or a project document, highlight the complete ID to open the same callout. On a phone, press and hold the text and adjust the selection handles to include the whole ID. The reader looks up the ticket in the current project.

Switching layouts displays the same chapter and task records. The **Tasks** tab is still available for edits.

## Start to finish

1. Find or create your project folder and follow the [setup instructions](../AGENTS.md) to initialize the repository, install the shared Bible, and set up the project Bible and task list.
2. Set the current release and choose a Work mode. Start at [Vision & Scope](game-bible-guide.md#vision--scope), and work through the chapters that apply in order.
3. Capture Explore findings as proposals, save the Grilling decisions, and turn them into tasks in Plan. Draft the applicable chapters and take them into Concept Generation. Show the intended results in each chapter’s concept page and record which visuals the creator approved.
4. In Build, update the owning chapter as each piece takes shape. Record what you built, what changed from the plan, and what you verified before moving on. Link the relevant task or artifact and name the next action and owner.
5. Use the checks below when deciding what work to do next. If a new finding changes an earlier decision, reopen that decision and repeat the affected work. Keep the next action visible in the Bible.

For example, in Zoo Helper, the visitor queue starts with a decision about what a child should see and hear. Plan turns it into a task with starting conditions and expected results. Before building, write the agreed cue and queue rules into the relevant chapters. As the queue becomes playable and resettable, add the actual behavior, playable build, and sandbox findings. Testing watches a child try it and checks the cue with sound off. Maintenance links any later fix to the observation that prompted it.

## Explore

Use Explore when you have an early idea, a chapter feels thin, or feedback shows the current design could work better. Start in the chapter that owns the question. Read what the project already says, look at the actual work or feedback, and name what you want to improve. Record where each observation came from and what you still need to find out.

1. **Frame the question.** Use the [Double Diamond](https://www.designcouncil.org.uk/resources/the-double-diamond/) to look beyond the first explanation. For example, turn “add a tutorial” into “How might we help a first-time player choose the right queue without stopping play?”
2. **Generate before judging.** Brainwrite several distinct ideas privately before comparing any. In a group, run [1-2-4-All](https://www.liberatingstructures.com/1-2-4-all): think alone, compare in pairs, combine ideas in fours, then share patterns. A solo agent can draft separate passes from the player, designer, and maintainer viewpoints. Keep one option based on the workflow that already exists.
3. **Compare and test.** Group related ideas, then compare which address the observed problem, what they cost to try, and what could prove them wrong. Pick the smallest useful test. For the queue, try floor markings, a character cue, and a quieter layout with the next person who plays. Record which cue they notice and what they do with it.
4. **Save the exploration before handing off.** Record the question, sources, strongest alternatives, recommendation and reason, and the next test or decision with an owner. Keep the findings in a clearly marked draft section or a project note linked from the owning chapter. Label proposals and assumptions so the team can tell them apart from observed results and approved decisions. Bring choices that need the creator into Grilling. Carry accepted outcomes into Plan.

## Grilling

Explore options and gather enough evidence to discuss them. Work through the applicable chapters with the creator. Use Grill with Docs to make decisions about what you’re trying to make and what people should experience. Link the complete [grilling record](auto-grill/SKILL.md#record-the-whole-interview) from the Bible. Keep who asked, who recommended each option, who answered and what was decided. Save the current decision in its chapter. Bring any question number back to the conversation to discuss it, add your own answer or take over the remaining interview. Move to Plan when you have enough decisions to describe the release and identify what still needs an answer.

## Plan

Use [Auto Plan](auto-plan/SKILL.md) to walk the release as someone would experience it, from opening it to getting what they came for. Check how the chapter decisions work together. If a player learns which ground is safe by looking at it, the art, movement rules, and feedback need to teach the same thing.

Draft the applicable chapters from the Grilling decisions and agreed scope. Update their existing Task List entries for the current lifecycle level and stage. Record what each task should produce, who owns it, what it depends on, and how to check it. Put unanswered decisions beside the work they block. Keep these chapter tasks separate from implementation tickets. Prepare a Concept Generation brief for each chapter that can advance, and name what still needs a decision.

## Concept Generation

Show the creator what they are going to get while the work can still change easily. Give every applicable chapter its own concept page. Use one wide lead image above four smaller, captioned panels in two columns. The lead shows the chapter’s main outcome in context. The four panels show related screens, scenes, states, or production details that explain how that outcome works. Use the [chapter concept board guide](concept-boards.md) and [board template](concept-board-template.html).

Use full-size, finished-looking mockups for the app screens or game scenes people will see. For chapters that cover technical or operational work, visualize the relevant state, diagram, runbook, package, or observation sheet. Mark anything that needs empirical evidence as a planned result. Keep the originals in the project chapter, link every panel to the full-size artifact, and record provenance, what is under review, and the owning chapter task. Add implementation ticket links when the team has created them.

Record the exact type, spacing, positions, behavior, asset treatment, and supported sizes needed to reproduce any approved visual. Use measurements and stated values with the mockup. Record the creator’s approval by board or panel, the revision it applies to, and the next ticket. Move approved scope into Build and keep unresolved visual decisions beside the work they block.

## Build

Build the agreed scope from Plan and the approved chapter concepts. Use the sandbox and compare the working result with the approved visual and its build specifications at the intended sizes. Update the owning chapter with the artifact, checks, and any changes the creator approved. Assemble the pieces into a complete candidate. Move to Testing when someone can open or install it the way the intended audience will and exercise the whole release.

## Testing

Put the integrated candidate through the major checks. Walk the real user journeys end to end on the intended devices, playtest or try the workflows with people where appropriate, and check the failure and recovery paths. Fix what breaks and repeat the affected checks. When these checks pass, use the Release, Pricing & Marketing chapter to ship or hand off. Record which version went out, where to find it, and who owns follow-up.

## Maintenance

Once the product is shipped or handed over, collect feedback and make the edits people ask for. Record fixes, updates, and what you verified. If a bigger change needs its own release, choose the Work mode that fits the next step.
