import { parseChapterGuide, parseWorkedExample } from './chapter-content.js';

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
    ['Summary', 'Set the player promise and decide what the first release needs to deliver.'],
    ['Project folders and Git', 'Set up or reuse Git and record where the code, assets, and planning documents live.'],
    ['Player promise, audience, and platforms', 'Say what players can do and why it matters to them. Name who it’s for and where they can play.'],
    ['First playable milestone and release scope', 'Name the smallest playable outcome that proves the idea. List what ships with it and what can wait.'],
    ['Open decisions', 'Record questions that still affect scope, who can answer them, and which work depends on the answers.'],
    ['Island Post', 'For the first browser release, a player can deliver one parcel across a rainy dock using touch or a keyboard.'],
  ]],
  ['Game Design Document', 'game-design-document', [
    ['Summary', 'Describe the experience and rules in enough detail for someone to build and test them.'],
    ['Player loop and intended experience', 'Follow one turn from entry through an action, its feedback, and the outcome. Say what should make the player want another turn.'],
    ['Mechanics', 'For each rule, describe the input, feedback, success, failure, and how the player recovers.'],
    ['Scene roadmap and dependencies', 'Outline what each scene introduces and which rules, art, and prior scenes it needs.'],
    ['Open design decisions', 'Record unanswered design questions and decide which need a prototype or playtest.'],
    ['Island Post', 'The Dock teaches dry routes. Market Lane adds wrapping. The Hill Route adds two deliveries and an optional step goal.'],
  ]],
  ['Engine & Assets', 'engine-and-assets', [
    ['Summary', 'Get a representative interaction running and account for the assets each scene needs.'],
    ['Engine and launch instructions', 'Record the engine, supported devices, and how to launch the game from a fresh checkout.'],
    ['Maps, characters, objects, interface, art, and sound', 'List what the player sees, hears, and interacts with. Map each item to the scenes that use it.'],
    ['Asset locations and readiness', 'Point to the current asset, identify placeholders, and record what still needs to be made or checked.'],
    ['Island Post', 'Run a courier on a tile map with a puddle tile, boardwalk, and parcel icons before building full routes.'],
  ]],
  ['Development Sandbox', 'development-sandbox', [
    ['Summary', 'Build one playable development scene before assembling player scenes. Move through it, use its objects and controls, and see the outcomes the game actually produces.'],
    ['Launch link or command', 'Document the development entry point or test-build shortcut so a contributor can open the sandbox and reset a case.'],
    ['Scenario and expected behavior', 'Name the starting state, play the case inside the sandbox, and reset to repeat it. Include failure and recovery where they matter.'],
    ['Build, platform, result, and evidence', 'Record what you ran, on which device or input, what happened, and where to see the result.'],
    ['Open failures and next checks', 'Identify the failed rule or asset, what work it blocks, and the check to repeat after the fix.'],
    ['Island Post', 'Cross a puddle with an unwrapped parcel, then a wrapped one. Confirm Retry restores a fresh parcel after a failed delivery.'],
  ]],
  ['Scene Scripts & Playtests', 'scene-scripts-and-playtests', [
    ['Summary', 'Assemble and playtest one complete scene at a time.'],
    ['Scene script', 'Write how the player enters, what they try to do, what characters say, and how each outcome moves them on.'],
    ['Mechanics and assets used', 'Link each scene to the rules and assets it uses, along with the sandbox checks that cover them.'],
    ['Playtest criteria, observations, fixes, and result', 'Set the player task before the test. Watch what happens, fix what blocks the experience, and record the retest.'],
    ['Island Post', 'Ask a first-time phone player to deliver to Mina. Watch whether they can find Retry after soaking a parcel.'],
  ]],
  ['Build & Play the Game', 'build-and-play-the-game', [
    ['Summary', 'Turn the assembled scenes into a game a player can install or open, then play through the build on its target.'],
    ['Build targets and steps', 'Record the startup scene, target, build or export command, and settings so someone else can make the same build.'],
    ['Package and launch', 'Package the required assets and dependencies. Test the installer or app package on a clean target, or open a staged web build in a fresh browser profile.'],
    ['Playthrough and evidence', 'Start from the player entry point and play the core loop across scenes. Record the build, target, steps, and result so the manual can use the verified build.'],
    ['Island Post', 'Open the staged browser build on a phone, start from the title screen, deliver to Mina, and continue to Market Lane.'],
  ]],
  ['Player Manual & Wiki', 'player-manual-and-wiki', [
    ['Summary', 'Help players learn the game and look up details from the build they actually play.'],
    ['In-game How to Play', 'Outline the controls, feedback, and first useful actions. Check that a new player can find the help and use it.'],
    ['Wiki topics and screenshots', 'Explain mechanics, items, and scenes with examples and screenshots from the release build.'],
    ['Published references', 'Record where the manual and wiki live. Check their links and confirm they match the current release.'],
    ['Island Post', 'Show the controls in How to Play. In the wiki, compare dry and wrapped parcels crossing the same puddle.'],
  ]],
  ['Release, Pricing & Marketing', 'release-pricing-and-marketing', [
    ['Summary', 'Decide how people get the game, verify the release, and show what players will actually do.'],
    ['Release scope, platform, price, and payment', 'Name what ships, where it’s available, and what it costs. Check payment and access if the release requires them.'],
    ['Readiness checks and release evidence', 'Run the exact candidate from the planned delivery path. Record its build and the result of playing the core loop.'],
    ['Store copy, screenshots, pitch, and links', 'Use the playable build to make launch material and verify that every published link leads where players expect.'],
    ['Island Post', 'Share the Dock preview, then prepare the three-route browser release using footage of an actual delivery.'],
  ]],
  ['Contributor Training', 'contributor-training', [
    ['Summary', 'Make it possible for someone new to contribute and check their own work.'],
    ['Setup, first task, and verification', 'Show how to launch the game and sandbox, make one representative change, and verify it.'],
    ['Decisions and references', 'Point to the rules, scripts, and checks a contributor needs to understand why the game works this way.'],
    ['Island Post', 'Have a teammate or agent add a small delivery route, run it in the game, and follow the documented checks.'],
  ]],
  ['Updates & DLC', 'updates-and-dlc', [
    ['Summary', 'Take a new feature or route through the same checks as the base game.'],
    ['Proposed changes, affected players, and release approach', 'State what changes, who gets it, and whether it ships as an update, expansion, or rehearsal.'],
    ['Sandbox, scene, and compatibility checks', 'Repeat affected scenarios and scenes. Check existing saves, access, and progress when the change touches them.'],
    ['Manual, wiki, and release notes', 'Update the player-facing material to explain what changed and how to use it.'],
    ['Island Post', 'Prove a new parcel rule in the sandbox, test the expansion route, and check that the original routes still work.'],
  ]],
  ['Intake & Feedback', 'intake-and-feedback', [
    ['Summary', 'Listen to prospects, players, and customers. Use what you learn to decide what to build next.'],
    ['Who to hear from', 'Include people who considered the game, people playing it now, and customers who have paid for it.'],
    ['Where feedback comes in and what to ask', 'Choose channels people can reach. Ask what they expected, what they tried, and what happened.'],
    ['Who reads, replies, and follows up', 'Assign an owner for each channel and record who handles follow-up.'],
    ['What people said or did', 'Capture the message or observation with its source, date, build, and enough context to understand it later.'],
    ['Patterns, urgent issues, and open questions', 'Group recurring reports, identify issues that need attention now, and note what needs another conversation.'],
    ['What returns to Chapter 1', 'Link the evidence to a scope decision and define how you’ll check whether the next release improves it.'],
    ['Island Post', 'Phone players miss Retry. Set a goal for the next release that a first-time player can recover from a wet delivery without coaching.'],
  ]],
];

