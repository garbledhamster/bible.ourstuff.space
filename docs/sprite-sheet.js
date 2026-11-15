const MAX_SIDE = 8192;
const MAX_PIXELS = 32 * 1024 * 1024;
const MAX_CELLS = 4096;

function validSize(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function sourceCell(asset, grid, row, column) {
  const { rows, columns, originX = 0, originY = 0 } = grid;
  if (!validSize(rows) || !validSize(columns) || rows * columns > MAX_CELLS) {
    throw new Error('Use positive whole numbers for source rows and columns, up to 4096 cells.');
  }
  if (asset.width % columns || asset.height % rows) {
    throw new Error('Source rows and columns must divide the PNG evenly.');
  }
  if (![originX, originY].every(Number.isSafeInteger)) {
    throw new Error('Use whole pixels for the source origin.');
  }
  if (![row, column].every(Number.isSafeInteger) || row < 0 || row >= rows || column < 0 || column >= columns) {
    throw new Error('A selected cell is outside this source grid.');
  }
  const width = asset.width / columns;
  const height = asset.height / rows;
  return {
    x: column * width, y: row * height, width, height, originX, originY,
    source: { kind: 'source', assetId: asset.id, row, column },
  };
}

export function planSpriteSheet(grid, crops) {
  const { rows, columns, cellWidth, cellHeight } = grid;
  if (![rows, columns, cellWidth, cellHeight].every(validSize)) {
    throw new Error('Use positive whole numbers for output rows, columns and cell dimensions.');
  }
  const width = columns * cellWidth;
  const height = rows * cellHeight;
  if (width > MAX_SIDE || height > MAX_SIDE || width * height > MAX_PIXELS) {
    throw new Error('Use an output up to 8192 pixels on a side and 32 megapixels overall.');
  }
  const capacity = rows * columns;
  if (!crops.length) throw new Error('Select a frame to combine.');
  if (crops.length > capacity) {
    throw new Error(`The grid has ${capacity} ${capacity === 1 ? 'cell' : 'cells'} for ${crops.length} frames.`);
  }
  const frameMap = {
    version: 1, rows, columns, cellWidth, cellHeight, width, height,
    frames: crops.map((crop, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const { width, height, originX, originY, source, durationMs } = crop;
      if (width > cellWidth || height > cellHeight) {
        throw new Error(`Frame ${index + 1} needs at least ${width} × ${height} px per cell.`);
      }
      const frame = {
        index, row, column, x: column * cellWidth, y: row * cellHeight,
        width: cellWidth, height: cellHeight, contentWidth: width, contentHeight: height,
        originX, originY, source,
      };
      if (durationMs !== undefined) frame.durationMs = durationMs;
      return frame;
    }),
  };
  return { crops, frameMap };
}

export function renderSpriteSheet({ crops, frameMap }) {
  const canvas = document.createElement('canvas');
  canvas.width = frameMap.width;
  canvas.height = frameMap.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser couldn’t create the output sheet.');
  context.imageSmoothingEnabled = false;
  crops.forEach(({ image, x, y, width, height }, index) => {
    const cell = frameMap.frames[index];
    context.drawImage(image, x, y, width, height, cell.x, cell.y, width, height);
  });
  return canvas;
}
