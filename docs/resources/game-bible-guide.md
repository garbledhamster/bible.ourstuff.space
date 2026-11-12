# Game Bible guide

I put this guide together for the way I want to build games with people and with agents. I want to be able to open the project, see what we're trying to make, and play enough of it to tell if it's going the way we pictured. That starts with the first idea and goes all the way through helping people play, putting out updates, and figuring out what to work on next.

Use the [Game Bible template](game-bible-template.md) to keep the decisions for your own game. I'll use Island Post, an example game about delivering parcels on a rainy island, to show how those decisions carry from one chapter to the next.

## Vision & Scope

When I'm picturing a game, I usually have more ideas than I can use in the first release. I want to get far enough with one of them that I can put the game in someone's hands and see what they do. That means agreeing on who we're making it for, what they'll get to do, and what we can finish well enough for them to try.

### Project folders and Git

I set up the project folder while the idea is still small. When I come back to it, or ask an agent to pick it up, I want us both looking at the same files and history. Run `git status` from the game folder. If Git is already set up, confirm the root with `git rev-parse --show-toplevel` and use that repository. For a new project, run `git init` in the game folder.

Put a short folder map in the README. I might start with scenes, objects, and interface code in `src/`, original art and sound in `assets/`, and the Game Bible and decisions in `docs/`. Give the sandbox and tests a place in the map when you add them. If the engine puts things somewhere else, record where they actually live so the next person can find them.

Stage the README and first notes with `git add`, look over what you staged, and save that starting point with `git commit`. Keep credentials and local engine caches out of Git. If you use GitHub, I start with a private repository unless the owner wants it public. Confirm the remote and its visibility before you push. [GitHub’s setup walkthrough](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)

### Player promise, audience, and platforms

I try to describe the game from where the player is sitting. In Island Post, you're carrying a parcel across a rainy dock and trying to get it to someone dry. You can picture what you'll do, and there's a reason to pay attention to the route you take. Write that much for your own game, then say who you think would enjoy it and where they'll play.

A phone and a desktop can deliver the same experience with different controls. If I say both are in scope, I'm agreeing to try the actual game with touch and a keyboard before I tell people it works on both.

### First playable milestone and release scope

Pick one part of the game that has a beginning, a decision, and an outcome the player can see. Write down the scenes and rules needed to get them through it, along with how they'll open the game. Keep the other ideas in the plan so you can come back to them after seeing how the first part plays.

### Open decisions

Some choices are easier to make with the game in front of you. If I can't tell whether a route is clear on a phone, I write down who will check it, what they need to build to try it, and what other work depends on the answer. That gives us something to do when we get to the question.

### Island Post example

The first preview could be one delivery across the Dock. A player picks up a parcel, finds Mina, and gets another try if the parcel gets wet. I'd set up the private repo, put the scope notes in `docs/`, and commit them with the folder map. Market Lane and the Hill Route can wait while we find out whether people understand and enjoy that first delivery.

### Complete when

I can find the repository, the folder map, and the scope notes in Git. From those notes, I can tell who we're building for, how they'll play, what belongs in the first release, and what we'd need to see to call it a good first try.

## Game Design Document

Once I know what I want someone to get out of the game, I write down what they'll actually do. This is the Game Design Document. If I hand an agent the idea for a delivery game, it still has to guess when a parcel gets wet or what the player sees when that happens. We can work through those details on paper and then see how they feel in the sandbox.

### Player loop and intended experience

Walk through one turn from where the player starts. In a delivery game, they get a parcel, choose a route, find out whether the parcel made it, and decide what to do next. I want to write down where the player gets to make a choice and what the game tells them along the way. Later I can watch someone take a route and see whether they picked it for the reason I thought they would.

### Mechanics

A mechanic is a rule we can put into play. I write down what the player starts with, what they do, what changes, and how they find out. If they can fail, the rule also needs to say what they can do after that. Add the touch and keyboard details where they differ. A person or agent building the rule should be able to try it and know what result to look for.

### Scene roadmap and dependencies

I give each scene a rough outline so I can see what it introduces and what the player should already know. The outline is also where I note which rules, art, and sounds that scene needs. When we sit down to assemble it, we can write the full scene script with its dialogue and transitions. By then we know which pieces we're putting together.

### Open design decisions

I keep the questions that still affect the game close to the rules they touch. Maybe we're deciding between tapping a destination and holding a direction on a phone. Put both controls on the same short route and see where players hesitate or overshoot. The comparison gives us something to talk about before we write the control into every scene.

### Island Post example

Say an unwrapped parcel gets wet the moment the courier enters a puddle. The parcel icon changes as soon as it happens so the player can connect the two. The Dock can teach that rule. In Market Lane we can introduce wrapping, which gives the player another way to plan the crossing once they know what a puddle does.

