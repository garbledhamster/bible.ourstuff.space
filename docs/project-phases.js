const phases = [
  ['Grilling', 'Work through the chapters with the creator and record the decisions for the release.'],
  ['Plan', 'Use Ask Edwards’s gestalt lens to review the whole idea, then outline build tasks from the decisions in every applicable chapter.'],
  ['Build', 'Build the agreed scope. Run the small checks needed to assemble a complete candidate.'],
  ['Testing', 'Run the major checks on the complete product. Fix issues and retest until it is ready to show and ship.'],
  ['Maintenance', 'After release or handoff, collect feedback and make edits, fixes, and updates.'],
];

export async function showProjectPhase() {
  const project = document.querySelector('.project-masthead-name');
  if (!project || document.querySelector(".bible-phase")) return;
  const source = document.querySelector('link[rel="alternate"][type="text/markdown"][title$="Project Bible source"]');
  let current = -1;
  let label = 'Phase not set';
  if (source) {
    try {
      const response = await fetch(source.href, { cache: 'no-store' });
      if (!response.ok) throw new Error('Project Bible unavailable');
      const opening = (await response.text()).split(/^##[ \t]/m, 1)[0];
      const phase = opening.match(/^\*\*Current phase:\*\*[ \t]+([^\r\n]+)$/m)?.[1].trim();
      current = phases.findIndex(([name]) => name === phase);
      if (current >= 0) label = `Phase ${current + 1} of ${phases.length} · ${phases[current][0]}`;
    } catch {
      label = 'Phase unavailable';
    }
  }

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('project-phases.css', import.meta.url);
  document.head.append(stylesheet);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bible-phase';
  button.setAttribute('aria-haspopup', 'dialog');
  button.textContent = label;

  const dialog = document.createElement('dialog');
  dialog.className = 'bible-update bible-phases';
  dialog.setAttribute('aria-labelledby', 'bible-phases-title');
  dialog.innerHTML = `
    <form method="dialog"><button class="close" aria-label="Close project phases" autofocus>×</button></form>
    <h2 id="bible-phases-title">Project phases</h2>
    <ol role="list"></ol>`;
  const list = dialog.querySelector('ol');
  phases.forEach(([name, summary], index) => {
    const item = document.createElement('li');
    const heading = document.createElement('strong');
    heading.textContent = `${index + 1}. ${name}`;
    item.append(heading);
    if (index === current) {
      item.setAttribute('aria-current', 'step');
      const flag = document.createElement('span');
      flag.textContent = 'Current phase';
      heading.after(flag);
    }
    const description = document.createElement('p');
    description.textContent = summary;
    item.append(description);
    list.append(item);
  });
  document.body.append(dialog);
  project.after(button);
  button.addEventListener('click', () => dialog.showModal());
}
