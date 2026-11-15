import {
  MAX_GAME_SCALE,
  MAX_POSE_DURATION,
  MAX_SPRITE_SIDE,
  MIN_GAME_SCALE,
  MIN_POSE_DURATION,
  renderSpritePose,
} from './sprite-placement-model.js';

const selections = new WeakMap();
const anchorName = /^[\p{L}\p{N}][\p{L}\p{N} _-]{0,39}$/u;
const builtInAnchors = ['origin', 'body', 'head'];

export function readSpritePlacementSelection(preview) {
  return selections.get(preview) ?? null;
}

function frameSettings() {
  return { width: 128, height: 128, gameScale: 1, views: [], slots: [], parts: [], poses: [], expressions: [] };
}

function numberField(field, label, min, max, step = 1, value = '') {
  return `<label>${label}<input name="${field}" type="number" step="${step}" min="${min}" max="${max}" value="${value}" required></label>`;
}

function pointFields(prefix = '') {
  return `<div class="sprite-placement__pair">
    ${numberField('x', `${prefix}X`, -32768, 32768, 1, 0)}
    ${numberField('y', `${prefix}Y`, -32768, 32768, 1, 0)}
  </div>`;
}

function namedInput(field, label) {
  return `<label>${label}<input name="${field}" type="text" maxlength="80" required></label>`;
}

function selectField(field, label) {
  return `<label>${label}<select name="${field}"></select></label>`;
}

function makePreview() {
  const section = document.createElement('section');
  section.className = 'sprite-placement-preview';
  section.dataset.spritePlacementPreview = '';
  section.setAttribute('aria-label', 'Pose preview');
  section.innerHTML = `
    <div class="sprite-placement__preview-options">
      ${selectField('view', 'View')}
      ${selectField('expression', 'Expression')}
      <label class="sprite-placement__guides"><input type="checkbox" name="guides"> Show anchors</label>
    </div>
    <div class="sprite-placement__canvases">
      <figure>
        <figcaption>Close-up <span data-frame-size></span></figcaption>
        <div class="sprite-placement__board sprite-placement__board--close">
          <div class="sprite-placement__surface" data-close-surface>
            <canvas data-pose-closeup aria-label="Close-up pose raster" role="img"></canvas>
            <div class="sprite-placement__markers" data-close-guides aria-hidden="true"></div>
          </div>
        </div>
      </figure>
      <figure>
        <figcaption>Game size <span data-game-scale></span></figcaption>
        <div class="sprite-placement__board sprite-placement__board--game">
          <div class="sprite-placement__surface" data-game-surface>
            <canvas data-pose-game-size aria-label="Game-size pose raster" role="img"></canvas>
            <div class="sprite-placement__markers" data-game-guides aria-hidden="true"></div>
          </div>
        </div>
      </figure>
    </div>
    <p class="sprite-placement__notice" data-render-status role="status" hidden></p>
    <div class="sprite-placement__motion">
      <div class="sprite-placement__transport" role="group" aria-label="Playback">
        <button type="button" data-step="-1" aria-label="Previous pose">Previous</button>
        <button type="button" data-play>Play</button>
        <button type="button" data-step="1" aria-label="Next pose">Next</button>
      </div>
      <div class="sprite-placement__strip" data-pose-strip role="group" aria-label="Pose frames"></div>
    </div>`;
  return section;
}

