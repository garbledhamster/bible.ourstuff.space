import assert from 'node:assert/strict';
import test from 'node:test';
import { readTaskList, saveTask, updateMember } from '../../docs/task-document.js';

const source = [
  '# Task List', '', '[Project Bible](game-bible.md)', '',
  '## Engine & Assets', '', '| Asset | Task | Status | Next action |', '| --- | --- | --- | --- |',
  '| [Art](art.png) | Make the chair | Sandbox checked <!-- task:chair Check 1 --> | Agent · Check [fit](fit.md) <!-- assignees: ["Joe","Kal"] --> |',
  '', '## Development Sandbox', '', '- [ ] Test Retry', '',
  '  **Waiting** · Play [the sandbox](sandbox.md).', '  <!-- assignees: ["Joe"] -->',
  '', '## Members', '', '- Joe', '- Kal', '',
].join('\n');

test('updates member references across table and checklist tasks without rewriting other work', () => {
  const doc = readTaskList(source);
  assert.deepEqual(doc.tasks.map(task => [task.title, task.done, task.members]), [
    ['Make the chair', true, ['Joe', 'Kal']], ['Test Retry', false, ['Joe']],
  ]);
  const renamed = updateMember(doc, 'Joe', 'Jo');
  assert.equal(renamed, source.replaceAll('"Joe"', '"Jo"').replace('- Joe\n', '- Jo\n'));
  const removed = updateMember(readTaskList(renamed), 'Kal');
  assert.deepEqual(readTaskList(removed).tasks.map(task => task.members), [['Jo'], ['Jo']]);
  assert.match(removed, /Agent · Check \[fit\]\(fit.md\)/);
});

test('saves changes in place and keeps legacy status, evidence, chapter style, and task IDs', () => {
  const doc = readTaskList(source);
  const [chair, retry] = doc.tasks;
  const edited = saveTask(doc, chair, { ...chair, title: 'Make and fit the chair', members: ['Kal'] });
  assert.match(edited, /\[Art\]\(art.png\) \| Make and fit the chair \| Sandbox checked <!-- task:chair Check 1 -->/);
  assert.match(edited, /<!-- assignees: \["Kal"\] -->/);
  assert.ok(edited.includes(source.slice(source.indexOf('## Development Sandbox'))));
  const complete = saveTask(doc, retry, { ...retry, status: 'Done', done: true });
  assert.match(complete, /- \[x\] Test Retry\n\n  \*\*Done\*\* · Play \[the sandbox\]\(sandbox.md\)/);
  const newTask = { title: 'New | task', chapter: 'Engine and Assets', status: 'Ready', done: false, members: ['Joe', 'Kal'] };
  const added = readTaskList(saveTask(doc, null, newTask));
  assert.equal(added.tasks[1].title, newTask.title);
  assert.deepEqual(added.tasks[1].members, newTask.members);
  assert.equal(added.tasks[1].chapter, 'Engine & Assets');
});

test('lists custom project sections and ignores an unrelated table', () => {
  const doc = readTaskList('# Task List\n\n## 1. Other work\n\n| Field | A | B | C |\n| --- | --- | --- | --- |\n| Ignore | Row | Value | Detail |\n\n- [x] Actual task\n');
  assert.deepEqual(doc.tasks.map(task => task.title), ['Actual task']);
  assert.equal(doc.tasks[0].chapter, '1. Other work');
});

test('keeps blockers separate from notes for both task formats', () => {
  let doc = readTaskList(source);
  for (const index of [0, 1]) {
    const task = doc.tasks[index];
    doc = readTaskList(saveTask(doc, task, { ...task, status: 'Blocked', done: false, blockers: 'Wait for [art](art.png)' }));
    assert.equal(doc.tasks[index].blockers, 'Wait for [art](art.png)');
    assert.equal(doc.tasks[index].notes, task.notes);
  }
});
