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

const title = document.querySelector('#references #reference-title');

if (title) {
  const endpoint = new URL('api/bible-update', location.href);
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
      show(result, restoring ? 'Previous version restored. Reload the reader.' :
        'Updated. Reload the reader to load any new styles.');
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
