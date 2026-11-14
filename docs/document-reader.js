import { marked } from './vendor/marked.esm.js';

const publicBible = 'https://bible.ourstuff.space';
const readable = /\.(?:md|txt|json|ya?ml|csv|tsv)$/i;

export function readingLink(url, reader) {
  if (!readable.test(url.pathname)) return url.href;
  let page = new URL(reader);
  if (url.origin !== reader.origin) {
    if (url.origin !== publicBible) return url.href;
    if (reader.pathname !== '/read.html') page = new URL('/read.html', publicBible);
  }
  page.searchParams.set('file', url.pathname + url.search);
  page.hash = url.hash;
  return page.href;
}

export function resolveDocumentLinks(tokens, source, reader) {
  marked.walkTokens(tokens, token => {
    if (token.type !== 'link' && token.type !== 'image') return;
    const url = new URL(token.href, source);
    if (token.type === 'link' && ['mailto:', 'tel:'].includes(url.protocol)) {
      token.href = url.href;
    } else if (!['http:', 'https:'].includes(url.protocol)) {
      token.href = '#';
    } else if (token.type === 'link' && !token.href.startsWith('#')) {
      token.href = readingLink(url, reader);
    } else if (token.type === 'image') {
      token.href = url.href;
    }
  });
}

function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function renderMarkdown(markdown, source, reader) {
  const tokens = marked.lexer(markdown.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, ''));
  resolveDocumentLinks(tokens, source, reader);
  const headings = new Set();
  const renderer = new marked.Renderer();
  renderer.html = ({ text }) => escapeHtml(text);
  renderer.heading = function ({ depth, tokens }) {
    const base = this.parser.parseInline(tokens, this.parser.textRenderer)
      .toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-') || 'section';
    let id = base;
    for (let suffix = 1; headings.has(id); suffix++) id = `${base}-${suffix}`;
    headings.add(id);
    return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
  };
  return marked.parser(tokens, { renderer });
}

export async function startReader() {
  const reader = new URL(location.href);
  const path = reader.searchParams.get('file');
  const article = document.querySelector('#document');
  const download = document.querySelector('#download');
  let markdown;
  try {
    if (!path) throw new Error('Missing file');
    const source = new URL(path, reader);
    if (source.origin !== reader.origin || !readable.test(source.pathname)) throw new Error('Unsupported file');
    const response = await fetch(source, { redirect: 'error', cache: 'no-cache' });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const contents = await response.text();
    const filename = decodeURIComponent(source.pathname.split('/').at(-1));
    if (/\.md$/i.test(source.pathname)) {
      article.innerHTML = renderMarkdown(contents, source, reader);
      markdown = contents;
    } else {
      const pre = document.createElement('pre');
      pre.textContent = contents;
      article.replaceChildren(pre);
    }
    if (!article.querySelector('h1')) {
      const heading = document.createElement('h1');
      heading.textContent = filename;
      article.prepend(heading);
    }
    document.title = `${article.querySelector('h1').textContent} · ${document.title}`;
    download.href = source.href;
    download.hidden = false;
    if (reader.hash) {
      const fragment = decodeURIComponent(reader.hash.slice(1));
      const renamedHeadings = {
        'game-design-document': 'design-document',
        'player-manual--wiki': 'demo-manual--wiki',
        'player-manual-and-wiki': 'demo-manual-and-wiki',
      };
      const id = CSS.escape(fragment);
      const renamedId = renamedHeadings[fragment];
      const heading = article.querySelector(`#${id}`)
        ?? (renamedId ? article.querySelector(`#${renamedId}`) : null);
      heading?.scrollIntoView();
    }
  } catch {
    article.textContent = 'This file couldn’t open. Check the link or go back to the Bible.';
  }
  article.removeAttribute('aria-busy');
  return markdown;
}
