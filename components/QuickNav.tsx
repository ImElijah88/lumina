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
    <div className="flex justify-center mb-8 sticky top-20 z-30 animate-fade-in-up delay-75 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 p-1.5 bg-[#0A0C10]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-white/5">
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
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 group overflow-hidden
                ${isActive 
                  ? 'bg-gray-800 text-white shadow-lg ring-1 ring-white/10' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
              <tab.icon className={`w-4 h-4 transition-colors ${isActive ? tab.color : 'text-gray-500 group-hover:text-gray-300'}`} />
              
              <span className={`whitespace-nowrap transition-all duration-300 ${isActive ? 'max-w-[150px] opacity-100 ml-1' : 'max-w-0 opacity-0 md:max-w-[150px] md:opacity-70 md:group-hover:opacity-100 md:ml-1'}`}>
                {tab.label}
              </span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full shadow-[0_0_8px_currentColor] animate-pulse ${tab.color.replace('text-', 'bg-')}`}></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
