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

function recordedBlocker(task) {
  return task.blockers && !/^(?:none|n\/?a|[-—])[.!]?$/i.test(task.blockers.trim()) ? task.blockers : '';
}

function queueGroup(task) {
  return recordedBlocker(task) || /^(?:blocked|waiting|hold|on hold|later)$/i.test(task.status.trim())
    ? 'waiting' : 'open';
}

function taskRow(task, index, source, reader, queue) {
  const row = node('li', '', 'chapter-ticket-row');
  const details = node('details');
  details.id = 'chapter-task-ticket-' + index;
  details.dataset.ticket = JSON.stringify([task.id, task.title, task.parent ?? '']);
  const summary = node('summary');
  const title = node('span');
  title.innerHTML = renderMarkdown(task.title, source, reader);
  summary.textContent = title.textContent.trim() || task.title;
  summary.append(node('span', task.status, 'chapter-ticket-status'));
  details.append(summary);

  if (task.parent) {
    details.append(node('p', 'Subtask of ' + task.parent + (task.parentId ? ' · ' + task.parentId : '')));
  }
  const metadata = queue ? node('div', '', 'chapter-queue-metadata') : details;
  if (task.members?.length) {
    const assigned = node('p', 'Assigned to ');
    assigned.append(node('strong', task.members.join(', ')));
    metadata.append(assigned);
  }
  const blockers = queue ? recordedBlocker(task) : task.blockers;
  appendMarkdown(metadata, blockers && '**Blockers:** ' + blockers, source, reader);
  appendMarkdown(details, task.notes, source, reader);
  appendMarkdown(details, task.asset, source, reader);
  const references = [...title.querySelectorAll('a')];
  if (references.length) {
    const links = node('p', 'References ');
    references.forEach((link, index) => {
      if (index) links.append(' · ');
      links.append(link);
    });
    details.append(links);
  }
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
  if (queue && metadata.hasChildNodes()) row.append(metadata);
  return row;
}

export function createChapterTaskSheet(chapter, { taskSource, queue = false } = {}) {
  const sheet = node('section', '', 'chapter-task-sheet');
  const title = queue ? 'Work queue' : 'Chapter task sheet';
  sheet.setAttribute('aria-label', title);
  const heading = node('h3', title);
  const refresh = node('button', 'Refresh tasks');
  refresh.type = 'button';
  const bar = node('div', '', 'chapter-sheet-bar');
  bar.append(heading, refresh);
  const status = node('p', '', 'chapter-sheet-status');
  status.setAttribute('role', 'status');
  const list = node('div', '', 'chapter-sheet-groups');
  sheet.append(bar, status, list);

  const source = taskSource ?? new URL('task-list.md', location.href);
  const reader = new URL('read.html', location.href);
  const url = taskSource ?? new URL('api/task-list', location.href);
  let loaded = false;

  async function refreshTasks(event) {
    if (refresh.getAttribute('aria-disabled') === 'true') return;
    refresh.setAttribute('aria-disabled', 'true');
    list.setAttribute('aria-busy', 'true');
    status.textContent = loaded ? 'Refreshing tasks…' : 'Loading chapter tasks…';
    status.removeAttribute('data-error');
    try {
      const response = await fetch(url, { cache: 'no-store' });
      const fallback = !taskSource && response.status === 404;
      const snapshot = fallback ? await fetch(source, { cache: 'no-store' }) : response;
      if (!snapshot.ok) throw new Error('Unable to load tasks.');
      const markdown = taskSource || fallback ? await snapshot.text() : (await snapshot.json()).markdown;
      if (typeof markdown !== 'string') throw new Error('Invalid task list.');
      const titles = [...document.querySelectorAll('#chapter-choices .chapter-choice-title, #chapter-choices .chapter-title')]
        .map(element => element.textContent.trim());
      const chapterRows = chapterTaskRows(markdown, chapter, titles);
      const rows = queue ? chapterRows.filter(row => row.group === 'remaining') : chapterRows;
      const groupBy = queue ? queueGroup : row => row.group;
      const labels = queue ? [['open', 'Open work'], ['waiting', 'Waiting or deferred']]
        : [['remaining', 'Remaining'], ['complete', 'Completed'], ['cancelled', 'Cancelled']];
      const openTickets = new Set([...list.querySelectorAll('details[open]')].map(item => item.dataset.ticket));
      const groups = document.createDocumentFragment();
      let index = 0;
      for (const [group, label] of labels) {
        const tasks = rows.filter(row => groupBy(row) === group);
        if ((queue || group === 'cancelled') && !tasks.length) continue;
        const section = node('section', '', 'chapter-sheet-group');
        section.dataset.group = group;
        section.append(node('h4', label + ' · ' + tasks.length));
        if (tasks.length) {
          const entries = node('ul');
          for (const task of tasks) {
            const row = taskRow(task, ++index, source, reader, queue);
            const details = row.querySelector('details');
            details.open = openTickets.has(details.dataset.ticket);
            entries.append(row);
          }
          section.append(entries);
        } else if (rows.length) {
          section.append(node('p', group === 'remaining' ? 'Nothing left to do in this chapter.' : 'No completed tasks yet.'));
        }
        groups.append(section);
      }
      list.replaceChildren(groups);
      loaded = true;
      status.textContent = rows.length ? (event ? 'Tasks refreshed.' : '')
        : queue ? 'No open work in this chapter.' : 'No tasks are recorded for this chapter.';
    } catch {
      status.dataset.error = '';
      status.textContent = loaded
        ? 'Couldn’t refresh. Showing the last loaded tasks.'
        : 'Couldn’t load chapter tasks. Select Refresh tasks to try again.';
    } finally {
      list.removeAttribute('aria-busy');
      refresh.removeAttribute('aria-disabled');
    }
  }

  refresh.onclick = refreshTasks;
  void refreshTasks();
  return sheet;
}
