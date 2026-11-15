import { readSpritePlacementSelection } from './sprite-placement.js';
import { planPoseFrame } from './sprite-pose-frame.js';
import { planSpriteSheet, renderSpriteSheet, safeSpriteFilename, sourceCell } from './sprite-sheet.js';

const SOURCE_DEFAULT = { rows: 1, columns: 1, originX: 0, originY: 0 };
const OUTPUT_DEFAULT = { rows: 1, columns: 1, cellWidth: 1, cellHeight: 1 };

function makeInspector() {
  const section = document.createElement('section');
  section.className = 'sprite-combine__inspector';
  section.hidden = true;
  section.innerHTML = `
    <div class="sprite-combine__navigation">
      <button type="button" data-combine-open aria-controls="sprite-combine-settings" aria-expanded="false">Combine &amp; Export</button>
      <button type="button" data-combine-jump-output hidden>Output grid</button>
    </div>
    <div id="sprite-combine-settings" data-combine-settings hidden>
      <form data-source-grid novalidate>
        <label>Source sheet <select data-combine-source></select></label>
        <fieldset>
          <legend>Source grid</legend>
          <div class="sprite-combine__fields">
            <label>Rows <input type="number" step="1" min="1" data-source-rows></label>
            <label>Columns <input type="number" step="1" min="1" data-source-columns></label>
            <label>Origin X <input type="number" step="1" data-source-origin-x></label>
            <label>Origin Y <input type="number" step="1" data-source-origin-y></label>
          </div>
          <button type="submit" data-source-grid-apply>Apply source grid</button>
          <p class="sprite-combine__feedback" data-combine-source-message role="status" hidden></p>
        </fieldset>
      </form>
      <form data-combine-pose-picker hidden>
        <fieldset>
          <legend>Rendered poses</legend>
          <label>Pose <select data-combine-pose></select></label>
          <label>Expression <select data-combine-expression></select></label>
          <button type="submit" data-combine-add-pose>Add pose frame</button>
          <p data-combine-pose-info role="status"></p>
        </fieldset>
      </form>
      <div class="sprite-combine__sequence">
        <h3>Frame order</h3>
        <p data-combine-empty-order></p>
        <ol data-frame-order aria-label="Frame order"></ol>
        <p class="sprite-combine__sr-only" data-combine-order-message role="status"></p>
      </div>
      <form id="sprite-combine-output-grid" data-output-grid novalidate>
        <fieldset>
          <legend>Output grid</legend>
          <div class="sprite-combine__fields">
            <label>Rows <input type="number" step="1" min="1" data-output-rows></label>
            <label>Columns <input type="number" step="1" min="1" data-output-columns></label>
            <label>Cell width <input type="number" step="1" min="1" data-output-cell-width></label>
            <label>Cell height <input type="number" step="1" min="1" data-output-cell-height></label>
          </div>
        </fieldset>
      </form>
    </div>
    <div class="sprite-combine__dock" data-combine-dock hidden>
      <p class="sprite-combine__feedback" data-combine-message role="status" hidden></p>
      <div id="sprite-combine-downloads" class="sprite-combine__downloads" hidden>
        <a data-download-png>Download PNG</a>
        <a data-download-frame-map>Download frame map (JSON)</a>
      </div>
      <div class="sprite-combine__actions">
        <button type="submit" form="sprite-combine-output-grid" class="sprite-generator__primary" data-combine-run>Combine</button>
        <button type="button" data-combine-export aria-expanded="false" aria-controls="sprite-combine-downloads" disabled>Export</button>
      </div>
    </div>`;
  return section;
}

