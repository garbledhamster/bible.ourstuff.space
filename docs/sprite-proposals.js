import { readSpritePlacementSelection } from './sprite-placement.js';
import { renderSpritePose, resolveSpritePose } from './sprite-placement-model.js';

const POLL_INTERVAL = 1500;
const PNG_BASE64_LIMIT = 4 * Math.ceil(8 * 1024 * 1024 / 3);

const named = (list, id) => Array.isArray(list) ? list.find(item => item?.id === id) : undefined;

function selectedPart(manifest, { poseId, viewId, slotId, expressionId }) {
  const placement = manifest?.placement;
  const pose = named(placement?.poses, poseId);
  const view = named(placement?.views, viewId);
  const slot = named(placement?.slots, slotId);
  const expression = expressionId ? named(placement?.expressions, expressionId) : null;
  const layer = Array.isArray(pose?.layers) ? pose.layers.find(item => item?.slotId === slotId) : null;
  if (!pose || !view || pose.viewId !== viewId || slot?.viewId !== viewId || !layer
      || (expressionId && !expression?.parts)) return null;
  const part = named(placement.parts, expression?.parts[slotId] ?? layer.partId);
  const asset = named(manifest.assets, part?.assetId);
  if (!part || part.slotId !== slotId || !asset || !pose.anchors?.[slot.anchor]) return null;
  return { pose, view, slot, expression, layer, part, asset };
}

function matchesPose(selection, proposal) {
  return selection?.poseId === proposal.poseId && selection.viewId === proposal.viewId
    && selection.expressionId === proposal.expressionId;
}

function registration(target) {
  const { pose, slot, layer, part, asset } = target;
  const anchor = pose.anchors[slot.anchor];
  return [slot.anchor, anchor.x, anchor.y, layer.x, layer.y, part.id, part.x, part.y, asset.id, asset.dataUrl];
}

function sameRegistration(left, right) {
  if (!left || !right) return false;
  const original = registration(right);
  return registration(left).every((value, index) => value === original[index]);
}

function addPart(manifest, proposal) {
  const target = selectedPart(manifest, proposal);
  const name = Array.from(proposal.name).slice(0, 120).join('');
  manifest.assets.push(proposal.asset);
  manifest.placement.parts.push({
    id: proposal.id, slotId: proposal.slotId, name, assetId: proposal.asset.id, x: proposal.x, y: proposal.y,
  });
  if (target.expression) {
    target.expression.parts = { ...target.expression.parts, [proposal.slotId]: proposal.id };
  } else {
    target.layer.partId = proposal.id;
  }
}

function makePanel() {
  const panel = document.createElement('section');
  panel.className = 'sprite-proposals';
  panel.setAttribute('aria-labelledby', 'sprite-proposals-title');
  panel.hidden = true;
  panel.innerHTML = `
    <h3 id="sprite-proposals-title">Codex proposals</h3>
    <button type="button" data-proposal-copy>Copy Codex context</button>
    <label data-proposal-reference-field hidden>Active set reference
      <textarea rows="4" readonly data-proposal-reference></textarea>
    </label>
    <label data-proposal-list-field hidden>Proposed part <select data-proposal-list></select></label>
    <p class="sprite-proposals__status" data-proposal-status role="status" hidden></p>
    <div class="sprite-proposals__actions" data-proposal-actions hidden>
      <button type="button" class="sprite-generator__primary" data-proposal-accept>Accept into draft</button>
      <button type="button" data-proposal-discard>Discard proposal</button>
    </div>`;
  return panel;
}

function makeComparison() {
  const comparison = document.createElement('section');
  comparison.className = 'sprite-proposals__comparison';
  comparison.setAttribute('aria-label', 'Proposal comparison');
  comparison.hidden = true;
  comparison.innerHTML = `
    <h3 data-proposal-comparison-title></h3>
    <div class="sprite-proposals__frames">
      <figure>
        <figcaption>Saved</figcaption>
        <div data-proposal-frame="saved"></div>
      </figure>
      <figure>
        <figcaption>Proposed</figcaption>
        <div data-proposal-frame="preview"></div>
      </figure>
    </div>`;
  return comparison;
}

function showStatus(element, text) {
  if (element.textContent !== text) element.textContent = text;
  element.hidden = !text;
}

function post(request, url, body, signal) {
  return request(url, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-Bible-Sprite-Generator': '1' },
    body: JSON.stringify(body),
  });
}

function toolSignal(options) {
  return options?.signal ?? (options instanceof AbortSignal ? options : undefined);
}

