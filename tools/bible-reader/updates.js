async function loadChapterWork() {
  if (document.querySelector('[data-chapter-work]')) return;
  const masthead = document.querySelector('link[href$="/project-masthead.css"]');
  if (!masthead || !document.querySelector('#chapter-dialog')) return;
  const module = new URL('reader-review-upgrade.js', masthead.href);
  try {
    const { enableChapterWork } = await import(module);
    enableChapterWork(new URL('review.css', module));
  } catch {
    // Earlier shared revisions have no chapter work module.
  }
}

void loadChapterWork();

async function loadGlobalTaskList() {
  const sharedStyle = document.querySelector('link[data-chapter-work][href$="/review.css"]')
    ?? document.querySelector('link[href$="/project-masthead.css"]');
  if (!sharedStyle || new URL(sharedStyle.href).origin !== location.origin) return;
  try {
    const { installPrivateTaskList } = await import(new URL('private-task-list.js', sharedStyle.href));
    await installPrivateTaskList();
  } catch {
    // Older checkouts and readers without a configured Task List keep their existing links.
  }
}

if (document.querySelector('#references')) void loadGlobalTaskList();


async function loadProjectPhase() {
  if (!document.querySelector('.project-masthead-name')) return;
  const sharedStyle = document.querySelector('link[data-chapter-work][href$="/review.css"]')
    ?? document.querySelector('link[href$="/project-masthead.css"]');
  if (!sharedStyle) return;
  const module = new URL('project-phases.js', sharedStyle.href);
  if (module.origin !== location.origin) return;
  try {
    const { showProjectPhase } = await import(module);
    await showProjectPhase();
  } catch {
    // Older shared revisions have no project phase module.
  }
}

void loadProjectPhase();

const title = document.querySelector('#references #reference-title');

