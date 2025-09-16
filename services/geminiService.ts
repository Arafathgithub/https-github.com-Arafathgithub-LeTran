
import { GoogleGenAI, Type } from "@google/genai";
import type { UploadedFile, PlanItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

const generateContentWithRetry = async (
  prompt: string,
  schema?: object,
  retries = 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: schema ? "application/json" : "text/plain",
          ...(schema && { responseSchema: schema }),
        },
      });
      return result.text;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, 1000 * (i + 1)));
    }
  }
  throw new Error("Failed to generate content after multiple retries.");
};


export const analyzeCobolCode = async (files: UploadedFile[]): Promise<string> => {
  const codeBlocks = files.map(f => `--- ${f.name} ---\n\`\`\`cobol\n${f.content}\n\`\`\``).join('\n\n');
  const prompt = `
    You are an expert COBOL modernization assistant. Analyze the following COBOL code files.
    Provide a concise summary of the program's purpose, identify all file I/O operations, 
    database calls, and external program calls (CALL statements). 
    List the key business logic sections. 
    Focus on providing a high-level overview that will be useful for planning a Java migration.

    ${codeBlocks}
  `;
  return generateContentWithRetry(prompt);
};

export const createModernizationPlan = async (analysis: string): Promise<PlanItem[]> => {
  const prompt = `
    Based on the following analysis of a COBOL program, create a detailed modernization plan to convert it to modern, object-oriented Java. 
    The plan should be a series of actionable steps. For each step, provide a clear title and a detailed description.
    
    Analysis:
    ${analysis}
  `;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      plan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
        },
      },
    },
  };
  
  const responseText = await generateContentWithRetry(prompt, schema);
  const parsed = JSON.parse(responseText);
  return parsed.plan;
};

export const convertCobolToJava = async (files: UploadedFile[], plan: PlanItem[]): Promise<UploadedFile[]> => {
  const codeBlocks = files.map(f => `--- ${f.name} ---\n\`\`\`cobol\n${f.content}\n\`\`\``).join('\n\n');
  const planText = plan.map((item, index) => `${index + 1}. ${item.title}: ${item.description}`).join('\n');
  
  const prompt = `
    You are an expert COBOL to Java modernization engine. Convert the following COBOL code to clean, readable, and maintainable Java.
    Follow the provided modernization plan to guide your transformation. The Java code should be functionally equivalent to the COBOL code.
    Add Javadoc comments to explain complex logic.
    
    Modernization Plan:
    ${planText}

    COBOL Code:
    ${codeBlocks}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      javaFiles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            fileName: { type: Type.STRING },
            code: { type: Type.STRING },
          },
        },
      },
    },
  };

  const responseText = await generateContentWithRetry(prompt, schema);
  const parsed = JSON.parse(responseText);
  
  return parsed.javaFiles.map((file: { fileName: string; code: string }) => ({
    name: file.fileName,
    content: file.code,
    language: 'java'
  }));
};

export const getChatResponse = async(message: string): Promise<string> => {
    const prompt = `You are a helpful COBOL modernization assistant. A user has a question. Provide a helpful and concise response. User question: "${message}"`;
    return generateContentWithRetry(prompt);
}
