const inset = 12;
const gap = 12;
const pointerInset = 16;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const selectionHighlight = 'bible-ticket-selection';
let nextCalloutId = 0;

export function createTicketCallout(host) {
  const card = document.createElement('section');
  if (typeof card.showPopover !== 'function') return null;
  card.className = 'ticket-callout';
  card.id = 'bible-ticket-callout-' + ++nextCalloutId;
  card.popover = 'auto';
  card.setAttribute('role', 'dialog');
  const titleId = card.id + '-title';
  card.setAttribute('aria-labelledby', titleId);

  const content = document.createElement('div');
  content.className = 'ticket-callout-content';
  content.tabIndex = 0;
  content.setAttribute('role', 'region');
  content.setAttribute('aria-label', 'Ticket information');
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'ticket-callout-close';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Close ticket');
  card.append(closeButton, content);
  host.append(card);

  let trigger;
  let focusReturn;
  let listeners;
  let observer;
  let frame;

  function close(from) {
    const node = trigger instanceof Range ? trigger.commonAncestorContainer : trigger;
    if (node && (!from || from.contains(node))) card.hidePopover();
  }

  function closeAndReturn() {
    const anchor = focusReturn;
    close();
    anchor?.focus({ preventScroll: true });
  }

  closeButton.addEventListener('click', closeAndReturn);
  card.addEventListener('pointerdown', event => event.stopPropagation());
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndReturn();
    }
    if (['Escape', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.stopPropagation();
  });
  card.addEventListener('beforetoggle', event => {
    if (event.newState !== 'closed') return;
    listeners?.abort();
    observer?.disconnect();
    cancelAnimationFrame(frame);
    frame = undefined;
    if (trigger instanceof Range) CSS.highlights?.delete(selectionHighlight);
    else trigger?.setAttribute('aria-expanded', 'false');
    trigger = undefined;
    focusReturn = undefined;
  });

  function position() {
    if (!trigger) return;
    const anchor = trigger.getBoundingClientRect();
    const node = trigger instanceof Range ? trigger.commonAncestorContainer : trigger;
    const element = node instanceof Element ? node : node.parentElement;
    const hostBounds = host.getBoundingClientRect();
    const body = element?.closest('.chapter-detail-body')?.getBoundingClientRect() ?? hostBounds;
    const viewport = window.visualViewport;
    const leftEdge = (viewport?.offsetLeft ?? 0) + inset;
    const topEdge = (viewport?.offsetTop ?? 0) + inset;
    const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - 2 * inset;
    const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight) - 2 * inset;
    const visibleTop = Math.max(anchor.top, hostBounds.top, body.top, topEdge - inset);
    const visibleBottom = Math.min(anchor.bottom, hostBounds.bottom, body.bottom, bottomEdge + inset);
    if (visibleBottom <= visibleTop || anchor.right <= leftEdge - inset || anchor.left >= rightEdge + inset) {
      close();
      return;
    }

    card.style.setProperty('--ticket-viewport-width', `${rightEdge - leftEdge}px`);
    card.style.setProperty('--ticket-height', `${bottomEdge - topEdge}px`);
    const { offsetWidth: width, offsetHeight: height } = card;
    const centerX = (anchor.left + anchor.right) / 2;
    const centerY = (visibleTop + visibleBottom) / 2;
    const roomRight = rightEdge - anchor.right - gap;
    const roomLeft = anchor.left - leftEdge - gap;
    let side, x, y, pointer;

    if (roomRight >= width || roomLeft >= width) {
      side = roomRight >= width ? 'right' : 'left';
      x = side === 'right' ? anchor.right + gap : anchor.left - gap - width;
      y = clamp(centerY - height / 2, topEdge, bottomEdge - height);
      pointer = clamp(centerY - y, pointerInset, height - pointerInset);
    } else {
      const below = bottomEdge - visibleBottom - gap;
      const above = visibleTop - topEdge - gap;
      const placeBelow = below >= height || (above < height && below >= above);
      side = placeBelow ? 'bottom' : 'top';
      const maxHeight = Math.max(0, placeBelow ? below : above);
      card.style.setProperty('--ticket-height', `${maxHeight}px`);
      x = clamp(centerX - width / 2, leftEdge, rightEdge - width);
      y = placeBelow ? visibleBottom + gap : visibleTop - gap - card.offsetHeight;
      pointer = clamp(centerX - x, pointerInset, width - pointerInset);
    }

    card.dataset.side = side;
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.style.setProperty('--ticket-pointer', `${pointer}px`);
  }

  function schedule(event) {
    if (event?.target instanceof Node && card.contains(event.target)) return;
    if (frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      position();
    });
  }

  function open(anchor, details) {
    if (trigger === anchor) {
      closeAndReturn();
      return;
    }
    close();
    trigger = anchor;
    content.replaceChildren(details);
    content.querySelector('h3').id = titleId;
    if (anchor instanceof Range) {
      focusReturn = document.activeElement;
      card.showPopover();
      if (CSS.highlights && typeof Highlight === 'function') {
        CSS.highlights.set(selectionHighlight, new Highlight(anchor));
      }
    } else {
      focusReturn = anchor;
      card.showPopover({ source: anchor });
      anchor.setAttribute('aria-expanded', 'true');
    }
    content.scrollTop = 0;
    position();
    if (!trigger) return;
    closeButton.focus({ preventScroll: true });
    listeners = new AbortController();
    const { signal } = listeners;
    window.addEventListener('resize', schedule, { signal });
    window.addEventListener('scroll', schedule, { capture: true, passive: true, signal });
    window.visualViewport?.addEventListener('resize', schedule, { signal });
    window.visualViewport?.addEventListener('scroll', schedule, { signal });
    observer = new ResizeObserver(schedule);
    if (anchor instanceof Element) observer.observe(anchor);
    observer.observe(card);
  }

  return { id: card.id, open, close };
}
