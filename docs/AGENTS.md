# Use the Project Bible in your project

The [Project Bible](https://bible.ourstuff.space/) has a shared chapter guide, templates, design notes, and assets. Keep a local copy linked to the main repository so you can bring those files up to date while your game's decisions, code, and art stay in your own project.

## Set up the project copy

1. Find the game repository with `git rev-parse --show-toplevel` and work from its root. For a new game, create its folder and run `git init` there.
2. Add the shared Bible as a Git submodule. If the project already has the Bible registered as a submodule, use its existing path and run `git submodule update --init -- <path>` to get the recorded revision.

   ```sh
   git submodule add -b main https://github.com/garbledhamster/bible.ourstuff.space.git docs/bible-upstream
   ```

3. Copy the [Bible template](resources/game-bible-template.md) from `docs/bible-upstream/docs/resources/game-bible-template.md` to `docs/game-bible.md` if the project needs a Bible. Keep an existing Project Bible and its decisions. Edit the existing Markdown in place. Use the shared chapter guide to work through the project copy, starting with Vision & Scope for a new game.
4. Record the paths in the project's README. Commit `.gitmodules`, the `docs/bible-upstream` revision, and the new project documents you reviewed. A teammate who clones the game can run `git submodule update --init -- docs/bible-upstream` to get the same shared revision.

For a new project, follow the [Vision & Scope kickoff](resources/game-bible-guide.md) with Project Bible and Grill with Docs.

## Refresh the shared Bible

Check `git -C docs/bible-upstream status --short` first. If it shows local edits, stop and preserve them before updating. Use the existing project README command if its reader uses a different setup. From the game root, run:

```sh
git submodule update --init --remote --checkout -- docs/bible-upstream
git diff --submodule=log -- docs/bible-upstream
```

This refreshes the shared guide, templates, and assets from the main Bible. Review the changes against your active chapter. Keep your project Markdown, art, notes, and saves in their existing locations. Make any changes to the project Bible as separate, targeted edits. Reload the local reader to see the updated Markdown. Use **Project Bible** as the main heading and show the project name on the next line. Stage and commit `docs/bible-upstream` to record the new shared revision for the team.

Find the live skill, templates, and downloads in the [agent resource index](resources/agent-index.md). To preview the shared site locally, run `npm ci` and `npm run build` from `docs/bible-upstream` and serve its `dist/` directory.
