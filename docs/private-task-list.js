import { enableGlobalTaskList } from './global-task-list.js';

export async function installPrivateTaskList() {
  const source = new URL('task-list.md', location.href);
  const endpoint = new URL('api/task-list', location.href);
  const link = document.querySelector('#references a[href="read.html?file=task-list.md"]');
  if (!link) return;
  return enableGlobalTaskList({
    source,
    endpoint,
    chapters: () => [...document.querySelectorAll('#chapter-choices .chapter-choice-title')].map(title => title.textContent),
    links: [link],
    footer: document.querySelector('.resources .link-row'),
  });
}
