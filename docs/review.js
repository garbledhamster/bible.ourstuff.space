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

function audio(source) {
  const player = element('audio');
  player.controls = true;
  player.preload = 'none';
  player.src = source;
  return player;
}

function artifacts(content) {
  const images = [...content.querySelectorAll('img')].map(image => {
    const node = image.closest('p') ?? image;
    const caption = node.nextElementSibling?.querySelector('strong');
    return {
      title: caption?.textContent.replace(/\.$/, '') || image.alt,
      caption: caption ? caption.parentElement.textContent.slice(caption.textContent.length).trim() : '',
      media: image.cloneNode(), node,
    };
  });
  const links = [...content.querySelectorAll('a')].filter(link => {
    const url = new URL(link.href);
    return /\.(pdf|xlsx|wav|mp3|mp4|webm)$/i.test(url.pathname)
      || url.searchParams.has('sandbox')
      || link.origin === location.origin && link.pathname.endsWith('/read.html') && !!url.searchParams.get('file');
  }).map(node => {
    const url = new URL(node.href);
    const media = /\.(wav|mp3)$/i.test(url.pathname) ? audio(url.href) : node.cloneNode(true);
    if (media.localName === 'a') media.className = 'artifact-document';
    return { title: node.textContent, caption: node.title, media, node };
  });
  return [...images, ...links];
}

export function chapterWork(dialog, body, { loadTasks, audioPreview } = {}) {
  const tabs = element('nav', 'chapter-work');
  tabs.setAttribute('aria-label', 'Chapter views');
  const reviewButton = button('Review', () => show('review'));
  const tasksButton = button('Tasks', () => show('tasks'));
  const back = button('Back to chapters', () => dialog.close());
  back.className = 'back';
  tabs.append(reviewButton, tasksButton, back);
  body.before(tabs);
  const selections = new Map();
  const taskViews = new Map();
  let view, slug, review, tasks;
  const pause = () => body.querySelectorAll('audio, video').forEach(media => media.pause());

  function show(next) {
    if (!review || !body.contains(review)) return;
    view = next;
    review.hidden = view !== 'review';
    tasks.hidden = view !== 'tasks';
    reviewButton.setAttribute('aria-pressed', String(!review.hidden));
    tasksButton.setAttribute('aria-pressed', String(!tasks.hidden));
    if (view === 'tasks') {
      pause();
      if (!tasks.hasChildNodes()) loadTasks?.(tasks, slug);
    }
    body.scrollTop = 0;
  }

  function render(chapter, next, checklist = []) {
    slug = chapter;
    const content = element('div', 'chapter-review-content');
    content.append(...body.childNodes);
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
      gallery.querySelector('audio')?.pause();
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
    review.append(gallery, content);
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
