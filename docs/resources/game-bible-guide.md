# Project Bible guide

I put this guide together for the way I want to build games with people and with agents. I want to be able to open the project, see what we're trying to make, and play enough of it to tell if it's going the way we pictured. That starts with the first idea and goes all the way through helping people play, putting out updates, and figuring out what to work on next.

Use the [Project Bible template](game-bible-template.md) to keep the decisions for your own game. I'll use Island Post, an example game about delivering parcels on a rainy island, to show how those decisions carry from one chapter to the next.

### Carry the work through the chapters

Work through the chapters in order for the current playable scope. Each chapter takes something from the previous one, improves it, and checks the result. Carry the same scene or interaction from the vision art into a design, a UI sketch, engine-ready assets, a sandbox case, and then a playable scene. When testing exposes a gap, return to the chapter that owns it and repeat the affected checks before moving on. Keep the next unmet check visible when work pauses.

Embed every image generated for the project in the chapter where it was made or discussed. Save the image in the project and put it next to the decision, asset, or result it illustrates. Give it useful alt text and a short caption explaining its purpose and current status. Link the source or prompt and reuse the same file when a later chapter needs it. Open the rendered chapter to confirm the image loads. For chapters that change the playable build, record what you tried, the result, and what the next chapter can build on.

## Vision & Scope

### Kick off the project

Start each new Project Bible with Vision & Scope. If you're working with an agent, use Project Bible and Grill with Docs together. Read the project notes and check the repository first, then use the chat pop-out to work through decisions in rounds. Put the recommended choice first and explain what each realistic option changes. Ask the next set of questions after the answers it depends on are in.

Save agreed decisions in the project's Bible as you go. Keep a short glossary in `CONTEXT.md` as the project's terms settle. Once the owner confirms the player promise, audience, platforms, visual direction, first playable, and how we'll check it, use that scope to start the Design Document. Keep the open decisions visible so the next person knows what still needs an answer.


When I'm picturing a game, I usually have more ideas than I can use in the first release. I want to get far enough with one of them that I can put the game in someone's hands and see what they do. That means agreeing on who we're making it for, what they'll get to do, and what we can finish well enough for them to try.

### Research and source collection

Start collecting material during kickoff so you have something concrete to work from in the first scope conversation. Begin with the project's own notes, existing work, and original sources that explain the subject or the people who will use what you're making. Gather useful text files, PDFs, datasets, videos, recordings, and transcripts as they apply. Keep authorized copies in the project when they help. Link to originals that should stay where they are.

Keep a short source record with the author or organization, original link or file, relevant page or timestamp, what you learned, and which decision it informs. Mark material you still need to review and record any limits on reuse. When a source changes what you're picturing, bring the finding into the next scope conversation. Collect Similar Projects alongside this work so you can also see how other people handled a comparable experience.

### Project folders and Git