### Complete when

I can follow a turn through the document, take a rule into the sandbox and know what to look for, and find the scenes that depend on it. Each open decision has a way to get an answer.

## Engine & Assets

I want to get a piece of the game running while the setup is still easy to change. A little map with a character and one object can tell me whether the engine can handle our controls and give the player the feedback we want. Once I can see that interaction, I have something to build the rest of the assets around.

### Engine and launch instructions

Write down which engine and version you're using, the devices you plan to support, and what someone needs to install. Then give them the command or link that starts the game from a clean checkout. I want someone opening the project for the first time to be able to follow the README and see the same interaction I see.

### Maps, characters, objects, interface, art, and sound

I make the asset list by walking through the scenes and asking what the player will see, hear, or touch. If an icon tells them the parcel is wet, I need both versions of that icon and a place in the game to look at them. Link each asset to the scene or rule that needs it. That's how I figure out which art or sound I want to get into the game first.

For a game like Island Post, I like the main screen to show the few things players need to keep track of. You can see the parcel and its condition while you move. Use icons and short words for things players check often, and give them a way to open the details by hovering, focusing with a keyboard, or pressing and holding. A game that depends on reading will need more text on screen. For this one, longer explanations can live in How to Play or with the item.

### Asset locations and readiness

Keep the working file or its source where the next contributor can find it. Mark which pieces are placeholders, which are ready to use, and which still need to be tried on a target device. A sprite can look right on its own and still be hard to read on the map. Open it in the game and see if it does its job at the size the player will see.

### Island Post example

I could start with a courier, a strip of dock tiles, a puddle, and the two parcel icons. Move the courier onto the puddle and look for the icon change. Once that works on the intended controls, there's a running example of how the map, movement, and art fit together before we fill out the Dock.

### Complete when

Someone can start the game from a clean checkout and show one real interaction with the assets it uses on an intended target. We know which remaining assets need work before we build the scenes that use them.

## Development Sandbox

Before I build out a scene, I want a real sandbox where I can get right to the part I'm working on. If I'm changing the way a wet parcel looks, I want to get straight to the puddle. The same goes for a menu, a piece of dialogue, or an object the player can use. I want a place where I or an agent can pull up that part of the game, try it, change something, and try it again.

### Launch link or command

Give the sandbox an entry point in the project and have it run the same game code the scene will use. I should be able to open a case, start from a known spot with the right items, and reset it without walking through a level. Keep the launch instructions where contributors already go to start the game.

### Scenario and expected behavior

Describe a case so another person can repeat it. Give them a starting state, an action, and something they can see or hear when it works. Start with success, failure, and how the player gets another try. Add cases for movement, menus, objects, dialogue, and the different controls when those pieces affect the scene you're about to build.

### Build, platform, result, and evidence

Keep the build or revision, the device and controls you used, what you expected, and what happened. A screenshot can show a changed icon. A short recording makes more sense if you're trying to show that a menu opens and closes at the right times. Link the evidence where the person picking up the scene will look for it.

### Open failures and next checks

When something fails, write down the case and which scene or release work depends on it. If Retry puts the player back with the same wet parcel, the Dock still needs a way for the player to recover. After the fix, start from that same failed delivery and see what Retry does before updating the result.

### Island Post example

Put the courier next to the same puddle twice. Start with a dry unwrapped parcel and cross the puddle, then reset and try the same move with a wrapped parcel. The first parcel should get wet and the second should stay dry. In a separate case, start with a failed delivery, press Retry, and check that the courier goes back to the start with a fresh parcel.

### Complete when

The person building the scene can open and reset the cases it relies on. The cases required for the release have passing results with enough detail for someone else to repeat them.

## Scene Scripts & Playtests

Once I've tried the pieces in the sandbox, I want to put them together and play one whole scene. The sandbox can show me the Retry button works. The scene tells me whether the player sees it when they're thinking about the delivery they just lost. That's why I like to finish a scene and watch someone play it before I build the next one.

### Scene script

Write the scene in the order the player experiences it. Where do they come in? What are they trying to do? Put the dialogue, prompts, and changes on screen where they happen. Follow the scene through each outcome and describe where the player goes when they finish, leave, or want another try.

### Mechanics and assets used

Link the scene to its rules in the Game Design Document and to the art, sound, objects, and interface it uses. Pull up their sandbox cases before assembly. Then play the scene with those same pieces in place. I might see the wet icon in the sandbox and miss it in the scene because it sits too close to the dialogue. That's something I can only check with the pieces together.

### Playtest criteria, observations, fixes, and result

Give a new player something to do and let them try it before you explain the controls or the route. Write down what they did, where they paused, and what they expected would happen. Once you change the scene, ask someone who hasn't seen it to try that part on the intended controls. They can show whether the change helped without remembering where you told the last player to look.

