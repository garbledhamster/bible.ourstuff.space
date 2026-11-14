# Private Project Bible reader updates

The reader checks the published Git revision at [version.json](https://bible.ourstuff.space/version.json) when the page opens. In **Get Started**, click the version above the title to check again or choose **Update now**. The short version is the first eight characters of the Git commit. Reload to pick up shared styles and resources after installing.

Serve a standard reader from its project root with Python 3 and Git:

```sh
python3 /path/to/bible.ourstuff.space/tools/bible-reader/serve.py \
  --port 8765 --directory docs --reader /reader/ docs/bible-upstream
```

Load `/_bible/updates.css` and `/_bible/updates.js` (a module) in each reader page. Use one `--reader URL_PATH SHARED_CHECKOUT` per reader. Readers that use the same checkout show the same installed version. A hosted reader can use `--mount /project/bible-upstream/ /path/to/project/docs/bible-upstream` to serve shared files from its project's checkout.

The updater checks Git for local changes and installs the published revision in the selected shared checkout. Each update saves the prior revision in a local Git ref before changing the checkout. In the version dialog, choose **Restore previous**, then reload the reader. Restore works offline and applies to every reader that uses that checkout. It preserves your project chapters, notes, assets, and Git history. Review the changed submodule pointer before recording it in the project repository. Keep the reader on localhost or a trusted private network.

For a checkout without a reader, use the same updater from a current copy of this repository:

```sh
python3 -B /path/to/bible.ourstuff.space/tools/bible-reader/version.py update docs/bible-upstream
python3 -B /path/to/bible.ourstuff.space/tools/bible-reader/version.py restore docs/bible-upstream
```

These commands switch the shared checkout to a detached revision. The backup stays in that clone under `refs/project-bible/backups/`, outside the project files.

## Editable Task List

To enable editing on a private reader, add `--task-list /reader/ /absolute/project/docs/task-list.md` using an existing reader route. Link to `read.html?file=task-list.md`. The server reads and saves that project file directly, so a browser save is visible in the workspace and an agent edit is visible on reload. Leave this option off for readers that do not need editing.

Use a Markdown document headed `# Task List`, with a four-column table under each chapter heading. Use **Asset**, **Task**, **Status**, and **Next action** as the headers. The Asset cell can contain a Markdown image linked to a full-size asset. Use relative image paths that the reader can serve. In the document reader's module, pass the displayed source to the editor, for example `startTaskList(await startReader())` after importing it from `/_bible/task-list.js`. A stale browser edit keeps its draft and asks the reader to reload before saving. Save an agent edit before starting its next check so the browser and workspace see the same next action.

Run the updater checks with `python3 -B -m unittest discover -s tools/bible-reader`.
