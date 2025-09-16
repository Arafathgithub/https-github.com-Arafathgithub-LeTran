
import type { UploadedFile, PlanItem } from '../types';

const MODEL_NAME = 'gpt-4o';

const callAzureOAI = async (
  messages: { role: 'system' | 'user'; content: string }[],
  expectJson: boolean,
  retries = 3
): Promise<string> => {
  const API_KEY = process.env.AZURE_OAI_API_KEY;
  const ENDPOINT = process.env.AZURE_OAI_ENDPOINT;

  if (!API_KEY || !ENDPOINT) {
    throw new Error("AZURE_OAI_API_KEY or AZURE_OAI_ENDPOINT environment variable not set. Please ensure your endpoint is complete, e.g., https://<your-resource>.openai.azure.com/openai/deployments/<your-deployment>/chat/completions?api-version=2024-02-01");
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        body: JSON.stringify({
          messages,
          model: MODEL_NAME,
          temperature: 0.2,
          max_tokens: 4096,
          ...(expectJson && { response_format: { type: 'json_object' } }),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Azure OpenAI API error! status: ${response.status}, body: ${errorBody}`);
      }

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      throw new Error('Invalid response structure from Azure OpenAI API');

    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, 1000 * (i + 1)));
    }
  }
  throw new Error("Failed to get response from Azure OpenAI after multiple retries.");
};

export const analyzeCobolCode = async (files: UploadedFile[]): Promise<string> => {
    const codeBlocks = files.map(f => `--- ${f.name} ---\n\`\`\`cobol\n${f.content}\n\`\`\``).join('\n\n');
    const userPrompt = `
      Analyze the following COBOL code files.
      Provide a concise summary of the program's purpose, identify all file I/O operations, 
      database calls, and external program calls (CALL statements). 
      List the key business logic sections. 
      Focus on providing a high-level overview that will be useful for planning a Java migration.
  
      ${codeBlocks}
    `;
    const messages = [
        { role: 'system' as const, content: 'You are an expert COBOL modernization assistant.' },
        { role: 'user' as const, content: userPrompt }
    ];
    return callAzureOAI(messages, false);
};
  
export const createModernizationPlan = async (analysis: string): Promise<PlanItem[]> => {
    const userPrompt = `
      Based on the following analysis of a COBOL program, create a detailed modernization plan to convert it to modern, object-oriented Java. 
      The plan should be a series of actionable steps. For each step, provide a clear title and a detailed description.
      Respond with a JSON object containing a single key "plan" which is an array of objects. Each object must have "title" (string) and "description" (string) properties.
      
      Analysis:
      ${analysis}
    `;
    const messages = [
        { role: 'system' as const, content: 'You are an expert COBOL modernization assistant. You must respond with a valid JSON object.' },
        { role: 'user' as const, content: userPrompt }
    ];
    const responseText = await callAzureOAI(messages, true);
    const parsed = JSON.parse(responseText);
    return parsed.plan;
};

export const convertCobolToJava = async (files: UploadedFile[], plan: PlanItem[]): Promise<UploadedFile[]> => {
    const codeBlocks = files.map(f => `--- ${f.name} ---\n\`\`\`cobol\n${f.content}\n\`\`\``).join('\n\n');
    const planText = plan.map((item, index) => `${index + 1}. ${item.title}: ${item.description}`).join('\n');
    
    const userPrompt = `
      Convert the following COBOL code to clean, readable, and maintainable Java.
      Follow the provided modernization plan to guide your transformation. The Java code should be functionally equivalent to the COBOL code.
      Add Javadoc comments to explain complex logic.
      Respond with a JSON object containing a single key "javaFiles" which is an array of objects. Each object must have "fileName" (string) and "code" (string) properties.
      
      Modernization Plan:
      ${planText}
  
      COBOL Code:
      ${codeBlocks}
    `;
    const messages = [
        { role: 'system' as const, content: 'You are an expert COBOL to Java modernization engine. You must respond with a valid JSON object.' },
        { role: 'user' as const, content: userPrompt }
    ];
  
    const responseText = await callAzureOAI(messages, true);
    const parsed = JSON.parse(responseText);
    
    return parsed.javaFiles.map((file: { fileName: string; code: string }) => ({
      name: file.fileName,
      content: file.code,
      language: 'java'
    }));
};
  
export const getChatResponse = async(message: string): Promise<string> => {
    const messages = [
        { role: 'system' as const, content: 'You are a helpful COBOL modernization assistant.' },
        { role: 'user' as const, content: `A user has a question. Provide a helpful and concise response. User question: "${message}"` }
    ];
    return callAzureOAI(messages, false);
}