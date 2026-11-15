export function splitTicketId(text, showTicketIds) {
  const match = showTicketIds && text.match(/^([A-Z0-9]{4}-[A-Z0-9]{4})[ \t]+(?=\S)/);
  return match
    ? { id: match[1], prefix: match[0], text: text.slice(match[0].length) }
    : { id: '', prefix: '', text };
}

export function ticketIdLabel(id) {
  const label = document.createElement('span');
  label.className = 'bible-ticket-id';
  const caption = document.createElement('span');
  caption.textContent = 'Ticket ID';
  const value = document.createElement('strong');
  value.textContent = id;
  label.append(caption, value);
  return label;
}

export function editTaskSubtasks(fieldset, items = [], readOnly = false, showTicketIds = false) {
  const legend = fieldset.querySelector('legend');
  const list = document.createElement('ul');
  const prefixes = new WeakMap();
  list.className = 'task-subtask-list';
  fieldset.replaceChildren(legend, list);
  fieldset.hidden = readOnly && items.length === 0;

  function add({ text = '', done = false } = {}) {
    const row = document.createElement('li');
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = done;
    check.disabled = readOnly;
    const description = document.createElement('textarea');
    description.rows = 2;
    const ticket = splitTicketId(text, showTicketIds);
    description.value = ticket.text;
    description.readOnly = readOnly;
    description.required = !readOnly;
    description.setAttribute('aria-label', 'Subtask instruction');
    const name = () => check.setAttribute('aria-label', 'Complete subtask: ' + description.value);
    description.addEventListener('input', name);
    name();
    row.append(check, description);
    if (ticket.id) {
      const instruction = document.createElement('div');
      instruction.className = 'bible-subtask-instruction';
      description.replaceWith(instruction);
      instruction.append(ticketIdLabel(ticket.id), description);
      prefixes.set(row, ticket.prefix);
    }
    if (!readOnly) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.onclick = () => {
        row.remove();
        addButton.focus();
      };
      row.append(remove);
    }
    list.append(row);
    return description;
  }

  const addButton = document.createElement('button');
  if (!readOnly) {
    addButton.type = 'button';
    addButton.textContent = 'Add subtask';
    addButton.onclick = () => add().focus();
    fieldset.append(addButton);
  }
  items.forEach(add);
  return () => [...list.children].map(row => ({
    text: row.querySelector('textarea').value.trim(),
    done: row.querySelector('input').checked,
    prefix: prefixes.get(row) ?? '',
  })).filter(item => item.text).map(({ text, done, prefix }) => ({ text: prefix + text, done }));
}
