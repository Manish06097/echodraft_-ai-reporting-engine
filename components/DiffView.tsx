import React, { useMemo } from 'react';
import { marked } from 'marked';
import { diff } from '../lib/diff';
import type { Diff } from '../types';

interface DiffViewProps {
  oldText: string;
  newText: string;
  isStreaming: boolean;
}

const DiffView: React.FC<DiffViewProps> = ({ oldText, newText, isStreaming }) => {
  const diffResult = useMemo(() => diff(oldText, newText), [oldText, newText]);

  const renderedHtml = useMemo(() => {
    const markerStartAdd = '<!--diff-add-start-->';
    const markerEndAdd = '<!--diff-add-end-->';
    const markerStartDel = '<!--diff-del-start-->';
    const markerEndDel = '<!--diff-del-end-->';

    let textWithMarkers = '';
    for (const [type, text] of diffResult) {
      switch (type) {
        case 1: // Addition
          textWithMarkers += markerStartAdd + text + markerEndAdd;
          break;
        case -1: // Deletion
          textWithMarkers += markerStartDel + text + markerEndDel;
          break;
        case 0: // Common
        default:
          textWithMarkers += text;
          break;
      }
    }

    // Italicize placeholder text before parsing markdown
    textWithMarkers = textWithMarkers.replace(/\[Details not provided in the initial notes\]/g, '*[Details not provided in the initial notes]*');

    marked.setOptions({
      gfm: true,
      breaks: true,
    });
    
    let html = marked.parse(textWithMarkers) as string;

    html = html.replace(new RegExp(markerStartAdd, 'g'), '<span class="bg-green-500/20 text-green-300 rounded">');
    html = html.replace(new RegExp(markerEndAdd, 'g'), '</span>');
    html = html.replace(new RegExp(markerStartDel, 'g'), '<span class="bg-red-500/20 text-red-300 line-through rounded">');
    html = html.replace(new RegExp(markerEndDel, 'g'), '</span>');

    return html;
  }, [diffResult]);

  return (
    <div
      className="prose prose-invert prose-lg max-w-none p-6 sm:p-10 bg-slate-900 rounded-lg border border-slate-700 min-h-[400px] text-slate-300 transition-all duration-300 shadow-inner shadow-black/20
                 prose-h1:text-4xl prose-h1:font-bold prose-h1:text-slate-100 prose-h1:text-center prose-h1:mb-12 prose-h1:pb-4 prose-h1:border-b prose-h1:border-slate-700
                 prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-sky-300 prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-800
                 prose-p:leading-8 prose-p:text-slate-300 prose-p:text-justify
                 prose-strong:text-slate-200 prose-strong:font-semibold
                 prose-em:text-slate-400
                 prose-ul:marker:text-sky-400 prose-ul:pl-1
                 prose-ol:marker:text-sky-400
                 prose-li:my-2
                 prose-table:w-full prose-table:table-fixed prose-table:border-collapse prose-table:mt-6 prose-table:mb-6
                 prose-thead:border-b-2 prose-thead:border-slate-600
                 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-slate-200 prose-th:first:w-[35%]
                 prose-tr:border-b prose-tr:border-slate-800
                 prose-tbody>tr:nth-of-type(even):bg-slate-800/50
                 prose-td:px-4 prose-td:py-3 prose-td:align-top prose-td:text-slate-400 prose-td:first:w-[35%] prose-td:first:font-semibold prose-td:first:text-slate-200"
      dangerouslySetInnerHTML={{
        __html: renderedHtml + (isStreaming ? '<span class="inline-block w-2 h-5 bg-sky-400 animate-pulse ml-1" />' : ''),
      }}
    />
  );
};

export default DiffView;