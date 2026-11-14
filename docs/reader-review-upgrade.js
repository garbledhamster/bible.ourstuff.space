import { chapterWork } from './review.js';
import { chapterTasks } from './chapter-tasks.js';
import { marked } from './vendor/marked.esm.js';
import { resolveDocumentLinks } from './document-reader.js';

// Older private reader shells replace the dialog body when a chapter opens.
// Their updater loads this module from the installed shared checkout.
export function enableChapterWork(reviewStyles) {
  const dialog = document.querySelector('#chapter-dialog');
  const body = dialog?.querySelector('.chapter-detail-body');
  if (!body || document.querySelector('[data-chapter-work]') || dialog.querySelector('.chapter-work')) return;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = reviewStyles;
  document.head.append(stylesheet);

  const reader = new URL('read.html', location.href);
  const shortcut = document.querySelector('#references a[href="read.html?file=task-list.md"]');
  const renderBible = (markdown, source) => {
    const tokens = marked.lexer(markdown);
    resolveDocumentLinks(tokens, source, reader);
    const renderer = new marked.Renderer();
    renderer.html = ({ text }) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    return marked.parser(tokens, { renderer });
  };
  const work = chapterWork(dialog, body, {
    loadTasks: shortcut ? (container, slug) => chapterTasks(container, slug, {
      endpoint: new URL('api/task-list', location.href),
      fullList: shortcut.href,
      renderBible,
    }) : undefined,
  });
  const render = () => {
    const slug = dialog.dataset.chapter;
    if (!slug || !dialog.open || !body.firstElementChild ||
        body.querySelector(':scope > :first-child > .chapter-gallery')) return;
    work.render(slug, 'review');
  };
  new MutationObserver(render).observe(body, { childList: true });
  new MutationObserver(render).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  dialog.addEventListener('close', work.pause);
  render();
}
