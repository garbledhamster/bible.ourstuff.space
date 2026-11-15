import { renderMarkdown } from './document-reader.js';
import { chapterKey, isDone, readTaskList, saveTask, updateMember } from './task-document.js';
import { editTaskSubtasks } from './task-subtasks.js';

const statuses = ['Ready', 'In progress', 'Blocked', 'Hold', 'Complete', 'Cancelled'];
const markup = `<dialog id="bible-task-list" aria-labelledby="bible-task-list-title">
  <header class="bible-task-heading">
    <p class="bible-task-label" id="bible-task-example" hidden>Island Post · Example</p>
    <h2 id="bible-task-list-title">Task List</h2>
    <form method="dialog"><button type="submit" class="close" aria-label="Close Task List" autofocus>×</button></form>
  </header>
  <div class="bible-task-toolbar">
    <div class="bible-task-filters">
      <label>Chapter<select id="task-chapter-filter"></select></label>
      <label>Status<select id="task-status-filter"></select></label>
      <label>Assignee<select id="task-person-filter"></select></label>
    </div>
    <button type="button" class="primary bible-task-accent" id="new-bible-task">+ New task</button>
  </div>
  <p class="bible-task-count" id="bible-task-count" role="status">Loading tasks…</p>
  <div class="bible-task-list" id="bible-task-rows" role="region" aria-label="Tasks by chapter" tabindex="0"></div>
  <nav class="bible-task-links" aria-label="Task List resources">
    <button type="button" id="refresh-bible-tasks" class="primary">Refresh</button>
    <a id="bible-task-document">Task List document</a>
    <a id="bible-task-workflow">How to work tasks</a>
  </nav>
</dialog>
<dialog id="bible-task-editor" aria-labelledby="bible-task-editor-title">
  <header class="bible-task-heading">
    <h2 id="bible-task-editor-title">New task</h2>
    <form method="dialog"><button type="submit" class="close" aria-label="Close task form">×</button></form>
  </header>
  <form id="bible-task-form">
    <label>Task name<input name="title" required autofocus></label>
    <div class="bible-task-fields">
      <label>Chapter<select name="chapter" required></select></label>
      <label>Status<select name="status" required></select></label>
    </div>
    <fieldset id="bible-task-member-field">
      <legend>Assignees</legend>
      <div class="bible-task-assignees" id="bible-task-assignees"></div>
      <button type="button" class="primary" id="insert-bible-member" aria-expanded="false" aria-controls="bible-task-member-callout">+ Insert member</button>
      <div id="bible-task-member-callout" hidden>
        <div class="bible-task-member-heading">
          <h3>Bible members</h3>
          <button type="button" class="primary" id="new-bible-member">+ Add user</button>
        </div>
        <p class="bible-task-member-hint">Pick anyone to assign to this task. Member changes apply across this Bible.</p>
        <div id="bible-task-member-action" hidden>
          <label>Name<input id="bible-task-member-name" maxlength="60"></label>
          <p id="bible-task-remove-message" hidden></p>
          <div class="bible-task-member-buttons">
            <button type="button" id="cancel-bible-member" class="primary">Cancel</button>
            <button type="button" id="save-bible-member" class="primary bible-task-accent">Add user</button>
          </div>
        </div>
        <div id="bible-task-member-rows"></div>
        <button type="button" class="primary" id="done-bible-members">Done</button>
      </div>
      <p class="bible-task-visually-hidden" id="bible-task-member-status" role="status"></p>
    </fieldset>
    <label>Blockers<input name="blockers" placeholder="Task, decision, or evidence needed"></label>
    <label>Description and next action<textarea name="notes" rows="3"></textarea></label>
    <fieldset id="bible-task-subtasks" class="task-subtasks"><legend>Subtasks</legend></fieldset>
    <label id="bible-task-asset">Attachment Markdown<input name="asset"></label>
    <div id="bible-task-evidence"></div>
    <p id="bible-task-save-status" role="status" hidden></p>
    <div class="bible-task-form-actions">
      <button type="button" class="primary" id="cancel-bible-task">Cancel</button>
      <button type="submit" id="save-bible-task" class="primary bible-task-accent">Save task</button>
    </div>
  </form>
</dialog>`;

