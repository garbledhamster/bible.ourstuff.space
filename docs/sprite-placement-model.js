export const MAX_SPRITE_SIDE = 4096;
export const MIN_GAME_SCALE = 0.05;
export const MAX_GAME_SCALE = 4;
export const MIN_POSE_DURATION = 16;
export const MAX_POSE_DURATION = 10000;

function point(value) {
  return Number.isSafeInteger(value?.x) && Number.isSafeInteger(value?.y);
}

function named(items, id) {
  return Array.isArray(items) ? items.find(item => item?.id === id) : undefined;
}

export function resolveSpritePose(manifest, { poseId, expressionId, proposals = [] } = {}) {
  const placement = manifest?.placement;
  const pose = named(placement?.poses, poseId);
  if (!pose) throw new Error('Choose a saved pose to render.');
  if (!named(placement.views, pose.viewId)) throw new Error('This pose needs a named view.');

  const { width, height } = placement;
  if (![width, height].every(size => Number.isInteger(size) && size >= 1 && size <= MAX_SPRITE_SIDE)) {
    throw new Error('Frame width and height must be between 1 and 4096 pixels.');
  }
  const { duration, anchors } = pose;
  if (!Number.isInteger(duration) || duration < MIN_POSE_DURATION || duration > MAX_POSE_DURATION) {
    throw new Error('Set a pose duration between 16 and 10000 ms.');
  }
  if (!point(anchors?.origin)) throw new Error('Set an origin for this pose.');
  if (!Array.isArray(pose.layers)) throw new Error('This pose needs a layer order.');
  const expression = expressionId ? named(placement.expressions, expressionId) : null;
  if (expressionId && !expression) throw new Error('Choose a saved expression.');
  const choices = expression?.parts ?? {};
  const replacements = new Map();
  for (const proposal of proposals) {
    if (!pose.layers.some(layer => layer.slotId === proposal.slotId)
        || (proposal.viewId != null && proposal.viewId !== pose.viewId)) {
      throw new Error('The proposed part needs a compatible slot on this pose.');
    }
    if (!proposal.asset || replacements.has(proposal.slotId)) {
      throw new Error('Choose one proposed PNG per slot.');
    }
    replacements.set(proposal.slotId, proposal);
  }

  const layers = pose.layers.map(layer => {
    const slot = named(placement.slots, layer.slotId);
    if (!slot || slot.viewId !== pose.viewId) throw new Error('A layer uses a slot from another view.');
    const partId = Object.hasOwn(choices, slot.id) ? choices[slot.id] : layer.partId;
    const part = named(placement.parts, partId);
    if (!part || part.slotId !== slot.id || !point(part)) {
      throw new Error(`Register a compatible part for ${slot.name}.`);
    }
    const asset = named(manifest.assets, part.assetId);
    if (!asset) throw new Error(`Import the PNG for ${part.name}.`);
    const anchor = Object.hasOwn(anchors, slot.anchor) ? anchors[slot.anchor] : null;
    if (!point(anchor)) throw new Error(`Set the ${slot.anchor} anchor for ${slot.name}.`);
    if (!point(layer)) throw new Error(`Set the X and Y offsets for ${slot.name}.`);
    const proposal = replacements.get(slot.id);
    if (proposal && (!point(proposal)
        && (proposal.x != null || proposal.y != null
          || proposal.asset.width !== asset.width || proposal.asset.height !== asset.height))) {
      throw new Error(`Set both registration offsets for the proposed ${slot.name} PNG.`);
    }
    return {
      asset: proposal?.asset ?? asset,
      x: anchor.x + layer.x + (proposal?.x ?? part.x),
      y: anchor.y + layer.y + (proposal?.y ?? part.y),
    };
  });
  return { width, height, duration, origin: { ...anchors.origin }, poseId, layers };
}

const decodedImages = new Map();

function loadSpriteImage(asset) {
  let decoded = decodedImages.get(asset.dataUrl);
  if (!decoded) {
    const image = new Image();
    image.src = asset.dataUrl;
    decoded = image.decode().then(() => image).catch(() => {
      if (decodedImages.get(asset.dataUrl) === decoded) decodedImages.delete(asset.dataUrl);
      throw new Error(`Reimport ${asset.name}. The PNG could not be opened.`);
    });
  }
  decodedImages.delete(asset.dataUrl);
  decodedImages.set(asset.dataUrl, decoded);
  if (decodedImages.size > 24) decodedImages.delete(decodedImages.keys().next().value);
  return decoded;
}

export async function renderSpritePose(manifest, selection) {
  const { width, height, layers, ...metadata } = resolveSpritePose(manifest, selection);
  const images = await Promise.all(layers.map(({ asset }) => loadSpriteImage(asset)));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('This browser could not open a canvas for the pose.');
  layers.forEach(({ x, y }, index) => context.drawImage(images[index], x, y));
  return { canvas, ...metadata };
}
