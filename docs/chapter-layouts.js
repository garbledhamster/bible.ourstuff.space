import { createChapterTaskSheet } from './chapter-task-sheet.js';

export const chapterLayouts = [
  ['default', 'Default'],
  ['editorial', 'Editorial brief'],
  ['illustrative', 'Illustrative'],
  ['architect', 'Architect'],
  ['handoff', 'Build handoff'],
  ['queue', 'Work queue'],
  ['marketing', 'Marketing brief'],
];

const marketingTopics = /\b(?:audiences?|positioning|messaging|offer|pricing|price|payment|launch|release (?:scope|plans?|evidence|readiness|assets?)|readiness checks|distribution|marketing|campaigns?|store(?:front| copy)|screenshots?|trailers?|press kits?|pitch|promotional|public demo)\b/i;

export function chapterLayoutPicker(onChange) {
  const label = document.createElement('label');
  label.className = 'chapter-layout-control';
  label.append('Layout');
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Chapter layout');
  for (const [id, name] of chapterLayouts) select.add(new Option(name, id));
  select.addEventListener('change', () => onChange(select.value));
  // Reader shells use horizontal arrow keys to move between chapters.
  select.addEventListener('keydown', event => event.stopPropagation());
  label.append(select);
  return { label, select };
}

export function chapterLayoutView(review, gallery, content, chapter, options) {
  const original = [...content.childNodes];
  const headings = original.filter(node => node.matches?.('h3'));
  review.toggleAttribute('data-has-outline', headings.length > 0);
  const sections = new Map();
  let taskSheet;
  let workQueue;
  let marketingIndex;

  function outline(entries, title) {
    const index = document.createElement('nav');
    index.className = 'chapter-layout-outline';
    index.setAttribute('aria-label', title);
    const label = document.createElement('strong');
    label.textContent = title;
    const list = document.createElement('ul');
    for (const heading of entries) {
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent;
      link.addEventListener('click', event => {
        event.preventDefault();
        const section = sections.get(heading);
        if (section) section.open = true;
        const target = section?.firstElementChild ?? heading;
        if (!section) target.tabIndex = -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'nearest' });
      });
      row.append(link);
      list.append(row);
    }
    index.append(label, list);
    return index;
  }

  function marketingReferences() {
    const entries = original.filter(node =>
      node.matches?.('h3, h4, h5, h6') && marketingTopics.test(node.textContent));
    if (entries.length) return outline(entries, 'Marketing references');
    const empty = document.createElement('p');
    empty.className = 'chapter-marketing-empty';
    empty.textContent = 'No marketing sections found in this chapter.';
    return empty;
  }

  function foldSections() {
    const fragment = document.createDocumentFragment();
    let target = fragment;
    for (const node of original) {
      if (headings.includes(node)) {
        const section = document.createElement('details');
        const summary = document.createElement('summary');
        summary.append(node);
        section.append(summary);
        section.open = sections.size === 0;
        sections.set(node, section);
        fragment.append(section);
        target = section;
      } else {
        target.append(node);
      }
    }
    content.replaceChildren(fragment);
  }

  return function showLayout(layout) {
    if (sections.size) {
      content.replaceChildren(...original);
      sections.clear();
    }
    review.dataset.layout = layout;
    if (layout === 'editorial' || layout === 'architect') {
      if (layout === 'architect') foldSections();
      review.replaceChildren(...(headings.length ? [outline(headings, 'On this page')] : []), content, gallery);
    } else if (layout === 'handoff') {
      taskSheet ??= createChapterTaskSheet(chapter, options);
      review.replaceChildren(taskSheet, content, gallery);
    } else if (layout === 'queue') {
      workQueue ??= createChapterTaskSheet(chapter, { ...options, queue: true });
      review.replaceChildren(workQueue, content, gallery);
    } else if (layout === 'marketing') {
      marketingIndex ??= marketingReferences();
      review.replaceChildren(marketingIndex, content, gallery);
    } else {
      review.replaceChildren(gallery, content);
    }
  };
}
