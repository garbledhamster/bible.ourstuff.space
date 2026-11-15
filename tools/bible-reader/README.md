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

## Choose a chapter layout

In **Open Chapter → Review → Layout**, choose how to read the chapter. [Chapter layout guide](../../docs/resources/project-phases.md#choose-how-to-read-a-chapter)

## Changelog

Open **Get Started → Changelog** to see project and shared Bible entries together. The shared entries come from the installed checkout, so they follow **Update now** and **Restore previous**. To include project entries, pass `--changelog /reader/ /absolute/project/docs/changelog.md` for the existing reader route. Keep those entries with the project and write dated headings followed by a short summary. The reader shows newest entries first.

## Sprite Generator

Create a writable workspace in the project checkout beside its served files. Choose a different directory for each project, outside the server’s document root, mounts, and shared Bible checkouts. Give the reader route a project name and the path to its workspace.

```sh
mkdir -p art/sprite-sets
python3 -B /path/to/bible.ourstuff.space/tools/bible-reader/serve.py \
  --port 8765 --directory docs --reader /reader/ docs/bible-upstream \
  --sprite-generator /reader/ "Project name" art/sprite-sets
```

Load the current `/_bible/updates.js` in a private reader that uses the shared `project-masthead.css`. Existing hosts need to run the current `serve.py` and its sibling modules. Restart the host after changing its command or updating its Python reader code. Use **Update now** to install the shared editor assets, then open **Sprite Generator** in the footer. If the workspace shows an error, check that its folder exists and the host can read and write it. Use the reader at its localhost address.

Enter a set name, choose **Create set**, and use **Import PNG**. The preview shows the original dimensions and transparent area. Choose **Save set**, then use **Saved sets** to reopen it. Each set is a versioned JSON manifest with the original PNG bytes. The reader keeps it in the project workspace, so the set is still there after restoring an older Bible revision. If someone else saves first, the editor keeps your draft and shows that the saved set changed. **Discard draft** reloads the saved set.

The private reader’s `api/sprite-generator` lists the configured project and its saved sets. `GET api/sprite-generator/<id>` returns the manifest and its revision. `POST` to the same set URL with JSON containing `revision` and `manifest` to save. Use `null` as the revision for a new set. The POST requires the reader’s HTTP origin and the `X-Bible-Sprite-Generator: 1` header. Compare with the returned revision before applying a later edit. A stale save returns HTTP 409 and preserves the current set.

### Review a PNG from Codex

Save the set with a registered part. Pause on the pose you want to review and select its slot in the layer list. Choose the expression if you're working on a variation. Select **Copy Codex context** and paste the reference into Codex. The reference includes the set URL, pose, slot, expression, saved revision, and the current PNG size and registration.

From the project workspace, use the shared reader's `sprite_proposal.py` to inspect the copied slot and stage the PNG file. Replace each angle-bracket value with the matching value from the reference.

```sh
python3 -B docs/bible-upstream/tools/bible-reader/sprite_proposal.py inspect \
  --set-url '<setUrl>' --revision '<revision>' --pose '<poseId>' \
  --slot '<slotId>' --expression '<expressionId>'

python3 -B docs/bible-upstream/tools/bible-reader/sprite_proposal.py stage \
  --set-url '<setUrl>' --revision '<revision>' --pose '<poseId>' \
  --slot '<slotId>' --expression '<expressionId>' --png path/to/part.png
```

Use an empty expression value for the base pose. For a different PNG size, pass both `--x` and `--y` to register the patch relative to the slot's anchor. A same-size PNG uses the saved part's registration when you omit those flags. If the saved revision changed, copy the updated context before staging again.

Watch **Codex proposals** in the open editor. With the proposal's pose and expression selected, **Saved** and **Proposed** show the same frame side by side. **Accept into draft** adds the part alongside any compatible edits you already made. Choose **Save set** to make those changes part of the saved revision, or choose **Discard proposal** to remove a pending proposal. If another editor has saved first, use **Save draft as copy** to keep your work in a new set, then open the latest revision from **Saved sets**. After an interrupted connection, check the save status and try **Save set** again if you still see unsaved changes.

In the built-in Codex browser, Site tools can inspect the selected slot and stage PNG bytes for the same review. Keep the Sprite Generator open on the saved pose with the slot selected.
