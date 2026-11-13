// Columns and rows are zero-based. A dot is open water; # is a mooring crate.
export const dock = [
  '.......',
  '.....#.',
  '.BCPBM.',
  '.BBBBB.',
  '.#.....',
  '.......',
];

export const start = { x: 1, y: 2, parcel: 'none' };
export const freshParcel = { x: 2, y: 2, parcel: 'dry' };

export const directions = {
  up: [0, -1], left: [-1, 0], down: [0, 1], right: [1, 0],
};

export function move(state, [dx, dy]) {
  if (state.delivery) return { state };
  const x = state.x + dx;
  const y = state.y + dy;
  const tile = dock[y]?.[x];
  if (!tile || tile === '.' || tile === '#') return { state, cue: 'blocked' };

  const next = { ...state, x, y };
  if (tile === 'C' && state.parcel === 'none') {
    next.parcel = 'dry';
    return { state: next, cue: 'pickup' };
  }
  if (tile === 'P' && state.parcel === 'dry') {
    next.parcel = 'soaked';
    return { state: next, cue: 'splash' };
  }
  if (tile === 'M' && state.parcel !== 'none') next.delivery = state.parcel;
  return { state: next };
}
