import { marked } from './vendor/marked.esm.js';

export function parseChapterGuide(guide) {
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

  if (sections.size !== 11) throw new Error(`Expected eleven guide chapters, found ${sections.size}.`);

  return Object.fromEntries(
    Array.from(sections, ([slug, chapter]) => [slug, marked.parser(chapter)])
  );
}
