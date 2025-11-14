import React from 'react';
import HtmlReportViewer from './HtmlReportViewer';

interface SideBySideReportViewerProps {
  geminiReport: string;
  qwenReport: string;
}

const SideBySideReportViewer: React.FC<SideBySideReportViewerProps> = ({ geminiReport, qwenReport }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-2xl font-bold text-center mb-4">Gemini Report</h2>
        <HtmlReportViewer markdownContent={geminiReport} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-center mb-4">Qwen Report</h2>
        <HtmlReportViewer markdownContent={qwenReport} />
      </div>
    </div>
  );
};

export default SideBySideReportViewer;
