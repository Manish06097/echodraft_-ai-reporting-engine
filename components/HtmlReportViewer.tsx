import React, { useMemo } from 'react';
import { convertMarkdownToHtml } from '../lib/markdownConverter';

interface HtmlReportViewerProps {
  markdownContent: string;
}

const HtmlReportViewer: React.FC<HtmlReportViewerProps> = ({ markdownContent }) => {
  const [sanitizedHtml, setSanitizedHtml] = React.useState('');

  useMemo(() => {
    async function convert() {
      const html = await convertMarkdownToHtml(markdownContent);
      setSanitizedHtml(html);
    }
    convert();
  }, [markdownContent]);

  return (
    <div
      className="report-container"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default HtmlReportViewer;
