
import React from 'react';
import { LogoIcon } from './icons/Icons';
import type { AIProvider } from '../types';

interface HeaderProps {
    aiProvider: AIProvider;
    onProviderChange: (provider: AIProvider) => void;
}

const AIProviderSwitcher: React.FC<HeaderProps> = ({ aiProvider, onProviderChange }) => {
    return (
        <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-lg">
            <button
                onClick={() => onProviderChange('gemini')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    aiProvider === 'gemini' 
                    ? 'bg-brand-blue text-white shadow-sm' 
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
                aria-pressed={aiProvider === 'gemini'}
            >
                Gemini
            </button>
            <button
                onClick={() => onProviderChange('azure')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    aiProvider === 'azure' 
                    ? 'bg-brand-blue text-white shadow-sm' 
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
                aria-pressed={aiProvider === 'azure'}
            >
                Azure OpenAI
            </button>
        </div>
    )
}


export const Header: React.FC<HeaderProps> = (props) => {
    return (
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 shadow-md">
            <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
                <LogoIcon className="w-8 h-8 text-brand-blue" />
                <h1 className="text-xl font-bold text-white tracking-tight">
                    COBOL to Java Modernization Assistant
                </h1>
                <div className="ml-auto">
                    <AIProviderSwitcher {...props} />
                </div>
            </div>
        </header>
    );
};

export default Header;
