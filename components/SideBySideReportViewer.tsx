import React, { useState } from 'react';
import HtmlReportViewer from './HtmlReportViewer';

interface SideBySideReportViewerProps {
  geminiReport: string;
  qwenReport: string;
}

const SideBySideReportViewer: React.FC<SideBySideReportViewerProps> = ({ geminiReport, qwenReport }) => {
  const [showRawGemini, setShowRawGemini] = useState(false);
  const [showRawQwen, setShowRawQwen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center justify-center mb-4">
          <h2 className="text-2xl font-bold text-center">Gemini Report</h2>
          <button 
            onClick={() => setShowRawGemini(!showRawGemini)}
            className="ml-4 px-2 py-1 text-sm bg-slate-700 rounded"
          >
            {showRawGemini ? 'View HTML' : 'View Raw'}
          </button>
        </div>
        {showRawGemini ? (
          <pre className="whitespace-pre-wrap bg-slate-900 p-4 rounded">{geminiReport}</pre>
        ) : (
          <HtmlReportViewer markdownContent={geminiReport} />
        )}
      </div>
      <div>
        <div className="flex items-center justify-center mb-4">
          <h2 className="text-2xl font-bold text-center">Qwen Report</h2>
          <button 
            onClick={() => setShowRawQwen(!showRawQwen)}
            className="ml-4 px-2 py-1 text-sm bg-slate-700 rounded"
          >
            {showRawQwen ? 'View HTML' : 'View Raw'}
          </button>
        </div>
        {showRawQwen ? (
          <pre className="whitespace-pre-wrap bg-slate-900 p-4 rounded">{qwenReport}</pre>
        ) : (
          <HtmlReportViewer markdownContent={qwenReport} />
        )}
      </div>
    </div>
  );
};

export default SideBySideReportViewer;
