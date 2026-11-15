import { chapterLayoutPicker, chapterLayoutView } from './chapter-layouts.js';
import { createTicketCallout } from './ticket-callout.js';

function element(tag, name, value) {
  const output = document.createElement(tag);
  if (name) output.className = name;
  if (value) output.textContent = value;
  return output;
}

function button(label, action) {
  const control = element('button', '', label);
  control.type = 'button';
  control.onclick = action;
  return control;
}

function player(kind, source, title) {
  const media = element(kind);
  media.controls = true;
  media.preload = 'none';
  media.src = source;
  media.setAttribute('aria-label', title);
  if (kind === 'video') media.playsInline = true;
  return media;
}

function artifacts(content) {
  const items = [];
  for (const node of content.querySelectorAll('img, a[href]')) {
    if (node.localName === 'img') {
      const anchor = node.closest('p') ?? node;
      const caption = anchor.nextElementSibling?.querySelector('strong');
      items.push({
        title: caption?.textContent.replace(/\.$/, '') || node.alt || 'Image',
        caption: (caption && caption.parentElement.textContent.slice(caption.textContent.length).trim())
          || node.title || (caption && node.alt) || 'Chapter image.',
        media: node.cloneNode(), node: anchor,
      });
      continue;
    }
    if (node.querySelector('img')) continue;
    const url = new URL(node.href);
    if (!['http:', 'https:'].includes(url.protocol)) continue;
    const kind = /\.(wav|mp3|m4a|aac|oga|flac|ogg)$/i.test(url.pathname) ? 'audio'
      : /\.(mp4|webm|ogv|m4v)$/i.test(url.pathname) ? 'video' : null;
    const filename = url.pathname.split('/').at(-1);
    const title = node.textContent.trim() || filename || 'Chapter artifact';
    if (kind) {
      const inline = element('span', 'inline-media');
      inline.append(player(kind, url.href, title));
      node.after(inline);
      items.push({ title, caption: node.title || (kind === 'audio' ? 'Audio file: ' : 'Video file: ') + filename, media: player(kind, url.href, title), node });
    } else if (/\.(pdf|xlsx)$/i.test(url.pathname)
      || url.searchParams.has('sandbox')
      || (url.origin === location.origin && url.pathname.endsWith('/read.html') && url.searchParams.has('file'))) {
      const media = node.cloneNode(true);
      media.className = 'artifact-document';
      items.push({ title, caption: node.title || 'Linked chapter resource.', media, node });
    }
  }
  return items;
}

export function chapterWork(dialog, body, { loadTasks, audioPreview, taskSource } = {}) {
  const ticketCallout = createTicketCallout(dialog);
  dialog.addEventListener('close', () => ticketCallout?.close());
  const tabs = element('nav', 'chapter-work');
  tabs.setAttribute('aria-label', 'Chapter views');
  const reviewButton = button('Review', () => show('review'));
  const tasksButton = button('Tasks', () => show('tasks'));
  const back = button('Back to chapters', () => dialog.close());
  back.className = 'back';
  let layout = 'default';
  let showLayout;
  const picker = chapterLayoutPicker(next => {
    ticketCallout?.close();
    pause();
    layout = next;
    showLayout?.(layout);
    body.scrollTop = dialog.scrollTop = 0;
  });
  tabs.append(reviewButton, tasksButton, picker.label, back);
  body.before(tabs);
  const selections = new Map();
  const taskViews = new Map();
  let view, slug, review, tasks;
  const pause = (except) => body.querySelectorAll('audio, video').forEach(media => {
    if (media !== except) media.pause();
  });
  body.addEventListener('play', event => pause(event.target), true);

  function show(next) {
    if (!review || !body.contains(review)) return;
    if (view !== next) {
      ticketCallout?.close();
      pause();
    }
    view = next;
    review.hidden = view !== 'review';
    tasks.hidden = view !== 'tasks';
    picker.label.hidden = view !== 'review';
    reviewButton.setAttribute('aria-pressed', String(!review.hidden));
    tasksButton.setAttribute('aria-pressed', String(!tasks.hidden));
    if (view === 'tasks') {
      if (!tasks.hasChildNodes()) loadTasks?.(tasks, slug);
    }
    body.scrollTop = dialog.scrollTop = 0;
  }

  function render(chapter, next, checklist = []) {
    ticketCallout?.close();
    slug = chapter;
    const content = element('div', 'chapter-review-content');
    content.append(...body.childNodes);
    if (!checklist.length) {
      const source = [...content.querySelectorAll('h3, h4')].find(heading =>
        /^(?:tasks|open tasks|next actions|what to check|complete when)$/i.test(heading.textContent.trim()));
      const list = source?.nextElementSibling;
      if (list?.matches('ul, ol')) checklist = [...list.children].map(item => item.textContent);
    }
    if (audioPreview && slug === 'audio-engineering') {
      const source = element('a', '', 'Bedroom knock preview');
      source.href = audioPreview;
      source.title = 'WAV reconstruction of the synthesized bedroom knock.';
      content.append(source);
    }
    const items = artifacts(content);
    const gallery = element('section', 'chapter-gallery');
    gallery.setAttribute('aria-label', 'Chapter artifacts');
    function drawGallery(focus) {
      gallery.querySelector('audio, video')?.pause();
      if (!items.length) {
        gallery.replaceChildren(element('p', '', 'This chapter has no review artifact yet.'),
          button('Open chapter tasks', () => { show('tasks'); tasksButton.focus(); }));
        return;
      }
      const index = selections.get(chapter) ?? 0;
      const item = items[index];
      const media = element('div', 'artifact-media');
      media.append(item.media);
      const controls = element('div', 'artifact-controls');
      const arrows = element('div', 'artifact-arrows');
      const select = (direction) => {
        selections.set(chapter, (index + direction + items.length) % items.length);
        drawGallery(direction);
      };
      const previous = button('←', () => select(-1));
      const next = button('→', () => select(1));
      previous.setAttribute('aria-label', 'Previous artifact');
      next.setAttribute('aria-label', 'Next artifact');
      previous.disabled = next.disabled = items.length === 1;
      arrows.append(previous, element('span', '', (index + 1) + ' of ' + items.length), next);
      controls.append(element('strong', '', item.title), arrows);
      const caption = element('div', 'artifact-caption');
      caption.append(controls);
      if (item.caption) caption.append(element('p', '', item.caption));
      const context = button('See in chapter', () => {
        const section = item.node.closest('details');
        if (section) section.open = true;
        item.node.tabIndex = -1;
        item.node.focus({ preventScroll: true });
        item.node.scrollIntoView({ block: 'center' });
      });
      context.className = 'context-link';
      gallery.replaceChildren(media, caption, context);
      if (focus) (focus < 0 ? previous : next).focus();
    }
    drawGallery();
    review = element('div');
    showLayout = chapterLayoutView(review, gallery, content, chapter, { taskSource, ticketCallout });
    showLayout(layout);
    if (!taskViews.has(chapter)) {
      const panel = element('section', 'chapter-tasks');
      panel.setAttribute('aria-label', 'Chapter tasks');
      if (!loadTasks) {
        if (checklist.length) {
          const list = element('ul');
          list.append(...checklist.map(task => element('li', '', task)));
          panel.append(list);
        } else {
          panel.append(element('p', '', 'This project has no chapter tasks listed here.'));
        }
      }
      taskViews.set(chapter, panel);
    }
    tasks = taskViews.get(chapter);
    body.replaceChildren(review, tasks);
    show(next);
  }
  return { render, pause, get view() { return view; } };
}
