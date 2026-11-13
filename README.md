# Game Bible

To use the Bible in a game repository, see [Set up and update a project Bible](docs/AGENTS.md).

Edit the source in `docs/`. The site and the agent skill use the same chapter guide in `docs/resources/game-bible-guide.md`. Add design notes to `docs/resources/joes-notes.md`. Add new agent resources to `docs/resources/agent-index.md` so readers and agents can find them from the live index. The browser reader opens files from `docs/` through `read.html?file=/path/to/file.md`. Keep the raw Markdown URLs for agents and downloads.

Run `npm ci` and `npm run build` with Node.js and Python 3. The build validates the chapter order and the index's local links, renders the notes, template and ticket list from Markdown, and rebuilds both ZIP downloads. Preview the result with `python3 -m http.server 8000 --directory dist`.

Pushing to `main` builds and publishes `dist/` to [bible.ourstuff.space](https://bible.ourstuff.space/) through the **Publish Bible** workflow. Check the run in GitHub Actions after a release.