Use the [project Bible setup instructions](https://bible.ourstuff.space/AGENTS.md) to keep a local copy of the shared guide, templates, and assets that you can update from the main Bible.

I set up the project folder while the idea is still small. When I come back to it, or ask an agent to pick it up, I want us both looking at the same files and history. Run `git status` from the game folder. If Git is already set up, confirm the root with `git rev-parse --show-toplevel` and use that repository. For a new project, run `git init` in the game folder.

Put a short folder map in the README. I might start with scenes, objects, and interface code in `src/`, original art and sound in `assets/`, and the Project Bible and decisions in `docs/`. Give the sandbox and tests a place in the map when you add them. If the engine puts things somewhere else, record where they actually live so the next person can find them.

Stage the README and first notes with `git add`, look over what you staged, and save that starting point with `git commit`. Keep credentials and local engine caches out of Git. If you use GitHub, I start with a private repository unless the owner wants it public. Confirm the remote and its visibility before you push. [GitHub’s setup walkthrough](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)

### Player promise, audience, and platforms

I try to describe the game from where the player is sitting. In Island Post, you're carrying a parcel across a rainy dock and trying to get it to someone dry. You can picture what you'll do, and there's a reason to pay attention to the route you take. Write that much for your own game, then say who you think would enjoy it and where they'll play.

A phone and a desktop can deliver the same experience with different controls. If I say both are in scope, I'm agreeing to try the actual game with touch and a keyboard before I tell people it works on both.

### Visual Vision

Ask the creator, “Picture one moment that shows what you're trying to make. What do you see in your mind’s eye?” Start with their description of a scene in the game or a screen in the software. Ask which details give it the feeling they want. If they bring a reference, ask what they see in it that belongs in their project.

Make one rough image of that scene or screen and show it to the creator. Ask what feels right and what they'd change. Revise the image from their feedback and show it again. Keep going until they say it feels like what they pictured. For Island Post, we might try a blue-gray dock with warm light in Mina’s window. If the light feels right but the dock looks too polished, keep the light and try rougher boards.

Embed the chosen image in this chapter beside the creator's description and the details they want to carry forward. If the conversation pauses, save the latest image as a draft and record what still needs their reaction. Use the chosen image as a reference when you sketch the interface and make the assets.

### Similar Projects

Look for games, apps, products, or services that solve a similar problem, serve a similar audience, or handle one part of the experience well. Include relevant open-source and closed-source examples. For each one, link to what you looked at, say what it has in common with your project, and write down a question you want to carry into a later chapter.

For an open-source project, look at the running product as well as its source, docs, and tests where they help answer your question. Check the license before reusing code or assets. For a closed-source product or service, try the workflow if you can and use public demos, help pages, or release notes to see how it works for the people using it.

If I were building a task board, I'd look at how [Kanboard](https://github.com/kanboard/kanboard), an open-source app, handles moving a task between columns. That gives me something to check in the Development Sandbox, where I'd try moving a task and refreshing the board to see whether it stayed put. I'd also look at how [Trello](https://support.atlassian.com/trello/docs/getting-started-with-trello-video-demo/), a closed-source service, introduces a first board. I'd use that to decide what to explain in the Design Document and what to leave for Demo, Manual & Wiki. I could then watch someone add and move a card to see where they need help.

As you work through the Bible, bring each reference back when you get to the decision it informs. It might give you a workflow to try in a playtest, a feature to leave out of the first release, or a way to explain the product when you launch.

### First playable milestone and release scope

Pick one part of the game that has a beginning, a decision, and an outcome the player can see. Write down the scenes and rules needed to get them through it, along with how they'll open the game. Keep the other ideas in the plan so you can come back to them after seeing how the first part plays.

### Open decisions

Some choices are easier to make with the game in front of you. If I can't tell whether a route is clear on a phone, I write down who will check it, what they need to build to try it, and what other work depends on the answer. That gives us something to do when we get to the question.

When the questions will take more than one session or one answer changes what we can work on next, use [Wayfinder](game-development-playbook.md#work-through-open-decisions). Give the map one destination, then write a decision ticket for each question you can already name. Put questions that still depend on what you learn under Not yet specified. Link the map from the project's Bible so the next person can pick up a question that's ready.

### Island Post example

The first public build is one delivery across the Dock. Pick up the parcel and find a dry route to Mina. Market Lane and the Hill Route can wait until we see how people play the Dock.

[Read the one-delivery scope](island-post-example.md#vision-and-scope)

### Complete when

I can find the repository, the folder map, and the scope notes in Git. From those notes, I can tell who we're building for, how they'll use what we're making, what belongs in the first release, and what we'd need to see to call it a good first try. I can find the sources and similar projects we reviewed, see what they tell us about the scope, and find the questions we want to bring into later chapters.

I can see the visual direction the creator confirmed and read which details they want to carry into the interface and assets.

## Design Document

Once I know what I want someone to get out of a project, I write down what they'll actually do. For a website, that could mean finding a resource from the home page, opening it, and getting back to where they started. If I hand an agent the idea for a delivery game, it still has to guess when a parcel gets wet or what the player sees when that happens. We can work through those details on paper and then see how they feel in the sandbox.

### Core workflow and intended experience

Walk through one complete task from where someone starts. In a delivery game, they get a parcel, choose a route, find out whether the parcel made it, and decide what to do next. I want to write down where the player gets to make a choice and what the game tells them along the way. Later I can watch someone take a route and see whether they picked it for the reason I thought they would.

### Rules and behavior

A mechanic is a rule we can put into play. I write down what the player starts with, what they do, what changes, and how they find out. If they can fail, the rule also needs to say what they can do after that. Add the touch and keyboard details where they differ. A person or agent building the rule should be able to try it and know what result to look for.

### Screens, scenes, and dependencies

For a site, outline the pages, what people can do on each one, and the content or systems they depend on. For a game, I give each scene a rough outline so I can see what it introduces and what the player should already know. The outline is also where I note which rules, art, and sounds that scene needs. When we sit down to assemble it, we can write the full scene script with its dialogue and transitions. By then we know which pieces we're putting together.

### Open design decisions

I keep the questions that still affect the game close to the rules they touch. Maybe we're deciding between tapping a destination and holding a direction on a phone. Put both controls on the same short route and see where players hesitate or overshoot. The comparison gives us something to talk about before we write the control into every scene.

If you're using a Wayfinder map, link the question here where it affects the workflow, rule, or scene. Once you settle it, write the decision, the reason, and the evidence in the chapter that owns that part of the project. Close the ticket with a link to that record. Use a build ticket when there's an agreed change for someone to implement.

### Island Post example

Stepping into the puddle soaks the parcel on that move. The parcel icon changes right away. Both routes end at Mina, where the player can Retry a soaked delivery or Play Again after a dry one.

[See the Dock map and rules](island-post-example.md#design-document)

### Complete when

I can follow a task or turn through the document, try a rule and know what to look for, and find the screens or scenes that depend on it. Each open decision has a way to get an answer.

## UI & UX Design

When I look at a screen, I want everything on it to feel like it was meant to be there. If someone needs to check their progress, change something, or try again, put that within reach at the moment they need it. Start with what they came to do. Then look at where their eyes go, what feels natural to click or tap, and what tells them the action worked.

### Put the next action where people need it

Take one core workflow from the Design Document and sketch it from the first screen to the outcome. At each step, ask what the person needs to see, what they'll try next, and what they need to know after they act. Keep frequent actions and important status in view. Put the action next to the thing it acts on, and put a recovery action next to the problem it solves.

### Let the layout do some of the explaining

Use alignment and spacing to show what belongs together. Use size, contrast, and position to make the next step easy to spot. Keep the text short. A familiar icon can carry something people recognize, and a short label can help when they'd have to guess. Give people a way to get more detail when they need it. Keep the instructions and labels people need to understand the task or use it with assistive technology.

### Set standards for this project

Read [Joe’s Notes](joes-notes.md) and use [Impeccable](https://github.com/pbakaus/impeccable) to shape the workflow and review the result. Write down the choices that should carry from screen to screen, like where primary actions go, how spacing groups related controls, and how buttons, icons, and feedback look and behave. For a game, decide what players need to see while they play. For an app, decide what someone needs in view to finish the task they opened it for. Link to the project's existing design notes or components when they already explain the choice.

### Make the interface part of the art

I want the menu to show what kind of game I've opened. Draw or generate the art for every button, icon, HUD panel, and menu frame, and save it with the project. Use the same approach for the designed controls and frames in an app. Put the pieces on the sketch and write down the states people need to recognize, such as pressed, selected, disabled, or on and off. Reuse one piece of art anywhere it does the same job.

Load that artwork into the interface. Use the engine or web code for layout, live labels, input, focus, and behavior. Code can animate a lightning flash and swap in a lit frame. The button face and the frame still come from the art files. Keep labels readable and controls usable with the supported inputs. [See the Island Post button and frame samples](island-post/ui-art.md).

### Try the design on the intended screens

Walk through a sketch or clickable prototype at the screen sizes you plan to support. Check what changes when the layout gets narrow and how someone reaches the same controls with the inputs the project supports. Write down what you need to prove in the sandbox and what you need to observe in a playtest. When the workflow is running, check readable text and contrast, visible keyboard focus where supported, and whether someone can complete the task and recover without coaching.

Use [Design Wayfinder](game-development-playbook.md#try-one-live-design-decision) when you need to use the actual interface to make the choice. Pick one question and build just enough to try it from the first action to the visible result. If you're comparing two options, give both the same task and starting state. Check the supported screens and inputs, then have the person making the decision try it. Save what they chose and why here, and carry the behavior into a sandbox case and a playtest where it matters.

### Island Post example

The parcel status stays above the map. After a wet handoff, Retry takes the place of the movement controls beside Mina’s response. The phone capture shows how they fit together.

[Follow the Retry placement decision from comparison to playtest](island-post-example.md#ui-and-ux-design)

### Complete when

We have a sketch or prototype of the main workflow at the intended screen sizes, with project-specific standards for layout, controls, and feedback. We’ve named the artwork and states each control or frame needs. We know what to check in the sandbox and playtest. A first-time user should be able to find what they need, tell what happened after they act, and get back on track without someone pointing out where to go.

## Engine & Assets

I want to get a piece of the game running while the setup is still easy to change. A little map with a character and one object can tell me whether the engine can handle our controls and give the player the feedback we want. Once I can see that interaction, I have something to build the rest of the assets around.

### Engine and launch instructions

Write down which engine and version you're using, the devices you plan to support, and what someone needs to install. Then give them the command or link that starts the game from a clean checkout. I want someone opening the project for the first time to be able to follow the README and see the same interaction I see.

### Maps, characters, objects, interface, art, and sound

I make the asset list by walking through the scenes and asking what the player will see, hear, or touch. If an icon tells them the parcel is wet, I need both versions of that icon and a place in the game to look at them. Link each asset to the scene or rule that needs it. That's how I figure out which art or sound I want to get into the game first.

For a game like Island Post, I like the main screen to show the few things players need to keep track of. You can see the parcel and its condition while you move. Use icons and short words for things players check often, and give them a way to open the details by hovering, focusing with a keyboard, or pressing and holding. A game that depends on reading will need more text on screen. For this one, longer explanations can live in How to Play or with the item.

### Turn the vision art into game assets

Bring the actual Vision & Scope art and the UI & UX sketches into this chapter. For each main asset in the playable scope, identify the reference, make or import the runtime file, and embed an image showing the result. The asset list should name the scene, source, file the engine loads, and what passed or still needs work. For a game, include the main environments, characters, props, and interface states. Try them in the real engine at play size. Check that the character reads against the room, that interactive props line up with their controls, and that the art fits the chosen perspective and palette.

### Create and wire the interface assets

1. Walk the screens with the UI & UX Design sketch. List the artwork, its states, and the places that use it. Make or generate the pieces against the project's art direction. Keep the source and the files the build loads together or link them from the asset ledger.
2. Import the files as textures, sprites, or images. For a resizable frame, preserve its corners and stretch or tile the middle. Give each control a readable label or accessible name, a usable hit area, and visible focus where supported.
3. Bind the art to the real control and game state. Try the states and effects with the real input in the sandbox. Check that the right art loads and labels and hit areas still fit on the smallest target screen. Capture the result in the built interface. [Follow the Dock implementation](island-post/ui-art.md).

### Asset locations and readiness

Keep the working file or its source where the next contributor can find it. Mark which pieces are placeholders, which are ready to use, and which still need to be tried on a target device. A sprite can look right on its own and still be hard to read on the map. Open it in the game and see if it does its job at the size the player will see.

### Island Post example

The Dock uses Phaser 4.2.1 and illustrated sprites for the courier, Mina, and the parcel. The HUD and controls use their own authored SVG files, with two frames for the parcel condition. The asset ledger shows where the source files live and which cues the player sees.

[Inspect the art and asset ledger](island-post-example.md#engine-and-assets)

### Complete when

Someone can start the game from a clean checkout and show one real interaction with the assets it uses on an intended target. The main runtime assets for the current playable scope come from its visual references, load in the engine, and appear in the chapter with the observed results. Resolve any missing main asset or failed fit before handing the scene to Development Sandbox. Track smaller remaining assets with their next check.

## Audio Engineering

Play one short scene and listen for what the player needs to hear. In a fishing game, I'd start with the tap on the line, the moment you can set the hook, and the splash when the fish comes up. A little wind can give you the feeling of sitting on the lake. Keep it low enough that you can still hear the bite on a phone.

### Spot the cues

Walk the scene from entry through success, failure, and retry. Give each sound a job. Write down the game event that starts it, what it should tell the player, and what should stop it. Mark which sounds repeat or loop, which need to cut through the mix, and which the release can do without. Give any information a player needs to act a visible or otherwise accessible equivalent.

### Plan the music

Make a music decision for each release, even if you want the whole game to go without music. Write down what music should do, where it plays, and where you want players to hear the place or the action on its own. Pick a style and a few qualities someone can work from, such as instruments, pace, and how busy the melody should be.

For each track, name what starts it, how long it runs, whether it loops, and how it changes or stops when the player pauses, retries, or moves to another scene. Set its level beside ambience, effects, and speech. If the music gets in the way of a line or a cue the player needs to act on, decide where to lower it or leave it out. Link the track and editable source and record who made it, what lets you ship it, and what credit to give.

On the Island Post dock, a few soft electric piano notes loop under the rain. The notes drop back when Mina speaks and return after her line. Retry keeps the track going so it doesn't start over every time you bring her a parcel.

### Build the sound effects

Start with a small set for one playable encounter. Record Foley, make the sound with synthesis, or find a recording you can use. For a fish landing, try a small splash and a wet slap as separate recordings. Listen to them with the landing animation. Keep the part of each recording that sells the motion, and trim the lead-in so the splash starts when the fish hits the ice. If a sound repeats often, try a few takes and compare them in a run with rapid input.

For ambience, record or assemble enough material to carry the scene. Edit the loop join and play several cycles of the actual export. Listen for clicks, gaps, or a sound that calls attention to itself every time the loop starts over.

### Where to find free sound effects

Start with the sound you need to hear. Search for “wooden door latch” for a podcast scene, “soft confirmation chime” for an app, or “small water splash” for a video or game. These libraries let you browse or download recordings for film, podcasts, videos, presentations, websites, apps, and games. Check the terms for the file and how you plan to publish it.

- **Freesound** is a good first stop for everyday sounds, Foley, and field recordings. Each upload shows its license. Sign in to download the original. Try the short CC0 splash to see what a sound page gives you. [Browse Freesound](https://freesound.org/) · [Downloadable splash by qubodup](https://freesound.org/people/qubodup/sounds/737234/) · [Freesound license guide](https://freesound.org/help/faq/#what-do-i-need-to-do-to-legally-use-the-files-on-freesound)
- **Pixabay** has a searchable library for effects such as chimes, ambience, and transitions. Its content license allows free use and editing without required credit, subject to its restrictions. It limits standalone distribution of substantially unchanged files. [Browse Pixabay Sound Effects](https://pixabay.com/sound-effects/) · [Pixabay Content License](https://pixabay.com/service/license-summary/)
- **Mixkit** is useful for quick edits, with effects for doors, footsteps, impacts, and transitions. Its sound-effects library offers free downloads for personal and commercial projects without required credit. Check the sound-effects terms for your use. [Browse Mixkit Sound Effects](https://mixkit.co/free-sound-effects/) · [Door recordings](https://mixkit.co/free-sound-effects/doors/) · [Mixkit licenses](https://mixkit.co/license/)
- **Sonniss** offers free bundles of recorded and designed effects. The bundle terms cover effects incorporated into personal and commercial projects, including films, podcasts, apps, and games, without required credit. Use the license in effect when you downloaded. Share the source link when someone needs their own copies. [Download the Sonniss bundles](https://sonniss.com/gameaudiogdc/) · [Sonniss bundle license](https://sonniss.com/gdc-bundle-license/)

**Start with CC0** if you expect to reuse a sound across projects or share the original file. For CC BY, include the creator, source, license link, and any changes in your credits. Reserve CC BY-NC sounds for projects that meet the license’s noncommercial terms. Check distribution terms separately if you're shipping a template, open repository, or sample pack. Save the sound's page, creator, license or version, and download date with the project. [CC0](https://creativecommons.org/publicdomain/zero/1.0/) · [CC BY](https://creativecommons.org/licenses/by/4.0/) · [CC BY-NC](https://creativecommons.org/licenses/by-nc/4.0/)

### Write and record dialogue

Write the line where it belongs in the scene. Give it an ID, the speaker, the exact words, the trigger, and any delivery notes. Read it aloud against the action. A line like “Now, set the hook!” has to fit the moment when the player can act. A sharp cue can mark the opening while a longer line prepares the player before the bite. Write the caption or on-screen prompt with the line.

Get the performer's permission for the planned use. Record a few takes with consistent mic distance and enough headroom for a louder read. Mark the take that fits the character and timing. Edit distracting noise, trim the start and end, and listen again beside the effects. For a line that can repeat, decide when it may play again and what happens if another line starts, the player skips it, or the scene ends.

### Generate spoken dialogue locally

Use text-to-speech (TTS) to turn a script into audio. For new English dialogue, start with **Kokoro-82M through Kokoro ONNX**. It runs on the CPU and writes a WAV you can edit. The quantized model and voice file together are about 121 MB. After setup, the script and synthesis stay on your machine. Island Post uses Kokoro's `af_heart` voice for both of Mina's lines. Try **Piper** when you already have a voice that works for the character or need a smaller model. [Kokoro model card and Apache 2.0 license](https://huggingface.co/hexgrad/Kokoro-82M) · [Kokoro ONNX](https://github.com/thewh1teagle/kokoro-onnx) · [Piper](https://github.com/OHF-Voice/piper1-gpl)

#### Render a line to WAV

From a folder for your dialogue work, install the renderer in a Python 3.12 virtual environment and download the model and voices once. This setup was checked on an Apple silicon Mac. [Model and voice downloads](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0)

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install kokoro-onnx==0.6.1 soundfile==0.13.1
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
curl -fL "$base/kokoro-v1.0.int8.onnx" -o kokoro-v1.0.int8.onnx
curl -fL "$base/voices-v1.0.bin" -o voices-v1.0.bin
```

```sh
.venv/bin/python - <<'PY'
import soundfile as sf
from kokoro_onnx import Kokoro

tts = Kokoro("kokoro-v1.0.int8.onnx", "voices-v1.0.bin")
line = "Try the lower boardwalk."
audio, rate = tts.create(line, voice="af_heart", speed=0.95, lang="en-us")
sf.write("mina-soaked.wav", audio, rate, subtype="PCM_16")
PY
```

Try two voices on the same line at similar volume. Listen for unclear consonants, names, pacing, and whether you can understand the words over the effects. Start with `af_heart` and compare `af_sarah`. Adjust punctuation or speed for another take, then listen in the scene before choosing. A transcript can flag a hard-to-hear word. Check it by ear on the speaker your audience will use.

For each chosen take, keep the line ID, exact text, voice ID, model version, speed, WAV, and caption with the project. Check the voice and model terms for your release. Get permission before imitating an identifiable person's voice.

### Prepare the files for the game

Keep the original recordings and editable masters. Name the exports by cue or line ID so someone can replace a take without guessing which file the game uses. Link the source, take, and build file in the cue list. Record the creator or performer, permission or license, and any credit that ships with the game. Mark temporary audio so it is easy to find before release.

Export in formats your targets play. Check timing and loop joins after encoding. Load short timing cues before the player needs them. Check the size and startup cost of longer ambience, music, and dialogue on the devices you plan to support.

### Wire and mix the scene

Play effects when the game accepts an action or changes state. For a timed prompt, use the same rule that turns on the visible prompt. Give loops and dialogue an owner that can stop them when you pause, retry, leave, or switch scenes. Set how loud the cues, ambience, music, and voice should be relative to each other, using the layers the scene needs. Listen to overlapping sounds, limit repeated effects, and leave room for the loudest moment. If the wind covers a line, lower it while the character speaks and listen to the return to normal. Add mute and any volume controls the release needs, and decide how those settings carry between sessions.

#### Make dialogue sound like it belongs in the scene

Start with what you would hear in that place between lines. At the Dock, a quiet rain loop runs before, during, and after Mina speaks. Keep this background on its own track so it carries across lines and you can turn it down if it competes with speech. If the voice still sounds close to the microphone, turn it down a little and try a gentle cut to the highest frequencies. A nearby wall or deck can give you a short, faint reflection. Save longer reverb for places with a tail you would hear, such as a hall. Compare the processed line with the original at about the same loudness while the scene plays. Listen for the first and last words on the speaker your audience will use. [Island Post mix settings and sources](island-post/verification.md#audio-cues)

On the web, test a fresh launch and start audio from a player gesture. Keep play working if the browser blocks audio or a file fails to load. In Phaser projects, check the installed version's Sound Manager and who owns each loop across scene changes. [Phaser sound source](https://github.com/phaserjs/phaser/tree/v4.2.1/src/sound) · [Browser autoplay behavior](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

### Listen on the target

Use a named, resettable case from the [Development Sandbox](../#development-sandbox). Listen through a normal run, a failure, and a retry on the devices people will use. Check the phone speaker and headphones if both are in scope. Try rapid input, pause and resume, leaving the scene, and a muted run. For web builds, also check switching away and returning. Record the build, device, what you heard, and what still needs another listen. An automated check can count playback requests. Listen to the actual mix to judge timing and balance.

#### Listen to the scene, then isolate one sound

Play the whole encounter once. Pick a moment that affects what the player hears or does, such as a hook prompt that might disappear under wind or a word lost under music. Reset to the same moment and compare two versions with one change. To find out whether wind covers the hook cue, lower the wind and leave the cue, the phone and its volume alone. If you're comparing two edits of a spoken line, play them at about the same loudness so the louder take doesn't get an easy advantage.

Ask the listener what they heard before you tell them what changed. Then play the whole scene again. Keep the change if the cue reads more clearly and the background still feels like it belongs. Record the moment, the change, what the listener heard and what you kept. This is a game audio exercise based on [Jason Corey’s technical ear training](https://sites.google.com/a/umich.edu/jason-corey/technical-ear-training).

### Complete when

The release has a music plan, including a decision to go without music if that suits the experience. The cue list links game events to the sounds the build plays, with source and credit information. We can replay a representative encounter on the intended targets, hear the cues at the right moments, read any essential dialogue, and finish with sound off. Mute works, loops and lines stop where they should, and we have a listening record for the build. If the release calls for silence, record that decision and check the player can follow the workflow through its other feedback.

[Play the Island Post audio example](island-post-example.md#audio-engineering) to hear how the score, rain, splash, and two captioned handoff lines fit together.

## Development Sandbox

While I'm preparing the release, I build one dedicated scene for development before I start assembling the scenes a player will go through. That's the sandbox. I want the mechanics, assets, controls, objects, and outcomes for this release within reach in that one scene. If I'm changing the way a wet parcel looks, I want to get straight to the puddle. The same goes for a menu, a piece of dialogue, or an object the player can use. I or an agent can try it, change something, and try it again.

Make it a playable simulation for developers. I want to move through the sandbox, walk up to an object or control, and use it to trigger the game's behavior so I can see what a player would see. In a game with HP, I could walk up to a “Die” button and activate it. The game rules take my HP to zero and I see the actual death scene.

I also want to use the sandbox to take screenshots for the wiki and to check the behavior we’ll showcase in the demo. If we can pull up a particular item, character, menu, or scene on its own, we can show what it looks like in the game without playing through a level to get there.

### Launch link or command

Give developers a direct way into the sandbox. It could have its own development entry point or open from a developer shortcut in a test build. Run the same game code the player scenes will use. Give cases named starting states so I can get to the right spot with the right items. Give me a Reset so I can go back to that same state and play the case again. Keep the launch and reset instructions where contributors already go to start the game.

### Scenario and expected behavior

Describe a case so another person can repeat it. Give them a starting state, an action, and something they can see or hear when it works.

### NPC roster and dialogue

If the game has non-player characters (NPCs), put a roster picker in the sandbox with every NPC in the release. I want to pick someone, walk up to them, and talk to them using the game's dialogue controls. Give me starting states for anything that changes the conversation, like what I'm carrying, what I've already said, or whether I finished a quest. Use those states and Reset to play every branch of each NPC's dialogue tree. Check what the character says, which choices appear, and what changes in the game after I choose one.

### Mechanics and other checks

Give every game mechanic in the release a playable case. Start with what should happen when I use it as intended, then try where the rule changes, what happens when it fails, and how I get another try. Test mechanics together when one changes the other. A parcel crossing a puddle is one case. Crossing it after wrapping the parcel shows whether wrapping changes the outcome.

Look at what the release asks the player to do and add cases for the parts they depend on. Use this list to decide what needs a check.

- **Controls and access.** Try the required actions on each supported control scheme and check any accessibility settings the game offers.
- **Menus and feedback.** Open and close menus. Exercise each required control and frame state. Check that the artwork, labels, animation, and sound give the right cues when the game state changes.
- **Objects and rewards.** Pick up, use, or spend an item. Try interacting again to see whether the game applies a one-time reward twice.
- **Transitions and recovery.** Check pause, resume, retry, and any handoff that depends on game state. After a retry, look at what resets and what the player keeps.
- **Progress and saves.** If the game saves progress, save from a known state and reload. Check what the game restores and what the player can do next.

### Build, platform, result, and evidence

Keep the build or revision, the device and controls you used, what you expected, and what happened. A screenshot can show a changed icon. A short recording makes more sense if you're trying to show that a menu opens and closes at the right times. Link the evidence where the person picking up the scene will look for it.

### Open failures and next checks

When something fails, write down the case and which scene or release work depends on it. If Retry puts the player back with the same wet parcel, the Dock still needs a way for the player to recover. After the fix, start from that same failed delivery and see what Retry does before updating the result.

### Island Post example

Choose Puddle and step into it with the dry parcel. Reset and pick Mina from the roster. Play the dry and soaked handoff cases using the movement controls, then try the action Mina offers.

[Open the playable Sandbox and case record](island-post-example.md#development-sandbox)

### Complete when

A contributor can open the dedicated sandbox, play every release mechanic and each applicable check through the game's controls or sandbox objects, and reset each case to its starting state. If the game has NPCs, the roster picker gives them a way to play every branch of each release NPC's dialogue tree. Record passing results before assembling the player scenes, with enough detail for someone else to repeat the checks.

## Scene Scripts & Playtests

Once I've tried the pieces in the sandbox, I want to put them together and play one whole scene. The sandbox can show me the Retry button works. The scene tells me whether the player sees it when they're thinking about the delivery they just lost. That's why I like to finish a scene and watch someone play it before I build the next one.

### Scene script

Write the scene in the order the player experiences it. Where do they come in? What are they trying to do? Put the dialogue, prompts, and changes on screen where they happen. Follow the scene through each outcome and describe where the player goes when they finish, leave, or want another try.

### Mechanics and assets used

Link the scene to its rules in the Design Document and to the art, sound, objects, and interface it uses. Pull up their sandbox cases before assembly. Then play the scene with those same pieces in place and use the UI & UX Design checks for its main workflow. I might see the wet icon in the sandbox and miss it in the scene because it sits too close to the dialogue. That's something I can only check with the pieces together.

### Playtest criteria, observations, fixes, and result

Give a new player something to do and let them try it before you explain the controls or the route. Write down what they did, where they paused, and what they expected would happen. Once you change the scene, ask someone who hasn't seen it to try that part on the intended controls. They can show whether the change helped without remembering where you told the last player to look.

### Island Post example

The Dock scene starts one step from pickup and ends with Mina’s response. The scripted pass covers both handoffs. A first-time session will show whether someone can choose a dry route and find Retry without help.

[Read the scene script and playtest record](island-post-example.md#scene-scripts-and-playtests)

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

Open the Dock build in a fresh browser. Take the shortcut, retry the soaked delivery, and carry a fresh parcel around the puddle. Play Again returns you to pickup.

[Open the player build and repeat the release check](island-post-example.md#build-and-play-the-game)

### Complete when

I can repeat the build, open or install it on each target we're shipping, and play through the core loop. I have a record of the build that passed and can use it for the manual and screenshots.

## Demo, Manual & Wiki

Every project needs a demo people can try. Pick one useful thing someone can do from start to finish and use the controls, visuals, and rules they’ll meet in the project. I want someone to see what makes the project useful or fun and have a go at it themselves. That could mean delivering a parcel in a game, moving a card to Done on a sample task board, or finding and opening a resource on a website.

### Build the demo from the sandbox

Start with the cases you’ve tested in the development sandbox. Pick a workflow that shows what the project can do, and link to the passing checks for its main action, visible result, and likely recovery. Keep the build and target with those results. If you want to show something the team hasn’t checked, add a sandbox case and run it first.

Use the real controls, visuals, and behavior from those cases to put together a short, guided workflow. Give the visitor a starting point with what they need already in reach, such as a fresh parcel or a sample board. Let them act and see the result for themselves. Give them a way to retry, replay the demo, and continue into the project. Open the demo from the same link or menu a visitor will use and try the whole flow on the release candidate.

### Connect the demo, manual, and wiki

Walk through the task from start to finish in the manual or in-app help. Show the controls, what success looks like, and how to recover from a likely mistake. Link to the demo so someone can follow along.

Give an item, control, or rule its own wiki page when someone is likely to look it up. A page can teach one small action with an example, a screenshot, and a link to the relevant place to practice. Use the same names, icons, and examples across the three. If someone opens help mid-task, take them to the relevant step or topic and give them a way back to their work.

### Capture the demo for a trailer or walkthrough

Choose a few moments that show what someone does and what happens because of it. Capture them from the verified demo build. A trailer can show the action and payoff in a few shots. A walkthrough can stay with the task long enough for someone to follow the steps. Use the public demo link wherever you share the footage so viewers can try what they saw.

### Island Post example

The demo uses the passing Sandbox cases in one delivery. The manual walks through the dry route. The wiki explains how to recognize a soaked parcel and find Retry. Capture those moments from the demo so a viewer can try the same delivery.

[Play the demo and follow the manual and wiki](island-post-example.md#demo-manual-and-wiki)

### Reusable demo template

Copy the [Demo, Manual & Wiki template](game-bible-template.md#demo-manual-and-wiki) for each workflow you want to showcase. Fill it in with a task, its passing sandbox cases, the public demo entry, the matching help, and the moments you’d capture.

### Grilling questions

1. **Audience and purpose.** Who will try this first? What task would help them understand what the project can do?
2. **Sandbox evidence.** Which checks show the action, result, and recovery working? What still needs a run before we show it?
3. **Hands-on practice.** What should someone do themselves? How will they tell it worked? How do they get another try?
4. **Help and handoffs.** What will they look up halfway through? Where does the practice link land, and how do they return to their task?
5. **Capture.** Which moments show the action and result? Can a viewer follow the link and do what they just saw?
6. **Proof.** What should a first-time user be able to do unaided? Which changes would send us back to the sandbox, the help, or the footage?

### Complete when

Record the passing sandbox cases and the release build, then watch a first-time user open the demo, complete the task, find the relevant help, and return to the task. Check that they can recover from a likely mistake and do the same kind of task unaided. Verify that you can capture the demo for a trailer or walkthrough and that viewers have a working link to try it. When a rule, label, or screen changes, check the affected sandbox cases and update the demo, instructions, screenshots, and footage that use it.

## Release, Pricing & Marketing

I think about where a game might go and how people might pay for it while I'm working out the design. When it's time to release, I want those choices to match what we're actually ready to put in someone's hands. The page that gets them interested should give them a good idea of what they'll do after they click Play.

### Release scope, platform, price, and payment

Write down what people get, where they'll get it, and what it costs. A free Dock preview and a paid game with several routes give players different things to expect. If you're charging, try the purchase path and make sure the buyer can get to the game afterward. Keep the scope and the price with the release decision so the store page and the team describe the same offer.

### Readiness checks and release evidence

Save the build ID for the version you intend to ship. Start with a fresh player state at the intended delivery path and follow it through to a full turn in the game. Check the devices, controls, and access you're promising. I want the evidence tied to the build people will receive, since a new export can change what ends up in the package.

### Store copy, screenshots, pitch, and links

Describe something the player can picture themselves doing. A shot of the courier choosing a path through the Dock tells me more about Island Post than a list of broad claims about the game. Use screenshots or footage from the verified demo, write a short pitch someone else can explain in their own words, and check the links for trying the demo, purchasing when applicable, and finding help. After launch, open the public page and take the same path a new player would.

### Island Post example

The Dock is free to play in a browser. The release kit pairs the public play link with a pitch and captures of the fork, splash, Retry, and dry handoff.

[See the release kit and real captures](island-post-example.md#release-pricing-and-marketing)

### Complete when

The release candidate passes on the targets and access conditions we promised. A player can get to it from the public page and find the help they need.

## Contributor Training

When I bring somebody into a project, I want to give them a real piece of the game to work on. I want the same thing when I'm handing it to an agent. If they can start the game, change something small, and show me what happened, I can see whether the project is set up for someone else to work in.

### Setup, first task, and verification

Show the contributor how to launch the game and the sandbox from a clean checkout. Give them one task with an outcome they can demonstrate. If the task changes a scene, have them play the affected path and run the sandbox cases it relies on. Point them to where we keep the results so the next person can find what they tried.

### Decisions and references

Link the rules, scenes, assets, and checks that matter for the task. Include the reason behind a decision the contributor might encounter, such as making touch controls work differently so a finger leaves more of the map visible. A short explanation can save them from having to work out why the game behaves that way.

### Island Post example

Start from a clean checkout and change one cue in the Sandbox. Rebuild, play the blocked move, and verify that the player demo still starts at pickup.

[Try the contributor exercise](island-post-example.md#contributor-training)

### Complete when

A new contributor can follow the guide, make a small change from a clean starting point, and show how they checked it.

## Updates & DLC

After a release, I want room to build more of the game. It could be a fix for people who already play or downloadable content (DLC) that gives them another part of it to explore. I work through the parts of the release process that the change touches, including what happens when somebody opens the new version with a game already in progress.

### Proposed changes, affected players, and release approach

Write down what changes, who gets it, and how they'll receive it. A fix to Retry might go to everyone with the base game. A new route might have its own access. If we're rehearsing the process, say what the rehearsal needs to prove. If we're shipping, say where a player will get the update and what they'll have when it finishes.

### Sandbox, scene, and compatibility checks

Start with the rules that changed and give them repeatable sandbox cases. Then play the scenes that use them. When the update touches saves, progress, or access, open the new build with data from the current release and see what a returning player can still reach. Write down which earlier checks you repeated and what made them relevant to this change.

### Manual, wiki, and release notes

Tell players what they'll see and what they need to do to use it. If you've moved Retry, check the demo and replace any pictures, directions, or footage that show the old location. If you've added a route, explain where to find it and who can access it. Open the help from the released build and check it against what a player gets.

### Island Post example

In the rehearsal, try a clearer help instruction and repeat the wet handoff, Retry, and dry detour. Keep that change in the rehearsal until it has a release of its own.

[Read the update rehearsal](island-post-example.md#updates-and-dlc)

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

The first staged build stalled on startup. The intake rehearsal shows how that finding became a fix and a fresh-browser release check.

[Trace a feedback rehearsal back to scope](island-post-example.md#intake-and-feedback)

### Complete when

Someone owns the intake and has tried the path from receiving a report to responding. We've used what we heard to make and record the next scope decision.
