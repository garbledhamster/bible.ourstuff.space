import { parseChapterGuide } from './chapter-content.js';

const guideUrl = new URL('./resources/game-bible-guide.md', import.meta.url);
const readerUrl = new URL('./read.html', import.meta.url);
let chapterRequest;

function loadChapterContent() {
  chapterRequest ??= fetch(guideUrl, { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`Chapter guide request failed: ${response.status}`);
      return response.text();
    })
    .then((source) => parseChapterGuide(source, guideUrl, readerUrl))
    .catch((error) => {
      chapterRequest = undefined;
      throw error;
    });
  return chapterRequest;
}

const chapters = [
  ['Vision & Scope', 'vision-and-scope', [
    'Gather source material and note what it tells you.',
    'Map the Git repository and project folders.',
    'Name the audience, platform, and player promise.',
    'Study similar projects and record what to try.',
    'Pick the first playable milestone and cut list.',
    'Assign open decisions and their next checks.',
  ], 'Read the one-delivery scope'],
  ['Design Document', 'design-document', [
    'Walk through the core task from start to outcome.',
    'Write each rule, its feedback, and how to recover.',
    'Map the screens, scenes, and what each needs.',
    'Pick a check for each open design question.',
  ], 'See the Dock map and rules'],
  ['UI & UX Design', 'ui-and-ux-design', [
    'Sketch the next action and status at each step.',
    'Group related controls and trim repeated copy.',
    'Plan the art and states for buttons, HUDs, and frames.',
    'Try the flow on its smallest and largest screens.',
  ], 'Compare the HUD sketch and phone capture'],
  ['Engine & Assets', 'engine-and-assets', [
    'Record the engine, targets, and launch command.',
    'Run one interaction with representative assets.',
    'List the art, sound, and controls each scene needs.',
    'Link the artwork and states to the controls that load them.',
  ], 'Inspect the art and asset ledger'],
  ['Audio Engineering', 'audio-engineering', [
    'List what players hear and which game events trigger it.',
    'Plan the music for the release, including where to use silence.',
    'Make the effects and record the lines for one scene.',
    'Track sources, permissions, captions, and export files.',
    'Set the mix, mute controls, and loop behavior.',
    'Listen to a resettable encounter on target devices.',
  ], 'Hear the puddle splash and Mina’s handoff'],
  ['Development Sandbox', 'development-sandbox', [
    'Give developers a separate launch path.',
    'Make each mechanic playable from a named start.',
    'Add a roster and test each NPC outcome.',
    'Reset each case and record results on target inputs.',
    'Log failures and the checks to repeat.',
  ], 'Open the Sandbox and case results'],
  ['Scene Scripts & Playtests', 'scene-scripts-and-playtests', [
    'Script the entrance, player choice, and outcomes.',
    'Link the scene to its rules, assets, and passing cases.',
    'Give a new player a task and observe without coaching.',
    'Record fixes and repeat the affected path.',
  ], 'Read the scene script and playtest record'],
  ['Build & Play the Game', 'build-and-play-the-game', [
    'Record the target, startup scene, and build command.',
    'Package the assets and open a fresh player session.',
    'Play through success, failure, and recovery.',
    'Save the build ID, target, and result.',
  ], 'Play the verified Dock build'],
  ['Demo, Manual & Wiki', 'demo-manual-and-wiki', [
    'Turn passing Sandbox cases into a playable demo.',
    'Write a walkthrough that leads back to practice.',
    'Add lookup pages for rules players ask about.',
    'Capture the demo and give viewers a link to try it.',
  ], 'Try the walkthrough and Wet Parcels wiki'],
  ['Release, Pricing & Marketing', 'release-pricing-and-marketing', [
    'Set what ships, where to get it, and what it costs.',
    'Verify the candidate through its delivery path.',
    'Write the pitch and capture screenshots from play.',
    'Open the public links as a new player.',
  ], 'See the public release kit'],
  ['Contributor Training', 'contributor-training', [
    'Write clean checkout and launch steps.',
    'Give a new contributor one small task.',
    'Link the rules and assets they need.',
    'Have them run the checks and save the result.',
  ], 'Try the contributor exercise'],
  ['Multiplayer & Multi-user Support', 'multiplayer-and-multi-user-support', [
    'Choose shared screen, split screen, or online play.',
    'Carry shared rules and a two-player proof from early chapters.',
    'Finish an encounter with independent players and shared outcomes.',
    'Verify local joining, remote hosting, and recovery in scope.',
    'Record capacity, persistence, and operating evidence.',
  ], 'Read the single-player scope decision'],
  ['Updates & DLC', 'updates-and-dlc', [
    'Describe the change, who gets it, and how it ships.',
    'Repeat the affected Sandbox and scene checks.',
    'Check existing progress and access when they apply.',
    'Update the help, release notes, and captures.',
  ], 'Read the update rehearsal'],
  ['Intake & Feedback', 'intake-and-feedback', [
    'Pick who to hear from and where they can reply.',
    'Assign intake, response, and follow-up.',
    'Save observations with the build and context.',
    'Group repeat reports and flag urgent issues.',
    'Bring a finding and a success check back to scope.',
  ], 'Trace a feedback rehearsal back to scope'],
];