function makeInspector() {
  const section = document.createElement('section');
  section.className = 'sprite-placement-inspector';
  section.setAttribute('aria-labelledby', 'sprite-placement-title');
  section.innerHTML = `
    <h3 id="sprite-placement-title">Character poses</h3>
    <button type="button" data-start>Add first pose</button>
    <p class="sprite-placement__notice" data-edit-status role="status" hidden></p>
    <p class="sprite-placement__fine" data-playing-notice hidden>Pause playback to edit.</p>
    <div data-placement-inspector>
      <details open>
        <summary>Pose and layers</summary>
        <form data-edit="pose">
          ${namedInput('name', 'Pose name')}
          ${numberField('duration', 'Duration (ms)', MIN_POSE_DURATION, MAX_POSE_DURATION)}
          <div class="sprite-placement__actions">
            <button>Update pose</button>
            <button type="button" data-new-pose>Add pose</button>
          </div>
        </form>
        <details>
          <summary>Anchors</summary>
          <form data-edit="anchor">
            ${selectField('anchor', 'Pose anchor')}
            <div data-custom-anchor hidden>${namedInput('newAnchor', 'New anchor name')}</div>
            ${pointFields('Anchor ')}
            <button>Set anchor</button>
          </form>
        </details>
        <div class="sprite-placement__stack">
          <h4>Layers <span>Back to front</span></h4>
          <div data-layer-list></div>
          <form data-edit="layer" hidden>
            ${selectField('part', 'Layer part')}
            ${pointFields('Layer ')}
            <div class="sprite-placement__actions">
              <button>Update layer</button>
              <button type="button" data-remove-layer>Remove layer</button>
            </div>
          </form>
          <form data-edit="add-layer">
            ${selectField('part', 'New layer part')}
            <button>Add layer</button>
          </form>
        </div>
      </details>
      <details>
        <summary>Registered parts</summary>
        <form data-edit="register">
          ${selectField('asset', 'Source PNG')}
          ${selectField('slot', 'Register to slot')}
          <div data-custom-slot>${namedInput('slotName', 'New slot name')}${selectField('anchor', 'Attach slot to')}</div>
          ${namedInput('name', 'Part name')}
          ${pointFields('Part ')}
          <button>Register part</button>
          <p class="sprite-placement__fine">Parts keep their PNG dimensions. X and Y are offsets from the slot’s anchor.</p>
        </form>
        <details data-edit-part>
          <summary>Edit a registered part</summary>
          <form data-edit="part">
            ${selectField('part', 'Registered part')}
            ${namedInput('name', 'Registered part name')}
            ${pointFields('Registered part ')}
            <button>Update part</button>
          </form>
        </details>
      </details>
      <details>
        <summary>Expressions</summary>
        <form data-edit="add-expression">
          ${namedInput('name', 'New expression name')}
          <button>Add expression</button>
        </form>
        <div data-expression-editor hidden>
          ${selectField('editExpression', 'Edit expression')}
          <p class="sprite-placement__fine">Choose a replacement for each slot you want to change.</p>
          <div data-expression-slots></div>
        </div>
      </details>
      <details>
        <summary>Frame and views</summary>
        <form data-edit="frame">
          <div class="sprite-placement__pair">
            ${numberField('width', 'Width (px)', 1, MAX_SPRITE_SIDE)}
            ${numberField('height', 'Height (px)', 1, MAX_SPRITE_SIDE)}
          </div>
          ${numberField('gameScale', 'Game scale', MIN_GAME_SCALE, MAX_GAME_SCALE, 'any')}
          <button>Update frame</button>
        </form>
        <form data-edit="view">
          ${namedInput('name', 'New view name')}
          <button>Add view</button>
        </form>
      </details>
    </div>`;
  return section;
}

function showMessage(element, message) {
  element.textContent = message;
  element.hidden = !message;
}

function fillSelect(select, items, value, placeholder) {
  const entries = placeholder == null ? items : [{ name: placeholder, id: '' }, ...items];
  if (entries.length !== select.length || entries.some(({ name, id }, index) => {
    const option = select.options[index];
    return option.text !== name || option.value !== id;
  })) {
    select.replaceChildren(...entries.map(({ name, id }) => new Option(name, id)));
  }
  if (select.value !== value && entries.some(entry => entry.id === value)) select.value = value;
}

function setFields(form, values) {
  for (const [name, value] of Object.entries(values)) form.elements.namedItem(name).value = value ?? '';
}

function fieldValue(form, name) {
  return form.elements.namedItem(name).value;
}

function finiteFields(form, names) {
  return Object.fromEntries(names.map(name => [name, form.elements.namedItem(name).valueAsNumber]));
}

function makeMarkers(container, anchors, width, height) {
  container.replaceChildren();
  for (const [name, { x, y }] of Object.entries(anchors)) {
    const marker = document.createElement('span');
    marker.dataset.anchor = name;
    marker.textContent = name;
    marker.style.left = `${x / width * 100}%`;
    marker.style.top = `${y / height * 100}%`;
    container.append(marker);
  }
}

