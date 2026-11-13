import { cp, readFile, rm, writeFile } from 'node:fs/promises';
import { marked } from 'marked';
import { parseChapterGuide, parseWorkedExample } from '../docs/chapter-content.js';
import { resolveDocumentLinks } from '../docs/document-reader.js';

const source = new URL('../docs/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, output), 'utf8');

async function render(path, label, content) {
  const file = new URL(path, output);
  const html = await readFile(file, 'utf8');
  const start = `<!-- BEGIN ${label} -->`;
  const end = `<!-- END ${label} -->`;
  const before = html.indexOf(start);
  const after = html.indexOf(end);
  if (before < 0 || after < before) throw new Error(`Missing ${label} markers in ${path}`);
  await writeFile(file, html.slice(0, before) + content + html.slice(after + end.length));
}

await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true });
const markedSource = new URL('../node_modules/marked/', import.meta.url);
const vendor = new URL('vendor/', output);
const markedModule = await readFile(new URL('lib/marked.esm.js', markedSource), 'utf8');
await Promise.all([
  writeFile(new URL('marked.esm.js', vendor), markedModule.replace(/\/\/# sourceMappingURL=.*\n?$/, '')),
  cp(new URL('LICENSE.md', markedSource), new URL('marked-LICENSE.md', vendor)),
]);

const guide = parseChapterGuide(await read('resources/game-bible-guide.md'));
parseWorkedExample(await read('resources/island-post-example.md'));
const notes = (await read('resources/joes-notes.md')).trim().split(/\n(?=### )/);
await render('index.html', 'NOTES',
  notes.slice(1).map(note => `<section>\n${marked.parse(note)}</section>\n`).join(''));

const [intro, ...chapters] = (await read('resources/game-bible-template.md')).trim().split(/\n(?=## )/);
const sections = chapters.map(chapter => {
  const tokens = marked.lexer(chapter);
  const slug = tokens[0].text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return { slug, html: `<section id="${slug}">\n${marked.parser(tokens)}</section>\n` };
});
if (Object.keys(guide).join() !== sections.map(section => section.slug).join()) {
  throw new Error('The template chapters must match the guide chapters in order.');
}
const introduction = marked.parser(marked.lexer(intro).slice(1));
await render('resources/template.html', 'TEMPLATE', introduction + sections.map(section => section.html).join(''));

const tickets = marked.lexer(await read('resources/game-tickets/README.md')).find(token => token.type === 'table');
if (!tickets || tickets.rows.length !== Object.keys(guide).length) {
  throw new Error('The ticket list must have one row per chapter.');
}
const liveResources = new URL('https://bible.ourstuff.space/resources/');
const ticketList = new URL('game-tickets/README.md', liveResources);
const reader = new URL('../read.html', liveResources);
const ticketRenderer = new marked.Renderer();
const renderLink = ticketRenderer.link.bind(ticketRenderer);
ticketRenderer.link = (token) => {
  const link = new URL(token.href);
  if (link.origin !== reader.origin) return renderLink(token);
  return renderLink({ ...token, href: `../..${link.pathname}${link.search}${link.hash}` });
};
const rows = tickets.rows.map(([id, ticket, blocker, evidence]) => {
  resolveDocumentLinks(ticket.tokens, ticketList, reader);
  return `<tr><th scope="row">${marked.parseInline(id.text)}</th>` +
    `<td>${marked.Parser.parseInline(ticket.tokens, { renderer: ticketRenderer })}</td>` +
    `<td>${marked.parseInline(blocker.text)}</td><td>${marked.parseInline(evidence.text)}</td></tr>\n`;
});
await render('resources/game-tickets/index.html', 'TICKETS', rows.join(''));

const localLinks = new Set();
const agentIndex = marked.lexer(await read('resources/agent-index.md'));
marked.walkTokens(agentIndex, token => {
  if (token.type !== 'link') return;
  const link = new URL(token.href, liveResources);
  if (link.origin === liveResources.origin) localLinks.add(link.pathname.slice(1));
});
for (const path of localLinks) {
  await readFile(new URL(path, output));
}
console.log(`Validated ${Object.keys(guide).length} chapters and ${localLinks.size} local agent resource links.`);
