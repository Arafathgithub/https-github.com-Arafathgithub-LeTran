
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, PlanItem, ProcessStep } from '../types';
import { BotIcon, SendIcon, CheckCircle, BrainCircuit, FileCode, Hammer, PartyPopper, RefreshCwIcon } from './icons/Icons';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  currentStep: ProcessStep;
  resetProcess: () => void;
}

const PlanDisplay: React.FC<{ plan: PlanItem[] }> = ({ plan }) => (
  <div className="mt-2 space-y-3">
    <h3 className="text-lg font-semibold text-gray-300">Modernization Plan</h3>
    <ul className="border border-gray-700 rounded-lg divide-y divide-gray-700">
      {plan.map((item, index) => (
        <li key={index} className="p-3">
          <p className="font-semibold text-brand-blue">{index + 1}. {item.title}</p>
          <p className="text-sm text-gray-400 mt-1">{item.description}</p>
        </li>
      ))}
    </ul>
  </div>
);

const AnalysisDisplay: React.FC<{ analysis: string }> = ({ analysis }) => (
  <div className="mt-2 p-3 bg-gray-900 border border-gray-700 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-300 mb-2">Code Analysis</h3>
    <pre className="text-sm text-gray-400 whitespace-pre-wrap font-mono">{analysis}</pre>
  </div>
);


const Message: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isAI = msg.sender === 'ai';
  return (
    <div className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAI ? 'bg-brand-blue' : 'bg-gray-600'}`}>
        {isAI ? <BotIcon className="w-5 h-5 text-white" /> : <span className="text-lg font-bold">U</span>}
      </div>
      <div className={`max-w-md p-3 rounded-lg ${isAI ? 'bg-gray-800 rounded-tl-none' : 'bg-gray-700 rounded-tr-none'}`}>
        {msg.text && <p className="text-gray-300 whitespace-pre-wrap">{msg.text}</p>}
        {msg.plan && <PlanDisplay plan={msg.plan} />}
        {msg.analysis && <AnalysisDisplay analysis={msg.analysis} />}
      </div>
    </div>
  );
};

const LoadingIndicator: React.FC = () => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center animate-pulse-fast">
            <BotIcon className="w-5 h-5 text-white" />
        </div>
        <div className="max-w-md p-3 rounded-lg bg-gray-800 rounded-tl-none">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);

const StepNotification: React.FC<{ currentStep: ProcessStep }> = ({ currentStep }) => {
    const notifications = {
        upload: { icon: <FileCode className="w-5 h-5"/>, text: "Upload your COBOL files to start." },
        analyze: { icon: <BrainCircuit className="w-5 h-5"/>, text: "Analyzing code..." },
        plan: { icon: <CheckCircle className="w-5 h-5 text-green-400"/>, text: "Analysis complete. Ready to create plan." },
        transform: { icon: <Hammer className="w-5 h-5"/>, text: "Plan created. Ready to transform." },
        done: { icon: <PartyPopper className="w-5 h-5 text-yellow-400"/>, text: "Modernization complete!" },
    };
    const {icon, text} = notifications[currentStep];

    return (
        <div className="sticky bottom-0 bg-gray-800/80 backdrop-blur-sm p-3 border-t border-gray-700">
            <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
                {icon}
                <span>{text}</span>
            </div>
        </div>
    )
}

export default function ChatPanel({ messages, onSendMessage, isLoading, currentStep, resetProcess }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Modernization Assistant</h2>
        <button onClick={resetProcess} className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400" title="Start Over">
          <RefreshCwIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => <Message key={msg.id} msg={msg} />)}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      <StepNotification currentStep={currentStep} />

      <div className="p-4 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "AI is working..." : "Ask a question..."}
            disabled={isLoading || currentStep !== 'done'}
            className="flex-1 w-full bg-gray-800 text-gray-300 rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || currentStep !== 'done'}
            className="bg-brand-blue text-white rounded-lg p-2.5 flex items-center justify-center transition-all hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
