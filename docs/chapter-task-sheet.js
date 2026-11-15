import { renderMarkdown } from './document-reader.js';
import { chapterKey, readTaskList } from './task-document.js';
import { splitTicketId } from './task-subtasks.js';

export function chapterTaskRows(markdown, chapter, chapterTitles = []) {
  const namedChapters = new Set([chapter, ...chapterTitles.map(chapterKey)]);
  const rows = [];
  for (const task of readTaskList(markdown).tasks) {
    const home = chapterKey(task.chapter);
    const parsed = splitTicketId(task.title, true);
    const id = parsed.id || (/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(task.id) ? task.id : '');
    const cancelled = /^(canceled|cancelled)$/i.test(task.status);
    if (home === chapter) {
      rows.push({ ...task, id, title: parsed.text, group: cancelled ? 'cancelled' : task.done ? 'complete' : 'remaining' });
    }
    for (const subtask of task.subtasks) {
      const [title, ...notes] = subtask.text.split(/\r?\n/);
      const statedChapter = chapterKey(notes[0]?.match(/^\s*([^.]+)\./)?.[1] ?? '');
      const subtaskHome = namedChapters.has(statedChapter) ? statedChapter : home;
      if (subtaskHome !== chapter) continue;
      const ticket = splitTicketId(title, true);
      rows.push({ id: ticket.id, title: ticket.text, notes: notes.join('\n'),
        parent: parsed.text, parentId: id, status: cancelled ? task.status : subtask.done ? 'Complete' : 'Open',
        group: cancelled ? 'cancelled' : subtask.done ? 'complete' : 'remaining' });
    }
  }
  return rows;
}

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function appendMarkdown(container, markdown, source, reader) {
  if (!markdown) return;
  const body = node('div', '', 'chapter-ticket-note');
  body.innerHTML = renderMarkdown(markdown, source, reader);
  container.append(body);
}

function taskRow(task, index, source, reader) {
  const row = node('li', '', 'chapter-ticket-row');
  const details = node('details');
  details.id = 'chapter-task-ticket-' + index;
  const summary = node('summary');
  const title = node('span');
  title.innerHTML = renderMarkdown(task.title, source, reader);
  summary.textContent = title.textContent.trim() || task.title;
  summary.append(node('span', task.status, 'chapter-ticket-status'));
  details.append(summary);

  if (task.parent) {
    details.append(node('p', 'Subtask of ' + task.parent + (task.parentId ? ' · ' + task.parentId : '')));
  }
  if (task.members?.length) details.append(node('p', 'Assigned to ' + task.members.join(', ')));
  appendMarkdown(details, task.blockers && '**Blockers:** ' + task.blockers, source, reader);
  appendMarkdown(details, task.notes, source, reader);
  appendMarkdown(details, task.asset, source, reader);
  if (title.querySelector('a')) appendMarkdown(details, task.title, source, reader);
  if (details.childElementCount === 1) details.append(node('p', 'No additional notes for this ticket.'));

  if (task.id) {
    const link = node('a', task.id, 'chapter-ticket-link');
    link.href = '#' + details.id;
    link.setAttribute('aria-label', 'Ticket ' + task.id);
    link.addEventListener('click', event => {
      event.preventDefault();
      details.open = true;
      summary.focus({ preventScroll: true });
      row.scrollIntoView({ block: 'nearest' });
    });
    row.append(link);
  }
  row.append(details);
  return row;
}

export function createChapterTaskSheet(chapter, { taskSource } = {}) {
  const sheet = node('section', '', 'chapter-task-sheet');
  sheet.setAttribute('aria-label', 'Chapter task sheet');
  const heading = node('h3', 'Chapter task sheet');
  const refresh = node('button', 'Refresh tasks');
  refresh.type = 'button';
  const bar = node('div', '', 'chapter-sheet-bar');
  bar.append(heading, refresh);
  const status = node('p', '', 'chapter-sheet-status');
  status.setAttribute('role', 'status');
  const list = node('div');
  sheet.append(bar, status, list);

  const source = taskSource ?? new URL('task-list.md', location.href);
  const reader = new URL('read.html', location.href);
  const url = taskSource ?? new URL('api/task-list', location.href);

  async function refreshTasks() {
    if (refresh.disabled) return;
    refresh.disabled = true;
    status.textContent = 'Loading chapter tasks…';
    try {
      const response = await fetch(url, { cache: 'no-store' });
      const fallback = !taskSource && response.status === 404;
      const snapshot = fallback ? await fetch(source, { cache: 'no-store' }) : response;
      if (!snapshot.ok) throw new Error('Unable to load tasks.');
      const markdown = taskSource || fallback ? await snapshot.text() : (await snapshot.json()).markdown;
      if (typeof markdown !== 'string') throw new Error('Invalid task list.');
      const titles = [...document.querySelectorAll('#chapter-choices .chapter-choice-title, #chapter-choices .chapter-title')]
        .map(element => element.textContent.trim());
      const rows = chapterTaskRows(markdown, chapter, titles);
      list.replaceChildren();
      let index = 0;
      for (const [group, label] of [['remaining', 'Remaining'], ['complete', 'Completed'], ['cancelled', 'Cancelled']]) {
        const tasks = rows.filter(row => row.group === group);
        if (group === 'cancelled' && !tasks.length) continue;
        const section = node('section', '', 'chapter-sheet-group');
        section.append(node('h4', label + ' · ' + tasks.length));
        if (tasks.length) {
          const entries = node('ul');
          for (const task of tasks) entries.append(taskRow(task, ++index, source, reader));
          section.append(entries);
        } else {
          section.append(node('p', group === 'remaining' ? 'No remaining tasks in this chapter.' : 'No completed tasks in this chapter.'));
        }
        list.append(section);
      }
      status.textContent = rows.length ? '' : 'No tasks are recorded for this chapter.';
    } catch {
      status.textContent = 'Couldn’t load chapter tasks. Use Refresh tasks to try again.';
      list.replaceChildren();
    } finally {
      refresh.disabled = false;
    }
  }

  refresh.onclick = refreshTasks;
  void refreshTasks();
  return sheet;
}
