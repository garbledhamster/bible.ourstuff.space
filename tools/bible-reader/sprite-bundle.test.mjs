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


test('a 120-character accepted part name survives an editable bundle round trip', async () => {
  const { readSpriteBundle, writeSpriteBundle } = await import('../../docs/sprite-bundle-model.js');
  const manifest = fixture();
  manifest.placement.parts[0].name = '長'.repeat(120);
  assert.deepEqual(readSpriteBundle(writeSpriteBundle(manifest)), manifest);
});

test('an authored anchor can share a name with an Object prototype property', async () => {
  const { readSpriteBundle, writeSpriteBundle } = await import('../../docs/sprite-bundle-model.js');
  const manifest = fixture();
  manifest.placement.slots[0].anchor = 'constructor';
  manifest.placement.poses[0].anchors.constructor = { x: 4, y: 2 };
  delete manifest.placement.poses[0].anchors.head;
  assert.deepEqual(readSpriteBundle(writeSpriteBundle(manifest)), manifest);
});

test('aggregate PNG size leaves room for the saved revision and portable selection', async () => {
  const { spriteDraftFits, writeSpriteBundle } = await import('../../docs/sprite-bundle-model.js');
  const manifest = fixture();
  // Three individual 8 MiB PNGs occupy 32 MiB after base64 encoding, before metadata.
  const maxPng = 'data:image/png;base64,' + 'A'.repeat(11_184_810) + 'A=';
  manifest.assets = Array.from({ length: 3 }, (_, index) => ({
    ...manifest.assets[0], id: `${index}${assetId.slice(1)}`, dataUrl: maxPng,
  }));
  assert.equal(spriteDraftFits(manifest), false);
  manifest.assets.pop();
  assert.equal(spriteDraftFits(manifest), true);

  const limit = 32 * 1024 * 1024;
  const bytes = value => Buffer.byteLength(value, 'utf8');
  manifest.name = '聴'.repeat(120);
  const needsRevision = JSON.stringify({ revision: '0'.repeat(64), manifest });
  manifest.assets[0].dataUrl += 'A'.repeat(limit - bytes(needsRevision) + 1);
  assert.ok(bytes(writeSpriteBundle(manifest)) < limit, 'a plain bundle can fit while its save request does not');
  assert.equal(spriteDraftFits(manifest), false);

  manifest.assets[0].dataUrl = manifest.assets[0].dataUrl.slice(0, -32);
  const selection = { viewId: 'front', poseId: 'walk', expressionId: 'smile', slotId: 'mouth', partId: 'happy' };
  assert.ok(bytes(JSON.stringify({ revision: '0'.repeat(64), manifest })) < limit);
  assert.ok(bytes(writeSpriteBundle(manifest, selection)) > limit, 'the editor needs room to export the paused selection');
  assert.equal(spriteDraftFits(manifest), false);
  manifest.assets[0].dataUrl = manifest.assets[0].dataUrl.slice(0, -512);
  assert.equal(spriteDraftFits(manifest), true);
});
