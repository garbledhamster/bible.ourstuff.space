const taskTag = / <!-- task:([\w-]+) (Answer|Build|Check) ([01]) -->$/;
const memberTag = /\s*<!-- assignees: (\[.*?\]) -->/;
const tableHeader = '| Asset | Task | Status | Next action |';
const tableDivider = '| --- | --- | --- | --- |';

export const chapterKey = title => title.toLowerCase().replaceAll('&', 'and')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const blockersPattern = /(?:^| · |\n)\*\*Blockers:\*\*[ \t]*(.*)$/;
function readDescription(value) {
  const match = value.match(blockersPattern);
  return { notes: match ? value.slice(0, match.index).trim() : value, blockers: match?.[1] ?? '' };
}
export const isDone = status => /^(done|complete|completed)$/i.test(status);
const splitCells = line => line.trim().slice(1, -1).split(/(?<!\\)\|/).map(value => value.trim());
const escapeCell = value => value.trim().replace(/\r?\n/g, ' ').replace(/(?<!\\)\|/g, '\\|');

function readMembers(match) {
  if (!match) return null;
  try {
    const names = JSON.parse(match[1]);
    return Array.isArray(names) && names.every(name => typeof name === 'string') ? [...new Set(names)] : null;
  } catch {
    return null;
  }
}

const formatMembers = names => '<!-- assignees: ' + JSON.stringify(names)
  .replaceAll('|', '\\u007c').replaceAll('<', '\\u003c').replaceAll('>', '\\u003e') + ' -->';

export function readTaskList(markdown) {
  const eol = markdown.includes('\r\n') ? '\r\n' : '\n';
  const lines = markdown.split(/\r?\n/);
  const tasks = [];
  const sections = [];
  const roster = new Map();
  let section;
  let table = false;
  let fence;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker && (!fence || marker[1][0] === fence[0] && marker[1].length >= fence.length)) {
      fence = fence ? null : marker[1];
      table = false;
      continue;
    }
    if (fence) continue;
    const heading = line.match(/^## (.+?)\s*$/);
    if (heading) {
      if (section) section.end = index;
      section = { chapter: heading[1], start: index, end: lines.length, tableEnd: null };
      sections.push(section);
    }
    if (!section || heading) {
      table = false;
      continue;
    }
    if (chapterKey(section.chapter) === 'members') {
      const member = line.match(/^- (\S.*?)\s*$/);
      if (member) roster.set(member[1], index);
      continue;
    }

    const cells = /^\|.*\|\s*$/.test(line) ? splitCells(line) : [];
    if (cells.join('|') === 'Asset|Task|Status|Next action' &&
        /^\|[\s:|-]+\|\s*$/.test(lines[index + 1] ?? '')) {
      table = true;
      section.tableEnd = index + 2;
      index++;
      continue;
    }
    if (table && cells.length === 4) {
      const [asset, title, savedStatus, next] = cells;
      const tag = savedStatus.match(taskTag);
      const status = savedStatus.replace(taskTag, '');
      const members = readMembers(next.match(memberTag));
      const notes = members ? next.replace(memberTag, '') : next;
      const legacy = members === null && notes.match(/^([^·\[\]]{1,60}) · /);
      tasks.push({ format: 'table', chapter: section.chapter, start: index, end: index + 1,
        asset, title: title.replaceAll('\\|', '|'), status, ...readDescription(notes),
        id: tag?.[1], kind: tag?.[2], done: tag ? tag[3] === '1' : isDone(status),
        members: members ?? (legacy ? [legacy[1].trim()] : []), explicit: members !== null });
      section.tableEnd = index + 1;
      continue;
    }
    table = false;

    const item = line.match(/^[-*] \[([ x])\] (.+)$/i);
    if (!item) continue;
    let end = index + 1;
    let lastBody = end;
    while (end < lines.length && (/^ {2,}|^\t/.test(lines[end]) || !lines[end].trim())) {
      if (lines[end].trim()) lastBody = end + 1;
      end++;
    }
    const body = lines.slice(index + 1, lastBody).map(value => value.trim()).join('\n').trim();
    const tag = body.match(memberTag);
    const members = readMembers(tag);
    const description = members ? body.replace(memberTag, '').trim() : body;
    const detail = description.match(/^\*\*([^*]+)\*\*(?:[ \t]*·[ \t]*|\n|$)/);
    const done = item[1] !== ' ';
    tasks.push({ format: 'checklist', chapter: section.chapter, start: index, end: lastBody,
      title: item[2], status: detail?.[1] ?? (done ? 'Done' : 'Ready'),
      ...readDescription(detail ? description.slice(detail[0].length).trim() : description), asset: '',
      done, members: members ?? [], explicit: members !== null });
    index = lastBody - 1;
  }

  return { lines, eol, sections, tasks, roster,
    members: [...new Set([...roster.keys(), ...tasks.flatMap(task => task.members)])] };
}

