
import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Trash2, Sparkles, X } from 'lucide-react';
import { StudyContent, SavedPrayer } from '../types';
import { soundEngine } from '../utils/soundUtils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  width: number;
  setWidth: (width: number) => void;
  favorites: StudyContent[];
  savedPrayers?: SavedPrayer[];
  onSelect: (study: StudyContent) => void;
  onRemoveFavorite: (study: StudyContent, e: React.MouseEvent) => void;
  onRemovePrayer?: (id: string, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  width,
  setWidth,
  favorites,
  savedPrayers = [],
  onSelect,
  onRemoveFavorite,
  onRemovePrayer
}) => {
  const [activeTab, setActiveTab] = useState<'verses' | 'prayers'>('verses');
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: 'verses' | 'prayers') => {
    soundEngine.playClick();
    setActiveTab(tab);
  };

  // Resize Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      let newWidth = e.clientX;
      if (newWidth < 240) newWidth = 240; // Min width
      if (newWidth > 600) newWidth = 600; // Max width
      
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setWidth]);

  return (
    <>
      {/* Overlay for mobile (closes sidebar when clicked) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full z-50 bg-[#050608]/95 backdrop-blur-xl border-r border-gray-800 shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
        style={{ width: isOpen ? (window.innerWidth < 768 ? '100%' : `${width}px`) : '0px' }}
      >
        <div className="flex flex-col h-full w-full relative"> 
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-[#0A0C10]/50">
            <div className="flex items-center gap-2 font-bold text-gray-200">
              <span className="text-xl tracking-tight">My Library</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
             <button 
               onClick={() => handleTabChange('verses')}
               onMouseEnter={() => soundEngine.playHover()}
               className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 
                 ${activeTab === 'verses' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
             >
                Verses
             </button>
             <button 
               onClick={() => handleTabChange('prayers')}
               onMouseEnter={() => soundEngine.playHover()}
               className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 
                 ${activeTab === 'prayers' ? 'border-rose-500 text-rose-500 bg-rose-500/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
             >
                Prayers
             </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800">
            
            {/* VERSES TAB */}
            {activeTab === 'verses' && (
              <div className="space-y-3 animate-fade-in">
                {favorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-center px-4">
                    <Bookmark className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm">No saved verses yet.</p>
                  </div>
                ) : (
                  favorites.map((fav, idx) => (
                    <div 
                      key={`${fav.verseReference}-${idx}`}
                      onClick={() => {
                        onSelect(fav);
                        if (window.innerWidth < 768) setIsOpen(false); // Close on mobile selection
                      }}
                      onMouseEnter={() => soundEngine.playHover()}
                      className="group relative flex flex-col p-3 bg-gray-900/30 border border-gray-800/50 rounded-lg hover:bg-gray-800 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[#f2c46d] font-serif font-medium text-sm group-hover:text-[#ffe4a0] transition-colors">
                          {fav.verseReference}
                        </span>
                        <button
                          onClick={(e) => onRemoveFavorite(fav, e)}
                          onMouseEnter={() => soundEngine.playHover()}
                          className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Remove from Saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {fav.comparison && (
                        <span className="text-[10px] text-teal-500 mb-1 block">vs {fav.comparison.secondReference}</span>
                      )}
                      <p className="text-xs text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">
                        {fav.keyMeaning}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PRAYERS TAB */}
            {activeTab === 'prayers' && (
              <div className="space-y-3 animate-fade-in">
                {savedPrayers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-center px-4">
                    <Sparkles className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm">No saved prayers yet.</p>
                  </div>
                ) : (
                  savedPrayers.map((prayer) => (
                    <div 
                      key={prayer.id}
                      onMouseEnter={() => soundEngine.playHover()}
                      className="group relative flex flex-col p-3 bg-rose-950/10 border border-rose-900/20 rounded-lg hover:bg-rose-950/20 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-900/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                    >
                       <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col">
                             <span className="text-rose-200 font-bold text-xs group-hover:text-rose-100 transition-colors">Prayer of {prayer.character}</span>
                             <span className="text-[10px] text-rose-400/70">{prayer.scenario}</span>
                          </div>
                          <button
                              onClick={(e) => onRemovePrayer && onRemovePrayer(prayer.id, e)}
                              onMouseEnter={() => soundEngine.playHover()}
                              className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete Prayer"
                          >
                              <Trash2 className="w-3.5 h-3.5" />
                          </button>
                       </div>
                       <div className="mt-2 pt-2 border-t border-rose-900/20">
                          <p className="text-[10px] text-gray-400 italic line-clamp-2 group-hover:text-gray-300 transition-colors">"{prayer.content.text}"</p>
                       </div>
                       <button 
                         onClick={() => {
                           soundEngine.playClick();
                           const text = `Prayer of ${prayer.character}\n\n${prayer.content.text}\n\nAffirmation: ${prayer.content.affirmation}`;
                           navigator.clipboard.writeText(text);
                           alert("Prayer copied to clipboard!");
                         }}
                         onMouseEnter={() => soundEngine.playHover()}
                         className="mt-2 text-[10px] text-gray-500 hover:text-rose-400 transition-colors text-left"
                       >
                          Click to Copy Full Prayer
                       </button>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
          
          {/* Footer branding */}
          <div className="p-4 border-t border-gray-800 text-[10px] text-gray-600 text-center">
            Lumina Personal Library
          </div>

          {/* Resize Handle */}
          <div 
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-50"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
          />
        </div>
      </div>
    </>
  );
};
