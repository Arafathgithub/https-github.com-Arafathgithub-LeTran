
import React, { useState } from 'react';
import ChatPanel from './components/ChatPanel';
import ExplorerPanel from './components/ExplorerPanel';
import Header from './components/Header';
import { useModernization } from './hooks/useModernization';
import type { AIProvider } from './types';

export default function App() {
  const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
  const modernization = useModernization(aiProvider);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-gray-300 font-sans overflow-hidden">
      <Header aiProvider={aiProvider} onProviderChange={setAiProvider} />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-4 p-4 max-w-screen-2xl mx-auto w-full min-h-0">
        <div className="lg:col-span-3 min-h-0">
          <ChatPanel 
            messages={modernization.messages}
            onSendMessage={modernization.handleSendMessage}
            isLoading={modernization.isLoading}
            currentStep={modernization.currentStep}
            resetProcess={modernization.resetProcess}
          />
        </div>
        <div className="lg:col-span-7 min-h-0">
          <ExplorerPanel 
            currentStep={modernization.currentStep}
            files={modernization.files}
            activeFile={modernization.activeFile}
            onFileSelect={modernization.setActiveFile}
            onFileUpload={modernization.handleFileUpload}
            analysis={modernization.analysis}
            plan={modernization.plan}
            triggerStep={modernization.triggerNextStep}
            isLoading={modernization.isLoading}
          />
        </div>
      </main>
    </div>
  );
}
