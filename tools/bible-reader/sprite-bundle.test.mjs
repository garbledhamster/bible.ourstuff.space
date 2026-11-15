import assert from 'node:assert/strict';
import test from 'node:test';

const assetId = '10000000-0000-0000-0000-000000000000';
const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAD0lEQVR4nGP4z8AARAwMAAz8Af9c/RSVAAAAAElFTkSuQmCC';

function fixture() {
  const frame = { kind: 'pose', poseId: 'walk', expressionId: 'smile' };
  const grid = { rows: 1, columns: 1, cellWidth: 8, cellHeight: 8 };
  return {
    version: 1, id: '20000000-0000-0000-0000-000000000000', name: 'Hockey',
    assets: [{ id: assetId, name: 'Mouth.png', width: 2, height: 1, dataUrl }],
    placement: {
      width: 8, height: 8, gameScale: .52,
      views: [{ id: 'front', name: 'Front' }],
      slots: [{ id: 'mouth', name: 'Mouth', viewId: 'front', anchor: 'head' }],
      parts: [{ id: 'happy', name: 'Smile', assetId, slotId: 'mouth', x: -1, y: 2 }],
      poses: [{
        id: 'walk', name: 'Walk', viewId: 'front', duration: 120,
        anchors: { origin: { x: 4, y: 7 }, head: { x: 4, y: 2 } },
        layers: [{ slotId: 'mouth', partId: 'happy', x: 0, y: 0 }],
      }],
      expressions: [{ id: 'smile', name: 'Smile', parts: { mouth: 'happy' } }],
    },
    combine: { grid, frames: [frame], lastCombined: { grid, frames: [frame], sourceGrids: {} } },
  };
}

test('an editable export reopens with its original PNG, placement, sequence and paused selection', async () => {
  const { readSpriteBundle, writeSpriteBundle } = await import('../../docs/sprite-bundle-model.js');
  const manifest = fixture();
  const selection = { viewId: 'front', poseId: 'walk', expressionId: 'smile', slotId: 'mouth', partId: 'happy' };
  const bundle = writeSpriteBundle(manifest, { ...selection, playing: true });
  const imported = readSpriteBundle(bundle);
  assert.deepEqual(imported, { ...manifest, placementSelection: selection });
  assert.equal(manifest.placementSelection, undefined);
});

test('a bundle with a missing PNG for a registered variant is rejected', async () => {
  const { readSpriteBundle, writeSpriteBundle } = await import('../../docs/sprite-bundle-model.js');
  const manifest = fixture();
  manifest.assets = [];
  assert.throws(() => readSpriteBundle(writeSpriteBundle(manifest)), /Missing PNG.*Smile/);
});

test('a corrupt or incompatible editable bundle gives an import-specific recovery message', async () => {
  const { readSpriteBundle, writeSpriteBundle } = await import('../../docs/sprite-bundle-model.js');
  assert.throws(() => readSpriteBundle('{'), /invalid JSON.*export/i);
  const manifest = fixture();
  manifest.assets[0].width = 3;
  assert.throws(() => readSpriteBundle(writeSpriteBundle(manifest)), /PNG dimensions.*Mouth/);
  manifest.assets[0].width = 2;
  manifest.assets[0].dataUrl = dataUrl.replace('lEQ', 'LAT');
  assert.throws(() => readSpriteBundle(writeSpriteBundle(manifest)), /PNG data.*Mouth/);
});

test('a bundle with a pose recipe referring to an incompatible slot is rejected', async () => {
  const { readSpriteBundle, writeSpriteBundle } = await import('../../docs/sprite-bundle-model.js');
  const manifest = fixture();
  manifest.placement.expressions[0].parts.mouth = 'missing';
  assert.throws(() => readSpriteBundle(writeSpriteBundle(manifest)), /compatible.*Mouth/);
  manifest.placement.expressions[0].parts.mouth = 'happy';
  manifest.combine.lastCombined.frames = [{ kind: 'pose', poseId: 'missing' }];
  assert.throws(() => readSpriteBundle(writeSpriteBundle(manifest)), /saved pose/);
});

test('a bundle preserves a completed recipe and a different working grid', async () => {
  const { readSpriteBundle, writeSpriteBundle } = await import('../../docs/sprite-bundle-model.js');
  const manifest = fixture();
  manifest.combine.grid = { ...manifest.combine.grid, cellWidth: 1 };
  assert.deepEqual(readSpriteBundle(writeSpriteBundle(manifest)).combine, manifest.combine);
});

test('an unfinished pose stays editable while the completed mixed result keeps its registered anchor', async () => {
  const { readSpriteBundle, writeSpriteBundle } = await import('../../docs/sprite-bundle-model.js');
  const manifest = fixture();
  manifest.combine.lastCombined.placement = structuredClone(manifest.placement);
  delete manifest.placement.poses[0].anchors.head;
  const imported = readSpriteBundle(writeSpriteBundle(manifest));
  assert.equal(imported.placement.poses[0].anchors.head, undefined);
  assert.deepEqual(imported.combine.lastCombined.placement.poses[0].anchors.head, { x: 4, y: 2 });
});
