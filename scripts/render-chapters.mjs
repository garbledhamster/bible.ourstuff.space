import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

const vendor = new URL('../docs/vendor/', import.meta.url);
const marked = await readFile(new URL('../node_modules/marked/lib/marked.esm.js', import.meta.url), 'utf8');
await mkdir(vendor, { recursive: true });
await Promise.all([
  writeFile(new URL('marked.esm.js', vendor), marked.replace(/\/\/# sourceMappingURL=.*\n?$/, '')),
  copyFile(new URL('../node_modules/marked/LICENSE.md', import.meta.url), new URL('marked-LICENSE.md', vendor)),
]);

const { parseChapterGuide } = await import('../docs/chapter-content.js');
const guide = await readFile(new URL('../docs/resources/game-bible-guide.md', import.meta.url), 'utf8');
const chapters = parseChapterGuide(guide);
console.log(`Validated ${Object.keys(chapters).length} Markdown chapters.`);
