const fields = [
  ['task', 'Task'], ['status', 'Status'], ['next', 'Next action and evidence'],
  ['image', 'Thumbnail path'], ['alt', 'Image description'], ['full', 'Full-size image path'],
];

function taskRows(markdown) {
  return markdown.split('\n').flatMap((line, index) => {
    if (!line.startsWith('|') || !line.endsWith('|')) return [];
    const cells = line.slice(1, -1).split(/(?<!\\)\|/).map(cell => cell.trim());
    if (cells.length !== 4 || cells[0] === 'Asset' || /^:?-+:?$/.test(cells[0])) return [];
    return [{ index, cells }];
  });
}

function cell(value) {
  return value.trim().replace(/(?<!\\)\|/g, '\\|');
}

function imageCell({ image, alt, full }) {
  if (!image) return '';
  for (const path of [image, full].filter(Boolean)) {
    const url = new URL(path, location.href);
    if (url.origin !== location.origin || !/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(url.pathname)
        || /[\s()[\]|\\<>]/.test(path)) {
      throw new Error('Use an image path from this Bible, with spaces written as %20.');
    }
  }
  const imageMarkup = `![${alt.replace(/[\[\]]/g, '')}](${image})`;
  return full ? `[${imageMarkup}](${full})` : imageMarkup;
}

export async function startTaskList(markdown) {
  const page = new URL(location.href);
  if (page.searchParams.get('file')?.split('/').at(-1) !== 'task-list.md') return;
  const endpoint = new URL('api/task-list', page);
  const article = document.querySelector('#document');
  const load = async () => {
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) throw new Error('The editable Task List is unavailable.');
    return response.json();
  };
  let snapshot;
  try {
    snapshot = await load();
    if (markdown !== snapshot.markdown) return;
  } catch {
    return;
  }
  const rows = taskRows(snapshot.markdown);
  const rendered = [...article.querySelectorAll('tbody tr')];
  if (rows.length !== rendered.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'task-editor';
  dialog.setAttribute('aria-labelledby', 'task-editor-title');
  dialog.innerHTML = `
    <form>
      <h2 id="task-editor-title">Edit task</h2>
      ${fields.map(([name, label]) => `<label>${label}<input name="${name}" maxlength="600"></label>`).join('')}
      <p data-result role="status" hidden></p>
      <div class="task-editor-actions">
        <button type="button" data-cancel>Cancel</button>
        <button type="submit">Save</button>
      </div>
    </form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const result = form.querySelector('[data-result]');
  const save = form.querySelector('[type=submit]');
  const cancel = form.querySelector('[data-cancel]');
  const controls = Object.fromEntries(fields.map(([name]) => [name, form.elements.namedItem(name)]));
  controls.task.required = controls.status.required = true;
  let active;
  cancel.onclick = () => dialog.close();
  dialog.addEventListener('cancel', event => { if (save.disabled) event.preventDefault(); });

  rendered.forEach((row, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'edit-task';
    button.textContent = 'Edit';
    button.setAttribute('aria-label', 'Edit task ' + row.cells[1].textContent);
    button.onclick = () => {
      active = rows[index];
      const [asset, task, status, next] = active.cells;
      const match = asset.match(/^(?:\[)?!\[([^\]]*)\]\(([^)]+)\)(?:\]\(([^)]+)\))?$/);
      const values = { task, status, next, alt: match?.[1] ?? '', image: match?.[2] ?? '', full: match?.[3] ?? '' };
      for (const [name] of fields) controls[name].value = values[name];
      result.hidden = true;
      dialog.showModal();
      controls.task.focus();
    };
    row.cells[3].append(' ', button);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    save.disabled = cancel.disabled = true;
    result.hidden = true;
    try {
      const values = Object.fromEntries(fields.map(([name]) => [name, cell(controls[name].value)]));
      if (!values.task || !values.status) throw new Error('Enter a task and status.');
      if (values.image && !values.alt) throw new Error('Describe the image so readers know what it shows.');
      const lines = snapshot.markdown.split('\n');
      lines[active.index] = `| ${[imageCell(values), values.task, values.status, values.next].join(' | ')} |`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bible-Task-List': '1' },
        body: JSON.stringify({ revision: snapshot.revision, markdown: lines.join('\n') }),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      location.reload();
    } catch (error) {
      result.textContent = error.message;
      result.hidden = false;
      save.disabled = cancel.disabled = false;
    }
  });
}
