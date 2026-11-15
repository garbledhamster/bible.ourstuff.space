import { installSpriteCombine } from './sprite-combine.js';
import { installSpritePlacement } from './sprite-placement.js';

const PNG_TYPE = 'image/png';
const PNG_LIMIT = 8 * 1024 * 1024;
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

async function readPng(file) {
  if (file.size > PNG_LIMIT) throw new Error('Choose a PNG smaller than 8 MB.');
  const header = new Uint8Array(await file.slice(0, 24).arrayBuffer());
  if (header.length < 24 || !PNG_SIGNATURE.every((byte, index) => header[index] === byte)) {
    throw new Error('Choose a PNG image.');
  }
  const dimensions = new DataView(header.buffer);
  const width = dimensions.getUint32(16);
  const height = dimensions.getUint32(20);
  if (!width || !height || width > 8192 || height > 8192 || width * height > 32 * 1024 * 1024) {
    throw new Error('Use a PNG up to 8192 pixels on a side and 32 megapixels overall.');
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Couldn’t read this PNG. Choose the file again.'));
    reader.readAsDataURL(new Blob([file], { type: PNG_TYPE }));
  });
  const image = new Image();
  image.src = dataUrl;
  try {
    await image.decode();
  } catch {
    throw new Error('This PNG couldn’t be opened. Try exporting it again.');
  }
  return { id: crypto.randomUUID(), name: file.name.slice(0, 120), width, height, dataUrl };
}

async function request(url, options) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const payload = response.headers.get('Content-Type')?.includes('application/json')
    ? await response.json()
    : {};
  if (!response.ok || !payload) {
    const error = new Error(payload?.message || 'Can’t reach the sprite workspace. Try again.');
    error.status = response.status;
    error.project = payload?.project;
    throw error;
  }
  return payload;
}

function makeEditor() {
  const dialog = document.createElement('dialog');
  dialog.className = 'sprite-generator';
  dialog.setAttribute('aria-labelledby', 'sprite-generator-title');
  dialog.innerHTML = `
    <header class="sprite-generator__header">
      <div>
        <h2 id="sprite-generator-title">Sprite Generator</h2>
        <p class="sprite-generator__context"><span data-project></span><span data-set></span></p>
      </div>
      <div class="sprite-generator__actions">
        <p class="sprite-generator__state" data-state role="status"></p>
        <button type="button" class="sprite-generator__primary" data-save disabled>Save set</button>
      </div>
      <form method="dialog" class="sprite-generator__dismiss">
        <button class="close" aria-label="Close Sprite Generator" autofocus>×</button>
      </form>
    </header>
    <div class="sprite-generator__body">
      <div class="sprite-generator__preview" data-preview role="region" aria-label="Sprite previews" tabindex="0">
        <figure class="sprite-generator__source" aria-label="Source preview">
          <div class="sprite-generator__artboard" data-artboard>
            <p data-empty>Create a set or open one from this project.</p>
          </div>
          <figcaption data-caption hidden></figcaption>
        </figure>
      </div>
      <div class="sprite-generator__controls" data-controls role="region" aria-label="Sprite controls" tabindex="0">
        <section data-library-section aria-labelledby="sprite-library-title">
          <h3 id="sprite-library-title">Set library</h3>
          <label>Saved sets <select data-library aria-label="Saved sets"></select></label>
          <form data-create>
            <label>New set name <input name="name" type="text" maxlength="120" required></label>
            <button type="submit">Create set</button>
          </form>
          <div class="sprite-generator__recovery">
            <button type="button" data-save-copy hidden>Save draft as copy</button>
            <button type="button" data-discard hidden>Discard draft</button>
          </div>
        </section>
        <section data-assets-section aria-labelledby="sprite-assets-title" hidden>
          <h3 id="sprite-assets-title">Source images</h3>
          <label class="sprite-generator__file">
            <span>Import PNG</span>
            <input type="file" accept="image/png,.png" data-file>
          </label>
          <label data-assets-field hidden>Preview image <select data-assets></select></label>
        </section>
      </div>
    </div>
    <p class="sprite-generator__message" data-message role="status" hidden></p>`;
  return dialog;
}

