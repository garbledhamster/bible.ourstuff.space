# Use the Project Bible in your project

The [Project Bible](https://bible.ourstuff.space/) has a shared chapter guide, templates, design notes, and assets. Keep a local copy linked to the main repository so you can bring those files up to date while your game's decisions, code, and art stay in your own project.

## Set up the project copy

1. Find the game repository with `git rev-parse --show-toplevel` and work from its root. For a new game, create its folder and run `git init` there.
2. Add the shared Bible as a Git submodule. If the project already has the Bible registered as a submodule, use its existing path and run `git submodule update --init -- <path>` to get the recorded revision.

   ```sh
   git submodule add -b main https://github.com/garbledhamster/bible.ourstuff.space.git docs/bible-upstream
   ```

3. Expose the shared skill at the project root for Codex. Use this command for the default submodule path. If a skill entry already exists, inspect where it points and keep it when it resolves to this shared skill.

   ```sh
   mkdir -p .agents/skills
   ln -s ../../docs/bible-upstream/docs/resources/project-bible .agents/skills/project-bible
   ```

   Add a pointer to the same `SKILL.md` from the project's root `AGENTS.md` so other agents can read it directly. Use the equivalent relative path if the submodule is elsewhere.
4. Copy the [Bible template](resources/game-bible-template.md) from `docs/bible-upstream/docs/resources/game-bible-template.md` to `docs/game-bible.md` if the project needs a Bible. Keep an existing Project Bible and its decisions. Edit the existing Markdown in place. Use the shared chapter guide to work through the project copy, starting with Vision & Scope for a new game.
5. Keep the current phase at the top of the project Bible. New projects start with `**Current phase:** Grilling`. See [Project phases](resources/project-phases.md).
6. Keep the live checklist in the project checkout at `docs/task-list.md` or use the existing checklist path. If you need a new checklist, start with the [Task List template](resources/task-list-template.md) and fill it with work for the current release. Link it beside **Joe’s Notes** in Tutorial or Get Started.
7. Record the paths in the project’s README. Commit `.gitmodules`, the submodule revision, the skill link, and the project documents you reviewed. A teammate can run `git clone --recurse-submodules <project-url>` to get the project and its skill, or run `git submodule update --init -- docs/bible-upstream` from an existing checkout. Open a new Codex session from the project root after initialization.

For a new project, follow the [Vision & Scope kickoff](resources/game-bible-guide.md) with Project Bible and Grill with Docs.

## Refresh the shared Bible

In the private reader, open **Tutorial** (called **Get Started** in older readers), click the Bible version above the title, and choose **Update now**. If an update causes a problem, choose **Restore previous** and reload the reader. Use the project’s README if its reader uses a different setup.

For a checkout without a reader, run the version command from the game root. Use a current copy of the shared Bible for the command:

```sh
python3 -B /path/to/bible.ourstuff.space/tools/bible-reader/version.py update docs/bible-upstream
git diff --submodule=log -- docs/bible-upstream
```

Use `restore` in place of `update` to return to the locally backed-up revision. The updater checks for local edits before changing the checkout.

The refresh gives you the updated skill, guide, templates, and shared assets at the same paths. Pick up from the current decision and evidence in your own Bible and apply the new guidance when it helps with that work. Keep your existing Bible, notes, task list, art, and saves in place. The template is for starting a new Bible. Make project edits in the existing project files. Reload the local reader to see the updated Markdown. Use **Project Bible** as the main heading and show the project name on the next line. Stage and commit `docs/bible-upstream` to record the new shared revision for the team.

A direct clone of the shared Bible already has the Codex skill link. Find the live skill, templates, and downloads in the [agent resource index](resources/agent-index.md). To preview the shared site locally, run `npm ci` and `npm run build` from `docs/bible-upstream` and serve its `dist/` directory.

## Keep project records current

Keep project-owned Feedback and Changelog Markdown files and link them from the Bible. Capture every item of human or agent feedback when it comes in, during development and after launch. Append entries in entry order and use an ISO 8601 date and time with a time zone offset. Record the source, context, and what was said. Label paraphrases.

When you finish a meaningful change, append a timestamped changelog entry before handing off the work. Say what changed and how you checked it. Link the feedback entry when it prompted the change. Use the shared Bible’s [Feedback](resources/feedback.md) and [Changelog](resources/changelog.md) as examples.
