# Game Bible guide

Use this guide alongside the [Game Bible template](game-bible-template.md). The examples follow Island Post, a browser game about delivering mail on a rainy island.

## Vision & Scope

Start with something you can show a player. A clear promise gives you a way to decide what belongs in the first release and what can wait.

### Project folders and Git

Choose the game’s project folder and set up Git while you’re working out the idea. Run `git status` there to see whether the project already uses Git. If it does, confirm the repository root with `git rev-parse --show-toplevel` and use the existing history. For a new project, run `git init` in the project folder.

Put a short folder map in the README so you and an agent know where to find the same things. A starting layout can put scenes, objects, and UI in `src/`, original art and sound in `assets/`, and the Game Bible, design notes, and decisions in `docs/`. Give sandbox scenarios and tests a known location as they come into use. Reuse the same layout across games where the engine allows it. If the engine needs a different path or the project outgrows a folder, update the map and commit it with the change.

Save the first Game Bible notes. Use `git add` to stage the README and notes, check the staged files, and use `git commit` to save the starting point. Keep credentials and local engine caches out of commits. If you host the project on GitHub, start with a **private** repository unless the owner wants it public. Connect it as the remote and verify its visibility before pushing. For a project that already has a remote, confirm it points to the intended repository. [GitHub’s setup walkthrough](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)

### Player promise, audience, and platforms

Describe what the player gets to do and why it could be worth their time. Name who you’re building for and how they’ll play. A phone browser with touch controls and a desktop browser with a keyboard can support the same promise, but you’ll need to check both.

### First playable milestone and release scope

Choose the smallest release that lets someone experience the promise from start to finish. Write down the scenes and mechanics it needs, how you’ll deliver it, and what you’re saving for later.

### Open decisions

Record each unresolved question with an owner and the work it affects. If a decision needs a playable answer, write down what the prototype needs to demonstrate.

**Complete when** someone can find the project’s Git repository and folder map, see the planning notes in its history, and tell who the game is for, what they’ll do in the first release, and how you’ll tell if it worked.

**Island Post example.** Start a private GitHub repository and commit the first design notes in `docs/` with a README that names the code and asset folders. The first preview lets a phone or desktop player take one parcel across the Dock and retry if it gets wet. Market Lane and the Hill Route can wait until players have tried that first delivery.

## Game Design Document

Write down how play works before asking an agent to build it. Start with a full turn, then describe the rules that make that turn interesting.

### Player loop and intended experience

Trace the loop from entry to player action, feedback, outcome, and the next action. Describe what you want the player to notice or feel at each decision. That gives the playtest something to check beyond whether the code runs.

### Mechanics

For each rule, record the starting state, input, state change, and visible or audible feedback. Cover what happens on success, what happens on failure, and how the player can recover. Include any difference between touch and keyboard controls.

### Scene roadmap and dependencies

Outline what each scene introduces. Link each scene to the rules, assets, and earlier lessons it depends on. Write the full dialogue and transition script when the scene is ready to assemble.

### Open design decisions

Give each unresolved design question a way to settle it. You might compare two inputs in a sandbox or watch players choose between two routes without explaining the choice.

**Complete when** someone can turn each rule into an observable test and tell which scenes depend on it.

**Island Post example.** Entering a puddle soaks an unwrapped parcel. The parcel icon changes so the player can see what happened. The Dock teaches that rule, and Market Lane adds wrapping once players know why it helps.

## Engine & Assets

Get one representative interaction running on the intended target. Use it to prove you can load the scene, handle input, and show the player an outcome.

### Engine and launch instructions

Record the chosen engine, supported targets, and the command or link that starts the game from a fresh checkout. Include any setup a contributor needs to perform before the first run.

### Maps, characters, objects, interface, art, and sound

List what players see, hear, and interact with. Tie each asset to the scenes or rules that use it so you can tell when it needs to be ready.

### Asset locations and readiness

Link to each asset or its source. Mark what’s ready, what’s a placeholder, and what still needs to be checked on the target. Check that the real assets load and communicate their intended states before relying on them in a scene.

