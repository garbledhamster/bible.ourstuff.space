const prop = document.querySelector('#prop');
const style = document.querySelector('#style');
const compare = document.querySelector('#compare');
const view = document.querySelector('#view');
const variant = document.querySelector('#variant');
const variantControl = document.querySelector('#variant-control');
const status = document.querySelector('#status');
const views = document.querySelector('.prop-views');
const panels = ['first', 'second'].map(id => ({
  heading: document.querySelector(`#${id}-style`),
  sheet: document.querySelector(`#${id}-sheet`),
  frame: document.querySelector(`#${id}-frame`),
  download: document.querySelector(`#${id}-download`),
}));

async function start() {
  const response = await fetch('prop-frames.json');
  if (!response.ok) throw new Error('Frame map could not load');
  const map = await response.json();
  const { width, height, columns } = map.frame;
  const images = new Map();
  let selection = 0;

  function loadSheet(path) {
    if (!images.has(path)) {
      const image = new Image();
      image.src = path;
      images.set(path, image.decode().then(() => image).catch(error => {
        images.delete(path);
        throw error;
      }));
    }
    return images.get(path);
  }

  function setVariants() {
    const { frames } = map.props[prop.value];
    variant.replaceChildren(...frames.map((entry, index) => new Option(`${index + 1}. ${entry.label}`, index)));
  }

  async function render() {
    const request = ++selection;
    const { label, sheets, frames } = map.props[prop.value];
    const names = [style.value, compare.value];
    const paths = names.map(name => sheets[name]);
    const showFrame = view.value === 'frame';
    const index = Number(variant.value);
    const x = index % columns * width;
    const y = Math.floor(index / columns) * height;
    variantControl.hidden = !showFrame;
    views.dataset.view = view.value;
    status.textContent = '';
    try {
      const loaded = await Promise.all(paths.map(loadSheet));
      if (request !== selection) return;
      panels.forEach((panel, i) => {
        const title = `${names[i]}-bit style`;
        panel.heading.textContent = title;
        panel.sheet.hidden = showFrame;
        panel.sheet.src = loaded[i].src;
        panel.sheet.alt = `4 by 4 ${label.toLowerCase()} variant sheet in ${title}`;
        panel.frame.hidden = !showFrame;
        panel.frame.setAttribute('aria-label', `${label}: ${frames[index].label} in ${title}, at 1×`);
        const context = panel.frame.getContext('2d');
        context.clearRect(0, 0, width, height);
        if (showFrame) {
          context.imageSmoothingEnabled = false;
          context.drawImage(loaded[i], x, y, width, height, 0, 0, width, height);
        }
        panel.download.href = paths[i];
        panel.download.hidden = false;
      });
    } catch {
      if (request === selection) status.textContent = 'A sheet could not load. Try selecting the style again.';
    }
  }

  prop.replaceChildren(...Object.entries(map.props).map(([id, item]) => new Option(item.label, id)));
  for (const select of [style, compare]) {
    select.replaceChildren(...map.styles.map(value => new Option(`${value}-bit style`, value)));
  }
  compare.value = '128';
  setVariants();
  prop.addEventListener('change', () => {
    setVariants();
    render();
  });
  [style, compare, view, variant].forEach(select => select.addEventListener('change', render));
  for (const select of [prop, style, compare, view, variant]) select.disabled = false;
  await render();
}

start().catch(() => {
  status.textContent = 'The prop sheet comparison could not load.';
});
