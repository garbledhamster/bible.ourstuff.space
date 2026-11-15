# Private Project Bible reader updates

The reader checks the published Git revision at [version.json](https://bible.ourstuff.space/version.json) when the page opens. In **Get Started**, click the version above the title to check again or choose **Update now**. The short version is the first eight characters of the Git commit. After installing or restoring, the reader reopens the same page and uses asset URLs tied to the installed revision. This gives each release its own script and stylesheet URLs, including in embedded browsers. Install the current `serve.py` and `updates.js` together and restart a running reader host once to enable this behavior. Subsequent shared Bible updates use **Update now** as usual.

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

## Work mode

To enable editing, add `--project-bible /reader/ /absolute/project/docs/game-bible.md` using an existing reader route. Point the reader’s `<link rel="alternate" type="text/markdown">` at the project Bible and end its title with `Project Bible source`. Use **Update now** and reload to pick up the Work mode picker from the shared checkout. The reader server must also be running a version with the `--project-bible` option.

Open **Work mode** below the project name, choose a mode, and select **Set Work mode**. The reader saves the selection in the project Markdown and shows the agent prompt. The server edits the Work mode line above the chapters and asks you to retry if the file changed since you opened the picker. The reader accepts the existing `**Current phase:** Build` field so earlier shared revisions can still show the saved mode. A reader without editing enabled displays the mode from its Markdown source.

## Editable Task List

To enable **Tasks** in a private reader’s footer and editing in its Task List, add `--task-list /reader/ /absolute/project/docs/task-list.md` using an existing reader route. Load the current `/_bible/updates.js`. It adds Tasks and a shortcut in Tutorial or Get Started after the project Task List is available. Existing Task List links open the same global view. The server reads and saves that project file directly, so a browser save is visible in the workspace and an agent edit is visible on reload. Leave this option off for readers that do not need editing.

Use a Markdown document headed `# Task List` with checklists or task tables under chapter headings. Follow the [Task List workflow](../../docs/resources/task-list-workflow.md) for editing from the project checkout. In a table, Use **Asset**, **Task**, **Status**, and **Next action** as the headers. The Asset cell can contain a Markdown image linked to a full-size asset. Use relative image paths that the reader can serve. In the document reader's module, pass the displayed source to the editor, for example `startTaskList(await startReader())` after importing it from `/_bible/task-list.js`. A stale browser edit keeps its draft and asks the reader to reload before saving. Save an agent edit before starting its next check so the browser and workspace see the same next action.

Run the updater checks with `python3 -B -m unittest discover -s tools/bible-reader`.

## Changelog

Open **Get Started → Changelog** to see project and shared Bible entries together. The shared entries come from the installed checkout, so they follow **Update now** and **Restore previous**. To include project entries, pass `--changelog /reader/ /absolute/project/docs/changelog.md` for the existing reader route. Keep those entries with the project and write dated headings followed by a short summary. The reader shows newest entries first.
