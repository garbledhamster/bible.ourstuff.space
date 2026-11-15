# Work modes

Choose the Work mode that fits what you want to do now. In a private project reader, open **Work mode** below the project name, choose a mode, and select **Set Work mode**. The reader saves it in the project’s Bible and shows a prompt you can copy into a chat. You can reopen the prompt from the same modal.

A mode tells the agent how to approach the work. A chapter tells you where the decision, task, or result belongs. You can switch from Build back to Grilling to revisit a decision, then return to Build. Use the recorded tasks and evidence to see how far the release has come.

Start a new project in **1. Explore** to learn where the idea could improve. Follow this order as the work calls for it:

1. [Explore](#explore)
2. [Grilling](#grilling)
3. [Plan](#plan)
4. [Build](#build)
5. [Testing](#testing)
6. [Maintenance](#maintenance)

You can switch to any mode at any time. The Work mode lives above the chapters in the project’s Markdown, for example `**Current phase:** Build`. Keeping that field lets older readers display the saved choice.

## Choose how to read a chapter

Open a chapter and use **Layout** in **Review**. **Default** opens the regular chapter view. **Editorial brief** puts the prose and a section index together. **Illustrative** gives the chapter’s existing images, media, and linked resources more room. **Architect** lets you expand and collapse sections. **Build handoff** puts the task sheet first so you can see what’s remaining or complete. Click a ticket ID on the sheet to open its details.

Switching layouts displays the same chapter and task records. The **Tasks** tab is still available for edits.

## Start to finish

1. Find or create your project folder and follow the [setup instructions](../AGENTS.md) to initialize the repository, install the shared Bible, and set up the project Bible and task list.
2. Set the current release and choose a Work mode. Start at [Vision & Scope](game-bible-guide.md#vision--scope), and work through the chapters that apply in order.
3. Capture Explore findings as proposals, save the Grilling decisions, and turn them into tasks in Plan. When Grilling and Plan give you an agreed scope, write the first usable draft of the applicable chapters before you start building that scope. Describe what you intend to make and how you’ll check it.
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

Use Ask Edwards’s gestalt lens as a project planning exercise. Step back from the chapter views and walk through the whole idea as someone would experience it, from opening it to getting what they came for. Look at how the chapter decisions work together. For example, if a player is supposed to learn which ground is safe by looking at it, the art, movement rules, and feedback need to teach the same thing. Resolve gaps and conflicts that would change the build.

Once the release makes sense as a whole, go back through every applicable chapter and outline all the build tasks you can identify from its decisions. Add them to the existing task list under the chapter they belong to. Say what each task should produce, what it depends on, and how you’ll know it works. Put unanswered decisions beside the tasks they block. Before implementation begins, use the Grilling decisions and plan to draft the chapter content for the agreed scope. For each applicable chapter, explain the intended behavior or design, link the work and acceptance checks, and mark anything still open. Then move to Build.

## Build

Build the full scope agreed in Plan. Use the sandbox and the minimum checks needed to keep building with confidence: confirm a piece works and that the next piece can use it. Update the relevant chapter while each piece is being built. Record how it works, decisions that changed, the artifact someone can open, and the checks you ran. Save those updates before starting dependent work or handing off the task. Assemble the pieces into a complete candidate. Move to Testing when someone can open or install it the way the intended audience will and exercise the whole release.

## Testing

Put the integrated candidate through the major checks. Walk the real user journeys end to end on the intended devices, playtest or try the workflows with people where appropriate, and check the failure and recovery paths. Fix what breaks and repeat the affected checks. When these checks pass, use the Release, Pricing & Marketing chapter to ship or hand off. Record which version went out, where to find it, and who owns follow-up.

## Maintenance

Once the product is shipped or handed over, collect feedback and make the edits people ask for. Record fixes, updates, and what you verified. If a bigger change needs its own release, choose the Work mode that fits the next step.
