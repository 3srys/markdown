import MarkdownIt from 'markdown-it';
import { setupPlugins, stripFrontMatter } from './plugins';
import { sanitizeHtml } from './sanitizer';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
});

setupPlugins(md);

export function parseMarkdown(markdown: string): string {
  const content = stripFrontMatter(markdown);
  const rawHtml = md.render(content);
  return sanitizeHtml(rawHtml);
}

export function calculateDocumentStats(markdown: string) {
  const plainText = markdown
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`_~>[\]()!-]/g, ' ')
    .trim();

  const words = plainText.length > 0 ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const characters = markdown.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    characters,
    readingTimeMinutes,
  };
}

