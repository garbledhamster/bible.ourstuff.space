import assert from 'node:assert/strict';
import test from 'node:test';

const manifest = {
  assets: [
    { id: 'head-art', width: 9, height: 8 },
    { id: 'neutral-art', width: 9, height: 8 },
    { id: 'smile-art', width: 9, height: 8 },
    { id: 'wrong-art', width: 9, height: 8 },
  ],
  placement: {
    width: 40,
    height: 45,
    gameScale: 0.5,
    views: [{ id: 'left', name: 'Left' }, { id: 'right', name: 'Right' }],
    slots: [
      { id: 'head', name: 'Head', viewId: 'left', anchor: 'head' },
      { id: 'mouth', name: 'Mouth', viewId: 'left', anchor: 'head' },
      { id: 'right-mouth', name: 'Mouth', viewId: 'right', anchor: 'head' },
    ],
    parts: [
      { id: 'head', name: 'Head art', assetId: 'head-art', slotId: 'head', x: 0, y: 0 },
      { id: 'neutral', name: 'Neutral', assetId: 'neutral-art', slotId: 'mouth', x: 0, y: 0 },
      { id: 'smile', name: 'Smile', assetId: 'smile-art', slotId: 'mouth', x: -2, y: 3 },
      { id: 'right-smile', name: 'Right smile', assetId: 'wrong-art', slotId: 'right-mouth', x: 0, y: 0 },
    ],
    poses: [
      {
        id: 'ready', name: 'Ready', viewId: 'left', duration: 180,
        anchors: { origin: { x: 21, y: 43 }, head: { x: 6, y: 7 } },
        layers: [{ slotId: 'head', partId: 'head', x: 0, y: 0 }, { slotId: 'mouth', partId: 'neutral', x: 0, y: 0 }],
      },
      {
        id: 'stride', name: 'Stride', viewId: 'left', duration: 290,
        anchors: { origin: { x: 21, y: 43 }, head: { x: 15, y: 17 } },
        layers: [{ slotId: 'head', partId: 'head', x: 0, y: 0 }, { slotId: 'mouth', partId: 'neutral', x: 1, y: -1 }],
      },
    ],
    expressions: [{ id: 'smile', name: 'Smile', parts: { mouth: 'smile' } }],
  },
};

test('a shared head placement moves its face layers together across poses', async () => {
  const { resolveSpritePose } = await import('../../docs/sprite-placement-model.js');
  const ready = resolveSpritePose(manifest, { poseId: 'ready' });
  const stride = resolveSpritePose(manifest, { poseId: 'stride' });
  const draws = frame => frame.layers.map(({ asset, x, y }) => [asset.id, x, y]);
  assert.deepEqual(draws(ready), [['head-art', 6, 7], ['neutral-art', 6, 7]]);
  assert.deepEqual(draws(stride), [['head-art', 15, 17], ['neutral-art', 16, 16]]);
  assert.deepEqual([stride.width, stride.height, stride.duration, stride.origin], [40, 45, 290, { x: 21, y: 43 }]);
});

test('a smile replaces only its own slot and preserves order, timing and origin', async () => {
  const { resolveSpritePose } = await import('../../docs/sprite-placement-model.js');
  const smile = resolveSpritePose(manifest, { poseId: 'stride', expressionId: 'smile' });
  assert.deepEqual(smile.layers.map(({ asset, x, y }) => [asset.id, x, y]),
    [['head-art', 15, 17], ['smile-art', 14, 19]]);
  assert.deepEqual([smile.duration, smile.origin], [290, { x: 21, y: 43 }]);
  assert.equal(resolveSpritePose(manifest, { poseId: 'stride' }).layers.at(-1).asset.id, 'neutral-art');
});

test('rejects art registered to another view and layers with missing anchors', async () => {
  const { resolveSpritePose } = await import('../../docs/sprite-placement-model.js');
  const draft = structuredClone(manifest);
  draft.placement.expressions[0].parts.mouth = 'right-smile';
  assert.throws(() => resolveSpritePose(draft, { poseId: 'ready', expressionId: 'smile' }), /compatible.*Mouth/);
  delete draft.placement.poses[0].anchors.head;
  assert.throws(() => resolveSpritePose(draft, { poseId: 'ready' }), /head anchor/);
});

test('a proposed PNG inherits the active slot registration and requires an explicit offset for a different canvas', async () => {
  const { resolveSpritePose } = await import('../../docs/sprite-placement-model.js');
  const asset = { id: 'proposed', width: 9, height: 8 };
  const matching = resolveSpritePose(manifest, {
    poseId: 'ready', expressionId: 'smile', proposals: [{ slotId: 'mouth', asset }],
  });
  assert.deepEqual(matching.layers.at(-1), { asset, x: 4, y: 10 });
  assert.throws(() => resolveSpritePose(manifest, {
    poseId: 'ready', proposals: [{ slotId: 'right-mouth', asset }],
  }), /slot.*pose/);
  assert.throws(() => resolveSpritePose(manifest, {
    poseId: 'ready', proposals: [{ slotId: 'mouth', asset: { ...asset, width: 7 } }],
  }), /offset/);
  const offset = resolveSpritePose(manifest, {
    poseId: 'ready', proposals: [{ slotId: 'mouth', asset: { ...asset, width: 7 }, x: 8, y: -3 }],
  });
  assert.deepEqual(offset.layers.at(-1), { asset: { ...asset, width: 7 }, x: 14, y: 4 });
});
