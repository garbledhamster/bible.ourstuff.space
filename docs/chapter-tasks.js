import { chapterKey, readTaskList } from './task-document.js';

const metadata = / <!-- task:([\w-]+) (Answer|Build|Check) ([01]) -->$/;
const slug = title => title.toLowerCase().replaceAll('&', 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const createId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte =>
  byte.toString(16).padStart(2, '0')).join('');
const table = ['| Asset | Task | Status | Next action |', '| --- | --- | --- | --- |'];
const split = line => line.slice(1, -1).split(/(?<!\\)\|/).map(cell => cell.trim());
const assigneesTag = /\s*<!-- assignees: \[.*?\] -->\s*$/;
const escapeCell = value => value.trim().replace(/(?<!\\)\|/g, '\\|');

function read(markdown) {
  const lines = markdown.split('\n');
  const rows = [];
  let chapter;
  const parsed = new Map(readTaskList(markdown).tasks.map(task => [task.start, task]));
  lines.forEach((raw, index) => {
    if (raw.startsWith('## ')) chapter = slug(raw.slice(3));
    if (!chapter || !raw.startsWith('|') || !raw.endsWith('|')) return;
    const cells = split(raw);
    if (cells.length !== 4 || cells[0] === 'Asset' || /^:?-+:?$/.test(cells[0])) return;
    const tag = cells[2].match(metadata);
    cells[2] = cells[2].replace(metadata, '');
    rows.push({ raw, index, chapter, cells, members: parsed.get(index)?.members, id: tag?.[1], kind: tag?.[2] ?? (chapter.includes('sandbox') || chapter.includes('playtest') ? 'Check' : 'Build'), done: tag?.[3] === '1' });
  });
  return { lines, rows };
}

function serialize({ cells, id, kind, done }) {
  const [asset, task, status, next] = cells;
  return '| ' + [asset, task, status + ' <!-- task:' + id + ' ' + kind + ' ' + Number(done) + ' -->', next].join(' | ') + ' |';
}

async function snapshot(endpoint) {
  const response = await fetch(endpoint, { cache: 'no-store' });
  if (!response.ok) throw new Error('The editable Task List is unavailable.');
  return response.json();
}