### Island Post example

Ask a first-time phone player to deliver a parcel to Mina. If the parcel gets wet, watch where they look before they try again. If they keep tapping the parcel icon, that tells us something about where they expect to recover. We can try moving Retry closer to the failed-delivery message, then watch a fresh player go through the same scene.

### Complete when

A player can go from the start of the scene to an outcome, recover where they need to, and continue or leave. Keep the observations and the result of the last check with the scene so the next person can see how it played.

## Build & Play the Game

Once I can play the scenes on their own, I want a build I can hand to somebody. I should be able to open it the way they will and get all the way through what we're releasing. It's easy to miss a map that never made it into the export when the engine has been loading it from your project folder the whole time.

### Build targets and steps

Write down the startup scene, the platforms you're building for, the source revision, and the tool version. Keep the build command or export settings with the setup instructions. If somebody finds a problem, I want us to be able to open the same version and see it before we try to fix it.

### Package and launch

For an installable game, package the assets and dependencies with it and try the actual app or installer on a clean target. For a browser game, serve the production build at a test URL and open it in a fresh browser profile. The point is to start with what a player gets and see whether it has everything they need.

### Playthrough and evidence

Start a new game and use the controls you expect players to use. Finish a full turn, follow the scene transitions, and try getting back on track after a failure. If there's a save, quit and reopen the game to see if it picks up where you left off. Keep the build ID, package or URL, target, and what you saw. If you fix something, make a new build and repeat the affected parts of the playthrough.

### Island Post example

I'd open the test URL on a phone with a fresh browser profile and start at the title screen. Take a parcel through a puddle, press Retry, and get the fresh parcel to Mina. If Market Lane is part of this build, follow the transition and check that the next map and parcel icons load. Keep that URL and build ID with the result so the screenshots and help can come from the same game.

### Complete when

I can repeat the build, open or install it on each target we're shipping, and play through the core loop. I have a record of the build that passed and can use it for the manual and screenshots.

## Player Manual & Wiki

I like to think about how we'll explain a game while we're designing it. Once we have a build to play, I can sit down with it and write the help using the words, icons, and screens the player will see. I want someone who's stuck to find the right bit of help and go back to what they were doing.

### In-game How to Play

Start with the controls and one thing a new player can try. Show what they'll see when it works and how they can recover from a mistake they're likely to make. If the main screen uses a parcel icon to show progress, use that same icon and a screenshot in How to Play. Ask a fresh player to find the help and do the action with it open or after reading it.

### Wiki topics and screenshots

Give an item, mechanic, or scene its own page when someone is likely to look it up. For a parcel, I'd explain how you get it, where it goes, what changes its condition, and what you can do once it's wet. A screenshot earns its place when it shows something a player needs to recognize, like the difference between the dry and wet icons. Link related pages where a player might need to take another step.

### Published references

Record where the manual and wiki live. Open them from the game the way a player would, then try the instructions on the build you're offering. If you've moved a button or changed the name of an item, update the picture and the words together so the reader can find it.

### Island Post example

How to Play can show the movement controls, the parcel icon, and where to find Retry. On the wiki, show what happens when you take the same puddle crossing with a wrapped and an unwrapped parcel in a build that includes wrapping. Link back to the recovery instructions for a player who's already stuck.

### Complete when

Someone can find the help from the game, follow it on the release candidate, and see the result you described.

## Release, Pricing & Marketing

I think about where a game might go and how people might pay for it while I'm working out the design. When it's time to release, I want those choices to match what we're actually ready to put in someone's hands. The page that gets them interested should give them a good idea of what they'll do after they click Play.

### Release scope, platform, price, and payment

Write down what people get, where they'll get it, and what it costs. A free Dock preview and a paid game with several routes give players different things to expect. If you're charging, try the purchase path and make sure the buyer can get to the game afterward. Keep the scope and the price with the release decision so the store page and the team describe the same offer.

### Readiness checks and release evidence

Save the build ID for the version you intend to ship. Start with a fresh player state at the intended delivery path and follow it through to a full turn in the game. Check the devices, controls, and access you're promising. I want the evidence tied to the build people will receive, since a new export can change what ends up in the package.

### Store copy, screenshots, pitch, and links

Describe something the player can picture themselves doing. A shot of the courier choosing a path through the Dock tells me more about Island Post than a list of broad claims about the game. Use screenshots or footage from the build, write a short pitch someone else can explain in their own words, and check the links for playing, purchasing when applicable, and finding help. After launch, open the public page and take the same path a new player would.

### Island Post example

For the Dock preview, I could show a real parcel delivery and say you get one route with a chance to retry if the parcel gets wet. On a phone, open the preview from its public page, finish a delivery, and follow the link to How to Play. That takes you through the experience the launch page describes.