const cancelled = task => task.status.toLowerCase() === 'cancelled';
const ready = task => !task.done && !task.blockers && /^(ready|open)$/i.test(task.status);
const distinct = values => [...new Set(values)];

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, action, label, className) {
  const control = element('button', text, className);
  control.type = 'button';
  if (label) control.setAttribute('aria-label', label);
  control.onclick = action;
  return control;
}

async function readSnapshot(url, options) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  if (!response.headers.get('Content-Type')?.includes('application/json')) {
    throw new Error('The editable Task List is unavailable.');
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result;
}

export function mountGlobalTaskList({ source, endpoint, chapters, initial, documentUrl }) {
  const style = element('link');
  style.rel = 'stylesheet';
  style.href = new URL('./global-task-list.css', import.meta.url);
  document.head.append(style);
  document.body.insertAdjacentHTML('beforeend', markup);
  const get = id => document.getElementById(id);
  const list = get('bible-task-list');
  const editor = get('bible-task-editor');
  const rows = get('bible-task-rows');
  const count = get('bible-task-count');
  const statusFilter = get('task-status-filter');
  const chapterFilter = get('task-chapter-filter');
  const personFilter = get('task-person-filter');
  const newTask = get('new-bible-task');
  const refresh = get('refresh-bible-tasks');
  const form = get('bible-task-form');
  const field = name => form.elements.namedItem(name);
  const memberField = get('bible-task-member-field');
  const picker = get('bible-task-member-callout');
  const insert = get('insert-bible-member');
  const assignees = get('bible-task-assignees');
  const memberRows = get('bible-task-member-rows');
  const memberAction = get('bible-task-member-action');
  const memberName = get('bible-task-member-name');
  const memberStatus = get('bible-task-member-status');
  const saveMember = get('save-bible-member');
  const addMember = get('new-bible-member');
  const removeMessage = get('bible-task-remove-message');
  const saveButton = get('save-bible-task');
  const saveStatus = get('bible-task-save-status');
  const cancelMember = get('cancel-bible-member');
  const cancelTask = get('cancel-bible-task');
  const reader = new URL('read.html', location.href);
  let doc = readTaskList(initial?.markdown ?? '');
  let revision = initial?.revision;
  let busy = false;
  let loading = false;
  let selectedChapter = '';
  let task;
  let assigned;
  let memberChange;
  let opener;

  get('bible-task-example').hidden = Boolean(endpoint);
  get('bible-task-document').href = documentUrl;
  const instructions = new URL('./read.html', import.meta.url);
  instructions.searchParams.set('file', new URL('./resources/task-list-workflow.md', import.meta.url).pathname);
  get('bible-task-workflow').href = instructions;
  for (const id of ['bible-task-document', 'bible-task-workflow']) {
    get(id).target = '_blank';
    get(id).rel = 'noopener';
  }
  newTask.hidden = !endpoint;

  function setOptions(select, choices, desired = select.value) {
    select.replaceChildren(...choices.map(([id, label]) => new Option(label, id)));
    if (choices.some(([id]) => id === desired)) select.value = desired;
  }

  function chapterNames() {
    const names = new Map(chapters().map(title => [chapterKey(title), title]));
    for (const section of doc.sections) {
      if (chapterKey(section.chapter) !== 'members') names.set(chapterKey(section.chapter), section.chapter);
    }
    return names;
  }

  function renderTasks() {
    const names = chapterNames();
    const { tasks } = doc;
    const statusChoices = distinct([...statuses, ...tasks.map(item => item.status)]);
    setOptions(chapterFilter, [['', 'All chapters'], ...names], selectedChapter || chapterFilter.value);
    selectedChapter = chapterFilter.value;
    setOptions(statusFilter, [['', 'All statuses'], ['ready-to-work', 'Ready to work'], ['active', 'Active'],
      ...statusChoices.map(status => ['status:' + status, status])]);
    setOptions(personFilter, [['', 'Everyone'], ['unassigned', 'Unassigned'],
      ...doc.members.map(name => ['member:' + name, name])]);
    const status = statusFilter.value;
    const person = personFilter.value;
    const visible = tasks.filter(item => {
      const matchesChapter = !selectedChapter || chapterKey(item.chapter) === selectedChapter;
      const matchesStatus = !status || status === 'ready-to-work' && ready(item) ||
        status === 'active' && !item.done && !cancelled(item) ||
        status === 'status:' + item.status || status === 'status:Complete' && item.done;
      const matchesPerson = !person || person === 'unassigned' && !item.members.length ||
        item.members.includes(person.slice('member:'.length));
      return matchesChapter && matchesStatus && matchesPerson;
    });
    const completed = tasks.filter(item => item.done).length;
    const cancellations = tasks.filter(cancelled).length;
    count.textContent = visible.length === tasks.length
      ? `${tasks.length} tasks · ${tasks.filter(ready).length} ready to work · ${completed} complete` +
        (cancellations ? ` · ${cancellations} cancelled` : '')
      : `${visible.length} of ${tasks.length} tasks`;
    const byChapter = Map.groupBy(visible, item => chapterKey(item.chapter));
    rows.replaceChildren();
    for (const [key, name] of names) {
      const matching = byChapter.get(key);
      if (!matching?.length) continue;
      const section = element('section', '', 'bible-task-section');
      const items = element('ul');
      section.append(element('h3', name), items);
      for (const item of matching) {
        const row = element('li', '', 'bible-task-row');
        row.dataset.status = item.status;
        const checkbox = element('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.done;
        checkbox.disabled = !endpoint || cancelled(item);
        checkbox.setAttribute('aria-label', `Mark ${item.title} ${item.done ? 'open' : 'complete'}`);
        checkbox.onchange = async () => {
          const done = checkbox.checked;
          checkbox.checked = item.done;
          if (await commit(saveTask(doc, item, { ...item, done, status: done ? 'Complete' : 'Ready' }))) {
            const sameTask = rows.querySelector('[data-task-line="' + item.start + '"] input:not(:disabled)');
            (sameTask ?? statusFilter).focus({ preventScroll: true });
          }
        };
        row.dataset.taskLine = item.start;
        row.append(checkbox, button(item.title, event => editTask(item, event.currentTarget), '', 'bible-task-title'),
          element('span', item.status, 'bible-task-state'),
          element('span', item.members.join(', ') || 'Unassigned', 'bible-task-owners'));
        if (item.blockers) row.append(element('span', 'Blockers: ' + item.blockers, 'bible-task-blockers'));
        items.append(row);
      }
      rows.append(section);
    }
    if (!visible.length) rows.append(element('p', tasks.length ? 'No tasks match these filters.' : 'No tasks yet.'));
  }

  function applySnapshot(snapshot) {
    revision = snapshot.revision;
    doc = readTaskList(snapshot.markdown);
    renderTasks();
  }

  async function refreshList() {
    if (loading || busy) return;
    loading = true;
    refresh.disabled = newTask.disabled = true;
    try {
      const snapshot = endpoint ? await readSnapshot(endpoint) : {
        markdown: await fetch(source, { cache: 'no-store' }).then(response => {
          if (!response.ok) throw new Error('Couldn’t open the Task List.');
          return response.text();
        }),
      };
      applySnapshot(snapshot);
    } catch (error) {
      count.textContent = error.message;
    } finally {
      refresh.disabled = false;
      newTask.disabled = !revision;
      loading = false;
    }
  }

  function showError(text) {
    const status = editor.open ? saveStatus : count;
    status.textContent = text;
    status.hidden = false;
  }

  async function commit(markdown) {
    if (busy || loading) return false;
    busy = true;
    const active = document.activeElement;
    saveStatus.hidden = true;
    list.setAttribute('aria-busy', 'true');
    editor.setAttribute('aria-busy', 'true');
    // Preserve the draft and block controls while the file revision is checked.
    const controls = [...list.querySelectorAll('button, input, select'), ...editor.querySelectorAll('button, input, textarea, select')];
    const enabled = controls.filter(control => !control.disabled);
    for (const control of enabled) control.disabled = true;
    try {
      applySnapshot(await readSnapshot(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bible-Task-List': '1' },
        body: JSON.stringify({ revision, markdown }),
      }));
      return true;
    } catch (error) {
      showError(error.message + (editor.open ? ' Your draft is still here.' : ''));
      return false;
    } finally {
      for (const control of enabled) control.disabled = false;
      list.removeAttribute('aria-busy');
      editor.removeAttribute('aria-busy');
      busy = false;
      if (editor.open && active.isConnected) active.focus({ preventScroll: true });
    }
  }

  function renderAssignees() {
    assignees.replaceChildren(...[...assigned].map(name => endpoint
      ? button(name + ' ×', () => {
        assigned.delete(name);
        const checkbox = [...memberRows.querySelectorAll('input')].find(control => control.value === name);
        if (checkbox) checkbox.checked = false;
        renderAssignees();
        insert.focus();
      }, 'Unassign ' + name, 'bible-task-chip')
      : element('span', name, 'bible-task-chip')));
  }

  function renderMembers() {
    memberRows.replaceChildren();
    for (const name of doc.members) {
      const row = element('div', '', 'bible-task-member-row');
      const label = element('label');
      const checkbox = element('input');
      checkbox.type = 'checkbox';
      checkbox.value = name;
      checkbox.checked = assigned.has(name);
      checkbox.onchange = () => {
        if (checkbox.checked) assigned.add(name);
        else assigned.delete(name);
        renderAssignees();
      };
      label.append(checkbox, element('span', name));
      row.append(label, button('Rename', () => startMemberChange('rename', name), 'Rename ' + name),
        button('Remove', () => startMemberChange('remove', name), 'Remove ' + name + ' from Bible'));
      memberRows.append(row);
    }
    renderAssignees();
  }

  function closeMemberAction() {
    const trigger = memberChange?.trigger;
    memberChange = undefined;
    memberAction.hidden = true;
    memberName.setCustomValidity('');
    return trigger;
  }

  function setPicker(open, focus = true) {
    closeMemberAction();
    picker.hidden = !open;
    insert.setAttribute('aria-expanded', String(open));
    if (focus) (open ? memberRows.querySelector('input') ?? addMember : insert).focus();
  }

  function startMemberChange(mode, name) {
    memberChange = { mode, name, trigger: document.activeElement };
    const remove = mode === 'remove';
    memberName.parentElement.hidden = remove;
    memberName.setCustomValidity('');
    memberName.value = name ?? '';
    removeMessage.hidden = !remove;
    const total = doc.tasks.filter(item => item.members.includes(name)).length;
    removeMessage.textContent = remove
      ? `Remove ${name} from this Bible? This clears their assignment from ${total} ${total === 1 ? 'task' : 'tasks'}.`
      : '';
    saveMember.textContent = { add: 'Add user', rename: 'Save name', remove: 'Remove user' }[mode];
    memberAction.hidden = false;
    (remove ? cancelMember : memberName).focus();
  }

  async function saveMemberChange() {
    if (!memberChange || busy) return;
    const { mode, name } = memberChange;
    const next = mode === 'remove' ? undefined : memberName.value.trim();
    if (next !== undefined) {
      const duplicate = doc.members.some(member => member !== name && member.toLowerCase() === next.toLowerCase());
      memberName.setCustomValidity(!next ? 'Enter a name.' : duplicate ? 'That name is already in the Bible.' : '');
      if (!memberName.reportValidity()) return;
    }
    const index = doc.tasks.indexOf(task);
    if (!await commit(updateMember(doc, name, next))) return;
    task = doc.tasks[index];
    if (assigned.delete(name) || mode === 'add') {
      if (next) assigned.add(next);
    }
    closeMemberAction();
    renderMembers();
    memberStatus.textContent = next ? `${next} saved to the Bible roster.` : `${name} removed from this Bible.`;
    ([...memberRows.querySelectorAll('input')].find(control => control.value === next) ?? addMember).focus();
  }

  let readSubtasks;
  function editTask(item, control) {
    if (busy || loading) return;
    opener = control;
    task = item;
    assigned = new Set(item?.members);
    const title = endpoint ? (item ? 'Edit task' : 'New task') : 'Task details';
    get('bible-task-editor-title').textContent = title;
    field('title').setCustomValidity('');
    field('title').value = item?.title ?? '';
    setOptions(field('chapter'), [['', 'Choose chapter'], ...chapterNames()],
      item ? chapterKey(item.chapter) : selectedChapter);
    setOptions(field('status'), distinct([...statuses, item?.status].filter(Boolean)).map(status => [status, status]),
      item?.status ?? 'Ready');
    field('notes').value = item?.notes ?? '';
    field('blockers').value = item?.blockers ?? '';
    field('asset').value = item?.asset ?? '';
    readSubtasks = editTaskSubtasks(get('bible-task-subtasks'), item?.subtasks, !endpoint);
    get('bible-task-asset').hidden = !endpoint || item?.format === 'checklist';
    for (const name of ['title', 'notes', 'blockers']) field(name).readOnly = !endpoint;
    for (const name of ['chapter', 'status']) field(name).disabled = !endpoint;
    insert.hidden = saveButton.hidden = !endpoint;
    cancelTask.textContent = endpoint ? 'Cancel' : 'Close';
    memberStatus.textContent = '';
    saveStatus.hidden = true;
    setPicker(false, false);
    renderMembers();
    const evidence = get('bible-task-evidence');
    try {
      evidence.innerHTML = renderMarkdown([item?.asset, item?.notes, item?.blockers].filter(Boolean).join('\n\n'), source, reader);
      for (const link of evidence.querySelectorAll('a')) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
    } catch {
      evidence.replaceChildren();
    }
    editor.showModal();
  }

  field('title').oninput = () => field('title').setCustomValidity('');
  memberName.oninput = () => memberName.setCustomValidity('');
  memberName.onkeydown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void saveMemberChange();
    }
  };
  insert.onclick = () => setPicker(picker.hidden);
  addMember.onclick = () => startMemberChange('add');
  saveMember.onclick = saveMemberChange;
  cancelMember.onclick = () => closeMemberAction()?.focus();
  cancelTask.onclick = () => editor.close();
  get('done-bible-members').onclick = () => setPicker(false);
  editor.addEventListener('click', event => {
    if (!busy && !picker.hidden && !event.composedPath().includes(memberField)) setPicker(false, false);
  });
  editor.addEventListener('cancel', event => {
    if (busy) return event.preventDefault();
    if (picker.hidden) return;
    event.preventDefault();
    if (memberChange) closeMemberAction()?.focus();
    else setPicker(false);
  });
  list.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  editor.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    else if (document.activeElement === document.body) (endpoint ? newTask : statusFilter).focus();
  });

  form.onsubmit = async event => {
    event.preventDefault();
    if (!endpoint || busy || memberChange) return;
    const title = field('title').value.trim();
    if (!title) {
      field('title').setCustomValidity('Enter a task name.');
      field('title').reportValidity();
      return;
    }
    const status = field('status').value;
    const draft = {
      ...task, title, status, chapter: chapterNames().get(field('chapter').value),
      notes: field('notes').value.trim(), asset: field('asset').value.trim(), blockers: field('blockers').value.trim(),
      done: status === task?.status ? task.done : isDone(status),
      members: [...assigned], explicit: true, subtasks: readSubtasks(),
    };
    if (await commit(saveTask(doc, task, draft))) {
      editor.close();
      const saved = doc.tasks.find(item => item.title === title && item.chapter === draft.chapter);
      opener = saved ? rows.querySelector('[data-task-line="' + saved.start + '"] button') : null;
      count.textContent += ' · Task saved';
    }
  };

  refresh.onclick = refreshList;
  newTask.onclick = event => editTask(null, event.currentTarget);
  statusFilter.onchange = personFilter.onchange = renderTasks;
  chapterFilter.onchange = () => {
    selectedChapter = chapterFilter.value;
    renderTasks();
  };
  renderTasks();
  return function open(chapter = '') {
    selectedChapter = chapter;
    chapterFilter.value = chapter;
    renderTasks();
    if (!list.open) list.showModal();
    void refreshList();
  };
}

export async function enableGlobalTaskList({ source, endpoint, chapters, links, footer, documentUrl = links[0]?.href }) {
  const initial = endpoint ? await readSnapshot(endpoint) : undefined;
  const open = mountGlobalTaskList({ source, endpoint, chapters, initial, documentUrl });
  for (const link of links) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      open();
    }, { capture: true });
  }
  if (footer) {
    const trigger = button('Tasks', () => open());
    trigger.setAttribute('aria-haspopup', 'dialog');
    const separator = element('span', '  •  ', 'separator');
    separator.setAttribute('aria-hidden', 'true');
    if (footer.firstElementChild) footer.firstElementChild.after(separator, trigger);
    else footer.append(trigger);
  }
  document.addEventListener('open-bible-task-list', event => open(event.detail));
  if (new URLSearchParams(location.search).get('view') === 'tasks') open();
  return open;
}
