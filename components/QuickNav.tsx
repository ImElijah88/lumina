import React from 'react';
import { BookOpen, Lightbulb, Heart, Compass, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundUtils';

export type QuickNavTab = 'narrative' | 'topics' | 'mood' | 'discoveries' | 'prayer';

interface QuickNavProps {
  activeTab: QuickNavTab;
  onTabChange: (tab: QuickNavTab) => void;
}

export const QuickNav: React.FC<QuickNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: QuickNavTab; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'narrative', label: 'Biblical Narrative', icon: BookOpen, color: 'text-amber-400' },
    { id: 'topics', label: 'Suggested Topics', icon: Lightbulb, color: 'text-yellow-400' },
    { id: 'mood', label: 'Emotions', icon: Heart, color: 'text-rose-400' },
    { id: 'discoveries', label: 'Quick Discoveries', icon: Compass, color: 'text-teal-400' },
    { id: 'prayer', label: 'Daily Prayer', icon: Sparkles, color: 'text-purple-400' },
  ];

  return (
    <div id="quick-nav-tabs" className="flex justify-center mb-8 sticky top-20 z-30 animate-fade-in-up delay-75 pointer-events-none w-full px-2 sm:px-4">
      <div className="pointer-events-auto flex flex-wrap justify-center items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-[#0A0C10]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-white/5 max-w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!isActive) {
                    soundEngine.playClick();
                    onTabChange(tab.id);
                }
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 group shrink-0
                ${isActive 
                  ? 'bg-gray-800 text-white shadow-lg ring-1 ring-white/10' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
              <tab.icon className={`w-5 h-5 transition-colors ${isActive ? tab.color : 'text-gray-500 group-hover:text-gray-300'}`} />
              
              {/* Custom Tooltip */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-gray-900 text-gray-200 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-800">
                {tab.label}
              </div>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full shadow-[0_0_8px_currentColor] animate-pulse ${tab.color.replace('text-', 'bg-')}`}></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