**Complete when** a contributor can launch a clean checkout and demonstrate one real interaction with its representative assets.

**Island Post example.** Open a small map, move the courier onto a puddle, and see the parcel icon change. This checks input, movement, map tiles, and feedback before the Dock needs its full art.

## Development Sandbox

Give the team a place to exercise a behavior on demand. The sandbox should make it easy to set up an unusual state and repeat a check after a change.

### Launch link or command

Provide a direct entry point that runs the current game code. A contributor should be able to select a case and reset it without playing through a scene first.

### Scenario and expected behavior

Write each case as a known starting state, an action, and an observable outcome. Include success, failure, and recovery. Add cases for art, dialogue, menus, or different inputs when they affect what the player can do.

### Build, platform, result, and evidence

Record the build, device or input, expected outcome, and actual result. Attach a test result, screenshot, or short recording that lets someone else understand what you checked.

### Open failures and next checks

When a case fails, record which scene or release work it blocks. Name the specific check to repeat after the fix and update the result when it passes.

**Complete when** the required cases for the release can be reset and repeated, and each has passing evidence.

**Island Post example.** Cross the same puddle with a dry unwrapped parcel and then with a wrapped one. The first should soak and the second should stay dry. After a failed delivery, Retry should put the player back at the start with a fresh parcel.

## Scene Scripts & Playtests

Build one complete scene at a time. The script tells the team what the player can do, and the playtest shows what the player actually does.

### Scene script

Write how the player enters, what they’re trying to accomplish, what the game shows or says, and what happens after each outcome. Include the route to retry, leave, or continue.

### Mechanics and assets used

Link the scene to the rules and assets it needs. Use the sandbox to verify them first, then check that they still work together in the assembled scene.

### Playtest criteria, observations, fixes, and result

Give a new player a task and watch what happens before offering help. Record what they tried, where they got stuck, and what they expected. Fix anything that blocks the intended experience and repeat the affected check on the intended controls.

**Complete when** a player can go from entry to outcome, the transitions and recovery work, and you have evidence that the scene delivers the intended experience.

**Island Post example.** Ask a first-time phone player to deliver to Mina. If they soak the parcel, watch where they look for Retry. Retest the change with someone who hasn’t seen the scene.

## Build & Play the Game

Once the scenes work on their own, put them together into a build someone can open and play. Start where a player starts and follow the game through a complete loop. This is where you find things that can be easy to miss while working on a scene, like an asset that didn’t make it into the export or a transition that sends the player to the wrong place.

### Build targets and steps

Choose the startup scene and the platforms in scope. Record the source revision, engine or tool version, and command or export settings you used to make the build. Include any setup someone else needs to repeat it.

### Package and launch

Compile or export the game for each target and include the assets and dependencies it needs. For an installable game, use the installer or app package on a clean target device or environment and launch it as a player would. For a browser game, serve the production build at a test URL and open it in a fresh browser profile.

### Playthrough and evidence

Start a new game from the player entry point. Use the intended controls to finish a core loop and check the transitions between scenes. Try a failure and recovery path if the game has one. If the game saves progress, close it, reopen it, and check that you can continue. Fix any failures and rebuild before repeating the affected checks.

**Complete when** you can repeat the build, open or install it on each target in scope, and play through the core loop. Record the build ID or revision, package or test URL, target, and observed result. Use that build when writing the player manual and taking screenshots.

**Island Post example.** Serve the production export and open it on a phone in a fresh browser profile. Start at the title screen, soak a parcel, retry, and deliver a fresh one to Mina. Follow the transition to Market Lane and check that its map and parcel icons load. Record the URL and build ID with the result.

## Player Manual & Wiki

Write the help from the playable build so players can recognize what they see on screen and use it to decide what to do.

### In-game How to Play

Show the controls, the first useful action, and the feedback players should look for. Include how to recover from a common mistake. Ask a fresh player to find the help and use it to perform the action.

### Wiki topics and screenshots

Give mechanics, items, and scenes their own entries when players are likely to look them up. Use screenshots from the build and explain the examples in terms of what the player does.

### Published references

Record where the manual and wiki live. Check their links from the game and confirm the instructions still match the release.

