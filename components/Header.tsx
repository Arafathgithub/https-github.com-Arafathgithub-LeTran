import React from 'react';
import { LogoIcon } from './icons/Icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 shadow-md">
            <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
                <LogoIcon className="w-8 h-8 text-brand-blue" />
                <h1 className="text-xl font-bold text-white tracking-tight">
                    COBOL to Java Modernization Assistant
                </h1>
            </div>
        </header>
    );
};

export default Header;
