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
    </dl>
    <p role="status">Checking for updates…</p>
    <div class="bible-update-actions">
      <button type="button" data-check>Check for updates</button>
      <button type="button" data-install disabled>Update now</button>
    </div>`;
  document.body.append(dialog);

  const installed = dialog.querySelector('[data-installed]');
  const latest = dialog.querySelector('[data-latest]');
  const status = dialog.querySelector('[role="status"]');
  const checkButton = dialog.querySelector('[data-check]');
  const installButton = dialog.querySelector('[data-install]');
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

  async function install() {
    if (busy || release?.status !== 'available') return;
    setBusy(true);
    status.textContent = 'Installing the shared Bible…';
    try {
      const { installed, latest } = release;
      const result = await request({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bible-Update': '1' },
        body: JSON.stringify({ installed, latest }),
      });
      show(result, 'Updated. Reload the reader to load any new styles.');
    } catch (error) {
      status.dataset.state = 'offline';
      status.textContent = error instanceof SyntaxError || error instanceof TypeError
        ? 'Couldn’t finish the update. Check the installed version before trying again.'
        : error.message;
    } finally {
      setBusy(false);
    }
  }

  version.addEventListener('click', () => dialog.showModal());
  checkButton.addEventListener('click', check);
  installButton.addEventListener('click', install);
  void check();
}
