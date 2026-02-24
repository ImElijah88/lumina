import React from 'react';
import { BookOpen } from 'lucide-react';

interface HeaderProps {
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#050608]/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          onClick={onHomeClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none group"
          title="Return to Search"
        >
          <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            Lumina
          </span>
        </button>
        <div className="hidden sm:block text-xs font-medium text-gray-500 border border-gray-800 px-3 py-1 rounded-full">
          Bible Study Assistant
        </div>
      </div>
    </header>
  );
};