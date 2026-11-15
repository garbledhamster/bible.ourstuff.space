import {
  MAX_GAME_SCALE, MAX_POSE_DURATION, MAX_SPRITE_SIDE, MIN_GAME_SCALE, MIN_POSE_DURATION,
} from './sprite-placement-model.js';
import { planPoseFrame } from './sprite-pose-frame.js';
import { planSpriteSheet, sourceCell } from './sprite-sheet.js';

export const SPRITE_BUNDLE_LIMIT = 32 * 1024 * 1024;
const BUNDLE_FORMAT = 'project-bible-sprite-set';
const BUNDLE_VERSION = 1;
const PNG_LIMIT = 8 * 1024 * 1024;
const PNG_PREFIX = 'data:image/png;base64,';
const PNG_DEPTHS = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const crcTable = Uint32Array.from({ length: 256 }, (_, byte) => {
  let value = byte;
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  return value;
});

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function name(value, limit = 80) {
  return typeof value === 'string' && value.trim() && Array.from(value).length <= limit
    && !/[\u0000-\u001f]/u.test(value);
}

function id(value) {
  return typeof value === 'string' && value.length > 0 && !Object.hasOwn(Object.prototype, value);
}

function integer(value, low = 1, high = Number.MAX_SAFE_INTEGER) {
  return Number.isSafeInteger(value) && value >= low && value <= high;
}

function point(value) {
  return record(value) && Number.isSafeInteger(value.x) && Number.isSafeInteger(value.y);
}

function indexEntries(items, noun, isId = id, nameLimit = 80) {
  ensure(Array.isArray(items), `The bundle needs a list of ${noun}.`);
  const map = new Map();
  for (const item of items) {
    ensure(record(item) && isId(item.id) && name(item.name, nameLimit) && !map.has(item.id),
      `The bundle has an invalid or duplicate entry in its ${noun}.`);
    map.set(item.id, item);
  }
  return map;
}

function pngMatches(asset) {
  const { dataUrl, width, height } = asset;
  const label = `\u201c${asset.name}\u201d. Export the bundle again with the original PNG.`;
  const invalid = `Invalid PNG data for ${label}`;
  ensure(typeof dataUrl === 'string' && dataUrl.startsWith(PNG_PREFIX)
    && dataUrl.length <= PNG_PREFIX.length + 4 * Math.ceil(PNG_LIMIT / 3), invalid);
  const encoded = dataUrl.slice(PNG_PREFIX.length);
  ensure(encoded.length % 4 === 0 && !/[^A-Za-z0-9+/=]/u.test(encoded), invalid);
  let bytes;
  try {
    bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
  } catch {
    throw new Error(invalid);
  }
  ensure(bytes.length >= 45 && bytes.length <= PNG_LIMIT, invalid);
  const view = new DataView(bytes.buffer);
  ensure(view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a
    && view.getUint32(8) === 13 && view.getUint32(12) === 0x49484452, invalid);
  ensure(integer(width, 1, 8192) && integer(height, 1, 8192) && width * height <= SPRITE_BUNDLE_LIMIT
    && width === view.getUint32(16) && height === view.getUint32(20), `PNG dimensions do not match ${label}`);
  ensure(PNG_DEPTHS[bytes[25]]?.includes(bytes[24]) && !bytes[26] && !bytes[27] && bytes[28] <= 1, invalid);
  let hasPixels = false;
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const end = offset + 8 + length;
    ensure(end + 4 <= bytes.length, invalid);
    let crc = 0xffffffff;
    for (let index = offset + 4; index < end; index++) crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[index]) & 0xff];
    ensure(((crc ^ 0xffffffff) >>> 0) === view.getUint32(end), invalid);
    const kind = view.getUint32(offset + 4);
    if (kind === 0x49444154 && length) hasPixels = true;
    if (kind === 0x49454e44) {
      ensure(!length && end + 4 === bytes.length && hasPixels, invalid);
      return;
    }
    offset = end + 4;
  }
  throw new Error(invalid);
}

function validatePlacement(placement, assets) {
  ensure(record(placement) && integer(placement.width, 1, MAX_SPRITE_SIDE)
    && integer(placement.height, 1, MAX_SPRITE_SIDE) && Number.isFinite(placement.gameScale)
    && placement.gameScale >= MIN_GAME_SCALE && placement.gameScale <= MAX_GAME_SCALE,
  'The bundle has invalid pose canvas settings.');
  const views = indexEntries(placement.views, 'views');
  const slots = indexEntries(placement.slots, 'slots');
  const parts = indexEntries(placement.parts, 'parts');
  const poses = indexEntries(placement.poses, 'poses');
  const expressions = indexEntries(placement.expressions, 'expressions');

  for (const slot of slots.values()) {
    ensure(views.has(slot.viewId) && id(slot.anchor), `Slot “${slot.name}” needs a view and anchor.`);
  }
  for (const part of parts.values()) {
    ensure(assets.has(part.assetId), `Missing PNG for part “${part.name}”. Export the bundle with the original PNG.`);
    ensure(slots.has(part.slotId) && point(part), `Part “${part.name}” needs a compatible slot and registration offsets.`);
  }
  for (const pose of poses.values()) {
    ensure(views.has(pose.viewId) && integer(pose.duration, MIN_POSE_DURATION, MAX_POSE_DURATION)
      && record(pose.anchors) && point(pose.anchors.origin) && Object.values(pose.anchors).every(point)
      && Array.isArray(pose.layers), `Pose “${pose.name}” needs a view, timing, anchors and layers.`);
    const layerSlots = new Set();
    for (const layer of pose.layers) {
      const slot = slots.get(layer?.slotId);
      ensure(point(layer) && slot && slot.viewId === pose.viewId
        && parts.get(layer.partId)?.slotId === slot.id && !layerSlots.has(slot.id),
      `Pose “${pose.name}” has a layer without a compatible part and slot.`);
      layerSlots.add(slot.id);
    }
  }
  for (const expression of expressions.values()) {
    ensure(record(expression.parts), `Expression “${expression.name}” needs a list of part choices.`);
    for (const [slotId, partId] of Object.entries(expression.parts)) {
      const slot = slots.get(slotId);
      ensure(slot && parts.get(partId)?.slotId === slot.id,
        `Choose a compatible part for “${slot?.name ?? slotId}” in expression “${expression.name}”.`);
    }
  }
  return { views, slots, parts, poses, expressions };
}

