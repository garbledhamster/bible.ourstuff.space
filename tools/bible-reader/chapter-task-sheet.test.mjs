import assert from 'node:assert/strict';
import test from 'node:test';
import { chapterTaskRows } from '../../docs/chapter-task-sheet.js';

const source = [
  '# Task List', '## Vision & Scope',
  '- [ ] MAIN-0001 Deliver the release',
  '  <!-- subtasks: [{"text":"OPEN-0001 Check the save\\nUI & UX Design. Kal. Waits for the sandbox.","done":false},{"text":"DONE-0001 Confirm scope","done":true}] -->',
  '## UI & UX Design',
  '- [x] DONE-0002 Approve layout',
  '- [ ] Stop old design', '  **Cancelled**',
  '',
  '| Asset | Task | Status | Next action |',
  '| --- | --- | --- | --- |',
  '| | Check first edit | Blocked <!-- task:TABL-0001 Build 0 --> | **Blockers:** Sandbox. <!-- assignees: ["Kal"] --> |',
].join('\n');

const chapters = ['Vision & Scope', 'UI & UX Design'];

test('shows real task and subtask status, and respects explicitly named subtask chapters', () => {
  const rows = chapterTaskRows(source, 'ui-and-ux-design', chapters);
  assert.deepEqual(rows.map(row => [row.id, row.title, row.group]), [
    ['OPEN-0001', 'Check the save', 'remaining'],
    ['DONE-0002', 'Approve layout', 'complete'],
    ['', 'Stop old design', 'cancelled'],
    ['TABL-0001', 'Check first edit', 'remaining'],
  ]);
  assert.equal(rows[0].parent, 'Deliver the release');
  assert.match(rows[0].notes, /Waits for the sandbox/);
  assert.deepEqual(rows[3].members, ['Kal']);
  assert.equal(rows[3].blockers, 'Sandbox.');
  assert.deepEqual(chapterTaskRows(source, 'vision-and-scope', chapters).map(row => row.id), ['MAIN-0001', 'DONE-0001']);
});