function taskLines(task, format) {
  const blocked = task.blockers?.trim().replace(/\r?\n/g, ' ');
  const assignment = task.members.length || task.explicit ? formatMembers(task.members) : '';
  if (format === 'table') {
    const tag = task.id ? ` <!-- task:${task.id} ${task.kind} ${Number(task.done)} -->` : '';
    return ['| ' + [task.asset ?? '', task.title, task.status + tag, [task.notes, blocked && '**Blockers:** ' + blocked].filter(Boolean).join(' · ')]
      .map(escapeCell).map((value, index) => index === 3 && assignment ? [value, assignment].filter(Boolean).join(' ') : value)
      .join(' | ') + ' |'];
  }
  const result = [`- [${task.done ? 'x' : ' '}] ${task.title.trim()}`, ''];
  const notes = task.notes?.trim().split(/\r?\n/) ?? [];
  const status = `  **${task.status.replaceAll('*', '')}**`;
  result.push(notes[0] ? status + ' · ' + notes[0] : status, ...notes.slice(1).map(line => '  ' + line));
  if (blocked) result.push('  **Blockers:** ' + blocked);
  if (assignment) result.push('  ' + assignment);
  return result;
}

function beforeTrailingBlank(lines, from, to) {
  while (to > from && !lines[to - 1].trim()) to--;
  return to;
}

export function saveTask(doc, previous, draft) {
  const lines = [...doc.lines];
  const key = chapterKey(draft.chapter);
  if (previous && chapterKey(previous.chapter) === key) {
    lines.splice(previous.start, previous.end - previous.start, ...taskLines(draft, previous.format));
    return lines.join(doc.eol);
  }
  const section = doc.sections.find(entry => chapterKey(entry.chapter) === key);
  const format = previous?.format ?? (section?.tableEnd || (!section && doc.tasks.some(task => task.format === 'table')) ? 'table' : 'checklist');
  const row = taskLines(draft, format);
  if (format === 'table' && section?.tableEnd) {
    lines.splice(section.tableEnd, 0, ...row);
  } else {
    const index = section ? beforeTrailingBlank(lines, section.start + 1, section.end)
      : beforeTrailingBlank(lines, 1, lines.length);
    const header = section ? [] : [`## ${draft.chapter}`, ''];
    const table = format === 'table' ? [tableHeader, tableDivider] : [];
    lines.splice(index, 0, '', ...header, ...table, ...row, ...(lines[index]?.trim() ? [''] : []));
  }
  if (previous) {
    // A move inserts first so the destination can use the original section boundaries.
    const shift = section && section.start < previous.start ? lines.length - doc.lines.length : 0;
    lines.splice(previous.start + shift, previous.end - previous.start);
  }
  return lines.join(doc.eol);
}

export function updateMember(doc, previous, next) {
  const lines = [...doc.lines];
  for (const task of doc.tasks.filter(task => previous && task.members.includes(previous))) {
    const names = [...new Set(task.members.flatMap(name => name === previous ? (next ? [next] : []) : [name]))];
    if (!task.explicit) {
      // Keep the rest of the old next action and use a structured assignment from now on.
      const rendered = taskLines({ ...task, members: names, explicit: true }, task.format);
      lines[task.start] = rendered[0];
      continue;
    }
    for (let index = task.start; index < task.end; index++) {
      lines[index] = lines[index].replace(memberTag, match => match.replace(/<!--.*-->/, formatMembers(names)));
    }
  }
  const registered = doc.roster.get(previous);
  if (registered !== undefined) {
    lines.splice(registered, 1, ...(next ? ['- ' + next] : []));
  } else if (next) {
    const roster = doc.sections.find(section => chapterKey(section.chapter) === 'members');
    const index = beforeTrailingBlank(lines, roster ? roster.start + 1 : 1, roster?.end ?? lines.length);
    lines.splice(index, 0, ...(roster ? [] : ['', '## Members', '']), '- ' + next,
      ...(lines[index]?.trim() ? [''] : []));
  }
  return lines.join(doc.eol);
}
