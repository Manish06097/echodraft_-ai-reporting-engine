import React, { useMemo, useState, useEffect, useRef } from 'react';
import { convertMarkdownToHtml } from '../lib/markdownConverter';

interface HtmlReportViewerProps {
  markdownContent: string;
}

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

const HtmlReportViewer: React.FC<HtmlReportViewerProps> = ({ markdownContent }) => {
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useMemo(() => {
    async function convert() {
      const processedMarkdown = markdownContent.replace(
        /<discrepancy note="([^"]+)">(.+?)<\/discrepancy>/g,
        (match, note, text) => {
          const encodedNote = note.replace(/"/g, '"');
          return `<span class="discrepancy-highlight" data-discrepancy-note="${encodedNote}">${text}</span>`;
        }
      );
      const html = await convertMarkdownToHtml(processedMarkdown);
      setSanitizedHtml(html);
    }
    convert();
  }, [markdownContent]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('discrepancy-highlight')) {
        const note = target.getAttribute('data-discrepancy-note');
        if (note) {
          setTooltip({
            visible: true,
            content: note,
            x: event.pageX,
            y: event.pageY,
          });
        }
      }
    };

    const handleMouseOut = () => {
      setTooltip({ visible: false, content: '', x: 0, y: 0 });
    };

    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);

    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
    };
  }, [sanitizedHtml]);

  return (
    <>
      {tooltip.visible && (
        <div
          className="custom-tooltip"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.content}
        </div>
      )}
      <div
        ref={containerRef}
        className="report-container"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </>
  );
};

export default HtmlReportViewer;
