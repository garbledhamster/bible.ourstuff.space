# Game Development Playbook draft

Use the Project Bible template to record the project's decisions, working artifacts, and evidence. When resuming, read the current stage and identify the next decision or check.

For a new Project Bible, follow the [Vision & Scope kickoff](game-bible-guide.md) with Project Bible and Grill with Docs.

When an idea is ready to build, fill in the [game spec template](game-spec-template.md) and use the [preset ticket list](game-tickets/README.md) to create the work in dependency order. Record evidence against the chapter’s completion checks.

1. Establish the player promise, initial scope, and rough scene roadmap. Record engine, audience, documentation, distribution, and potential update decisions at the level needed now.
2. Work through unresolved design decisions in rounds. Use the chat pop-out, lead with the recommended option and its reason, and offer realistic alternatives. Update the Bible and complete the agreed preparation between rounds. Use [UI & UX Design](game-bible-guide.md#ui--ux-design) to sketch the core workflow, set interface standards, and name the artwork and states each control or frame needs. Carry that list into [Engine & Assets](game-bible-guide.md#engine--assets), create the files, and plan the checks you’ll use once it runs.
3. During preparation, build one dedicated development sandbox scene with a direct way for contributors to open it. Put the release’s mechanics, assets, controls, objects, and outcomes within reach. Play the cases in the scene by using objects and controls that run the actual game rules. Give each case a named starting state, a reset, and an observable pass criterion. Cover every release mechanic, every dialogue branch through the NPC roster picker when the game has NPCs, and the other checks that apply in the [Development Sandbox chapter](game-bible-guide.md#development-sandbox). Record the results before assembling the player scenes.
4. Script, assemble, and playtest one scene at a time. Use Game Quality Control to record what players can do.
5. Compile or export the assembled game. Install the package or open the staged browser build on each target in scope, then play the core loop across scenes and record the result.
6. Build a public demo from passing sandbox cases. Connect the manual and wiki to it and capture the verified workflow for release material. Record distribution, pricing, and launch checks.
7. Show contributors how to start the game, use the sandbox, and verify changes. Run updates and DLC through the affected steps.
8. Set up intake before you need it. Decide how prospects, players, and customers can reach you, who replies, and how you’ll record what they say. Review the feedback after a playtest or release, follow up, and take the evidence that changes the next cycle back to Vision and Scope.

Use the [Project Bible guide](game-bible-guide.md) for the complete chapter instructions and examples.

## Work through open decisions

Use **Wayfinder** when a release has questions that span sessions or block other decisions. Start from the [Vision & Scope open decisions](game-bible-guide.md#open-decisions). Give the effort a destination, put answerable questions on decision tickets in the project's existing tracker, and record which questions depend on which answers. If there's no tracker, use local Markdown. Keep one map and link it from the project Bible. Work the next ready question with the evidence it needs. Use Grill with Docs when the owner can answer through discussion.

Once a decision is settled, record the answer, reason, and evidence in the relevant Bible chapter. Close the decision ticket with a link there and add a one-line summary to the map. When the way is clear, use the release spec and build tickets for the work people can now do.

## Try one live design decision

Use **Design Wayfinder** when the owner needs to use the interface to decide. Start in [UI & UX Design](game-bible-guide.md#ui--ux-design) and use the existing decision ticket if the project has one. Write down where the person enters, what they do, what state the action reads or changes, what they see, and how they can tell it worked. Build the smallest working version in the project. Check it on the intended screens and inputs, then ask the owner to try it and give their reaction before settling the question.

For a comparison, keep the task and starting state consistent. Link the evidence from the chapter and carry the selected behavior into the sandbox and playtest as appropriate. [See how Island Post used this for Retry](island-post-example.md#ui-and-ux-design).
