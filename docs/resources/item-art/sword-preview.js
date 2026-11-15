const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const direction = document.querySelector('#direction');
const move = document.querySelector('#move');
const play = document.querySelector('#play');
const status = document.querySelector('#status');

async function startPreview() {
  const response = await fetch('sword-frames.json');
  if (!response.ok) throw new Error('Frame map could not load');
  const map = await response.json();
  const sheet = new Image();
  sheet.src = map.image;
  await sheet.decode();

  const { width, height, columns } = map.frame;
  context.imageSmoothingEnabled = false;
  let timer;
  const current = () => map.actions[move.value][direction.value];

  function draw(index) {
    const x = (index % columns) * width;
    const y = Math.floor(index / columns) * height;
    context.clearRect(0, 0, width, height);
    context.drawImage(sheet, x, y, width, height, 0, 0, width, height);
  }

  function reset() {
    clearTimeout(timer);
    draw(current().frames[0]);
    status.textContent = '';
  }

  function playSwing() {
    clearTimeout(timer);
    const { frames, durationMs } = current();
    status.textContent = 'Playing swing.';
    function showFrame(step) {
      draw(frames[step]);
      if (step + 1 < frames.length) {
        timer = setTimeout(() => showFrame(step + 1), durationMs[step]);
      } else {
        status.textContent = 'Back in guard.';
      }
    }
    showFrame(0);
  }

  direction.addEventListener('change', reset);
  move.addEventListener('change', reset);
  play.addEventListener('click', playSwing);
  reset();
  play.disabled = false;
}

startPreview().catch(() => {
  status.textContent = 'The animation could not load. The sprite sheet is available below.';
});
