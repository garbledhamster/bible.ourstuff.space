import { test } from 'node:test';
import assert from 'node:assert/strict';
import { directions, freshParcel, move, start } from './rules.js';

const run = (state, ...path) => path.reduce((s, d) => move(s, directions[d]).state, state);
test('a soaked parcel stays soaked through the handoff; a dry detour succeeds', () => {
  const wet = run(start, 'right', 'right', 'right', 'right');
  assert.equal(wet.delivery, 'soaked');
  assert.equal(move(wet, directions.down).state, wet);
  assert.equal(run(freshParcel, 'down', 'right', 'right', 'right', 'up').delivery, 'dry');
});

test('blocked movement keeps the courier and parcel in place', () => {
  const state = run(start, 'down');
  assert.deepEqual(move(state, directions.down), { state, cue: 'blocked' });
  assert.equal(run(state, 'right').x, 2);
});
