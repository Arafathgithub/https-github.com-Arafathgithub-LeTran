
export type ProcessStep = 'upload' | 'analyze' | 'plan' | 'transform' | 'done';

export interface PlanItem {
  title: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  plan?: PlanItem[];
  analysis?: string;
}

export type CodeLanguage = 'cobol' | 'java';

export interface UploadedFile {
  name: string;
  content: string;
  language: CodeLanguage;
}