**Complete when** a player can find the help, follow it, and see the described result in the candidate build.

**Island Post example.** Show movement and parcel condition in How to Play. On the wiki, compare the same puddle crossing with wrapped and unwrapped parcels and link to the retry instructions.

## Release, Pricing & Marketing

Decide how players will get the game and check that the exact build you’re offering delivers the experience shown in the launch material.

### Release scope, platform, price, and payment

Record what ships, where it’s available, and what it costs. If people pay, run the relevant purchase and access checks. If a preview and a full release differ, say what players get in each.

### Readiness checks and release evidence

Record the candidate’s build identifier. Start from the intended delivery path with a fresh player state and complete the core loop. Check any platforms, inputs, or access conditions promised for this release.

### Store copy, screenshots, pitch, and links

Describe what players actually do and use screenshots from the build. Check the store or landing page links to play, purchase, and get help. After publishing, repeat the launch check from the real player entry point.

**Complete when** you have passing evidence for the release candidate and the delivery path works as promised.

**Island Post example.** Publish the Dock preview with footage of a real parcel delivery. Open it from the landing page on a phone, finish a delivery, and verify the link to How to Play.

## Contributor Training

Write the handoff around one real task. A short guide is enough if a new contributor can get to a working change and prove it.

### Setup, first task, and verification

Show how to start the game and sandbox, make a representative change, and run the checks it affects. Give the contributor a specific outcome to demonstrate and a place to record the evidence.

### Decisions and references

Link to the rules, scene scripts, and checks they’ll need. Include decisions they might otherwise reverse by accident, such as why a control behaves differently on touch.

**Complete when** someone new can follow the guide from a clean starting point, complete a small change, and show how they verified it.

**Island Post example.** Ask a teammate or agent to add a small delivery route. They should be able to reuse the parcel rules, play from entry to outcome, and show the affected sandbox and scene results.

## Updates & DLC

Take a proposed change through the parts of the release process it touches. Decide what players get and how to prove their existing game still works.

### Proposed changes, affected players, and release approach

Describe the change, who receives it, and how it will reach them. Decide whether you’re rehearsing a release or delivering an update or expansion.

### Sandbox, scene, and compatibility checks

Add or update the affected sandbox cases and play the changed scenes. Check existing saves, progress, and access when the change touches them. Record which earlier checks you repeated and why.

### Manual, wiki, and release notes

Tell players what changed and how to use it. Replace screenshots and instructions where behavior changed, and check that help still matches the released game.

**Complete when** the update or rehearsal passes its affected checks and the player-facing material reflects the change.

**Island Post example.** Prove a new parcel rule in the sandbox, use it in an expansion route, and play an original route to make sure the new rule hasn’t changed an old delivery.

## Intake & Feedback

Listen to people who are considering the game as well as those already playing. The point is to learn what should change in the next release and what you need to find out first.

### Who to hear from

Name the people whose experience you need to understand. Include prospects who stopped before playing, current players, or paying customers when their experience is relevant.

### Where feedback comes in and what to ask

Pick channels people can reach and you can maintain. Ask what they expected, what they tried, and what happened. Set up intake before a playtest or launch so people know where to respond.

### Who reads, replies, and follows up

Give each channel an owner. Let people know you heard them and explain when you’ll follow up or what else you need to understand the report.

### What people said or did

Record the observation or report with its source, date, build, device, and context where relevant. Keep what people actually said or did clear so the team can revisit the evidence.

### Patterns, urgent issues, and open questions

Look for recurring friction and identify issues that need attention now. Ask a follow-up question or run another playtest when the evidence leaves the cause unclear.

### What returns to Chapter 1

Bring a specific finding back to Vision & Scope. Record the scope decision, the evidence behind it, and what you’ll check in the next release. If you hold scope, record why.

**Complete when** someone owns the intake, you’ve exercised the path from receiving feedback to responding, and you’ve written down the next scope decision.

**Island Post example.** Several phone players report missing Retry after a wet delivery. Bring that finding into the next release with a testable goal. A first-time phone player can recover from a wet delivery without coaching.
