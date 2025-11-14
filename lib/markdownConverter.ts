import { marked } from 'marked';
import DOMPurify from 'dompurify';

export async function convertMarkdownToHtml(markdown: string): Promise<string> {
  const rawHtml = await marked(markdown);
  return DOMPurify.sanitize(rawHtml);
}
