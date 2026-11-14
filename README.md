# Project Bible

Clone this repository to get the [Project Bible skill](docs/resources/project-bible/SKILL.md) and its resources together. Codex discovers the skill through the checked-in `.agents/skills/project-bible` link. To use it in a game or app repository, see [Set up and update a project Bible](docs/AGENTS.md).

Edit the source in `docs/`. The site and the agent skill use the same chapter guide in `docs/resources/game-bible-guide.md`. Add design notes to `docs/resources/joes-notes.md`. Add new agent resources to `docs/resources/agent-index.md` so readers and agents can find them from the live index. The browser reader opens files from `docs/` through `read.html?file=/path/to/file.md`. Keep the raw Markdown URLs for agents and downloads.

Run `npm ci` and `npm run build` with Node.js and Python 3. The build validates the chapter order and the index's local links, renders the notes, template and ticket list from Markdown, and rebuilds both ZIP downloads. Preview the result with `python3 -m http.server 8000 --directory dist`.

The Island Post example lives in `examples/island-post/`. The site build packages its player demo at `/island-post/` and developer Sandbox at `/island-post/sandbox/`. Use `node --test examples/island-post/rules.test.js` to check the shared Dock rules. The Dock ships with light rain, a short score, and two captioned lines for Mina. See the [audio cue list](docs/resources/island-post/verification.md#audio-cues) for the mix, credits, and the remaining phone listening check.

Pushing to `main` builds and publishes `dist/` to [bible.ourstuff.space](https://bible.ourstuff.space/) through the **Publish Bible** workflow. Check the run in GitHub Actions after a release.

The Pages build publishes its Git revision at `/version.json`. Private Project Bible readers use it to compare their installed shared copy with the published release. See [reader setup](tools/bible-reader/README.md).
