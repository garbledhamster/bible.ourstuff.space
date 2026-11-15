import { readSpriteBundle, SPRITE_BUNDLE_LIMIT, writeSpriteBundle } from './sprite-bundle-model.js';
import { readSpritePlacementSelection } from './sprite-placement.js';
import { safeSpriteFilename } from './sprite-sheet.js';

export function installSpriteBundle({ controls, preview, getDraft, canImportDraft, importDraft }) {
  const library = controls.querySelector('[data-library-section]');
  if (!library) return;

  const group = document.createElement('div');
  group.className = 'sprite-bundle';
  group.innerHTML = `
    <div class="sprite-bundle__actions">
      <label class="sprite-generator__file">
        <span>Import editable bundle</span>
        <input type="file" accept=".json,application/json" data-bundle-import>
      </label>
      <button type="button" data-bundle-export hidden>Download editable bundle</button>
    </div>
    <p role="status" data-bundle-message hidden></p>`;
  library.append(group);
  const input = group.querySelector('[data-bundle-import]');
  const download = group.querySelector('[data-bundle-export]');
  const message = group.querySelector('[data-bundle-message]');
  let importing = false;
  let setId;

  function showMessage(text) {
    message.textContent = text;
    message.hidden = !text;
  }

  function render() {
    const draft = getDraft();
    if (setId !== draft?.id) {
      setId = draft?.id;
      showMessage('');
    }
    input.disabled = importing || !canImportDraft();
    download.hidden = !draft;
    download.disabled = importing;
  }

  input.addEventListener('change', async () => {
    const file = input.files.item(0);
    input.value = '';
    if (!file || importing || !canImportDraft()) return;
    const current = getDraft();
    importing = true;
    render();
    showMessage('Checking bundle…');
    try {
      if (file.size > SPRITE_BUNDLE_LIMIT) throw new Error('Choose an editable bundle under 32 MB.');
      const manifest = readSpriteBundle(await file.text());
      for (const asset of manifest.assets) {
        const image = new Image();
        image.src = asset.dataUrl;
        try {
          await image.decode();
        } catch {
          throw new Error(`Couldn’t open “${asset.name}”. Export the bundle again with the original PNG.`);
        }
        if (image.naturalWidth !== asset.width || image.naturalHeight !== asset.height) {
          throw new Error(`PNG dimensions do not match “${asset.name}”. Export the bundle again with the original PNG.`);
        }
      }
      if (current !== getDraft() || !importDraft(manifest)) {
        throw new Error('The open set changed. Finish your edits, then import the bundle again.');
      }
      showMessage('Bundle opened as a new set. Save it to keep it in this project.');
    } catch (error) {
      showMessage(error.message);
    } finally {
      importing = false;
      render();
    }
  });

  download.addEventListener('click', () => {
    const manifest = getDraft();
    if (!manifest) return;
    const selection = readSpritePlacementSelection(preview);
    const blob = new Blob([writeSpriteBundle(manifest, selection)], { type: 'application/json' });
    if (blob.size > SPRITE_BUNDLE_LIMIT) {
      showMessage('This set is too large for a 32 MB editable bundle.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeSpriteFilename(manifest.name)}.sprite-bundle.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  return render;
}