### Complete when

The release candidate passes on the targets and access conditions we promised. A player can get to it from the public page and find the help they need.

## Contributor Training

When I bring somebody into a project, I want to give them a real piece of the game to work on. I want the same thing when I'm handing it to an agent. If they can start the game, change something small, and show me what happened, I can see whether the project is set up for someone else to work in.

### Setup, first task, and verification

Show the contributor how to launch the game and the sandbox from a clean checkout. Give them one task with an outcome they can demonstrate. If the task changes a scene, have them play the affected path and run the sandbox cases it relies on. Point them to where we keep the results so the next person can find what they tried.

### Decisions and references

Link the rules, scenes, assets, and checks that matter for the task. Include the reason behind a decision the contributor might encounter, such as making touch controls work differently so a finger leaves more of the map visible. A short explanation can save them from having to work out why the game behaves that way.

### Island Post example

Ask a person or agent to add a short delivery route using the existing parcel rules. They should be able to find those rules and the art, play the new route from its start to a delivery, and show what happens when a parcel gets wet. Have them leave the sandbox and scene results where the team can use them.

### Complete when

A new contributor can follow the guide, make a small change from a clean starting point, and show how they checked it.

## Updates & DLC

After a release, I want room to build more of the game. It could be a fix for people who already play or downloadable content (DLC) that gives them another part of it to explore. I work through the parts of the release process that the change touches, including what happens when somebody opens the new version with a game already in progress.

### Proposed changes, affected players, and release approach

Write down what changes, who gets it, and how they'll receive it. A fix to Retry might go to everyone with the base game. A new route might have its own access. If we're rehearsing the process, say what the rehearsal needs to prove. If we're shipping, say where a player will get the update and what they'll have when it finishes.

### Sandbox, scene, and compatibility checks

Start with the rules that changed and give them repeatable sandbox cases. Then play the scenes that use them. When the update touches saves, progress, or access, open the new build with data from the current release and see what a returning player can still reach. Write down which earlier checks you repeated and what made them relevant to this change.

### Manual, wiki, and release notes

Tell players what they'll see and what they need to do to use it. If you've moved Retry, replace the old picture and directions in the manual. If you've added a route, explain where to find it and who can access it. Open the help from the released build and check it against what a player gets.

### Island Post example

Say an expansion adds a kind of wrap that lasts through two puddles. Try it in the sandbox, then play the expansion route where it matters. Take a regular parcel across the original Dock again and open a save from before the update if the game has saves. Now we have checks for the new rule and for the experience people already had.

### Complete when

The update or rehearsal passes the checks it affects, including the relevant paths for existing players. The manual, wiki, and release notes describe what players get in that version.

## Intake & Feedback

Putting a game in front of people gives me a chance to see where their experience differs from what I pictured. Some people will play and tell me where they got stuck. Others might never make it past the page where I ask them to try it. I want a way to hear from both and bring something specific back to the next release.

### Who to hear from

Think about whose experience could answer a question you have. For a phone control, I'd watch a first-time phone player. For a purchase issue, I'd want to hear from somebody who tried to buy it. A person who left before pressing Play might help me understand what they thought they were getting from the page.

### Where feedback comes in and what to ask

Pick a place people can reach and that somebody can keep up with. Put it where players will see it before the playtest or launch. Ask what they expected, what they tried, and what happened. If someone tells me the game was confusing, I want to know what they were trying to do when they felt that way.

### Who reads, replies, and follows up

Give each channel an owner who will read it and respond. Tell people what you heard and what else you need from them, or when you can come back with an answer. If a report needs somebody else to look at it, record who has it so the original player can get a reply.

### What people said or did

Write down the report or observation with the date, build, device, and the circumstances that matter. I want to be able to tell the difference between a player tapping the parcel icon three times and my guess about why they tapped it. Keeping their words or the actual action makes it easier to revisit the problem when we have another report.

### Patterns, urgent issues, and open questions

Look for problems that keep showing up and for a report that needs a quick response, like someone paying and being unable to open the game. If the reason is unclear, ask a follow-up or set up another playtest. Two people can say they couldn't retry and have gotten stuck in different places.

### What returns to Chapter 1

Bring a finding back to Vision & Scope with the evidence behind it. Write down what you want to change, why it fits the next release, and how you'll see if it helped. If you decide to keep the scope where it is, record the reason so you can come back to that decision as you learn more.

### Island Post example

Suppose several phone players miss Retry after a wet delivery. I'd bring that back to the next scope decision with the playtest notes and a goal we can check. A first-time phone player should be able to recover from a wet delivery without someone telling them where to tap.

### Complete when

Someone owns the intake and has tried the path from receiving a report to responding. We've used what we heard to make and record the next scope decision.