if (title) {
  const endpoint = new URL('api/bible-update', location.href);
  if (!title.closest('#references').querySelector('[data-bible-changelog]')) addChangelog(title);
  const version = document.createElement('button');
  version.className = 'bible-version';
  version.type = 'button';
  version.setAttribute('aria-haspopup', 'dialog');
  version.textContent = 'Bible version';
  title.before(version);

  const dialog = document.createElement('dialog');
  dialog.className = 'bible-update';
  dialog.setAttribute('aria-labelledby', 'bible-update-title');
  dialog.innerHTML = `
    <form method="dialog">
      <button class="close" aria-label="Close Bible updates" autofocus>×</button>
    </form>
    <h2 id="bible-update-title">Bible updates</h2>
    <dl>
      <div><dt>Installed</dt><dd data-installed>—</dd></div>
      <div><dt>Latest</dt><dd data-latest>—</dd></div>
      <div data-backup hidden><dt>Previous</dt><dd data-previous>—</dd></div>
    </dl>
    <p role="status">Checking for updates…</p>
    <div class="bible-update-actions">
      <button type="button" data-check>Check for updates</button>
      <button type="button" data-install disabled>Update now</button>
      <button type="button" data-restore hidden disabled>Restore previous</button>
    </div>`;
  document.body.append(dialog);

  const installed = dialog.querySelector('[data-installed]');
  const latest = dialog.querySelector('[data-latest]');
  const backup = dialog.querySelector('[data-backup]');
  const previous = dialog.querySelector('[data-previous]');
  const status = dialog.querySelector('[role="status"]');
  const checkButton = dialog.querySelector('[data-check]');
  const installButton = dialog.querySelector('[data-install]');
  const restoreButton = dialog.querySelector('[data-restore]');
  let release;
  let busy = false;

  function showVersion(cell, revision) {
    cell.textContent = revision ? revision.slice(0, 8) : '—';
    cell.title = revision ?? '';
  }

  function setBusy(value) {
    busy = value;
    checkButton.disabled = busy;
    installButton.disabled = busy || release?.status !== 'available';
    restoreButton.disabled = busy || !release?.previous;
  }

  async function request(options) {
    const response = await fetch(endpoint, { cache: 'no-store', ...options });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    return result;
  }

  function show(result, message) {
    release = result;
    showVersion(installed, result.installed);
    showVersion(latest, result.latest);
    showVersion(previous, result.previous);
    backup.hidden = restoreButton.hidden = !result.previous;
    if (result.installed) version.textContent = `Bible version ${result.installed.slice(0, 8)}`;
    status.dataset.state = result.status;
    status.textContent = message ?? result.message ??
      (result.status === 'current' ? 'You’re up to date.' : 'An update is available.');
  }

  async function check() {
    if (busy) return;
    setBusy(true);
    status.textContent = 'Checking for updates…';
    try {
      show(await request());
    } catch {
      show({ installed: release?.installed, status: 'offline' },
        'Couldn’t check for updates. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  async function changeVersion(action) {
    const restoring = action === 'restore';
    if (busy || (restoring ? !release?.previous : release?.status !== 'available')) return;
    setBusy(true);
    status.textContent = restoring ? 'Restoring the previous Bible…' : 'Installing the shared Bible…';
    try {
      const { installed, latest, previous } = release;
      const result = await request({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bible-Update': '1' },
        body: JSON.stringify(restoring ? { action, installed, previous } : { action, installed, latest }),
      });
      show(result, restoring ? 'Previous version restored. Reopening the reader…' : 'Updated. Reopening the reader…');
      const reader = new URL(location.href);
      reader.searchParams.set('bible-revision', result.installed);
      location.replace(reader);
    } catch (error) {
      status.dataset.state = 'offline';
      status.textContent = error instanceof SyntaxError || error instanceof TypeError
        ? 'Couldn’t change versions. Check the installed version before trying again.'
        : error.message;
    } finally {
      setBusy(false);
    }
  }

  version.addEventListener('click', () => dialog.showModal());
  checkButton.addEventListener('click', check);
  installButton.addEventListener('click', () => changeVersion('install'));
  restoreButton.addEventListener('click', () => changeVersion('restore'));
  void check();
}

function addChangelog(title) {
  const shortcut = document.createElement('button');
  shortcut.type = 'button';
  shortcut.textContent = 'Changelog';
  shortcut.dataset.bibleChangelog = '';
  shortcut.setAttribute('aria-haspopup', 'dialog');

  const references = title.closest('#references');
  const notes = [...references.querySelectorAll('.link-row')].find(row => row.textContent.includes('Joe’s Notes'));
  const row = notes ?? references.appendChild(document.createElement('p'));
  row.append(' · ', shortcut);

  const dialog = document.createElement('dialog');
  dialog.className = 'bible-update bible-changelog';
  dialog.setAttribute('aria-labelledby', 'bible-changelog-title');
  dialog.innerHTML = `
    <form method="dialog">
      <button class="close" aria-label="Close changelog" autofocus>×</button>
    </form>
    <h2 id="bible-changelog-title">Changelog</h2>
    <section><h3>Project changes</h3><div data-project></div></section>
    <section><h3>Shared Bible changes</h3><div data-shared></div></section>`;
  document.body.append(dialog);
  shortcut.addEventListener('click', () => {
    dialog.showModal();
    void showLog(dialog.querySelector('[data-project]'), 'project-changelog.md',
      'No project changes recorded.');
    void showLog(dialog.querySelector('[data-shared]'), 'bible-changelog.md',
      'Install the latest Bible to see its shared changelog.');
  });
}

async function showLog(container, file, emptyMessage) {
  container.textContent = 'Loading…';
  try {
    const response = await fetch(new URL(file, location.href), { cache: 'no-store' });
    if (response.status === 404) {
      container.textContent = emptyMessage;
      return;
    }
    if (!response.ok) throw new Error('Couldn’t open the changelog.');
    const markdown = await response.text();
    const entries = markdown.split(/^#{2,6} (?=\d{4}-\d{2}-\d{2}\b|\d{4}-\d{2}-\d{2}T)/m).slice(1);
    const list = document.createElement('ul');
    for (const entry of entries.reverse()) {
      const [heading, ...lines] = entry.trim().split(/\r?\n/);
      const item = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = heading.replace(/T\d\d:\d\d(?::\d\d)?(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)?/, '');
      item.append(label);
      const summary = lines.join('\n').trim().split(/\n\s*\n/)[0]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/^[*-] /gm, '').replace(/\s+/g, ' ');
      if (summary) item.append(document.createElement('br'), summary);
      list.append(item);
    }
    if (list.childElementCount) container.replaceChildren(list);
    else container.textContent = emptyMessage;
  } catch {
    container.textContent = 'Couldn’t open the changelog. Try again.';
  }
}
