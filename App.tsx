import React, { useState, useCallback } from 'react';
import { refineReport, generateReportFromText } from './services/geminiService';
import { generateQwenReportFromText, refineQwenReport } from './services/qwenService';
import SideBySideReportViewer from './components/SideBySideReportViewer';
import { WandIcon, Spinner } from './components/icons';
import TemplateUploader from './components/TemplateUploader';
import OldReportUploader from './components/OldReportUploader';

type AppState = 'idle' | 'generating' | 'editing' | 'refining';

const processReportAndKeywords = (text: string) => {
  const keywordRegex = /<!--\s*keywords:\s*([^>]+?)\s*-->/;
  const match = text.match(keywordRegex);
  
  const cleanedText = text.replace(keywordRegex, '').trim();
  
  if (match && match[1]) {
    const keywords = match[1].split(',').map(k => k.trim()).filter(Boolean);
    return { reportText: cleanedText, keywords };
  }
  
  return { reportText: cleanedText, keywords: [] };
};


function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [initialNotes, setInitialNotes] = useState<string>('');
  const [geminiReport, setGeminiReport] = useState<string>('');
  const [qwenReport, setQwenReport] = useState<string>('');
  const [streamingGeminiReport, setStreamingGeminiReport] = useState<string>('');
  const [streamingQwenReport, setStreamingQwenReport] = useState<string>('');
  const [templateContent, setTemplateContent] = useState<string>('');
  const [oldReportContent, setOldReportContent] = useState<string>('');
  const [editInstruction, setEditInstruction] = useState<string>('');
  const [geminiKeywords, setGeminiKeywords] = useState<string[]>([]);
  const [qwenKeywords, setQwenKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = useCallback(async () => {
    if (!initialNotes.trim()) return;

    setAppState('generating');
    setError(null);
    setGeminiReport('');
    setQwenReport('');
    setStreamingGeminiReport('');
    setStreamingQwenReport('');
    setGeminiKeywords([]);
    setQwenKeywords([]);

    try {
      const geminiStream = generateReportFromText(initialNotes, templateContent, oldReportContent);
      const qwenStream = generateQwenReportFromText(initialNotes, templateContent, oldReportContent);

      const processStream = async (stream: AsyncGenerator<string>, setStreamingReport: (report: string) => void) => {
        let fullStreamedText = '';
        for await (const chunk of stream) {
          fullStreamedText += chunk;
          setStreamingReport(fullStreamedText);
        }
        return fullStreamedText;
      };

      const [geminiResult, qwenResult] = await Promise.all([
        processStream(geminiStream, setStreamingGeminiReport),
        processStream(qwenStream, setStreamingQwenReport)
      ]);

      const { reportText: geminiReportText, keywords: geminiKeywords } = processReportAndKeywords(geminiResult);
      const { reportText: qwenReportText, keywords: qwenKeywords } = processReportAndKeywords(qwenResult);

      setGeminiReport(geminiReportText);
      setQwenReport(qwenReportText);
      setGeminiKeywords(geminiKeywords);
      setQwenKeywords(qwenKeywords);
      setAppState('editing');
    } catch (e: any) {
      setError(`Failed to generate report: ${e.message}`);
      setAppState('idle');
    }
  }, [initialNotes, templateContent, oldReportContent]);


  const handleRefine = useCallback(async () => {
    if (!editInstruction.trim()) return;

    setAppState('refining');
    setError(null);
    setStreamingGeminiReport('');
    setStreamingQwenReport('');

    try {
      const geminiStream = refineReport(geminiReport, editInstruction);
      const qwenStream = refineQwenReport(qwenReport, editInstruction);

      const processStream = async (stream: AsyncGenerator<string>, setStreamingReport: (report: string) => void) => {
        let fullStreamedText = '';
        for await (const chunk of stream) {
          fullStreamedText += chunk;
          setStreamingReport(fullStreamedText);
        }
        return fullStreamedText;
      };

      const [geminiResult, qwenResult] = await Promise.all([
        processStream(geminiStream, setStreamingGeminiReport),
        processStream(qwenStream, setStreamingQwenReport)
      ]);

      const { reportText: geminiReportText, keywords: geminiKeywords } = processReportAndKeywords(geminiResult);
      const { reportText: qwenReportText, keywords: qwenKeywords } = processReportAndKeywords(qwenResult);

      setGeminiReport(geminiReportText);
      setQwenReport(qwenReportText);
      setGeminiKeywords(geminiKeywords);
      setQwenKeywords(qwenKeywords);
      setEditInstruction('');
      setAppState('editing');
    } catch (e: any) {
      setError(`Failed to refine report: ${e.message}`);
      setAppState('editing');
    }
  }, [editInstruction, geminiReport, qwenReport]);

  const renderContent = () => {
    switch (appState) {
      case 'idle':
        return (
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-slate-100">Start a New Report</h2>
            <p className="text-slate-400 text-lg max-w-2xl">
              Paste your raw notes, transcript, or a rough draft below. The AI will structure it into a professional, well-formatted clinical report.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TemplateUploader onTemplateUpload={setTemplateContent} />
              <OldReportUploader onReportUpload={setOldReportContent} />
            </div>
            <textarea
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              placeholder="e.g., Patient is John Doe, 45 y/o male. MRI of the lumbar spine shows a mild disc bulge at L4-L5..."
              className="w-full h-60 bg-slate-900/70 border border-slate-700 rounded-lg p-4 text-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all duration-300"
            />
            <button
              onClick={handleGenerateReport}
              className="bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-semibold rounded-lg px-8 py-3 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all self-start shadow-lg shadow-sky-900/40"
              disabled={!initialNotes.trim()}
            >
              <WandIcon className="w-6 h-6"/>
              <span>Generate Report</span>
            </button>
          </div>
        );
      
      case 'generating':
        return (
          <div className="flex flex-col">
            <div className="flex items-center text-slate-300 mb-6 px-2">
              <Spinner className="w-6 h-6 mr-4" />
              <h2 className="text-2xl font-semibold">Generating Reports...</h2>
            </div>
            <SideBySideReportViewer geminiReport={streamingGeminiReport} qwenReport={streamingQwenReport} />
          </div>
        );

      case 'editing':
      case 'refining':
        return (
          <>
            <SideBySideReportViewer geminiReport={geminiReport} qwenReport={qwenReport} />
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {geminiKeywords.length > 0 && (
                <div className="p-5 bg-slate-900/70 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-300 mb-4">Gemini Keywords</h3>
                  <div className="flex flex-wrap gap-3">
                    {geminiKeywords.map((keyword, index) => (
                      <span key={index} className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium px-3 py-1.5 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {qwenKeywords.length > 0 && (
                <div className="p-5 bg-slate-900/70 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-300 mb-4">Qwen Keywords</h3>
                  <div className="flex flex-wrap gap-3">
                    {qwenKeywords.map((keyword, index) => (
                      <span key={index} className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium px-3 py-1.5 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 sticky bottom-4">
              <div className="relative">
                <input
                  type="text"
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  placeholder="e.g., 'Make the impression more concise'"
                  className="w-full bg-slate-800/80 backdrop-blur-sm border-2 border-slate-600 rounded-lg py-4 pl-5 pr-36 text-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none focus:border-sky-500 transition-all"
                  disabled={appState === 'refining'}
                />
                <button
                  onClick={handleRefine}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-semibold rounded-md px-5 py-2.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-sky-900/40"
                  disabled={appState === 'refining' || !editInstruction.trim()}
                >
                  {appState === 'refining' ? <Spinner className="w-5 h-5"/> : <WandIcon className="w-5 h-5"/>}
                  <span className="text-base">Refine</span>
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,150,200,0.3),rgba(255,255,255,0))] text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-300">
            EchoDraft
          </h1>
          <p className="text-slate-400 mt-4 text-xl">Your AI-Powered Reporting Assistant</p>
        </header>

        <main className="bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl shadow-black/40 p-6 sm:p-8">
          {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-6 border border-red-500/30 text-base" role="alert">{error}</div>}
          {renderContent()}
        </main>

        <footer className="text-center mt-12 text-slate-500 text-sm">
        </footer>
      </div>
    </div>
  );
}

export default App;