export async function chapterTasks(container, chapter, { endpoint, renderBible, fullList }) {
  const source = new URL('../task-list.md', endpoint);
  const chapterTitle = document.querySelector('#chapter-dialog-title').textContent;
  const result = document.createElement('p');
  result.setAttribute('role', 'status');
  result.textContent = 'Loading tasks…';
  const legacy = document.createElement('a');
  legacy.href = fullList;
  legacy.textContent = 'Open full Task List';
  const list = document.createElement('div');
  const addForm = document.createElement('form');
  addForm.className = 'add-chapter-task';
  addForm.innerHTML = '<input aria-label="New task" placeholder="New task" maxlength="600" required><button>Add task</button>';
  const input = addForm.querySelector('input');
  addForm.hidden = true;
  const global = document.createElement('button');
  global.type = 'button';
  global.textContent = 'Manage these tasks in Task List';
  global.hidden = !document.getElementById('bible-task-list');
  global.onclick = () => document.dispatchEvent(new CustomEvent('open-bible-task-list', {
    detail: chapterKey(chapterTitle),
  }));
  container.append(global, result, list, addForm, legacy);
  let busy = false;
  let expanded;


  async function save(baseline, draft, compare) {
    if (busy) return false;
    busy = true;
    container.setAttribute('aria-busy', 'true');
    result.replaceChildren('Saving…');
    try {
      const current = await snapshot(endpoint);
      const { lines, rows } = read(current.markdown);
      if (baseline) {
        const matches = rows.filter(row => baseline.id ? row.id === baseline.id
          : row.chapter === chapter && row.raw === baseline.raw);
        const actual = matches.length === 1 ? matches[0] : undefined;
        if (!actual || actual.chapter !== chapter) throw new Error('This task was moved or removed. Your draft is still in the editor.');
        if (actual.raw !== baseline.raw) {
          compare(actual);
          throw new Error('This task changed. Compare the saved values with your draft before saving again.');
        }
        lines[actual.index] = serialize(draft);
      } else {
        const start = lines.findIndex(line => line.startsWith('## ') && slug(line.slice(3)) === chapter);
        if (start === -1) {
          lines.push('', '## ' + chapterTitle, '', ...table, serialize(draft), '');
        } else {
          const last = rows.filter(row => row.chapter === chapter).at(-1);
          const header = lines.indexOf(table[1], start);
          if (!last && (header < 0 || lines.slice(start + 1, header).some(line => line.startsWith('## ')))) {
            lines.splice(start + 1, 0, '', ...table, serialize(draft), '');
          } else {
            lines.splice((last?.index ?? header) + 1, 0, serialize(draft));
          }
        }
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bible-Task-List': '1' },
        body: JSON.stringify({ revision: current.revision, markdown: lines.join('\n') }),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      result.textContent = 'Saved';
      return true;
    } catch (error) {
      result.textContent = error.message;
      return false;
    } finally {
      busy = false;
      container.removeAttribute('aria-busy');
    }
  }

  function rowView(row) {
    const item = document.createElement('article');
    item.dataset.done = row.done;
    item.innerHTML = '<div class="task-summary"><input type="checkbox"><button class="task-title" type="button" aria-expanded="false"></button><span class="task-kind"></span><span class="task-owner"></span></div><form class="task-detail" hidden></form>';
    const checkbox = item.querySelector('input');
    const title = item.querySelector('.task-title');
    const detail = item.querySelector('form');
    const owner = item.querySelector('.task-owner');
    const kind = item.querySelector('.task-kind');
    const update = () => {
      checkbox.checked = row.done;
      checkbox.setAttribute('aria-label', row.cells[1]);
      item.dataset.done = row.done;
      title.textContent = row.cells[1];
      kind.textContent = row.kind;
      owner.textContent = (row.members?.join(', ') ?? row.cells[3].match(/^([^·]+) · /)?.[1]) || 'Unassigned';
    };
    update();
    detail.innerHTML = '<label>Task<input name="task" required></label><label>Kind<select name="kind"><option>Answer</option><option>Build</option><option>Check</option></select></label><label>Status<input name="status" required></label><label>Owner, next action and evidence<textarea name="next"></textarea></label><label>Attachment Markdown<input name="asset"></label><div class="task-attachment"></div><p class="task-conflict" hidden></p><button type="submit">Save task</button>';
    const controls = detail.elements;
    const preview = detail.querySelector('.task-attachment');
    const conflict = detail.querySelector('.task-conflict');
    function loadFields() {
      const [asset, task, status, next] = row.cells;
      for (const [key, value] of Object.entries({ asset, task, status, next: next.replace(assigneesTag, ''), kind: row.kind })) {
        controls.namedItem(key).value = value;
      }
      preview.replaceChildren();
      try { preview.innerHTML = renderBible([asset, next.replace(assigneesTag, '')].filter(Boolean).join('\n\n'), source); }
      catch { preview.textContent = next; }
    }
    loadFields();
    title.onclick = () => {
      const opening = detail.hidden;
      if (expanded && expanded !== title) expanded.click();
      detail.hidden = !opening;
      title.setAttribute('aria-expanded', String(opening));
      expanded = opening ? title : undefined;
    };
    let latest;
    const compare = actual => {
      latest = actual;
      checkbox.disabled = true;
      conflict.hidden = false;
      conflict.textContent = 'Saved task: ' + actual.cells.filter(Boolean).join(' · ') + ' · ' + actual.kind + (actual.done ? ' · Checked' : ' · Open');
      if (detail.hidden) title.click();
    };
    async function apply(draft) {
      draft.id ??= createId();
      if (!await save(latest ?? row, draft, compare)) {
        checkbox.checked = row.done;
        return;
      }
      row = { ...draft, raw: serialize(draft) };
      conflict.hidden = true;
      latest = undefined;
      checkbox.disabled = false;
      update();
      loadFields();
    }
    checkbox.onchange = () => apply({ ...row, done: checkbox.checked });
    detail.onsubmit = event => {
      event.preventDefault();
      const values = ['asset', 'task', 'status', 'next'].map(key => escapeCell(controls.namedItem(key).value.replace(/[\r\n]+/g, ' ')));
      if (!values[1] || !values[2]) return;
      const current = latest ?? row;
      values[3] = (values[3] + (current.cells[3].match(assigneesTag)?.[0] ?? '')).trim();
      apply({ ...current, cells: values, kind: controls.namedItem('kind').value });
    };
    return item;
  }

  try {
    const { rows } = read((await snapshot(endpoint)).markdown);
    const matching = rows.filter(row => row.chapter === chapter);
    list.append(...matching.map(rowView));
    result.textContent = matching.length ? '' : 'No tasks for this chapter yet.';
    addForm.hidden = false;
    addForm.onsubmit = async event => {
      event.preventDefault();
      const task = escapeCell(input.value);
      if (!task) return;
      const draft = { id: createId(), kind: 'Build', done: false, cells: ['', task, 'Open', ''] };
      if (await save(null, draft)) {
        input.value = '';
        list.append(rowView({ ...draft, raw: serialize(draft) }));
        input.focus();
      }
    };
  } catch (error) {
    result.textContent = error.message;
    addForm.hidden = true;
  }
}