const panels = [...chapters, ['Island Post (In-Progress)', 'island-post-example']];

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

function appendChapterSections(container, sections) {
  for (const [title, summary] of sections) {
    const callout = document.createElement('div');
    callout.className = 'callout';
    const heading = document.createElement('h4');
    const detail = document.createElement('p');
    heading.textContent = title;
    detail.textContent = summary;
    callout.append(heading, detail);
    container.append(callout);
  }
}

for (const [number, [title, slug, sections]] of panels.entries()) {
  const isExample = number === chapters.length;
  const card = document.createElement('article');
  card.className = isExample ? 'chapter worked-example' : 'chapter';
  card.id = slug;
  const label = isExample ? 'Example 1' : chapterLabel(number);
  card.innerHTML = `<header class="chapter-cover"><span class="chapter-number">${label}</span><h3>${title.replaceAll('&', '&amp;')}</h3><div class="chapter-actions"></div></header><div class="chapter-body"></div>`;
  const body = card.querySelector('.chapter-body');
  body.tabIndex = 0;
  body.setAttribute('role', 'region');
  body.setAttribute('aria-label', `${title} sections`);
  const actions = card.querySelector('.chapter-actions');
  if (isExample) {
    body.textContent = 'Loading example…';
    const markdown = document.createElement('a');
    markdown.className = 'chapter-link';
    const exampleUrl = new URL('./resources/island-post-example.md', import.meta.url);
    markdown.href = 'read.html?file=/resources/island-post-example.md';
    markdown.textContent = 'Read example';
    actions.append(markdown);
    fetch(exampleUrl, { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Worked example request failed: ${response.status}`);
        return response.text();
      })
      .then((source) => { body.innerHTML = parseWorkedExample(source, exampleUrl, readerUrl); })
      .catch((error) => {
        body.textContent = 'The example couldn’t load. Use Read example to open it.';
        console.error(error);
      });
  } else {
    appendChapterSections(body, sections);
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
    : 'Example 1';
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
  const number = panels.findIndex(([, slug]) => location.hash === '#' + slug);
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