function makeWorkspace() {
  const workspace = document.createElement('div');
  workspace.className = 'sprite-combine__workspace';
  workspace.dataset.combineWorkspace = '';
  workspace.hidden = true;
  workspace.innerHTML = `
    <div class="sprite-combine__sheet-switch" role="group" aria-label="Sheet preview">
      <button type="button" data-sheet-mode="source" aria-pressed="true">Source cells</button>
      <button type="button" data-sheet-mode="output" aria-pressed="false">Combined sheet</button>
    </div>
    <figure data-combine-source-preview>
      <h3>Source cells</h3>
      <div class="sprite-combine__board">
        <div class="sprite-combine__sheet" data-combine-source-sheet hidden>
          <div class="sprite-combine__source-cells" data-source-cells role="group" aria-label="Selectable source cells"></div>
        </div>
        <p data-combine-no-source>Import a PNG from the set to select its cells.</p>
      </div>
      <figcaption data-combine-source-caption></figcaption>
    </figure>
    <figure data-combine-output-preview hidden>
      <h3>Combined sheet</h3>
      <div class="sprite-combine__board">
        <div class="sprite-combine__sheet" data-combine-output-sheet>
          <div class="sprite-combine__grid-lines" aria-hidden="true"></div>
        </div>
      </div>
      <figcaption data-combine-output-caption></figcaption>
      <p class="sprite-combine__feedback" data-combine-stale role="status" hidden></p>
    </figure>`;
  return workspace;
}

function getFields(container, selectors) {
  return Object.fromEntries(Object.entries(selectors).map(([name, selector]) => [name, container.querySelector(selector)]));
}

function fieldValues(fields) {
  return Object.fromEntries(Object.entries(fields).map(([name, input]) => [name, input.valueAsNumber]));
}

function writeFields(fields, values) {
  for (const [name, input] of Object.entries(fields)) input.value = values[name] ?? '';
}

function showMessage(node, text) {
  node.textContent = text;
  node.hidden = !text;
}

function sizeSheet(element, width, height, rows, columns) {
  element.style.setProperty('--sheet-ratio', width / height);
  element.style.setProperty('--sheet-row', `${100 / rows}%`);
  element.style.setProperty('--sheet-column', `${100 / columns}%`);
  element.style.setProperty('--sheet-rows', rows);
  element.style.setProperty('--sheet-columns', columns);
}

function sourceKey({ assetId, row, column }) {
  return `${assetId}/${row}/${column}`;
}

function describeSourceCell(asset, row, column) {
  return `${asset.name} · ${row + 1}, ${column + 1}`;
}

async function decodeSource(asset) {
  const image = new Image();
  image.src = asset.dataUrl;
  try {
    await image.decode();
  } catch {
    throw new Error(`Couldn’t open ${asset.name}. Reimport the PNG from its original file.`);
  }
  return image;
}

function pngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Couldn’t create the PNG. Try a smaller output.')), 'image/png');
  });
}