function validateSelection(selection, placement) {
  ensure(record(selection) && placement?.poses.get(selection.poseId)?.viewId === selection.viewId
    && placement?.views.has(selection.viewId)
    && (!selection.slotId || placement.slots.get(selection.slotId)?.viewId === selection.viewId)
    && (!selection.partId
      || placement.slots.get(placement.parts.get(selection.partId)?.slotId)?.viewId === selection.viewId)
    && (!selection.expressionId || placement.expressions.has(selection.expressionId)),
  'The bundle has a saved selection that is missing from the pose editor.');
}

function validateGrid(grid) {
  ensure(record(grid) && [grid.rows, grid.columns, grid.cellWidth, grid.cellHeight].every(value => integer(value)),
    'The bundle has invalid output grid settings.');
}

function validateRecipe(recipe, assets, manifest, completed = false) {
  ensure(record(recipe), 'The bundle has an invalid Combine recipe.');
  const { grid, frames, sourceGrids = {}, placement } = recipe;
  if (grid !== undefined || completed) validateGrid(grid);
  ensure(record(sourceGrids) && (!completed || Array.isArray(frames)),
    'The bundle has an invalid frame order or source grid.');
  for (const [assetId, settings] of Object.entries(sourceGrids)) {
    const asset = assets.get(assetId);
    ensure(asset, 'A source grid is missing its PNG. Export the bundle with the original PNG.');
    ensure(record(settings), `The source grid for “${asset.name}” is invalid.`);
    sourceCell(asset, settings, 0, 0);
  }
  if (placement !== undefined && completed) validatePlacement(placement, assets);
  if (frames === undefined) return;
  ensure(Array.isArray(frames), 'The bundle has an invalid frame order.');
  const renderManifest = completed && placement !== undefined ? { ...manifest, placement } : manifest;
  const crops = frames.map(frame => {
    ensure(record(frame), 'The bundle has an invalid frame in its order.');
    if (frame.kind === 'source') {
      const asset = assets.get(frame.assetId);
      ensure(asset, 'A source frame is missing its PNG. Export the bundle with the original PNG.');
      return sourceCell(asset, sourceGrids[asset.id] ?? { rows: 1, columns: 1 }, frame.row, frame.column);
    }
    ensure(frame.kind === 'pose' && id(frame.poseId)
      && (frame.expressionId == null || frame.expressionId === '' || id(frame.expressionId)),
    'The bundle has an invalid pose frame.');
    if (completed) return planPoseFrame(frame, renderManifest);
    ensure(renderManifest.placement?.poses.some(pose => pose.id === frame.poseId), 'Choose a saved pose for the frame order.');
    ensure(!frame.expressionId || renderManifest.placement.expressions
      .some(expression => expression.id === frame.expressionId), 'Choose a saved expression for the frame order.');
    return null;
  });
  if (completed) planSpriteSheet(grid, crops);
}

export function writeSpriteBundle(manifest, selection) {
  const { viewId, poseId, expressionId, slotId, partId } = selection ?? {};
  const portable = poseId
    ? { ...manifest, placementSelection: { viewId, poseId, expressionId, slotId, partId } }
    : manifest;
  return JSON.stringify({ format: BUNDLE_FORMAT, version: BUNDLE_VERSION, manifest: portable }) + '\n';
}

export function readSpriteBundle(text) {
  let bundle;
  try {
    bundle = JSON.parse(text);
  } catch {
    throw new Error('The bundle contains invalid JSON. Export it again from Sprite Generator.');
  }
  if (bundle?.format !== BUNDLE_FORMAT || bundle.version !== BUNDLE_VERSION) {
    throw new Error('Choose a supported Sprite Generator bundle.');
  }
  const { manifest } = bundle;
  ensure(record(manifest) && manifest.version === 1 && typeof manifest.id === 'string'
    && UUID.test(manifest.id) && name(manifest.name, 120), 'The bundle has an invalid sprite set.');
  const assets = indexEntries(manifest.assets, 'source images', value => typeof value === 'string' && UUID.test(value), 120);
  for (const asset of assets.values()) pngMatches(asset);
  const placement = manifest.placement === undefined ? undefined : validatePlacement(manifest.placement, assets);
  if (manifest.placementSelection !== undefined) validateSelection(manifest.placementSelection, placement);
  if (manifest.combine !== undefined) {
    validateRecipe(manifest.combine, assets, manifest);
    if (manifest.combine.lastCombined !== undefined) validateRecipe(manifest.combine.lastCombined, assets, manifest, true);
  }
  return manifest;
}
