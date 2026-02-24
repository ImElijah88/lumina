import React from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeaderProps {
  onHomeClick?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick, isSidebarOpen, onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#050608]/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 group ${
              isSidebarOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            title={isSidebarOpen ? "Close Library" : "Open Library"}
          >
            <div className="relative">
              <BookOpen className={`w-6 h-6 transition-transform duration-300 ${isSidebarOpen ? 'scale-90' : 'scale-100'}`} />
              {/* Chevron overlay to indicate toggle action */}
              <div className={`absolute -right-1 -bottom-1 w-3 h-3 bg-[#050608] rounded-full flex items-center justify-center border border-gray-700 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                 {isSidebarOpen ? <ChevronLeft className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
              </div>
            </div>
          </button>

          <button 
            onClick={onHomeClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
            title="Return to Search"
          >
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              Lumina
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};