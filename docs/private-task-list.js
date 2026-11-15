import { enableGlobalTaskList } from './global-task-list.js';

export async function installPrivateTaskList() {
  const source = new URL('task-list.md', location.href);
  const endpoint = new URL('api/task-list', location.href);
  const references = document.querySelector('#references');
  if (!references) return;
  const link = references.querySelector('a[href="read.html?file=task-list.md"]');
  const documentUrl = new URL('./read.html', import.meta.url);
  documentUrl.searchParams.set('file', source.pathname);
  const open = await enableGlobalTaskList({
    source,
    endpoint,
    chapters: () => [...document.querySelectorAll('#chapter-choices .chapter-choice-title, #chapter-choices .chapter-title')]
      .map(title => title.textContent),
    links: link ? [link] : [],
    documentUrl: link?.href ?? documentUrl.href,
    footer: document.querySelector('.resources .link-row'),
  });
  if (!link) {
    const shortcut = document.createElement('button');
    shortcut.type = 'button';
    shortcut.textContent = 'Task List';
    shortcut.setAttribute('aria-haspopup', 'dialog');
    shortcut.onclick = () => open();
    const notes = [...references.querySelectorAll('.link-row')].find(row => row.textContent.includes('Joe’s Notes'));
    (notes ?? references).append(' · ', shortcut);
  }
}
