import { chapterTaskRows, loadTicketSource, ticketDetails } from './chapter-task-sheet.js';
import { createTicketCallout } from './ticket-callout.js';

function selectedTicket() {
  const selection = document.getSelection();
  if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) return;
  const id = selection.toString().trim();
  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(id)) return;
  const range = selection.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const element = node instanceof Element ? node : node.parentElement;
  if (!element || element.closest('input, textarea, [contenteditable], .ticket-callout')) return;
  return { id, range, host: element.closest('dialog[open]') ?? document.body };
}

function sameRange(first, second) {
  return first && second && first.startContainer === second.startContainer
    && first.endContainer === second.endContainer && first.startOffset === second.startOffset
    && first.endOffset === second.endOffset;
}

export function installTicketSelection({
  chapter, callout, reader = new URL('read.html', location.href), taskSource, loadStyles = true,
} = {}) {
  if (typeof HTMLElement.prototype.showPopover !== 'function') return;
  const viewers = new WeakMap();
  if (chapter && callout) viewers.set(chapter, callout);
  if (loadStyles) {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = new URL('./ticket-callout.css', import.meta.url);
    document.head.append(sheet);
  }

  let timeout;
  let previous;
  let mouseSelecting = false;
  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button === 0) mouseSelecting = true;
  }, true);
  function finishSelection(event) {
    if (event.pointerType !== 'mouse' || !mouseSelecting) return;
    mouseSelecting = false;
    checkSelection();
  }
  document.addEventListener('pointerup', finishSelection, true);
  document.addEventListener('pointercancel', finishSelection, true);
  window.addEventListener('blur', () => { mouseSelecting = false; });
  document.addEventListener('selectionchange', checkSelection);
  checkSelection();

  function checkSelection() {
    clearTimeout(timeout);
    if (mouseSelecting) return;
    const selected = selectedTicket();
    if (!selected) {
      previous = undefined;
      return;
    }
    if (sameRange(previous, selected.range)) return;
    timeout = setTimeout(() => void showSelectedTicket(), 220);
  }

  async function showSelectedTicket() {
    const selected = selectedTicket();
    if (!selected) return;
    const { id, host } = selected;
    const anchor = selected.range.cloneRange();
    previous = anchor;
    try {
      const { source, markdown } = await loadTicketSource(reader, taskSource);
      if (!sameRange(anchor, selectedTicket()?.range)) return;
      const matches = chapterTaskRows(markdown).filter(task => task.id === id);
      if (matches.length !== 1) return;
      let viewer = viewers.get(host);
      if (!viewer) {
        viewer = createTicketCallout(host);
        viewers.set(host, viewer);
        if (host instanceof HTMLDialogElement) host.addEventListener('close', () => viewer.close());
      }
      viewer.open(anchor, ticketDetails(matches[0], source, reader));
    } catch {
      // Ordinary text selection stays available when the Task List can't be read.
    }
  }
}
