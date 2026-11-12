import { readFile, writeFile } from 'node:fs/promises';
import { marked } from 'marked';

const guidePath = new URL('../docs/resources/game-bible-guide.md', import.meta.url);
const outputPath = new URL('../docs/chapter-content.js', import.meta.url);
const guide = await readFile(guidePath, 'utf8');
const tokens = marked.lexer(guide);
const sections = new Map();
let currentSection;

for (const token of tokens) {
  if (token.type === 'heading' && token.depth === 2) {
    const slug = token.text.toLowerCase()
      .replaceAll('&', 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (sections.has(slug)) throw new Error(`Duplicate chapter heading: ${token.text}`);
    currentSection = [];
    sections.set(slug, currentSection);
  } else if (currentSection) {
    currentSection.push(token);
  }
}

marked.walkTokens(tokens, (token) => {
  if (token.type === 'html') throw new Error('Chapter guide must use Markdown without raw HTML.');
});

if (sections.size !== 10) throw new Error(`Expected ten guide chapters, found ${sections.size}.`);

const content = Object.fromEntries(
  Array.from(sections, ([slug, chapter]) => [slug, marked.parser(chapter)])
);
await writeFile(outputPath, '// Generated from resources/game-bible-guide.md by npm run build.\n' +
  `export const chapterContent = ${JSON.stringify(content, null, 2)};\n`);
