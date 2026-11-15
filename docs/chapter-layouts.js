import { createChapterTaskSheet } from './chapter-task-sheet.js';

export const chapterLayouts = [
  ['default', 'Default'],
  ['editorial', 'Editorial brief'],
  ['illustrative', 'Illustrative'],
  ['architect', 'Architect'],
  ['handoff', 'Build handoff'],
];

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

  function outline() {
    const index = document.createElement('nav');
    index.className = 'chapter-layout-outline';
    index.setAttribute('aria-label', 'On this page');
    const label = document.createElement('strong');
    label.textContent = 'On this page';
    const list = document.createElement('ul');
    for (const heading of headings) {
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
      review.replaceChildren(...(headings.length ? [outline()] : []), content, gallery);
    } else if (layout === 'handoff') {
      taskSheet ??= createChapterTaskSheet(chapter, options);
      review.replaceChildren(taskSheet, content, gallery);
    } else {
      review.replaceChildren(gallery, content);
    }
  };
}