export async function installSpriteGenerator(extensions = [installSpritePlacement, installSpriteCombine]) {
  const footer = document.querySelector('.resources .link-row');
  if (!footer || footer.querySelector('[data-sprite-generator-trigger]')) return;
  const endpoint = new URL('api/sprite-generator', location.href);
  let library;
  let setupMessage = '';
  try {
    library = await request(endpoint);
  } catch (error) {
    if (error.status !== 503 || !error.project) return;
    library = { project: error.project, sets: [] };
    setupMessage = error.message;
  }
  if (typeof library.project !== 'string' || !Array.isArray(library.sets)) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('sprite-generator.css', import.meta.url);
  document.head.append(style);
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.dataset.spriteGeneratorTrigger = '';
  trigger.textContent = 'Sprite Generator';
  const separator = document.createElement('span');
  separator.className = 'separator';
  separator.setAttribute('aria-hidden', 'true');
  separator.textContent = '  •  ';
  if (footer.firstElementChild) footer.firstElementChild.after(separator, trigger);
  else footer.append(trigger);

  const dialog = makeEditor();
  document.body.append(dialog);
  const find = selector => dialog.querySelector(selector);
  const project = find('[data-project]');
  const set = find('[data-set]');
  const state = find('[data-state]');
  const save = find('[data-save]');
  const close = find('.close');
  const librarySection = find('[data-library-section]');
  const librarySelect = find('[data-library]');
  const create = find('[data-create]');
  const createName = create.elements.namedItem('name');
  const createButton = create.querySelector('button');
  const discard = find('[data-discard]');
  const saveCopy = find('[data-save-copy]');
  const sourcesSection = find('[data-assets-section]');
  const file = find('[data-file]');
  const assets = find('[data-assets]');
  const assetsField = find('[data-assets-field]');
  const artboard = find('[data-artboard]');
  const image = new Image();
  const empty = find('[data-empty]');
  const caption = find('[data-caption]');
  const message = find('[data-message]');
  const controls = find('[data-controls]');
  const preview = find('[data-preview]');
  const setEndpoint = id => new URL(`${endpoint.pathname}/${id}`, endpoint);
  let saved = null;
  let draft = null;
  let activeAsset = null;
  let dirty = false;
  let conflict = false;
  let copyAttempt = null;
  let uncertainSave = null;
  let busy = '';

  function setMessage(text) {
    message.textContent = text;
    message.hidden = !text;
  }

  function renderLibrary() {
    librarySelect.replaceChildren(new Option('Choose a saved set', ''),
      ...library.sets.map(item => new Option(item.name, item.id)));
  }

  function render() {
    project.textContent = library.project;
    set.textContent = draft?.name ?? 'No set open';
    state.textContent = busy || (conflict ? 'Saved set changed' : dirty ? 'Unsaved changes' : saved ? 'Saved' : '');
    state.title = saved?.revision ?? '';
    const unavailable = Boolean(setupMessage || busy);
    save.disabled = unavailable || !dirty || conflict;
    close.disabled = Boolean(busy);
    createName.disabled = createButton.disabled = unavailable || dirty;
    librarySelect.disabled = unavailable || dirty || !library.sets.length;
    librarySelect.value = saved?.manifest.id ?? '';
    discard.hidden = !dirty && !conflict;
    discard.textContent = dirty ? 'Discard draft' : 'Reload saved set';
    discard.disabled = Boolean(busy);
    saveCopy.hidden = !conflict || !dirty;
    saveCopy.disabled = unavailable;
    sourcesSection.hidden = !draft;
    if (draft && sourcesSection.previousElementSibling === librarySection) {
      librarySection.before(sourcesSection);
    }
    file.disabled = unavailable || !draft;
    const sources = draft?.assets ?? [];
    assetsField.hidden = sources.length < 2;
    assets.replaceChildren(...sources.map(asset => new Option(asset.name, asset.id)));
    const asset = sources.find(source => source.id === activeAsset) ?? sources.at(0);
    assets.value = asset?.id ?? '';
    assets.disabled = unavailable;
    empty.hidden = Boolean(asset);
    empty.textContent = draft ? 'Import a PNG to preview it here.' : 'Create a set or open one from this project.';
    caption.hidden = !asset;
    if (asset) {
      if (image.getAttribute('src') !== asset.dataUrl) image.src = asset.dataUrl;
      image.alt = `${asset.name} preview`;
      image.classList.toggle('sprite-generator__pixelated', Math.max(asset.width, asset.height) <= 128);
      if (!image.parentNode) artboard.append(image);
      caption.textContent = `${asset.name} · ${asset.width} × ${asset.height} px`;
    } else {
      image.remove();
      image.removeAttribute('src');
    }
    renders.forEach(refresh => refresh?.());
  }

  function updateDraft(edit) {
    if (!draft || busy) return false;
    const next = structuredClone(draft);
    edit(next);
    draft = next;
    dirty = true;
    render();
    return true;
  }

  function markConflict() {
    conflict = true;
    setMessage(dirty
      ? 'Someone saved a newer revision. Save your draft as a copy or discard it to reopen that revision.'
      : 'Someone saved a newer revision. Reload the saved set to see it.');
    render();
  }

  function observeRevision(revision) {
    if (!saved || busy || conflict || revision === saved.revision) return;
    if (uncertainSave) {
      if (!uncertainSave.checking) void settleInterruptedSave(uncertainSave);
      return;
    }
    markConflict();
  }

  async function settleInterruptedSave(attempt) {
    attempt.checking = true;
    const current = await request(setEndpoint(attempt.manifest.id)).catch(() => null);
    attempt.checking = false;
    if (!current || busy || uncertainSave !== attempt || saved?.manifest.id !== current.manifest.id) return;
    if (sameManifest(current.manifest, attempt.manifest)) {
      finishSave(current, !sameManifest(draft, attempt.manifest));
      setMessage('Confirmed the saved set after the connection was interrupted.');
      render();
    } else if (current.revision !== saved.revision) {
      uncertainSave = null;
      markConflict();
    }
  }

  const extension = {
    controls, preview, dialog, request, setEndpoint, getProject: () => library.project,
    getDraft: () => draft, getSaved: () => saved, isBusy: () => Boolean(busy), hasConflict: () => conflict,
    observeRevision, updateDraft, setMessage,
  };
  const renders = extensions.map(install => install(extension));

  function showSnapshot(snapshot) {
    saved = snapshot;
    draft = snapshot ? structuredClone(snapshot.manifest) : null;
    activeAsset = null;
    dirty = conflict = false;
    copyAttempt = uncertainSave = null;
  }

  async function run(label, action) {
    if (busy) return;
    busy = label;
    setMessage('');
    render();
    try {
      await action();
    } catch (error) {
      if (error.status === 409) conflict = true;
      setMessage(error instanceof Error ? error.message : 'The sprite workspace couldn’t finish that action.');
    } finally {
      busy = '';
      render();
    }
  }

  async function refreshLibrary() {
    try {
      library = await request(endpoint);
      setupMessage = '';
      renderLibrary();
    } catch (error) {
      if (error.status === 503) {
        setupMessage = 'Check the directory in --sprite-generator. It must exist and the reader needs permission to read and write it.';
        throw new Error(setupMessage);
      }
      throw error;
    }
  }

  create.addEventListener('submit', event => {
    event.preventDefault();
    if (dirty || busy) return;
    const name = createName.value.trim();
    if (!name) {
      setMessage('Enter a name for the set.');
      createName.focus();
      return;
    }
    showSnapshot(null);
    draft = { version: 1, id: crypto.randomUUID(), name, assets: [] };
    dirty = true;
    create.reset();
    setMessage('');
    render();
    file.focus();
  });

  librarySelect.addEventListener('change', () => {
    const id = librarySelect.value;
    if (!id || dirty) {
      librarySelect.value = saved?.manifest.id ?? '';
      return;
    }
    void run('Opening set…', async () => showSnapshot(await request(setEndpoint(id))));
  });

  discard.addEventListener('click', () => {
    if (!dirty && !conflict) return;
    void run('Reloading set…', async () => {
      const id = saved?.manifest.id;
      showSnapshot(id ? await request(setEndpoint(id)) : null);
      await refreshLibrary();
    });
  });

  file.addEventListener('change', () => {
    const selected = file.files.item(0);
    file.value = '';
    if (!selected || !draft) return;
    void run('Importing PNG…', async () => {
      const asset = await readPng(selected);
      draft.assets.push(asset);
      activeAsset = asset.id;
      dirty = true;
    });
  });

  assets.addEventListener('change', () => {
    activeAsset = assets.value;
    render();
  });

  async function persistDraft(manifest, revision) {
    const url = setEndpoint(manifest.id);
    let snapshot;
    try {
      snapshot = await request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bible-Sprite-Generator': '1' },
        body: JSON.stringify({ revision, manifest }),
      });
    } catch (error) {
      if (error.status === 400 || error.status === 403) throw error;
      // A write can reach disk even when its response never reaches this editor.
      const current = await request(url).catch(() => null);
      if (current && sameManifest(current.manifest, manifest)) {
        snapshot = current;
        setMessage('Confirmed the saved set after the connection was interrupted.');
      } else if (current && uncertainSave && sameManifest(current.manifest, uncertainSave.manifest)) {
        finishSave(current, true);
        return persistDraft(manifest, current.revision);
      } else if (error.status === 409 || (current && current.revision !== revision)) {
        uncertainSave = null;
        const stale = new Error('Someone saved a newer revision. Save your draft as a copy or discard it to reopen that revision.');
        stale.status = 409;
        throw stale;
      } else {
        if (!current && manifest.id === saved?.manifest.id) uncertainSave = { manifest: structuredClone(manifest) };
        throw new Error('The save could not be confirmed. Your draft is still here. Try saving again.');
      }
    }
    finishSave(snapshot);
  }

  function sameManifest(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  function finishSave(snapshot, keepDraft = false) {
    saved = snapshot;
    if (!keepDraft) draft = structuredClone(saved.manifest);
    dirty = keepDraft;
    conflict = false;
    copyAttempt = uncertainSave = null;
    const item = { id: saved.manifest.id, name: saved.manifest.name, revision: saved.revision };
    library.sets = [...library.sets.filter(set => set.id !== item.id), item]
      .sort((a, b) => a.name.localeCompare(b.name));
    renderLibrary();
  }

  save.addEventListener('click', () => {
    if (!dirty || conflict) return;
    void run('Saving…', () => persistDraft(draft, saved?.revision ?? null));
  });

  saveCopy.addEventListener('click', () => {
    if (!dirty || !conflict || busy) return;
    if (copyAttempt?.draft !== draft) {
      const suffix = ' (draft copy)';
      const name = Array.from(draft.name).slice(0, 120 - suffix.length).join('') + suffix;
      copyAttempt = { draft, manifest: { ...draft, name, id: crypto.randomUUID() } };
    }
    void run('Saving copy…', () => persistDraft(copyAttempt.manifest, null));
  });

  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  trigger.addEventListener('click', () => {
    dialog.showModal();
    void run('Loading sets…', refreshLibrary);
  });
  renderLibrary();
  render();
}
