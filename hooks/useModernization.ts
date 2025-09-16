
import { useState, useCallback } from 'react';
import type { ProcessStep, ChatMessage, UploadedFile, PlanItem, AIProvider } from '../types';
import * as geminiService from '../services/geminiService';
import * as azureOpenAIService from '../services/azureOpenAIService';

const services = {
  gemini: geminiService,
  azure: azureOpenAIService,
};

export const useModernization = (provider: AIProvider) => {
  const [currentStep, setCurrentStep] = useState<ProcessStep>('upload');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am your COBOL modernization assistant. Please upload your COBOL files to begin.' }
  ]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeFile, setActiveFile] = useState<UploadedFile | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const api = services[provider];

  const addMessage = (message: Omit<ChatMessage, 'id'>) => {
    setMessages(prev => [...prev, { ...message, id: Date.now().toString() }]);
  };

  const handleFileUpload = useCallback(async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsLoading(true);
    const newFiles: UploadedFile[] = [];
    for (const file of Array.from(uploadedFiles)) {
      if (file.name.toLowerCase().endsWith('.cbl') || file.name.toLowerCase().endsWith('.cob')) {
        const content = await file.text();
        newFiles.push({ name: file.name, content, language: 'cobol' });
      }
    }

    if (newFiles.length > 0) {
      setFiles(newFiles);
      setActiveFile(newFiles[0]);
      addMessage({ sender: 'user', text: `Uploaded ${newFiles.length} COBOL file(s).` });
      addMessage({ sender: 'ai', text: 'Files uploaded successfully. I will now analyze the code. This may take a moment.' });
      setCurrentStep('analyze');
      
      try {
        const analysisResult = await api.analyzeCobolCode(newFiles);
        setAnalysis(analysisResult);
        addMessage({ sender: 'ai', analysis: analysisResult });
        addMessage({ sender: 'ai', text: 'Analysis complete. Next, I will generate a modernization plan.' });
        setCurrentStep('plan');
      } catch (e) {
        const err = e as Error;
        addMessage({ sender: 'ai', text: `An error occurred during analysis: ${err.message}` });
        setCurrentStep('upload');
      }
    } else {
      addMessage({ sender: 'ai', text: 'No valid COBOL files (.cbl, .cob) were found. Please try again.' });
    }
    setIsLoading(false);
  }, [api]);
  
  const generatePlan = useCallback(async () => {
    if (!analysis) return;
    setIsLoading(true);
    addMessage({ sender: 'user', text: 'Generate the modernization plan.' });
    addMessage({ sender: 'ai', text: 'Creating a modernization plan based on the analysis...' });
    try {
      const planResult = await api.createModernizationPlan(analysis);
      setPlan(planResult);
      addMessage({ sender: 'ai', plan: planResult });
      addMessage({ sender: 'ai', text: 'Modernization plan created. Ready to transform the code to Java.' });
      setCurrentStep('transform');
    } catch(e) {
      const err = e as Error;
      addMessage({ sender: 'ai', text: `An error occurred while creating the plan: ${err.message}` });
    }
    setIsLoading(false);
  }, [analysis, api]);
  
  const transformCode = useCallback(async () => {
    const cobolFiles = files.filter(f => f.language === 'cobol');
    if (cobolFiles.length === 0 || !plan) return;
    setIsLoading(true);
    addMessage({ sender: 'user', text: 'Transform the code to Java.' });
    addMessage({ sender: 'ai', text: 'Transforming COBOL to Java. This is the final step and may take some time.' });
    try {
      const javaFiles = await api.convertCobolToJava(cobolFiles, plan);
      setFiles(prev => [...prev, ...javaFiles]);
      setActiveFile(javaFiles[0] || null);
      addMessage({ sender: 'ai', text: 'Transformation complete! You can now view the generated Java files.'});
      setCurrentStep('done');
    } catch(e) {
      const err = e as Error;
      addMessage({ sender: 'ai', text: `An error occurred during transformation: ${err.message}` });
    }
    setIsLoading(false);
  }, [files, plan, api]);

  const triggerNextStep = useCallback(() => {
    if (currentStep === 'plan') generatePlan();
    else if (currentStep === 'transform') transformCode();
  }, [currentStep, generatePlan, transformCode]);

  const handleSendMessage = useCallback(async (text: string) => {
    addMessage({ sender: 'user', text });
    setIsLoading(true);
    try {
        const response = await api.getChatResponse(text);
        addMessage({ sender: 'ai', text: response });
    } catch (e) {
        const err = e as Error;
        addMessage({ sender: 'ai', text: `Sorry, I encountered an error: ${err.message}` });
    }
    setIsLoading(false);
  }, [api]);
  
  const resetProcess = useCallback(() => {
    setCurrentStep('upload');
    setMessages([
        { id: '1', sender: 'ai', text: 'Hello! I am your COBOL modernization assistant. Please upload your COBOL files to begin.' }
    ]);
    setFiles([]);
    setActiveFile(null);
    setAnalysis(null);
    setPlan(null);
    setIsLoading(false);
  }, []);


  return {
    currentStep,
    messages,
    files,
    activeFile,
    analysis,
    plan,
    isLoading,
    handleFileUpload,
    setActiveFile,
    triggerNextStep,
    handleSendMessage,
    resetProcess
  };
};
