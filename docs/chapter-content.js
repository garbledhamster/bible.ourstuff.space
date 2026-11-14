import { marked } from './vendor/marked.esm.js';
import { resolveDocumentLinks } from './document-reader.js';

export function parseChapterGuide(guide, source, reader) {
  const tokens = lexMarkdown(guide, source, reader);
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

  if (sections.size !== 14) throw new Error(`Expected 14 guide chapters, found ${sections.size}.`);

  return Object.fromEntries(
    Array.from(sections, ([slug, chapter]) => [slug, marked.parser(chapter)])
  );
}

export function parseWorkedExample(markdown, source, reader) {
  const tokens = lexMarkdown(markdown, source, reader);
  return marked.parser(tokens.filter(token => token.type !== 'heading' || token.depth !== 1));
}

function lexMarkdown(markdown, source, reader) {
  const tokens = marked.lexer(markdown);
  marked.walkTokens(tokens, (token) => {
    if (token.type === 'html') throw new Error('Project Bible sources must use Markdown without raw HTML.');
  });
  if (source && reader) resolveDocumentLinks(tokens, source, reader);
  return tokens;
}
