import { bootDock } from './dock.js';

bootDock();

const help = document.querySelector('#how-to-play');
const wet = document.querySelector('#wet-parcels');
function revealHelp() {
  if (location.hash === '#how-to-play' || location.hash === '#wet-parcels') help.open = true;
  if (location.hash === '#wet-parcels') wet.open = true;
}
window.addEventListener('hashchange', revealHelp);
revealHelp();
