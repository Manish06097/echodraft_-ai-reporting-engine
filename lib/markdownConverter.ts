import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Custom tokenizer for the <discrepancy> tag
const discrepancyExtension = {
  name: 'discrepancy',
  level: 'inline' as const,
  start(src: string) {
    return src.match(/<discrepancy/)?.index;
  },
  tokenizer(src: string) {
    const rule = /^<discrepancy note="([^"]+)">(.+?)<\/discrepancy>/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'discrepancy',
        raw: match[0],
        note: match[1],
        text: match[2],
      };
    }
  },
  renderer(token: any) {
    return `<span class="discrepancy-highlight" title="${token.note}">${token.text}</span>`;
  },
};

marked.use({ extensions: [discrepancyExtension] });

export async function convertMarkdownToHtml(markdown: string): Promise<string> {
  // First, handle the custom tag with a simple regex replacement before passing to marked.
  // This is a simpler approach than a full-blown marked extension for this specific case.
  const processedMarkdown = markdown.replace(
    /<discrepancy note="([^"]+)">(.+?)<\/discrepancy>/g,
    '<span class="discrepancy-highlight" title="$1">$2</span>'
  );

  const rawHtml = await marked(processedMarkdown);
  
  // Allow span with class and title attributes
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['span'],
    ADD_ATTR: ['class', 'title'],
  });
}
