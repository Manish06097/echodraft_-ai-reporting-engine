import mammoth from 'mammoth';
import * as pdf from 'pdf-parse';

export async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (event.target?.result) {
        try {
          const arrayBuffer = event.target.result as ArrayBuffer;
          if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } else if (file.type === 'application/pdf') {
            const data = await (pdf as any).default(Buffer.from(arrayBuffer));
            resolve(data.text);
          } else {
            // For .txt and other text files
            const decoder = new TextDecoder();
            resolve(decoder.decode(arrayBuffer));
          }
        } catch (error) {
          reject(`Error reading ${file.name}: ${error}`);
        }
      } else {
        reject('Failed to read file');
      }
    };

    reader.onerror = () => {
      reject('Error reading file');
    };

    reader.readAsArrayBuffer(file);
  });
}
