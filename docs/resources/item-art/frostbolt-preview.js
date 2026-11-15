const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const direction = document.querySelector('#direction');
const play = document.querySelector('#play');
const status = document.querySelector('#status');

async function startPreview() {
  const response = await fetch('frostbolt-frames.json');
  if (!response.ok) throw new Error('Frame map could not load');
  const map = await response.json();
  const sheet = new Image();
  sheet.src = map.image;
  await sheet.decode();

  const { width, height, columns, origin } = map.frame;
  const center = canvas.width / 2;
  const reach = 24;
  let animation;
  context.imageSmoothingEnabled = false;

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function draw(index, x, y) {
    clear();
    const sourceX = (index % columns) * width;
    const sourceY = Math.floor(index / columns) * height;
    context.drawImage(sheet, sourceX, sourceY, width, height,
      Math.round(x) - origin.x, Math.round(y) - origin.y, width, height);
  }

  function reset() {
    cancelAnimationFrame(animation);
    clear();
    status.textContent = '';
  }

  function castSpell() {
    reset();
    const { axis, cast, flight, impact } = map.directions[direction.value];
    status.textContent = 'Casting Frostbolt.';
    let start;

    function step(now) {
      start ??= now;
      let elapsed = now - start;
      for (const [phase, travel] of [[cast, () => -reach], [flight, fraction => -reach + fraction * reach * 2], [impact, () => reach]]) {
        const duration = phase.frames.length * phase.frameMs;
        if (elapsed < duration) {
          const index = phase.frames[Math.floor(elapsed / phase.frameMs)];
          const offset = travel(elapsed / duration);
          draw(index, center + axis.x * offset, center + axis.y * offset);
          animation = requestAnimationFrame(step);
          return;
        }
        elapsed -= duration;
      }
      clear();
      status.textContent = 'Frostbolt hit.';
    }

    animation = requestAnimationFrame(step);
  }

  function showPreview() {
    reset();
    draw(map.directions[direction.value].flight.frames[0], center, center);
  }

  direction.addEventListener('change', showPreview);
  play.addEventListener('click', castSpell);
  showPreview();
  play.disabled = false;
}

startPreview().catch(() => {
  status.textContent = 'The animation could not load. The sprite sheet is available below.';
});