const panels = [...chapters, ['Island Post', 'island-post-example']];
const exampleReader = 'read.html?file=/resources/island-post-example.md';

const rail = document.querySelector('#rail');
const previous = document.querySelector('#prev');
const next = document.querySelector('#next');
const position = document.querySelector('#position');
const drawer = document.querySelector('#references');
const chapterChoices = document.querySelector('#chapter-choices');
const chapterDialog = document.querySelector('#chapter-dialog');
const chapterDialogBody = chapterDialog.querySelector('.chapter-detail-body');
const chapterDialogTitle = chapterDialog.querySelector('h2');
const chapterDialogNumber = chapterDialog.querySelector('.chapter-number');
const chapterPrevious = document.querySelector('#chapter-previous');
const chapterNext = document.querySelector('#chapter-next');
let current = 0;
let scrollFrame = 0;
let openChapterIndex = 0;
let chapterDrag;

function chapterLabel(index) {
  return `Chapter ${String(index + 1).padStart(2, '0')}`;
}

async function renderOpenChapter(index) {
  const [title, slug] = chapters[index];
  const focused = document.activeElement;
  openChapterIndex = index;
  chapterDialog.dataset.chapter = slug;
  chapterDialogNumber.textContent = chapterLabel(index);
  chapterDialogTitle.textContent = title;
  chapterDialogBody.textContent = 'Loading chapter…';
  chapterPrevious.disabled = index === 0;
  chapterNext.disabled = index === chapters.length - 1;
  if (focused === chapterPrevious && chapterPrevious.disabled) chapterNext.focus();
  if (focused === chapterNext && chapterNext.disabled) chapterPrevious.focus();

  try {
    const chapterContent = await loadChapterContent();
    if (openChapterIndex !== index) return;
    if (!Object.hasOwn(chapterContent, slug)) throw new Error(`Chapter missing from guide: ${slug}`);
    chapterDialogBody.innerHTML = chapterContent[slug];
    chapterDialogBody.scrollTop = 0;
  } catch (error) {
    if (openChapterIndex !== index) return;
    chapterDialogBody.textContent = 'The chapter guide couldn’t load. Reopen the chapter to try again.';
    console.error(error);
  }
}

function moveOpenChapter(direction) {
  const index = openChapterIndex + direction;
  if (index < 0 || index >= chapters.length) return;
  renderOpenChapter(index);
  showPanel(index);
}

chapterPrevious.addEventListener('click', () => moveOpenChapter(-1));
chapterNext.addEventListener('click', () => moveOpenChapter(1));
chapterDialog.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  moveOpenChapter(event.key === 'ArrowLeft' ? -1 : 1);
});
chapterDialog.addEventListener('close', () => {
  chapterDrag = undefined;
  rail.children[openChapterIndex].querySelector('button.chapter-link').focus({ preventScroll: true });
});

