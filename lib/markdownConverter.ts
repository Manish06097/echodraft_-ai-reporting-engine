import { marked } from 'marked';
import DOMPurify from 'dompurify';

export async function convertMarkdownToHtml(markdown: string): Promise<string> {
  const rawHtml = await marked(markdown);
  
  // Allow span with class and title attributes
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['span'],
    ADD_ATTR: ['class', 'title'],
  });
}
