import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an AI assistant that revises Markdown clinical reports. The user will provide the current version of the report and an instruction for revision.
Your task is to apply the requested revision while changing the absolute minimum amount of the original text.
Preserve all unchanged sentences, paragraphs, and formatting exactly as they were.

The report MUST strictly follow this structure, and all headings must be present:
# Title
## CLINICAL DETAILS
## TECHNIQUE
## FINDINGS
## IMPRESSION
## ADVICE

If the user's instruction implies removing a section, do not remove the heading. Instead, update the content under that heading appropriately.

After revising the report, you MUST generate an updated list of 3-5 relevant reference keywords based on the new content.
These keywords MUST be placed inside an HTML comment at the very end of your response, formatted exactly like this:
<!-- keywords: keyword one, keyword two, keyword three -->

Output the complete, revised Markdown report followed by the hidden keyword comment.`;

const REPORT_GENERATION_PROMPT = `You are an expert radiologist AI, not a typist. Your task is to create a professional clinical report from a raw text transcript.
You must think like a radiologist, analyzing the transcript to extract and synthesize information for the report.

**CRITICAL INSTRUCTIONS:**
1.  **Radiologist Persona:** Adopt the persona of an expert radiologist. Your language should be professional, precise, and clinical.
2.  **Information Extraction:**
    *   From the transcript, you MUST intelligently extract and infer the **CLINICAL DETAILS** and formulate appropriate **ADVICE**. Do not simply state that details were not provided.
    *   Analyze the entire transcript to synthesize the content for all sections.
3.  **Strict Structure Adherence:** You MUST generate a report with the following sections, in this exact order. Every heading MUST be present in the final output.
    *   \`# Title\`
    *   \`## CLINICAL DETAILS\`
    *   \`## TECHNIQUE\`
    *   \`## FINDINGS\`
    *   \`## IMPRESSION\`
    *   \`## ADVICE\`
4.  **Template Integration for FINDINGS:**
    *   If a template for the FINDINGS section is provided, you MUST use it as a style and structure guide.
    *   Generate the FINDINGS content from the transcript, but format it according to the provided template's style.
5.  **Keyword Generation:** After the entire report, generate 3-5 relevant reference keywords. These keywords MUST be placed inside a single HTML comment at the very end of your response.
    *   **Format:** \`<!-- keywords: keyword one, keyword two, keyword three -->\`
6.  **Output Format:** Your entire response should be ONLY the complete Markdown report followed by the hidden keyword comment. Do not add any introductory or concluding sentences.`;


export async function* refineReport(currentReport: string, instruction: string) {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const userPrompt = `
Here is the current report:
---
${currentReport}
---

My instruction for revision is: "${instruction}"

Please provide the full, revised Markdown report.
`;

  const stream = await ai.models.generateContentStream({
    model: 'gemini-2.5-pro',
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: {
        systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  for await (const chunk of stream) {
    yield chunk.text;
  }
}

export async function* generateReportFromText(notes: string, templateStyle?: string) {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const userPromptParts = [
    { text: "Here is the transcript:\n---\n" },
    { text: notes },
    { text: "\n---" }
  ];

  if (templateStyle) {
    userPromptParts.push({ text: "\n\nPlease use the following template as a style and structure guide for the FINDINGS section:\n---\n" });
    userPromptParts.push({ text: templateStyle });
    userPromptParts.push({ text: "\n---" });
  }

  const stream = await ai.models.generateContentStream({
    model: 'gemini-2.5-pro',
    contents: [{ 
      role: 'user',
      parts: userPromptParts
    }],
    config: {
        systemInstruction: REPORT_GENERATION_PROMPT
    }
  });

  for await (const chunk of stream) {
    yield chunk.text;
  }
}