chapterDialog.addEventListener('pointerdown', (event) => {
  chapterDrag = undefined;
  if (!event.isPrimary || event.button !== 0 || event.shiftKey ||
      event.target === chapterDialog || event.target.closest('a, button')) return;
  chapterDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
});
window.addEventListener('pointercancel', (event) => {
  if (chapterDrag?.pointerId === event.pointerId) chapterDrag = undefined;
});
window.addEventListener('blur', () => { chapterDrag = undefined; });
window.addEventListener('pointerup', (event) => {
  if (chapterDrag?.pointerId !== event.pointerId) return;
  const dx = event.clientX - chapterDrag.x;
  const dy = event.clientY - chapterDrag.y;
  chapterDrag = undefined;
  if (!chapterDialog.open || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

  const previousIndex = openChapterIndex;
  moveOpenChapter(dx < 0 ? 1 : -1);
  if (event.pointerType === 'mouse' && openChapterIndex !== previousIndex) {
    window.getSelection()?.removeAllRanges();
  }
});

function appendChapterActions(container, steps, example, slug) {
  const list = document.createElement('ol');
  list.className = 'chapter-steps';
  for (const step of steps) {
    const item = document.createElement('li');
    item.textContent = step;
    list.append(item);
  }
  const callout = document.createElement('a');
  callout.className = 'chapter-example';
  callout.href = `${exampleReader}#${slug}`;
  const label = document.createElement('strong');
  label.textContent = 'Island Post example';
  const action = document.createElement('span');
  action.textContent = example;
  callout.append(label, action);
  container.append(list, callout);
}

for (const [number, [title, slug, steps, example]] of panels.entries()) {
  const isExample = number === chapters.length;
  const card = document.createElement('article');
  card.className = isExample ? 'chapter worked-example' : 'chapter';
  card.id = slug;
  const label = isExample ? 'Playable example' : chapterLabel(number);
  card.innerHTML = `<header class="chapter-cover"><span class="chapter-number">${label}</span><h3>${title.replaceAll('&', '&amp;')}</h3><div class="chapter-actions"></div></header><div class="chapter-body"></div>`;
  const body = card.querySelector('.chapter-body');
  body.tabIndex = 0;
  body.setAttribute('role', 'region');
  body.setAttribute('aria-label', isExample ? 'Island Post showcase' : `${title} actions`);
  const actions = card.querySelector('.chapter-actions');
  if (isExample) {
    actions.innerHTML = `<a class="chapter-link" href="island-post/">Play the Dock</a><a class="chapter-link" href="${exampleReader}">Read the case study</a>`;
    body.innerHTML = `<img src="resources/island-post/evidence/ui-dock.jpg" alt="The courier at the fork between the puddle and dry boardwalk" width="790" height="900" loading="lazy">
      <p>Bring Mina a dry parcel. The shortcut looks tempting.</p>
      <p>Play the delivery, then follow it through the Project Bible.</p>
      <a class="chapter-example" href="island-post/sandbox/"><strong>Development Sandbox</strong><span>Play the resettable Dock cases</span></a>`;
  } else {
    appendChapterActions(body, steps, example, slug);
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'chapter-link';
    open.textContent = 'Open Chapter';
    open.setAttribute('aria-label', `Open Chapter ${number + 1} · ${title}`);
    open.setAttribute('aria-haspopup', 'dialog');
    open.addEventListener('click', () => {
      renderOpenChapter(number);
      chapterDialog.showModal();
    });
    actions.append(open);
    if (number === 0) {
      const play = document.createElement('a');
      play.className = 'chapter-link';
      play.href = 'island-post/';
      play.textContent = 'Play Island Post';
      actions.append(play);
    }
  }
  if (slug === 'intake-and-feedback') {
    const restart = document.createElement('a');
    restart.className = 'chapter-link';
    restart.href = '#vision-and-scope';
    restart.textContent = '↺ Back to Chapter 1';
    restart.addEventListener('click', (event) => {
      event.preventDefault();
      history.replaceState(null, '', restart.href);
      showPanel(0);
      const heading = rail.children[0].querySelector('h3');
      heading.tabIndex = -1;
      heading.focus();
    });
    actions.append(restart);
  }
  rail.append(card);
  const choice = document.createElement('a');
  choice.className = 'chapter-cover chapter-choice';
  choice.href = '#' + slug;
  choice.dataset.chapter = slug;
  const chapterNumber = card.querySelector('.chapter-number').cloneNode(true);
  const chapterTitle = document.createElement('span');
  chapterTitle.className = 'chapter-choice-title';
  chapterTitle.textContent = title;
  choice.append(chapterNumber, chapterTitle);
  choice.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.replaceState(null, '', choice.href);
    drawer.close();
    showPanel(number);
    const heading = card.querySelector('h3');
    heading.tabIndex = -1;
    heading.focus({preventScroll: true});
  });
  chapterChoices.append(choice);
}

function renderPanelPosition() {
  position.textContent = current < chapters.length
    ? `${String(current + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`
    : 'Example';
  previous.disabled = current === 0;
  next.disabled = current === panels.length - 1;
  next.setAttribute('aria-label', current === chapters.length - 1 ? 'Go to Island Post example' : 'Next chapter');
}