function registerSiteTools({ activeContext, inspect, stage }) {
  const host = document.modelContext;
  let registration;
  let previous = Promise.resolve();
  return enabled => {
    if (!enabled) {
      registration?.abort();
      registration = null;
      return;
    }
    if (registration || typeof host?.registerTool !== 'function') return;
    const controller = new AbortController();
    registration = controller;
    previous = previous.then(async () => {
      if (controller.signal.aborted) return;
      const tools = [
        {
          name: 'inspect_active_sprite_slot',
          description: 'Read the open Sprite Generator set revision and the selected pose, slot, expression, and PNG registration.',
          inputSchema: { type: 'object', properties: {}, additionalProperties: false },
          annotations: { readOnlyHint: true },
          execute: async (_input, options) => inspect(activeContext(), toolSignal(options)),
        },
        {
          name: 'stage_sprite_png_proposal',
          description: 'Stage a replacement PNG for the selected sprite slot at the inspected revision. The editor shows it for review.',
          inputSchema: {
            type: 'object',
            properties: {
              revision: { type: 'string', pattern: '^[0-9a-f]{64}$' },
              poseId: { type: 'string' },
              slotId: { type: 'string' },
              expressionId: { type: 'string', description: 'Use the expression returned by inspection, or an empty string for the base pose.' },
              name: { type: 'string', minLength: 1, maxLength: 120 },
              pngBase64: { type: 'string', maxLength: PNG_BASE64_LIMIT, description: 'PNG bytes as base64.' },
              x: { type: 'integer', description: 'Part X registration relative to its anchor. Provide X and Y together for different image dimensions.' },
              y: { type: 'integer', description: 'Part Y registration relative to its anchor.' },
            },
            required: ['revision', 'poseId', 'slotId', 'expressionId', 'name', 'pngBase64'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: async (input, options) => stage(activeContext(), input, toolSignal(options)),
        },
      ];
      try {
        for (const tool of tools) {
          if (controller.signal.aborted) break;
          await host.registerTool(tool, { signal: controller.signal });
        }
      } catch {
        controller.abort();
      }
    });
  };
}

export function installSpriteProposals({
  controls, preview, dialog, request, setEndpoint, getDraft, getSaved, isBusy, hasConflict,
  observeRevision, updateDraft, setMessage,
}) {
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = new URL('sprite-proposals.css', import.meta.url);
  document.head.append(sheet);

  const panel = makePanel();
  const comparison = makeComparison();
  controls.prepend(panel);
  preview.prepend(comparison);
  const find = key => panel.querySelector(`[data-proposal-${key}]`);
  const copy = find('copy');
  const reference = find('reference');
  const referenceField = find('reference-field');
  const list = find('list');
  const listField = find('list-field');
  const status = find('status');
  const actions = find('actions');
  const accept = find('accept');
  const discard = find('discard');
  const comparisonTitle = comparison.querySelector('[data-proposal-comparison-title]');
  let watch;
  let inbox = [];
  let inboxError = '';
  let selectedId = '';
  let selectionKey = '';
  let referenceKey;
  let comparisonKey;
  let comparisonReady = false;
  let comparisonError = '';
  let pending = false;
  let sequence = 0;

  function activeContext() {
    const saved = getSaved();
    const selection = readSpritePlacementSelection(preview);
    if (!dialog.open || !saved || selection?.playing || hasConflict()
        || (watch?.setId === saved.manifest.id && watch.currentRevision !== saved.revision)) return null;
    const target = selectedPart(saved.manifest, selection ?? {});
    if (!target || !selectedPart(getDraft(), selection)) return null;
    const { poseId, viewId, slotId, expressionId } = selection;
    return {
      setUrl: setEndpoint(saved.manifest.id).href, revision: saved.revision,
      poseId, viewId, slotId, expressionId,
    };
  }

  function proposalUrl(setUrl, id = '') {
    return `${setUrl}/proposals${id ? `/${id}` : ''}`;
  }

  async function inspect(context, signal) {
    if (!context || isBusy()) throw new Error('Pause on a saved pose and select its registered slot.');
    const { setUrl, ...target } = context;
    const details = await post(request, proposalUrl(setUrl), { action: 'inspect', ...target }, signal);
    return { setUrl, ...details };
  }

  async function stage(context, input, signal) {
    if (!context || isBusy() || !input || ['revision', 'poseId', 'slotId', 'expressionId']
      .some(key => input[key] !== context[key])) {
      throw new Error('Inspect the selected slot and its current revision again.');
    }
    const { setUrl, ...target } = context;
    const { name, pngBase64 } = input;
    const position = Object.hasOwn(input, 'x') || Object.hasOwn(input, 'y') ? { x: input.x, y: input.y } : {};
    if (Object.keys(position).length && ![position.x, position.y].every(Number.isSafeInteger)) {
      throw new Error('Set both registration offsets as whole pixels.');
    }
    const item = await post(request, proposalUrl(setUrl), { ...target, name, pngBase64, ...position }, signal);
    if (watch?.setUrl === setUrl) void pollSoon(watch);
    return item;
  }

  const refreshSiteTools = registerSiteTools({ activeContext, inspect, stage });

  function canCompare(proposal, selection) {
    return proposal && !selection?.playing && matchesPose(selection, proposal)
      && watch?.revision === proposal.revision && watch.currentRevision === proposal.revision && !hasConflict();
  }

  function updateComparison(proposal, selection) {
    const comparable = canCompare(proposal, selection);
    const key = comparable ? `${proposal.id} ${proposal.revision}` : '';
    if (key === comparisonKey) return;
    comparisonKey = key;
    comparisonReady = false;
    comparisonError = '';
    comparison.hidden = true;
    const run = ++sequence;
    if (!key) return;
    const { setUrl, controller } = watch;
    const saved = getSaved();
    const pose = { poseId: proposal.poseId, expressionId: proposal.expressionId };
    void (async () => {
      try {
        const full = await request(proposalUrl(setUrl, proposal.id), { signal: controller.signal });
        const [before, after] = await Promise.all([
          renderSpritePose(saved.manifest, pose),
          renderSpritePose(saved.manifest, { ...pose, proposals: [full] }),
        ]);
        if (run !== sequence) return;
        before.canvas.dataset.proposalSaved = '';
        before.canvas.setAttribute('role', 'img');
        before.canvas.setAttribute('aria-label', 'Saved sprite pose');
        after.canvas.dataset.proposalPreview = '';
        after.canvas.setAttribute('role', 'img');
        after.canvas.setAttribute('aria-label', 'Proposed sprite pose');
        comparison.querySelector('[data-proposal-frame="saved"]').replaceChildren(before.canvas);
        comparison.querySelector('[data-proposal-frame="preview"]').replaceChildren(after.canvas);
        comparisonTitle.textContent = `${full.poseName} · ${full.expressionName || 'Base pose'} · ${full.slotName}`;
        comparison.hidden = false;
        comparisonReady = true;
        watch.review = full;
      } catch (error) {
        if (run !== sequence) return;
        comparisonError = error.message;
      }
      renderPanel();
    })();
  }

  function renderPanel() {
    const selection = readSpritePlacementSelection(preview);
    const context = activeContext();
    refreshSiteTools(Boolean(context));
    panel.hidden = !dialog.open || !watch || (!context && !inbox.length && !inboxError);
    const key = JSON.stringify(context);
    copy.disabled = !context || isBusy();
    if (key !== referenceKey) {
      referenceField.hidden = true;
      reference.value = '';
    }
    if (JSON.stringify(inbox) !== selectionKey) {
      selectionKey = JSON.stringify(inbox);
      list.replaceChildren(...inbox.map(item => new Option(`${item.slotName} · ${item.name}`, item.id)));
    }
    if (!inbox.some(item => item.id === selectedId)) {
      selectedId = (inbox.find(item => matchesPose(selection, item) && item.revision === watch?.revision) ?? inbox[0])?.id ?? '';
    }
    list.value = selectedId;
    listField.hidden = !inbox.length;
    const item = inbox.find(proposal => proposal.id === selectedId);
    actions.hidden = !item;
    const savedTarget = item && selectedPart(getSaved()?.manifest, item);
    const draftTarget = item && selectedPart(getDraft(), item);
    const edited = item && !sameRegistration(draftTarget, savedTarget);
    const accepted = item && getDraft()?.assets.some(asset => asset.id === item.id);
    updateComparison(item, selection);
    const reviewActions = comparison.hidden ? panel : comparison;
    if (actions.parentElement !== reviewActions) reviewActions.append(status, actions);
    let text = inboxError;
    if (item) {
      if (accepted) text = 'In your draft. Save set to keep this part.';
      else if (item.revision !== watch?.currentRevision || hasConflict()) text = 'This proposal is for an older revision. Copy the current context to request a new one.';
      else if (selection?.playing) text = 'Pause playback to review the proposal.';
      else if (!matchesPose(selection, item)) text = `Select ${item.poseName} · ${item.expressionName || 'Base pose'} to compare.`;
      else if (comparisonError) text = comparisonError;
      else if (edited) text = 'This placement changed in your draft. Keep your draft or restore its saved placement before accepting.';
      else if (!comparisonReady) text = 'Opening proposal…';
    }
    accept.disabled = !comparisonReady || !item || edited || accepted || pending || isBusy() || hasConflict();
    discard.disabled = !item || accepted || pending || isBusy();
    showStatus(status, text);
  }

  async function pollSoon(active) {
    if (!active || active !== watch || active.polling) return;
    clearTimeout(active.timer);
    active.polling = true;
    try {
      if (!isBusy()) {
        const payload = await request(proposalUrl(active.setUrl), { signal: active.controller.signal });
        if (active !== watch || isBusy()) return;
        inbox = payload.proposals;
        inboxError = '';
        active.currentRevision = payload.revision;
        observeRevision(payload.revision);
        renderPanel();
      }
    } catch (error) {
      if (active !== watch) return;
      inboxError = error.status === 404 ? 'The saved set is unavailable.' : 'Can’t check proposals. Retrying…';
      renderPanel();
    } finally {
      active.polling = false;
      if (active === watch) active.timer = setTimeout(() => void pollSoon(active), POLL_INTERVAL);
    }
  }

  function refresh() {
    const saved = dialog.open ? getSaved() : null;
    if ((saved?.revision ?? null) !== (watch?.revision ?? null) || saved?.manifest.id !== watch?.setId) {
      if (watch) {
        clearTimeout(watch.timer);
        watch.controller.abort();
      }
      inbox = [];
      inboxError = '';
      pending = false;
      selectedId = '';
      watch = saved ? {
        setId: saved.manifest.id, revision: saved.revision, setUrl: setEndpoint(saved.manifest.id).href,
        currentRevision: saved.revision, controller: new AbortController(),
      } : null;
      if (watch) void pollSoon(watch);
    }
    renderPanel();
  }

  copy.addEventListener('click', async () => {
    const context = activeContext();
    try {
      const info = await inspect(context);
      if (JSON.stringify(context) !== JSON.stringify(activeContext())) return;
      referenceKey = JSON.stringify(context);
      reference.value = JSON.stringify(info, null, 2);
      referenceField.hidden = false;
      try {
        await navigator.clipboard.writeText(reference.value);
        setMessage('Copied the saved set and slot for Codex.');
      } catch {
        reference.focus();
        reference.select();
        setMessage('Copy the selected set reference for Codex.');
      }
    } catch (error) {
      setMessage(error.message);
    }
  });

  list.addEventListener('change', () => {
    selectedId = list.value;
    renderPanel();
  });

  accept.addEventListener('click', async () => {
    if (accept.disabled || !watch?.review) return;
    const active = watch;
    const proposal = active.review;
    pending = true;
    renderPanel();
    try {
      const payload = await request(proposalUrl(active.setUrl), { signal: active.controller.signal });
      if (active !== watch) return;
      observeRevision(payload.revision);
      if (payload.revision !== active.revision || hasConflict() || selectedId !== proposal.id
          || !payload.proposals.some(item => item.id === proposal.id)
          || !canCompare(proposal, readSpritePlacementSelection(preview))) return;
      const current = selectedPart(getDraft(), proposal);
      const original = selectedPart(getSaved().manifest, proposal);
      if (!sameRegistration(current, original)) return;
      resolveSpritePose(getDraft(), { poseId: proposal.poseId, expressionId: proposal.expressionId, proposals: [proposal] });
      if (updateDraft(manifest => addPart(manifest, proposal))) {
        setMessage('Proposal added to your draft.');
        dialog.querySelector('[data-save]')?.focus();
      }
    } catch (error) {
      if (active === watch) setMessage(error.message);
    } finally {
      if (active === watch) {
        pending = false;
        renderPanel();
      }
    }
  });

  discard.addEventListener('click', async () => {
    if (discard.disabled || !watch) return;
    const active = watch;
    const id = selectedId;
    pending = true;
    renderPanel();
    try {
      await post(request, proposalUrl(active.setUrl, id), { action: 'discard' }, active.controller.signal);
      if (active !== watch) return;
      inbox = inbox.filter(item => item.id !== id);
      setMessage('Proposal discarded.');
      void pollSoon(active);
    } catch (error) {
      if (active === watch) setMessage(error.message);
    } finally {
      if (active === watch) {
        pending = false;
        renderPanel();
      }
    }
  });

  preview.addEventListener('sprite-placement-selection', renderPanel);
  dialog.addEventListener('close', refresh);
  return refresh;
}
