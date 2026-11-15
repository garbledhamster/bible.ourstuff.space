export function editTaskSubtasks(fieldset, items = [], readOnly = false) {
  const legend = fieldset.querySelector('legend');
  const list = document.createElement('ul');
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
    description.value = text;
    description.readOnly = readOnly;
    description.required = !readOnly;
    description.setAttribute('aria-label', 'Subtask instruction');
    const name = () => check.setAttribute('aria-label', 'Complete subtask: ' + description.value);
    description.addEventListener('input', name);
    name();
    row.append(check, description);
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
  })).filter(item => item.text);
}