function showPanel(number) {
  current = Math.min(panels.length - 1, Math.max(0, number));
  rail.scrollTo({left: panelScrollLeft(current), behavior: 'instant'});
  renderPanelPosition();
}

function panelScrollLeft(number) {
  const start = rail.children[0].offsetLeft;
  const end = rail.scrollWidth - rail.clientWidth;
  return Math.min(end, rail.children[number].offsetLeft - start);
}

document.addEventListener('wheel', (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey ||
      Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

  const openDialog = document.querySelector('dialog[open]');
  if (openDialog && (openDialog !== drawer || !chapterChoices.contains(event.target))) return;

  const list = event.target.closest('.chapter-body');
  if (list && list.scrollHeight > list.clientHeight) return;

  const scroller = openDialog ? chapterChoices : rail;
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 :
    event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? scroller.clientWidth : 1;
  event.preventDefault();
  scroller.scrollLeft += event.deltaY * unit;
}, { passive: false });

rail.addEventListener('scroll', () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => {
    if (Math.abs(panelScrollLeft(current) - rail.scrollLeft) < 3) return;
    const end = rail.scrollWidth - rail.clientWidth;
    if (end - rail.scrollLeft < 3) {
      current = panels.length - 1;
    } else {
      const start = rail.children[0].offsetLeft;
      const distance = (card) => Math.abs(card.offsetLeft - start - rail.scrollLeft);
      const cards = [...rail.children];
      current = cards.indexOf(cards.reduce((nearest, card) => distance(card) < distance(nearest) ? card : nearest));
    }
    renderPanelPosition();
  });
}, {passive:true});
previous.addEventListener('click', () => showPanel(current - 1));
next.addEventListener('click', () => showPanel(current + 1));
function updateReferenceSeparators() {
  for (const bullet of drawer.querySelectorAll('.separator')) {
    const top = bullet.getBoundingClientRect().top;
    const leftTop = bullet.previousElementSibling.getBoundingClientRect().top;
    const rightTop = bullet.nextElementSibling.getBoundingClientRect().top;
    bullet.style.visibility = Math.abs(top - leftTop) < 3 && Math.abs(top - rightTop) < 3 ? '' : 'hidden';
  }
}

document.querySelector('#quick').addEventListener('click', () => {
  drawer.showModal();
  for (const [number, choice] of [...chapterChoices.children].entries()) {
    if (number === current) choice.setAttribute('aria-current', 'location');
    else choice.removeAttribute('aria-current');
  }
  const firstChoice = chapterChoices.firstElementChild;
  chapterChoices.scrollLeft = chapterChoices.children[current].offsetLeft - firstChoice.offsetLeft;
  updateReferenceSeparators();
});
for (const button of document.querySelectorAll('[data-info-dialog]')) {
  const dialog = document.getElementById(button.dataset.infoDialog);
  button.addEventListener('click', () => dialog.showModal());
}

rail.addEventListener('keydown', (event) => {
  if (event.target !== rail) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPanel(current + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});

for (const [number, group] of [document.querySelector('.resources'), drawer].entries()) {
  const description = group.querySelector('.link-description');
  description.id = 'resource-description-' + number;
  for (const item of group.querySelectorAll('[data-description]')) {
    const show = () => {
      description.textContent = item.dataset.description;
      description.hidden = false;
      item.setAttribute('aria-describedby', description.id);
    };
    const hide = () => {
      description.hidden = true;
      item.removeAttribute('aria-describedby');
    };
    item.addEventListener('pointerenter', show);
    item.addEventListener('pointerleave', () => {
      if (document.activeElement !== item || !item.matches(':focus-visible')) hide();
    });
    item.addEventListener('focus', show);
    item.addEventListener('blur', hide);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hide();
    });
  }
}

function showLinkedPanel() {
  const renamedChapters = {
    '#game-design-document': '#design-document',
    '#player-manual-and-wiki': '#demo-manual-and-wiki',
  };
  const fragment = renamedChapters[location.hash] ?? location.hash;
  const number = panels.findIndex(([, slug]) => fragment === '#' + slug);
  if (number !== -1) showPanel(number);
}

window.addEventListener('resize', () => {
  renderPanelPosition();
  if (drawer.open) updateReferenceSeparators();
});
document.fonts.ready.then(() => {
  if (drawer.open) updateReferenceSeparators();
});
window.addEventListener('hashchange', showLinkedPanel);
renderPanelPosition();
showLinkedPanel();
