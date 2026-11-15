import assert from 'node:assert/strict';
import test from 'node:test';

test('source cells use zero-based rows and columns and carry their registered origin', async () => {
  const { sourceCell } = await import('../../docs/sprite-sheet.js');
  const sheet = { id: 'a', width: 12, height: 8 };
  const grid = { rows: 2, columns: 3, originX: 2, originY: 3 };
  assert.deepEqual(sourceCell(sheet, grid, 1, 2), {
    x: 8, y: 4, width: 4, height: 4, originX: 2, originY: 3,
    source: { kind: 'source', assetId: 'a', row: 1, column: 2 },
  });
  assert.throws(() => sourceCell(sheet, { ...grid, columns: 5 }, 0, 0), /divide/);
  assert.throws(() => sourceCell(sheet, grid, 2, 0), /outside/);
});

test('the frame map places native crops in row-major cells and preserves origins and timing', async () => {
  const { planSpriteSheet, sourceCell } = await import('../../docs/sprite-sheet.js');
  const source = sourceCell({ id: 'a', width: 12, height: 8 },
    { rows: 2, columns: 3, originX: 2, originY: 3 }, 1, 2);
  const pose = {
    x: 0, y: 0, width: 5, height: 6, originX: 3, originY: 5,
    durationMs: 120, source: { kind: 'pose', poseId: 'skate' },
  };
  const { frameMap } = planSpriteSheet({ columns: 1, rows: 3, cellWidth: 8, cellHeight: 9 }, [source, pose]);
  assert.deepEqual(frameMap, {
    version: 1, columns: 1, rows: 3, cellWidth: 8, cellHeight: 9, width: 8, height: 27,
    frames: [
      {
        index: 0, row: 0, column: 0, x: 0, y: 0, width: 8, height: 9,
        contentWidth: 4, contentHeight: 4, originX: 2, originY: 3, source: source.source,
      },
      {
        index: 1, row: 1, column: 0, x: 0, y: 9, width: 8, height: 9,
        contentWidth: 5, contentHeight: 6, originX: 3, originY: 5, source: pose.source, durationMs: 120,
      },
    ],
  });
});

test('invalid dimensions, insufficient capacity and an oversized crop fail before rendering', async () => {
  const { planSpriteSheet } = await import('../../docs/sprite-sheet.js');
  const grid = { rows: 1, columns: 1, cellWidth: 6, cellHeight: 8 };
  const crop = { x: 0, y: 0, width: 6, height: 7, originX: 1, originY: 2 };
  assert.throws(() => planSpriteSheet({ ...grid, rows: 0 }, [crop]), /whole numbers/);
  assert.throws(() => planSpriteSheet({ ...grid, cellWidth: 8193 }, [crop]), /8192/);
  assert.throws(() => planSpriteSheet(grid, []), /Select.*frame/);
  assert.throws(() => planSpriteSheet(grid, [crop, crop]), /2 frames/);
  assert.throws(() => planSpriteSheet({ ...grid, cellHeight: 6 }, [crop]), /Frame 1.*6 × 7/);
});