function copyRaster(destination, source, poseId, expressionId) {
  destination.width = source.width;
  destination.height = source.height;
  destination.getContext('2d', { willReadFrequently: true }).drawImage(source, 0, 0);
  destination.dataset.poseId = poseId;
  destination.dataset.expressionId = expressionId;
}

function defaultAnchors(width, height) {
  return {
    origin: { x: Math.floor(width / 2), y: height - 1 },
    body: { x: 0, y: 0 },
    head: { x: Math.floor(width / 4), y: 0 },
  };
}

function newPose(name, viewId, width, height) {
  return {
    id: crypto.randomUUID(),
    name,
    viewId,
    duration: 200,
    anchors: defaultAnchors(width, height),
    layers: [],
  };
}

function button(label, action, value) {
  const node = document.createElement('button');
  node.type = 'button';
  node.textContent = label;
  node.dataset[action] = value;
  return node;
}

export function installSpritePlacement({ controls, preview, getDraft, updateDraft }) {
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = new URL('sprite-placement.css', import.meta.url);
  document.head.append(sheet);

  const stage = makePreview();
  const inspector = makeInspector();
  preview.prepend(stage);
  controls.prepend(inspector);

  const form = action => inspector.querySelector(`[data-edit="${action}"]`);
  const namedField = (parent, name) => parent.querySelector(`[name="${name}"]`);
  const field = (action, name) => namedField(form(action), name);
  const start = inspector.querySelector('[data-start]');
  const editStatus = inspector.querySelector('[data-edit-status]');
  const renderStatus = stage.querySelector('[data-render-status]');
  const closeup = stage.querySelector('[data-pose-closeup]');
  const game = stage.querySelector('[data-pose-game-size]');
  const closeGuides = stage.querySelector('[data-close-guides]');
  const gameGuides = stage.querySelector('[data-game-guides]');
  const stageCanvases = stage.querySelector('.sprite-placement__canvases');
  const strip = stage.querySelector('[data-pose-strip]');
  const play = stage.querySelector('[data-play]');
  const guides = namedField(stage, 'guides');
  const viewField = namedField(stage, 'view');
  const expressionField = namedField(stage, 'expression');
  const layerList = inspector.querySelector('[data-layer-list]');
  const inspectorFields = inspector.querySelector('[data-placement-inspector]');
  const playingNotice = inspector.querySelector('[data-playing-notice]');

  let setId;
  let viewId = '';
  let poseId = '';
  let expressionId = '';
  let slotId = '';
  let partId = '';
  let editExpressionId = '';
  let playing = false;
  let renderSequence = 0;
  let timer;

  const current = () => getDraft()?.placement;
  const currentPose = () => current()?.poses.find(pose => pose.id === poseId);
  const activePoses = () => current()?.poses.filter(pose => pose.viewId === viewId) ?? [];
  const activeSlots = () => current()?.slots.filter(slot => slot.viewId === viewId) ?? [];

  function publishSelection() {
    const next = Object.freeze({ viewId, poseId, expressionId, slotId, partId, playing });
    const previous = selections.get(preview);
    if (previous && Object.keys(next).every(key => previous[key] === next[key])) return;
    selections.set(preview, next);
    preview.dispatchEvent(new CustomEvent('sprite-placement-selection', { bubbles: true, detail: next }));
  }

  function stop() {
    clearTimeout(timer);
    playing = false;
  }

  function selectPose(id) {
    poseId = id;
    const layers = currentPose()?.layers ?? [];
    if (!layers.some(layer => layer.slotId === slotId)) slotId = layers.at(-1)?.slotId ?? '';
  }

  function stepPose(direction) {
    const poses = activePoses();
    if (!poses.length) return;
    const currentIndex = poses.findIndex(pose => pose.id === poseId);
    selectPose(poses[(currentIndex + direction + poses.length) % poses.length].id);
  }

  function updateAnimationControls(poses) {
    inspectorFields.inert = playing;
    playingNotice.hidden = !playing;
    play.textContent = playing ? 'Pause' : 'Play';
    play.disabled = poses.length < 2;
    stage.querySelectorAll('[data-step]').forEach(control => control.disabled = play.disabled);
    const focused = document.activeElement?.dataset.frame;
    const existing = [...strip.children];
    const sameFrames = existing.length === poses.length
      && poses.every((pose, index) => existing[index].dataset.frame === pose.id);
    if (!sameFrames) strip.replaceChildren(...poses.map(pose => button(pose.name, 'frame', pose.id)));
    [...strip.children].forEach((control, index) => {
      const pose = poses[index];
      control.textContent = pose.name;
      control.title = `${pose.duration} ms`;
      control.setAttribute('aria-pressed', String(pose.id === poseId));
      if (!sameFrames && pose.id === focused) control.focus();
    });
  }

  async function renderStage() {
    const ticket = ++renderSequence;
    clearTimeout(timer);
    const manifest = getDraft();
    const placement = current();
    const pose = currentPose();
    const show = Boolean(placement?.views.length);
    stage.hidden = !show;
    publishSelection();
    if (!show) return;

    fillSelect(viewField, placement.views, viewId);
    fillSelect(expressionField, placement.expressions, expressionId, 'Base parts');
    updateAnimationControls(activePoses());
    closeGuides.hidden = gameGuides.hidden = !guides.checked;
    if (!pose) {
      showMessage(renderStatus, 'Add a pose for this view.');
      stageCanvases.hidden = true;
      return;
    }

    try {
      const { canvas, duration } = await renderSpritePose(manifest, { poseId, expressionId });
      if (ticket !== renderSequence) return;
      const scale = placement.gameScale;
      if (!Number.isFinite(scale) || scale < MIN_GAME_SCALE || scale > MAX_GAME_SCALE) {
        throw new Error('Set a game scale between 0.05 and 4.');
      }
      const { width, height } = canvas;
      stage.style.setProperty('--frame-width', width);
      stage.style.setProperty('--frame-height', height);
      stage.style.setProperty('--game-width', `${width * scale}px`);
      stage.style.setProperty('--game-height', `${height * scale}px`);
      stage.querySelector('[data-frame-size]').textContent = `${width} × ${height}`;
      stage.querySelector('[data-game-scale]').textContent = `${Math.round(scale * 1000) / 10}%`;
      for (const destination of [closeup, game]) copyRaster(destination, canvas, poseId, expressionId);
      for (const markers of [closeGuides, gameGuides]) makeMarkers(markers, pose.anchors, width, height);
      showMessage(renderStatus, pose.layers.length ? '' : 'Add a registered part to this pose.');
      stageCanvases.hidden = false;
      if (playing) {
        timer = setTimeout(() => {
          stepPose(1);
          void renderStage();
        }, duration);
      }
    } catch (error) {
      if (ticket !== renderSequence) return;
      stop();
      publishSelection();
      updateAnimationControls(activePoses());
      stageCanvases.hidden = true;
      for (const destination of [closeup, game]) {
        delete destination.dataset.poseId;
        delete destination.dataset.expressionId;
      }
      showMessage(renderStatus, error.message);
    }
  }

  function edit(mutator) {
    stop();
    showMessage(editStatus, '');
    if (!updateDraft(draft => mutator(draft.placement ??= frameSettings()))) {
      showMessage(editStatus, 'Wait for the current set operation to finish.');
      render();
    }
  }

  function initialize() {
    const view = { id: crypto.randomUUID(), name: 'Front' };
    viewId = view.id;
    edit(placement => {
      placement.views.push(view);
      placement.poses.push(newPose('Pose 1', view.id, placement.width, placement.height));
    });
  }

  function renderLayers(pose, placement, slots) {
    const layered = new Set(pose.layers.map(layer => layer.slotId));
    const focus = document.activeElement?.dataset;
    const currentAction = focus?.layerAction;
    const currentSlot = focus?.slot;
    const rows = pose.layers.map((layer, index) => {
      const slot = slots.find(entry => entry.id === layer.slotId);
      const title = slot?.name ?? 'Incompatible slot';
      const row = document.createElement('div');
      row.className = 'sprite-placement__layer';
      const choose = button(title, 'layerAction', 'select');
      choose.dataset.slot = layer.slotId;
      choose.setAttribute('aria-pressed', String(layer.slotId === slotId));
      row.append(choose);
      for (const [direction, name] of [[-1, 'back'], [1, 'forward']]) {
        const move = button(name === 'back' ? 'Back' : 'Front', 'layerAction', name);
        move.dataset.slot = layer.slotId;
        move.dataset.direction = direction;
        move.disabled = !pose.layers[index + direction];
        move.setAttribute('aria-label', `Move ${title} ${name}`);
        move.title = move.getAttribute('aria-label');
        row.append(move);
      }
      return row;
    });
    layerList.replaceChildren(...rows);
    const retainedFocus = [...layerList.querySelectorAll('button')].find(control =>
      control.dataset.layerAction === currentAction && control.dataset.slot === currentSlot);
    const fallback = [...layerList.querySelectorAll('[data-layer-action="select"]')]
      .find(control => control.dataset.slot === currentSlot);
    if (retainedFocus) (retainedFocus.disabled ? fallback : retainedFocus)?.focus();

    const added = field('add-layer', 'part');
    const addable = placement.parts.filter(part => slots.some(slot => slot.id === part.slotId)
      && !layered.has(part.slotId));
    fillSelect(added, addable.map(part => {
      const slot = slots.find(entry => entry.id === part.slotId);
      return { ...part, name: `${slot.name} · ${part.name}` };
    }), added.value, addable.length ? 'Choose a registered part' : 'Register a part in a new slot');
    const addButton = form('add-layer').querySelector('button');
    addButton.disabled = !added.value;

    const layer = pose.layers.find(entry => entry.slotId === slotId);
    form('layer').hidden = !layer;
    if (layer) {
      fillSelect(field('layer', 'part'), placement.parts.filter(part => part.slotId === slotId), layer.partId,
        'Choose a compatible part');
      setFields(form('layer'), { x: layer.x, y: layer.y });
    }
  }

  function renderRegistration(pose, placement, slots) {
    const asset = field('register', 'asset');
    const inputs = getDraft().assets;
    fillSelect(asset, inputs.map(image => ({
      ...image, name: `${image.name} · ${image.width} × ${image.height}`,
    })), asset.value, inputs.length ? 'Choose a source PNG' : 'Import a PNG under Source images');
    const slot = field('register', 'slot');
    fillSelect(slot, slots, slot.value, 'New slot');
    const customSlot = inspector.querySelector('[data-custom-slot]');
    customSlot.hidden = Boolean(slot.value);
    field('register', 'slotName').disabled = customSlot.hidden;
    const attach = field('register', 'anchor');
    const anchors = Object.keys(pose.anchors).map(id => ({ id, name: id }));
    fillSelect(attach, anchors, attach.value || 'head');
    form('register').querySelector('button').disabled = !asset.value;
    const registered = field('part', 'part');
    const parts = placement.parts.filter(part => slots.some(slot => slot.id === part.slotId));
    fillSelect(registered, parts, partId);
    partId = registered.value;
    const part = parts.find(entry => entry.id === partId);
    inspector.querySelector('[data-edit-part]').hidden = !part;
    if (part) setFields(form('part'), { name: part.name, x: part.x, y: part.y });
  }

  function renderExpressions(placement, slots) {
    const expressionEditor = inspector.querySelector('[data-expression-editor]');
    const select = namedField(expressionEditor, 'editExpression');
    fillSelect(select, placement.expressions, editExpressionId);
    const expression = placement.expressions.find(entry => entry.id === select.value);
    expressionEditor.hidden = !expression;
    const slotEditor = inspector.querySelector('[data-expression-slots]');
    const focused = document.activeElement?.dataset.expressionSlot;
    slotEditor.replaceChildren(...(expression ? slots.map(slot => {
      const label = document.createElement('label');
      label.textContent = slot.name + ' replacement';
      const field = document.createElement('select');
      field.dataset.expressionSlot = slot.id;
      const options = placement.parts.filter(part => part.slotId === slot.id);
      fillSelect(field, options, expression.parts[slot.id] ?? '', 'Use pose layer');
      label.append(field);
      return label;
    }) : []));
    if (focused) [...slotEditor.querySelectorAll('select')]
      .find(field => field.dataset.expressionSlot === focused)?.focus();
  }

  function renderInspector() {
    const placement = current();
    const pose = currentPose();
    const slots = activeSlots();
    const hasPlacement = Boolean(placement?.views.length);
    inspector.hidden = !getDraft();
    start.hidden = hasPlacement;
    inspector.querySelector('[data-placement-inspector]').hidden = !pose;
    if (!pose) return;

    setFields(form('frame'), {
      width: placement.width, height: placement.height, gameScale: placement.gameScale,
    });
    setFields(form('pose'), { name: pose.name, duration: pose.duration });
    const anchor = field('anchor', 'anchor');
    const anchorOptions = [...new Set([...builtInAnchors, ...Object.keys(pose.anchors)])];
    fillSelect(anchor, anchorOptions.map(id => ({ id, name: id })), anchor.value || 'head', 'New anchor');
    const customAnchor = inspector.querySelector('[data-custom-anchor]');
    customAnchor.hidden = Boolean(anchor.value);
    field('anchor', 'newAnchor').disabled = customAnchor.hidden;
    setFields(form('anchor'), pose.anchors[anchor.value] ?? { x: 0, y: 0 });
    renderLayers(pose, placement, slots);
    renderRegistration(pose, placement, slots);
    renderExpressions(placement, slots);
  }

  function render() {
    const draft = getDraft();
    if (draft?.id !== setId) {
      stop();
      setId = draft?.id;
      const selection = draft?.placementSelection;
      viewId = selection?.viewId ?? '';
      poseId = selection?.poseId ?? '';
      expressionId = selection?.expressionId ?? '';
      slotId = selection?.slotId ?? '';
      partId = selection?.partId ?? '';
      editExpressionId = expressionId;
      guides.checked = false;
      form('register').reset();
      showMessage(editStatus, '');
    }
    const placement = current();
    if (!placement?.views.some(view => view.id === viewId)) viewId = placement?.views[0]?.id ?? '';
    if (!activePoses().some(pose => pose.id === poseId)) poseId = activePoses()[0]?.id ?? '';
    if (!placement?.expressions.some(expression => expression.id === expressionId)) expressionId = '';
    selectPose(poseId);
    if (activePoses().length < 2) stop();
    renderInspector();
    void renderStage();
  }

  function compatiblePart(placement, id, intendedSlot) {
    return placement.parts.find(part => part.id === id && part.slotId === intendedSlot);
  }

  const edits = {
    frame(form) {
      const frame = finiteFields(form, ['width', 'height', 'gameScale']);
      edit(placement => Object.assign(placement, frame));
    },
    view(form) {
      const name = fieldValue(form, 'name').trim();
      const placement = current();
      if (!name) return showMessage(editStatus, 'Enter a name for the view.');
      if (placement.views.some(view => view.name.toLowerCase() === name.toLowerCase())) {
        return showMessage(editStatus, 'This view name is already in use.');
      }
      const view = { id: crypto.randomUUID(), name };
      viewId = view.id;
      slotId = '';
      form.reset();
      edit(placement => {
        placement.views.push(view);
        placement.poses.push(newPose('Pose 1', view.id, placement.width, placement.height));
      });
    },
    pose(form) {
      const name = fieldValue(form, 'name').trim();
      const { duration } = finiteFields(form, ['duration']);
      if (!name) return showMessage(editStatus, 'Enter a name for the pose.');
      edit(placement => Object.assign(placement.poses.find(pose => pose.id === poseId), { name, duration }));
    },
    anchor(form) {
      const key = fieldValue(form, 'anchor') || fieldValue(form, 'newAnchor').trim();
      if (!anchorName.test(key)) return showMessage(editStatus, 'Use letters, numbers, spaces, underscores, or hyphens for an anchor name.');
      const position = finiteFields(form, ['x', 'y']);
      const anchor = field('anchor', 'anchor');
      if (!Array.from(anchor.options).some(option => option.value === key)) anchor.add(new Option(key, key));
      anchor.value = key;
      edit(placement => {
        const pose = placement.poses.find(pose => pose.id === poseId);
        pose.anchors = { ...pose.anchors, [key]: position };
      });
    },
    register(form) {
      const placement = current();
      const pose = currentPose();
      const assetId = fieldValue(form, 'asset');
      const name = fieldValue(form, 'name').trim();
      if (!getDraft().assets.some(asset => asset.id === assetId)) return showMessage(editStatus, 'Choose an imported PNG.');
      if (!name) return showMessage(editStatus, 'Enter a name for the part.');
      const intendedSlot = fieldValue(form, 'slot');
      const slots = activeSlots();
      const existing = slots.find(slot => slot.id === intendedSlot);
      if (intendedSlot && !existing) return showMessage(editStatus, 'Choose a slot in the active view.');
      const slotName = fieldValue(form, 'slotName').trim();
      const anchor = fieldValue(form, 'anchor');
      if (!existing && (!slotName || !Object.hasOwn(pose.anchors, anchor))) {
        return showMessage(editStatus, 'Give the new slot a name and choose one of this pose’s anchors.');
      }
      if (!existing && slots.some(slot => slot.name.toLowerCase() === slotName.toLowerCase())) {
        return showMessage(editStatus, 'Choose the existing slot with this name or enter a different one.');
      }
      const slot = existing ?? { id: crypto.randomUUID(), name: slotName, viewId, anchor };
      const part = {
        id: crypto.randomUUID(), name, assetId, slotId: slot.id, ...finiteFields(form, ['x', 'y']),
      };
      partId = part.id;
      form.reset();
      setFields(form, { x: 0, y: 0 });
      if (!placement.slots.some(entry => entry.id === slot.id)) {
        const select = field('register', 'slot');
        select.add(new Option(slot.name, slot.id));
        select.value = slot.id;
      }
      edit(placement => {
        if (!existing) placement.slots.push(slot);
        placement.parts.push(part);
      });
    },
    part(form) {
      const selected = fieldValue(form, 'part');
      const name = fieldValue(form, 'name').trim();
      if (!name) return showMessage(editStatus, 'Enter a name for the part.');
      const values = { name, ...finiteFields(form, ['x', 'y']) };
      edit(placement => Object.assign(placement.parts.find(part => part.id === selected), values));
    },
    'add-layer'(form) {
      const pose = currentPose();
      const part = current().parts.find(entry => entry.id === fieldValue(form, 'part'));
      const slot = activeSlots().find(entry => entry.id === part?.slotId);
      if (!slot || pose.layers.some(layer => layer.slotId === slot.id)) {
        return showMessage(editStatus, 'Choose a registered part from an unused slot in this view.');
      }
      if (!Object.hasOwn(pose.anchors, slot.anchor)) {
        return showMessage(editStatus, `Set the ${slot.anchor} anchor on this pose before adding ${slot.name}.`);
      }
      slotId = slot.id;
      edit(placement => placement.poses.find(pose => pose.id === poseId).layers.push({
        partId: part.id, slotId, x: 0, y: 0,
      }));
    },
    layer(form) {
      const partId = fieldValue(form, 'part');
      if (!compatiblePart(current(), partId, slotId)) {
        return showMessage(editStatus, 'Choose a part registered to this slot and view.');
      }
      const values = { partId, ...finiteFields(form, ['x', 'y']) };
      edit(placement => {
        const pose = placement.poses.find(pose => pose.id === poseId);
        Object.assign(pose.layers.find(layer => layer.slotId === slotId), values);
      });
    },
    'add-expression'(form) {
      const name = fieldValue(form, 'name').trim();
      if (!name) return showMessage(editStatus, 'Enter a name for the expression.');
      const expression = { id: crypto.randomUUID(), name, parts: {} };
      editExpressionId = expression.id;
      form.reset();
      edit(placement => placement.expressions.push(expression));
    },
  };

  function changeExpressionPart(control) {
    const slot = control.dataset.expressionSlot;
    const selection = control.value;
    if (!activeSlots().some(entry => entry.id === slot)
        || (selection && !compatiblePart(current(), selection, slot))) {
      showMessage(editStatus, 'Choose a replacement registered to this slot and view.');
      renderInspector();
      return;
    }
    edit(placement => {
      const expression = placement.expressions.find(entry => entry.id === editExpressionId);
      if (selection) expression.parts = { ...expression.parts, [slot]: selection };
      else delete expression.parts[slot];
    });
  }

  function clickLayer(control) {
    const requestedSlot = control.dataset.slot;
    if (control.dataset.layerAction === 'select') {
      slotId = requestedSlot;
      stop();
      render();
      return;
    }
    edit(placement => {
      const layers = placement.poses.find(pose => pose.id === poseId).layers;
      const index = layers.findIndex(layer => layer.slotId === requestedSlot);
      const neighbor = index + Number(control.dataset.direction);
      if (index >= 0 && layers[neighbor]) {
        [layers[index], layers[neighbor]] = [layers[neighbor], layers[index]];
      }
    });
  }

  function addPose() {
    const existing = currentPose();
    let index = activePoses().length + 1;
    const names = new Set(activePoses().map(pose => pose.name));
    while (names.has(`Pose ${index}`)) index++;
    const pose = { ...structuredClone(existing), id: crypto.randomUUID(), name: `Pose ${index}` };
    poseId = pose.id;
    edit(placement => placement.poses.push(pose));
    field('pose', 'name').focus();
    field('pose', 'name').select();
  }

  stage.addEventListener('click', event => {
    const control = event.target.closest('button');
    if (!control) return;
    if (control === play && !playing) {
      playing = true;
      void renderStage();
      return;
    }
    stop();
    if (control.dataset.step) stepPose(Number(control.dataset.step));
    if (control.dataset.frame) selectPose(control.dataset.frame);
    render();
  });
  viewField.addEventListener('change', () => {
    stop();
    viewId = viewField.value;
    render();
  });
  expressionField.addEventListener('change', () => {
    expressionId = expressionField.value;
    void renderStage();
  });
  guides.addEventListener('change', () => {
    closeGuides.hidden = gameGuides.hidden = !guides.checked;
  });

  inspector.addEventListener('submit', event => {
    const action = event.target.dataset.edit;
    if (!Object.hasOwn(edits, action)) return;
    event.preventDefault();
    edits[action](event.target);
  });
  inspector.addEventListener('change', event => {
    const control = event.target;
    if (control.dataset.expressionSlot) return changeExpressionPart(control);
    if (control.name === 'editExpression') {
      editExpressionId = control.value;
      renderExpressions(current(), activeSlots());
    }
    if (control === field('register', 'asset')) {
      const asset = getDraft().assets.find(asset => asset.id === control.value);
      form('register').querySelector('button').disabled = !asset;
      if (asset && !fieldValue(form('register'), 'name')) {
        field('register', 'name').value = asset.name.replace(/\.png$/i, '').slice(0, 80);
      }
    }
    if (control === field('register', 'slot')) {
      inspector.querySelector('[data-custom-slot]').hidden = Boolean(control.value);
      field('register', 'slotName').disabled = Boolean(control.value);
    }
    if (control === field('add-layer', 'part')) form('add-layer').querySelector('button').disabled = !control.value;
    if (control === field('anchor', 'anchor')) {
      inspector.querySelector('[data-custom-anchor]').hidden = Boolean(control.value);
      field('anchor', 'newAnchor').disabled = Boolean(control.value);
      setFields(form('anchor'), currentPose().anchors[control.value] ?? { x: 0, y: 0 });
    }
    if (control === field('part', 'part')) {
      partId = control.value;
      publishSelection();
      const part = current().parts.find(entry => entry.id === partId);
      setFields(form('part'), { name: part.name, x: part.x, y: part.y });
    }
  });
  inspector.addEventListener('click', event => {
    const control = event.target.closest('button');
    if (!control) return;
    if (control === start) {
      initialize();
      field('pose', 'name').focus();
      field('pose', 'name').select();
    }
    if (control.hasAttribute('data-new-pose')) addPose();
    if (control.dataset.layerAction) clickLayer(control);
    if (control.hasAttribute('data-remove-layer')) {
      edit(placement => {
        const pose = placement.poses.find(pose => pose.id === poseId);
        pose.layers = pose.layers.filter(layer => layer.slotId !== slotId);
      });
      field('add-layer', 'part').focus();
    }
  });
  preview.closest('dialog')?.addEventListener('close', () => {
    stop();
    render();
  });

  return render;
}