// resolveFrame can supply a rendered pose using the same native crop, origin and source metadata as an imported cell.
export function installSpriteCombine({ controls, preview, getDraft, isBusy, updateDraft }, { resolveFrame } = {}) {
  const dialog = controls.closest('dialog');
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('sprite-combine.css', import.meta.url);
  document.head.append(style);
  const inspector = makeInspector();
  controls.prepend(inspector);
  const workspace = makeWorkspace();
  preview.append(workspace);

  const find = selector => inspector.querySelector(selector) ?? workspace.querySelector(selector);
  const toggle = find('[data-combine-open]');
  const jumpOutput = find('[data-combine-jump-output]');
  const settings = find('[data-combine-settings]');
  const dock = find('[data-combine-dock]');
  const picker = find('[data-combine-source]');
  const sourceForm = find('[data-source-grid]');
  const sourceFields = getFields(inspector, {
    rows: '[data-source-rows]', columns: '[data-source-columns]',
    originX: '[data-source-origin-x]', originY: '[data-source-origin-y]',
  });
  const sourceSheet = find('[data-combine-source-sheet]');
  const sourceImage = new Image();
  sourceImage.alt = '';
  const sourceCells = find('[data-source-cells]');
  const sourceCaption = find('[data-combine-source-caption]');
  const sourceMessage = find('[data-combine-source-message]');
  const noSource = find('[data-combine-no-source]');
  const posePicker = find('[data-combine-pose-picker]');
  const poseField = find('[data-combine-pose]');
  const expressionField = find('[data-combine-expression]');
  const poseButton = find('[data-combine-add-pose]');
  const poseInfo = find('[data-combine-pose-info]');
  const order = find('[data-frame-order]');
  const emptyOrder = find('[data-combine-empty-order]');
  const orderMessage = find('[data-combine-order-message]');
  const outputForm = find('[data-output-grid]');
  const outputFields = getFields(inspector, {
    rows: '[data-output-rows]', columns: '[data-output-columns]',
    cellWidth: '[data-output-cell-width]', cellHeight: '[data-output-cell-height]',
  });
  const outputPreview = find('[data-combine-output-preview]');
  const outputSheet = find('[data-combine-output-sheet]');
  const outputCaption = find('[data-combine-output-caption]');
  const staleHint = find('[data-combine-stale]');
  const outputMessage = find('[data-combine-message]');
  const combineButton = find('[data-combine-run]');
  const exportButton = find('[data-combine-export]');
  const downloads = find('#sprite-combine-downloads');
  const pngLink = find('[data-download-png]');
  const mapLink = find('[data-download-frame-map]');

  let isOpen = false;
  let setId;
  let sourceId;
  let assetKey;
  let sourceGridKey;
  let outputGridKey;
  let poseKey;
  let poseSelection;
  let queueKey;
  let restoredKey;
  let dragging;
  let output;
  let renderAttempt = 0;
  let combining = false;
  let outputStale = false;

  function editRecipe(edit) {
    return updateDraft(draft => {
      draft.combine ??= {};
      edit(draft.combine);
    });
  }

  function getAsset() {
    return getDraft()?.assets.find(asset => asset.id === sourceId);
  }

  function getSourceGrid() {
    return getDraft()?.combine?.sourceGrids?.[sourceId] ?? SOURCE_DEFAULT;
  }

  function currentFrames() {
    return getDraft()?.combine?.frames ?? [];
  }

  function getOutputGrid() {
    if (getDraft().combine?.grid) return getDraft().combine.grid;
    const first = currentFrames()[0];
    const placement = getDraft().placement;
    if (first?.kind === 'pose' && placement) {
      return { ...OUTPUT_DEFAULT, cellWidth: placement.width, cellHeight: placement.height };
    }
    const firstAsset = getDraft().assets.find(asset => asset.id === first?.assetId);
    if (firstAsset) {
      const grid = getDraft().combine?.sourceGrids?.[firstAsset.id] ?? SOURCE_DEFAULT;
      return { ...OUTPUT_DEFAULT, cellWidth: firstAsset.width / grid.columns, cellHeight: firstAsset.height / grid.rows };
    }
    const asset = getAsset();
    const grid = getSourceGrid();
    return asset
      ? { ...OUTPUT_DEFAULT, cellWidth: asset.width / grid.columns, cellHeight: asset.height / grid.rows }
      : OUTPUT_DEFAULT;
  }

  function resetDownloads() {
    downloads.hidden = true;
    exportButton.setAttribute('aria-expanded', 'false');
    for (const link of [pngLink, mapLink]) {
      if (link.href) URL.revokeObjectURL(link.href);
      link.removeAttribute('href');
    }
  }

  function currentRecipe() {
    const draft = getDraft();
    const recipe = {
      grid: fieldValues(outputFields),
      frames: currentFrames(),
      sourceGrids: draft.combine?.sourceGrids ?? {},
    };
    if (recipe.frames.some(frame => frame.kind === 'pose')) recipe.placement = draft.placement;
    return recipe;
  }

  function updateExportState() {
    const stale = Boolean(output && JSON.stringify(output.recipe) !== JSON.stringify(currentRecipe()));
    if (stale !== outputStale) resetDownloads();
    outputStale = stale;
    exportButton.textContent = stale ? 'Export previous' : 'Export';
    showMessage(staleHint, stale ? 'Previous sheet. Combine again to use your latest changes.' : '');
  }

  function setSheetMode(mode) {
    workspace.dataset.sheetView = mode;
    for (const button of workspace.querySelectorAll('[data-sheet-mode]')) {
      button.setAttribute('aria-pressed', String(button.dataset.sheetMode === mode));
    }
  }

  function showOutput(result) {
    resetDownloads();
    output?.canvas.remove();
    output = result;
    outputPreview.hidden = !output;
    workspace.classList.toggle('sprite-combine__workspace--paired', Boolean(output));
    setSheetMode(output ? 'output' : 'source');
    exportButton.disabled = !output;
    updateExportState();
    if (!output) return;

    const { canvas, frameMap: map } = output;
    canvas.dataset.combineOutput = '';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Combined sprite sheet');
    const empty = map.rows * map.columns - map.frames.length;
    outputCaption.textContent = `${map.width} × ${map.height} px · ${map.columns} × ${map.rows} cells · ${empty} empty`;
    sizeSheet(outputSheet, map.width, map.height, map.rows, map.columns);
    outputSheet.prepend(canvas);
  }

  function showMode(open) {
    isOpen = open;
    settings.hidden = workspace.hidden = dock.hidden = !open;
    jumpOutput.hidden = !open;
    dialog.classList.toggle('sprite-combine-active', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Back to set' : 'Combine & Export';
  }

  function makeCell(asset, row, column, orderIndex) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.dataset.sourceCell = '';
    cell.dataset.row = row;
    cell.dataset.column = column;
    cell.setAttribute('aria-label', describeSourceCell(asset, row, column));
    cell.title = `Row ${row + 1}, column ${column + 1}`;
    cell.tabIndex = row === 0 && column === 0 ? 0 : -1;
    cell.innerHTML = '<span aria-hidden="true"></span>';
    paintCell(cell, orderIndex);
    return cell;
  }

  function paintCell(cell, orderIndex) {
    cell.setAttribute('aria-pressed', String(orderIndex !== undefined));
    cell.firstElementChild.textContent = orderIndex === undefined ? '' : orderIndex + 1;
  }

  function renderSource(asset, frames) {
    sourceForm.hidden = sourceSheet.hidden = !asset;
    noSource.hidden = Boolean(asset);
    if (!asset) {
      sourceCaption.textContent = '';
      sourceImage.remove();
      sourceImage.removeAttribute('src');
      sourceCells.replaceChildren();
      sourceGridKey = undefined;
      return;
    }

    const selected = new Map(frames
      .map((frame, index) => [frame, index])
      .filter(([frame]) => frame.kind === 'source' && frame.assetId === asset.id)
      .map(([frame, index]) => [sourceKey(frame), index]));
    const grid = getSourceGrid();
    const key = JSON.stringify([asset.id, grid]);
    if (key === sourceGridKey) {
      for (const cell of sourceCells.children) {
        paintCell(cell, selected.get(sourceKey({ assetId: asset.id, ...cell.dataset })));
      }
      return;
    }

    sourceGridKey = key;
    writeFields(sourceFields, grid);
    sourceImage.src = asset.dataUrl;
    sourceImage.width = asset.width;
    sourceImage.height = asset.height;
    if (!sourceImage.parentNode) sourceSheet.prepend(sourceImage);
    try {
      const first = sourceCell(asset, grid, 0, 0);
      sizeSheet(sourceSheet, asset.width, asset.height, grid.rows, grid.columns);
      const cells = [];
      for (let row = 0; row < grid.rows; row++) {
        for (let column = 0; column < grid.columns; column++) {
          cells.push(makeCell(asset, row, column, selected.get(sourceKey({ assetId: asset.id, row, column }))));
        }
      }
      sourceCells.replaceChildren(...cells);
      sourceCaption.textContent = `${asset.name} · ${grid.columns} × ${grid.rows} cells · ${first.width} × ${first.height} px each`;
    } catch (error) {
      sourceCells.replaceChildren();
      sourceCaption.textContent = asset.name;
      showMessage(sourceMessage, error.message);
    }
  }

  function frameLabel(frame) {
    if (frame.kind === 'pose') {
      const placement = getDraft().placement;
      const pose = placement?.poses.find(entry => entry.id === frame.poseId);
      const expression = placement?.expressions.find(entry => entry.id === frame.expressionId);
      const view = placement?.views.find(entry => entry.id === pose?.viewId);
      return [view?.name, pose?.name ?? 'Missing pose', expression?.name].filter(Boolean).join(' · ');
    }
    const asset = getDraft().assets.find(asset => asset.id === frame.assetId);
    return asset ? describeSourceCell(asset, frame.row, frame.column) : 'Missing source frame';
  }

  function selectedPoseFrame() {
    return { kind: 'pose', poseId: poseField.value, expressionId: expressionField.value || null };
  }

  function renderPoseInfo() {
    let message;
    let invalid = false;
    try {
      const { originX, originY } = planPoseFrame(selectedPoseFrame(), getDraft());
      message = `Origin ${originX}, ${originY} px`;
    } catch (error) {
      message = error.message;
      invalid = true;
    }
    if (poseInfo.textContent !== message) poseInfo.textContent = message;
    poseInfo.classList.toggle('sprite-combine__feedback', invalid);
    poseButton.disabled = invalid;
  }

  function renderPosePicker(placement) {
    posePicker.hidden = !resolveFrame || !placement?.poses.length;
    emptyOrder.textContent = posePicker.hidden
      ? 'Select cells from the source preview.'
      : 'Select source cells or add a pose frame.';
    if (posePicker.hidden) return;

    const views = new Map(placement.views.map(view => [view.id, view.name]));
    const poses = placement.poses.map(({ id, name, viewId }) => [id, `${views.get(viewId)} · ${name}`]);
    const expressions = placement.expressions.map(({ id, name }) => [id, name]);
    const key = JSON.stringify([poses, expressions]);
    if (poseKey !== key || poseSelection) {
      const poseId = poseSelection?.poseId ?? poseField.value;
      const expressionId = poseSelection?.expressionId ?? expressionField.value;
      poseSelection = undefined;
      poseKey = key;
      poseField.replaceChildren(...poses.map(([id, label]) => new Option(label, id)));
      expressionField.replaceChildren(new Option('Base parts', ''),
        ...expressions.map(([id, label]) => new Option(label, id)));
      if (poses.some(([id]) => id === poseId)) poseField.value = poseId;
      if (expressions.some(([id]) => id === expressionId)) expressionField.value = expressionId;
    }
    renderPoseInfo();
  }

  function renderOrder(frames) {
    const labels = frames.map(frameLabel);
    const key = JSON.stringify([frames, labels]);
    if (queueKey === key) return;
    queueKey = key;
    emptyOrder.hidden = Boolean(frames.length);
    order.replaceChildren(...labels.map((label, index) => {
      const item = document.createElement('li');
      item.dataset.combineFrame = '';
      item.dataset.frameIndex = index;
      item.draggable = true;
      item.innerHTML = `<div>
        <span data-frame-label></span>
        <button type="button" data-frame-earlier><span aria-hidden="true"></span></button>
        <button type="button" data-frame-later><span aria-hidden="true"></span></button>
        <button type="button" data-frame-remove><span aria-hidden="true"></span></button>
      </div>`;
      const title = item.querySelector('[data-frame-label]');
      title.textContent = title.title = label;
      const earlier = item.querySelector('[data-frame-earlier]');
      const later = item.querySelector('[data-frame-later]');
      earlier.setAttribute('aria-label', `Move frame ${index + 1} earlier`);
      later.setAttribute('aria-label', `Move frame ${index + 1} later`);
      item.querySelector('[data-frame-remove]').setAttribute('aria-label', `Remove frame ${index + 1}`);
      earlier.disabled = index === 0;
      later.disabled = index === frames.length - 1;
      return item;
    }));
  }

  function render() {
    const draft = getDraft();
    if (draft?.id !== setId) {
      setId = draft?.id;
      sourceId = assetKey = sourceGridKey = outputGridKey = poseKey = poseSelection = queueKey = restoredKey = undefined;
      showMode(false);
      showOutput(null);
      renderAttempt++;
      combining = false;
      showMessage(sourceMessage, '');
      showMessage(outputMessage, '');
    }

    inspector.hidden = !draft;
    if (!draft || !isOpen) return;
    const { assets, combine } = draft;
    const key = JSON.stringify(assets.map(({ id, name }) => [id, name]));
    if (key !== assetKey) {
      assetKey = key;
      if (!assets.some(asset => asset.id === sourceId)) sourceId = assets[0]?.id;
      picker.replaceChildren(...assets.map(asset => new Option(asset.name, asset.id)));
      picker.value = sourceId ?? '';
    }
    const frames = currentFrames();
    renderSource(getAsset(), frames);
    renderPosePicker(draft.placement);
    renderOrder(frames);
    const grid = getOutputGrid();
    const gridKey = JSON.stringify(grid);
    if (gridKey !== outputGridKey) {
      outputGridKey = gridKey;
      writeFields(outputFields, grid);
    }
    combineButton.disabled = combining;
    combineButton.textContent = combining ? 'Combining…' : 'Combine';
    updateExportState();

    const previous = combine?.lastCombined;
    const previousKey = JSON.stringify(previous);
    if (previousKey !== restoredKey) {
      restoredKey = previousKey;
      if (previous) void combineSheet(previous, false);
      else if (output) showOutput(null);
    }
  }

  async function combineSheet(recipe, remember) {
    const draft = getDraft();
    const attempt = ++renderAttempt;
    const stillCurrent = () => attempt === renderAttempt && getDraft()?.id === draft.id;
    combining = true;
    showMessage(outputMessage, '');
    render();
    try {
      const assets = new Map(draft.assets.map(asset => [asset.id, asset]));
      const renderDraft = recipe.placement ? { ...draft, placement: recipe.placement } : draft;
      const crops = recipe.frames.map(frame => {
        if (frame.kind !== 'source') {
          if (resolveFrame) return planPoseFrame(frame, renderDraft);
          throw new Error('A rendered pose in this recipe is unavailable.');
        }
        const asset = assets.get(frame.assetId);
        if (!asset) throw new Error('A source image is missing. Remove its frame or reimport the PNG.');
        return sourceCell(asset, recipe.sourceGrids?.[asset.id] ?? SOURCE_DEFAULT, frame.row, frame.column);
      });

      const plan = planSpriteSheet(recipe.grid, crops);
      const images = new Map();
      await Promise.all(crops.map(async crop => {
        if (crop.source.kind === 'pose') {
          const frame = await resolveFrame(crop.source, renderDraft);
          crop.image = frame.image;
          return;
        }
        const asset = assets.get(crop.source.assetId);
        if (!images.has(asset.id)) images.set(asset.id, decodeSource(asset));
        crop.image = await images.get(asset.id);
      }));
      if (!stillCurrent()) return;

      const canvas = renderSpriteSheet(plan);
      if (remember) {
        const previousKey = restoredKey;
        restoredKey = JSON.stringify(recipe);
        const remembered = editRecipe(combine => {
          combine.grid = recipe.grid;
          combine.lastCombined = recipe;
        });
        if (!remembered) {
          restoredKey = previousKey;
          if (isBusy()) throw new Error('The set is updating. Try Combine again when it’s ready.');
          return;
        }
      }
      showOutput({ canvas, frameMap: plan.frameMap, recipe });
    } catch (error) {
      if (stillCurrent()) showMessage(outputMessage, error.message);
    } finally {
      if (stillCurrent()) {
        combining = false;
        render();
      }
    }
  }

  function moveFrame(from, to, focusSelector) {
    const frames = [...currentFrames()];
    if (from === to || !frames[from] || !frames[to]) return;
    const [frame] = frames.splice(from, 1);
    frames.splice(to, 0, frame);
    if (!editRecipe(recipe => { recipe.frames = frames; })) return;
    orderMessage.textContent = `Moved ${frameLabel(frame)} to position ${to + 1} of ${frames.length}.`;
    if (focusSelector) {
      const moved = order.children[to];
      const action = moved.querySelector(focusSelector + ':enabled') ?? moved.querySelector('button:enabled');
      action?.focus();
    }
  }

  toggle.addEventListener('click', () => {
    if (!isOpen) poseSelection = readSpritePlacementSelection(preview);
    showMode(!isOpen);
    controls.scrollTop = preview.scrollTop = 0;
    render();
    if (isOpen) {
      if (getAsset()) picker.focus({ preventScroll: true });
      else if (!posePicker.hidden) poseField.focus({ preventScroll: true });
    }
  });
  posePicker.addEventListener('change', renderPoseInfo);
  posePicker.addEventListener('submit', event => {
    event.preventDefault();
    const frame = selectedPoseFrame();
    try {
      planPoseFrame(frame, getDraft());
      const frames = currentFrames();
      if (editRecipe(recipe => { recipe.frames = [...frames, frame]; })) {
        orderMessage.textContent = `Added ${frameLabel(frame)} at position ${frames.length + 1}.`;
      }
    } catch (error) {
      poseInfo.textContent = error.message;
    }
  });
  picker.addEventListener('change', () => {
    sourceId = picker.value;
    showMessage(sourceMessage, '');
    render();
  });
  sourceForm.addEventListener('submit', event => {
    event.preventDefault();
    const asset = getAsset();
    if (!asset) return;
    const grid = fieldValues(sourceFields);
    try {
      sourceCell(asset, grid, 0, 0);
      for (const frame of currentFrames()) {
        if (frame.kind === 'source' && frame.assetId === sourceId) sourceCell(asset, grid, frame.row, frame.column);
      }
      editRecipe(recipe => {
        recipe.sourceGrids ??= {};
        recipe.sourceGrids[sourceId] = grid;
      });
      showMessage(sourceMessage, '');
      sourceCells.querySelector('[tabindex="0"]')?.focus({ preventScroll: true });
    } catch (error) {
      showMessage(sourceMessage, error.message);
    }
  });

  sourceCells.addEventListener('click', event => {
    const cell = event.target.closest('[data-source-cell]');
    if (!cell) return;
    const frame = { kind: 'source', assetId: sourceId, row: Number(cell.dataset.row), column: Number(cell.dataset.column) };
    const frames = currentFrames();
    const index = frames.findIndex(selected => selected.kind === 'source' && sourceKey(selected) === sourceKey(frame));
    editRecipe(recipe => { recipe.frames = index < 0 ? [...frames, frame] : frames.filter((_, position) => position !== index); });
  });
  sourceCells.addEventListener('focusin', event => {
    const prior = sourceCells.querySelector('button[tabindex="0"]');
    if (prior) prior.tabIndex = -1;
    event.target.tabIndex = 0;
  });
  sourceCells.addEventListener('keydown', event => {
    const cell = event.target.closest('[data-source-cell]');
    if (!cell) return;
    const { rows, columns } = getSourceGrid();
    let row = Number(cell.dataset.row);
    let column = Number(cell.dataset.column);
    switch (event.key) {
      case 'ArrowLeft': column = Math.max(0, column - 1); break;
      case 'ArrowRight': column = Math.min(columns - 1, column + 1); break;
      case 'ArrowUp': row = Math.max(0, row - 1); break;
      case 'ArrowDown': row = Math.min(rows - 1, row + 1); break;
      case 'Home': column = 0; break;
      case 'End': column = columns - 1; break;
      default: return;
    }
    event.preventDefault();
    sourceCells.children[row * columns + column]?.focus();
  });

  order.addEventListener('click', event => {
    const action = event.target.closest('button');
    if (!action) return;
    const index = Number(action.closest('li').dataset.frameIndex);
    if (action.hasAttribute('data-frame-remove')) {
      const frames = currentFrames();
      const removed = frames[index];
      if (!editRecipe(recipe => { recipe.frames = frames.filter((_, position) => position !== index); })) return;
      orderMessage.textContent = `Removed ${frameLabel(removed)}.`;
      const next = order.children[Math.min(index, order.children.length - 1)];
      (next?.querySelector('[data-frame-remove]') ?? sourceCells.querySelector('[tabindex="0"]')
        ?? (!posePicker.hidden ? poseField : picker)).focus();
      return;
    }
    const earlier = action.hasAttribute('data-frame-earlier');
    moveFrame(index, index + (earlier ? -1 : 1), earlier ? '[data-frame-earlier]' : '[data-frame-later]');
  });
  function clearDrag() {
    dragging = undefined;
    order.querySelector('[data-drop-target]')?.removeAttribute('data-drop-target');
  }
  order.addEventListener('dragstart', event => {
    const item = event.target.closest('[data-frame-index]');
    if (!item) return;
    dragging = Number(item.dataset.frameIndex);
    event.dataTransfer.setData('text/plain', item.querySelector('[data-frame-label]').textContent);
    event.dataTransfer.effectAllowed = 'move';
  });
  order.addEventListener('dragover', event => {
    const item = event.target.closest('[data-frame-index]');
    if (dragging === undefined || !item) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    order.querySelector('[data-drop-target]')?.removeAttribute('data-drop-target');
    item.dataset.dropTarget = '';
  });
  order.addEventListener('drop', event => {
    const target = event.target.closest('[data-frame-index]');
    if (dragging === undefined || !target) return;
    event.preventDefault();
    const from = dragging;
    clearDrag();
    moveFrame(from, Number(target.dataset.frameIndex));
  });
  order.addEventListener('dragend', clearDrag);

  outputForm.addEventListener('change', () => {
    const grid = fieldValues(outputFields);
    if (Object.values(grid).every(value => Number.isSafeInteger(value) && value > 0)) {
      editRecipe(recipe => { recipe.grid = grid; });
    }
  });
  outputForm.addEventListener('input', updateExportState);
  jumpOutput.addEventListener('click', () => outputFields.rows.focus());
  workspace.addEventListener('click', event => {
    const mode = event.target.closest('[data-sheet-mode]')?.dataset.sheetMode;
    if (mode) setSheetMode(mode);
  });
  outputForm.addEventListener('submit', event => {
    event.preventDefault();
    if (combining) return;
    const invalid = Object.values(outputFields).find(input => !Number.isSafeInteger(input.valueAsNumber)
      || input.valueAsNumber < 1);
    if (invalid) {
      showMessage(outputMessage, 'Use positive whole numbers for output rows, columns and cell dimensions.');
      invalid.focus();
      return;
    }
    void combineSheet(currentRecipe(), true);
  });
  exportButton.addEventListener('click', async () => {
    if (!output) return;
    if (!downloads.hidden) {
      downloads.hidden = true;
      exportButton.setAttribute('aria-expanded', 'false');
      return;
    }
    const result = output;
    if (!pngLink.href) {
      exportButton.disabled = true;
      exportButton.textContent = 'Preparing…';
      try {
        const png = await pngBlob(result.canvas);
        if (output !== result) return;
        const filename = safeSpriteFilename(getDraft().name);
        const map = new Blob([JSON.stringify(result.frameMap, null, 2) + '\n'], { type: 'application/json' });
        pngLink.download = `${filename}.png`;
        mapLink.download = `${filename}.frames.json`;
        pngLink.href = URL.createObjectURL(png);
        mapLink.href = URL.createObjectURL(map);
      } catch (error) {
        if (output === result) showMessage(outputMessage, error.message);
        return;
      } finally {
        exportButton.disabled = !output;
        updateExportState();
      }
    }
    if (pngLink.hasAttribute('href')) {
      downloads.hidden = false;
      exportButton.setAttribute('aria-expanded', 'true');
      pngLink.focus();
    }
  });

  return render;
}
