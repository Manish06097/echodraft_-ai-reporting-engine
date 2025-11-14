import React, { useState, useCallback } from 'react';
import { readFileContent } from '../lib/fileReader';
import { UploadCloudIcon, XIcon } from './icons';

interface TemplateUploaderProps {
  onTemplateUpload: (content: string) => void;
}

const TemplateUploader: React.FC<TemplateUploaderProps> = ({ onTemplateUpload }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      try {
        const content = await readFileContent(file);
        onTemplateUpload(content);
        setFileName(file.name);
      } catch (err: any) {
        setError(err.toString());
        setFileName(null);
        onTemplateUpload('');
      }
    }
  }, [onTemplateUpload]);

  const handleRemoveFile = useCallback(() => {
    setFileName(null);
    onTemplateUpload('');
  }, [onTemplateUpload]);

  return (
    <div className="w-full">
      <label htmlFor="template-upload" className="block text-lg font-medium text-slate-300 mb-2">
        Upload Findings Template (Optional)
      </label>
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <input
            id="template-upload"
            type="file"
            accept=".txt,.docx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center w-full h-16 px-4 bg-slate-900/70 border-2 border-dashed border-slate-700 rounded-lg">
            {fileName ? (
              <span className="text-slate-200">{fileName}</span>
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <UploadCloudIcon className="w-6 h-6" />
                <span>Drag & drop or click to upload (.docx, .txt)</span>
              </div>
            )}
          </div>
        </div>
        {fileName && (
          <button
            onClick={handleRemoveFile}
            className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"
            aria-label="Remove template file"
          >
            <XIcon className="w-5 h-5 text-slate-300" />
          </button>
        )}
      </div>
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
};

export default TemplateUploader;
