const modes = [
  ['Explore', 'Find where the idea can improve, generate alternatives, and recommend a small test.'],
  ['Grilling', 'Work through decisions with the creator. Keep the questions, recommendations, and attributed human and agent answers in the Bible’s grilling record.'],
  ['Plan', 'Review how the whole release fits together and turn the decisions into build tasks.'],
  ['Build', 'Build the agreed scope and run the checks needed to assemble a complete candidate.'],
  ['Testing', 'Try the complete release through its real user journeys and record what passed or needs work.'],
  ['Maintenance', 'Use feedback from the shipped release to guide fixes and updates, then verify them.'],
];

async function readMode(endpoint) {
  const response = await fetch(endpoint, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Couldn’t load the Work mode.');
  return response.json();
}

async function readSourceMode(source) {
  if (!source) return '';
  try {
    const response = await fetch(source.href, { cache: 'no-store' });
    if (!response.ok) return '';
    const opening = (await response.text()).split(/^##[ \t]/m, 1)[0];
    const mode = opening.match(/^\*\*(?:Work mode|Current phase):\*\*[ \t]*([^\r\n]*)/m)?.[1].trim();
    return modes.some(([name]) => name === mode) ? mode : '';
  } catch {
    return '';
  }
}

export async function showProjectPhase() {
  const project = document.querySelector('.project-masthead-name');
  if (!project || document.querySelector('.bible-phase')) return;
  const source = document.querySelector('link[rel="alternate"][type="text/markdown"][title$="Project Bible source"]');
  const endpoint = new URL('api/work-mode', location.href);

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('project-phases.css', import.meta.url);
  document.head.append(stylesheet);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bible-phase';
  button.setAttribute('aria-haspopup', 'dialog');
  button.textContent = 'Work mode';

  const dialog = document.createElement('dialog');
  dialog.className = 'bible-update bible-phases';
  dialog.setAttribute('aria-labelledby', 'bible-phases-title');
  dialog.innerHTML = `
    <form method="dialog"><button class="close" aria-label="Close Work mode" autofocus>×</button></form>
    <h2 id="bible-phases-title">Work mode</h2>
    <section data-picker>
      <p class="bible-mode-order">Recommended order for a new project. Switch modes as needed.</p>
      <fieldset aria-label="Choose a Work mode" disabled></fieldset>
      <p role="status"></p>
      <div class="bible-update-actions">
        <button type="button" data-current-prompt hidden>Show agent prompt</button>
        <button type="button" data-save hidden disabled>Set Work mode</button>
      </div>
    </section>
    <section data-confirmation hidden>
      <p>Paste this into your chat if the agent needs help picking up the selected mode.</p>
      <label for="bible-work-mode-prompt">Prompt for your agent</label>
      <textarea id="bible-work-mode-prompt" rows="7" readonly></textarea>
      <p role="status"></p>
      <div class="bible-update-actions">
        <button type="button" data-back>Back</button>
        <button type="button" data-copy>Copy prompt</button>
      </div>
    </section>`;

  const title = dialog.querySelector('h2');
  const picker = dialog.querySelector('[data-picker]');
  const fieldset = picker.querySelector('fieldset');
  const status = picker.querySelector('[role="status"]');
  const save = picker.querySelector('[data-save]');
  const currentPrompt = picker.querySelector('[data-current-prompt]');
  const confirmation = dialog.querySelector('[data-confirmation]');
  const prompt = confirmation.querySelector('textarea');
  const copy = confirmation.querySelector('[data-copy]');
  const copyStatus = confirmation.querySelector('[role="status"]');
  let snapshot;
  let activeMode = '';
  let busy = false;

  for (const [index, [name, summary]] of modes.entries()) {
    const label = document.createElement('label');
    label.className = 'bible-mode-option';
    label.innerHTML = '<input type="radio" name="work-mode"><span><strong></strong> <span class="bible-mode-active" hidden>Active</span><span class="bible-mode-summary"></span></span>';
    label.querySelector('input').value = name;
    label.querySelector('strong').textContent = `${index + 1}. ${name}`;
    label.querySelector('.bible-mode-summary').textContent = summary;
    fieldset.append(label);
  }

  function selectedMode() {
    return fieldset.querySelector('input:checked')?.value;
  }

  function updateControls() {
    fieldset.disabled = busy || !snapshot;
    save.hidden = !snapshot;
    save.disabled = busy || !selectedMode() || selectedMode() === activeMode;
    currentPrompt.hidden = !activeMode;
    currentPrompt.disabled = busy;
  }

  function showActiveMode() {
    const number = modes.findIndex(([name]) => name === activeMode) + 1;
    button.textContent = number ? `Work mode · ${number}. ${activeMode}` : 'Work mode not set';
    for (const input of fieldset.querySelectorAll('input')) {
      input.checked = input.value === activeMode;
      input.closest('label').querySelector('.bible-mode-active').hidden = !input.checked;
    }
    updateControls();
  }

  const initial = (async () => {
    try {
      snapshot = await readMode(endpoint);
    } catch {
      snapshot = null;
    }
    activeMode = snapshot ? (snapshot.mode ?? '') : await readSourceMode(source);
    showActiveMode();
  })();

  function showPicker() {
    confirmation.hidden = true;
    picker.hidden = false;
    title.textContent = 'Work mode';
  }

  function showPrompt(saved) {
    title.textContent = saved ? `Work mode set to ${activeMode}` : `${activeMode} prompt`;
    const summary = modes.find(([name]) => name === activeMode)[1];
    prompt.value = `Use ${activeMode} for ${project.textContent.trim()}. Read the Project Bible skill and follow the ${activeMode} instructions in the chapter we’re discussing. ${summary} Tell me what we should do next.`;
    if (activeMode === 'Explore') {
      prompt.value += ' Use the Explore playbook. Start from evidence, frame the question, generate distinct ideas before judging them, and compare the strongest options. Save findings, proposals and the next question or test in a draft section or note linked from the owning chapter.';
    } else if (activeMode === 'Plan') {
      prompt.value += ' At the end of Plan, draft the relevant Bible chapters from the Grilling decisions and agreed scope before building.';
    } else if (activeMode === 'Build') {
      prompt.value += ' Start from the chapters drafted after Grilling and Plan. Update the owning chapter as each piece is built, with what changed, the working result and the checks you ran.';
    } else {
      prompt.value += ' Record the decisions or results and link the evidence in the owning chapter.';
    }
    copyStatus.textContent = '';
    picker.hidden = true;
    confirmation.hidden = false;
    copy.focus();
  }

  fieldset.addEventListener('change', updateControls);
  button.addEventListener('click', async () => {
    await initial;
    if (dialog.open) return;
    showPicker();
    dialog.showModal();
    if (busy) return;
    busy = true;
    status.textContent = 'Checking the saved Work mode…';
    updateControls();
    try {
      snapshot = await readMode(endpoint);
      if (snapshot) activeMode = snapshot.mode ?? '';
      else activeMode = await readSourceMode(source);
      status.textContent = snapshot ? '' : 'Change the Work mode in the project’s private reader or its Markdown file.';
    } catch (error) {
      snapshot = null;
      status.textContent = error.message;
    } finally {
      busy = false;
      showActiveMode();
    }
  });

  save.addEventListener('click', async () => {
    const mode = selectedMode();
    if (save.disabled) return;
    busy = true;
    updateControls();
    status.textContent = 'Saving Work mode…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bible-Work-Mode': '1' },
        body: JSON.stringify({ mode, revision: snapshot.revision }),
      });
      const result = await response.json();
      if (response.status === 409) {
        snapshot = await readMode(endpoint);
        activeMode = snapshot?.mode ?? '';
        showActiveMode();
      }
      if (!response.ok) throw new Error(result.message);
      snapshot = result;
      activeMode = result.mode;
      showActiveMode();
      status.textContent = '';
      if (dialog.open) showPrompt(true);
    } catch (error) {
      status.textContent = error.message || 'Couldn’t save the Work mode.';
      if (dialog.open) status.scrollIntoView({ block: 'nearest' });
    } finally {
      busy = false;
      updateControls();
    }
  });

  currentPrompt.addEventListener('click', () => showPrompt(false));
  confirmation.querySelector('[data-back]').addEventListener('click', () => {
    showPicker();
    currentPrompt.focus();
  });
  copy.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(prompt.value);
      copyStatus.textContent = 'Prompt copied.';
    } catch {
      prompt.focus();
      prompt.select();
      copyStatus.textContent = document.execCommand('copy')
        ? 'Prompt copied.' : 'Copy the selected text to paste it into your chat.';
    }
  });

  document.body.append(dialog);
  project.after(button);
  await initial;
}
