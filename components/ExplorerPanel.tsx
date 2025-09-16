import React, { useState, useCallback, useEffect } from 'react';
import type { ProcessStep, UploadedFile, PlanItem, CodeLanguage } from '../types';
import { CobolIcon, JavaIcon, UploadCloudIcon, CheckCircle, BrainCircuit, FileCode, Hammer, PartyPopper, ChevronDown, ChevronRight, ClipboardList, DownloadIcon } from './icons/Icons';
import JSZip from 'jszip';

interface ExplorerPanelProps {
  currentStep: ProcessStep;
  files: UploadedFile[];
  activeFile: UploadedFile | null;
  onFileSelect: (file: UploadedFile) => void;
  onFileUpload: (files: FileList | null) => void;
  analysis: string | null;
  plan: PlanItem[] | null;
  triggerStep: () => void;
  isLoading: boolean;
}

const STEPS = [
  { id: 'upload', name: 'Upload', icon: FileCode },
  { id: 'analyze', name: 'Analyze', icon: BrainCircuit },
  { id: 'plan', name: 'Plan', icon: FileCode },
  { id: 'transform', name: 'Transform', icon: Hammer },
  { id: 'done', name: 'Done', icon: PartyPopper },
];

const ProcessStepper: React.FC<{ currentStep: ProcessStep }> = ({ currentStep }) => {
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-between p-4">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isActive = index === currentStepIndex;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                isCompleted ? 'bg-green-500 border-green-500' : 
                isActive ? 'bg-brand-blue border-brand-blue animate-pulse' : 
                'bg-gray-700 border-gray-600'
              }`}>
                {isCompleted ? <CheckCircle className="w-6 h-6 text-white"/> : <Icon className="w-6 h-6 text-gray-300"/>}
              </div>
              <p className={`mt-2 text-sm font-medium ${isActive ? 'text-brand-blue' : 'text-gray-400'}`}>{step.name}</p>
            </div>
            {index < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-700 mx-2"></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const FileExplorer: React.FC<{ files: UploadedFile[], activeFile: UploadedFile | null, onFileSelect: (file: UploadedFile) => void, currentStep: ProcessStep }> = ({ files, activeFile, onFileSelect, currentStep }) => {
    const [expanded, setExpanded] = useState<Record<CodeLanguage, boolean>>({ cobol: true, java: true });
    
    const toggleLanguage = (lang: CodeLanguage) => {
        setExpanded(prev => ({ ...prev, [lang]: !prev[lang] }));
    }

    const cobolFiles = files.filter(f => f.language === 'cobol');
    const javaFiles = files.filter(f => f.language === 'java');

    const handleDownload = () => {
        if (javaFiles.length === 0) return;
        
        const zip = new JSZip();
        javaFiles.forEach(file => {
            zip.file(file.name, file.content);
        });

        zip.generateAsync({ type: 'blob' }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'modernized-java-code.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        });
    };

    return (
        <div className="p-4 space-y-2">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">Code Explorer</h3>
                {currentStep === 'done' && javaFiles.length > 0 && (
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 hover:text-white transition-colors"
                        title="Download Java files as .zip"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download .zip</span>
                    </button>
                )}
            </div>
            {cobolFiles.length > 0 && (
                <div>
                    <button onClick={() => toggleLanguage('cobol')} className="flex items-center gap-2 w-full text-left font-semibold text-gray-400 hover:text-white">
                       {expanded.cobol ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4"/>} COBOL Files
                    </button>
                    {expanded.cobol && <div className="pl-4 mt-1 space-y-1">
                        {cobolFiles.map(file => (
                            <button key={file.name} onClick={() => onFileSelect(file)} className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded-md ${activeFile?.name === file.name ? 'bg-brand-blue/20 text-brand-blue' : 'hover:bg-gray-800'}`}>
                                <CobolIcon className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                            </button>
                        ))}
                    </div>}
                </div>
            )}
             {javaFiles.length > 0 && (
                <div>
                    <button onClick={() => toggleLanguage('java')} className="flex items-center gap-2 w-full text-left font-semibold text-gray-400 hover:text-white">
                        {expanded.java ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4"/>} Java Files
                    </button>
                    {expanded.java && <div className="pl-4 mt-1 space-y-1">
                        {javaFiles.map(file => (
                            <button key={file.name} onClick={() => onFileSelect(file)} className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded-md ${activeFile?.name === file.name ? 'bg-brand-blue/20 text-brand-blue' : 'hover:bg-gray-800'}`}>
                                <JavaIcon className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                            </button>
                        ))}
                    </div>}
                </div>
            )}
        </div>
    )
}

const PlanTimeline: React.FC<{ plan: PlanItem[] }> = ({ plan }) => {
    return (
      <div className="bg-gray-950 h-full p-6">
        <h3 className="text-xl font-bold text-white mb-6">Modernization Plan Timeline</h3>
        <ol className="relative border-l border-gray-700 ml-4">
          {plan.map((item, index) => (
            <li key={index} className="mb-10 ml-8">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-blue rounded-full -left-4 ring-4 ring-gray-900 text-white font-bold">
                {index + 1}
              </span>
              <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
                <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                <p className="mt-1 text-sm text-gray-400">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  };

const CodeViewer: React.FC<{ file: UploadedFile | null }> = ({ file }) => {
  return (
    <div className="bg-gray-950 h-full overflow-hidden">
      {file ? (
        <pre className="h-full overflow-auto p-4 text-sm text-gray-300 font-mono">
            <code>{file.content}</code>
        </pre>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>Select a file to view its content</p>
        </div>
      )}
    </div>
  );
};


const UploadView: React.FC<{ onFileUpload: (files: FileList | null) => void }> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="flex-1 p-4 flex flex-col justify-center items-center">
      <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full max-w-lg h-64 border-2 border-dashed rounded-xl flex flex-col justify-center items-center text-center transition-colors ${isDragging ? 'border-brand-blue bg-brand-blue/10' : 'border-gray-700'}`}>
        <UploadCloudIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-white">Drag & Drop COBOL files</h3>
        <p className="text-gray-500">or</p>
        <input type="file" ref={inputRef} onChange={(e) => onFileUpload(e.target.files)} multiple accept=".cbl,.cob" className="hidden" />
        <button onClick={() => inputRef.current?.click()} className="mt-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
          Browse Files
        </button>
      </div>
    </div>
  );
};


const ActionView: React.FC<{ currentStep: ProcessStep, triggerStep: () => void, isLoading: boolean }> = ({ currentStep, triggerStep, isLoading }) => {
    const actions = {
        plan: { text: "Generate Plan", icon: <BrainCircuit className="w-5 h-5"/> },
        transform: { text: "Transform to Java", icon: <Hammer className="w-5 h-5"/> },
    };

    if(currentStep !== 'plan' && currentStep !== 'transform') return null;

    const { text, icon } = actions[currentStep];

    return (
        <div className="p-4 border-t border-gray-800">
            <button
                onClick={triggerStep}
                disabled={isLoading}
                className="w-full bg-brand-blue text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Processing...' : text}
                {!isLoading && icon}
            </button>
        </div>
    )
}

export default function ExplorerPanel(props: ExplorerPanelProps) {
    const [activeTab, setActiveTab] = useState<'code' | 'plan'>('code');

    useEffect(() => {
        // When a plan is generated, switch to the plan tab to show it
        if (props.plan && props.currentStep === 'transform') {
          setActiveTab('plan');
        } else if (props.currentStep === 'upload' || props.currentStep === 'analyze') {
          // Reset to code tab for early stages
          setActiveTab('code');
        }
      }, [props.plan, props.currentStep]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden shadow-2xl">
      <ProcessStepper currentStep={props.currentStep} />
      <div className="border-y border-gray-800 flex-1 flex flex-col min-h-0">
        {props.currentStep === 'upload' ? (
          <UploadView onFileUpload={props.onFileUpload} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 flex-1 min-h-0">
            <div className="md:col-span-1 md:border-r border-gray-800 overflow-y-auto">
                <FileExplorer files={props.files} activeFile={props.activeFile} onFileSelect={props.onFileSelect} currentStep={props.currentStep}/>
            </div>
            <div className="md:col-span-2 flex flex-col min-h-0">
                {/* Tabs */}
                <div className="flex border-b border-gray-800 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'code' ? 'border-b-2 border-brand-blue text-white' : 'text-gray-500 hover:text-white'
                        }`}
                        aria-current={activeTab === 'code'}
                    >
                        <FileCode className="w-4 h-4" />
                        Code
                    </button>
                    {props.plan && (
                        <button
                            onClick={() => setActiveTab('plan')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'plan' ? 'border-b-2 border-brand-blue text-white' : 'text-gray-500 hover:text-white'
                            }`}
                            aria-current={activeTab === 'plan'}
                        >
                            <ClipboardList className="w-4 h-4" />
                            Plan
                        </button>
                    )}
                </div>
                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'code' && <CodeViewer file={props.activeFile} />}
                    {activeTab === 'plan' && props.plan && <PlanTimeline plan={props.plan} />}
                </div>
            </div>
          </div>
        )}
      </div>
      <ActionView currentStep={props.currentStep} triggerStep={props.triggerStep} isLoading={props.isLoading} />
    </div>
  );
}