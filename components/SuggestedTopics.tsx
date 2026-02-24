import React from 'react';
import { Lightbulb } from 'lucide-react';
import { SUGGESTED_PROMPTS } from '../utils/bibleSuggestions';
import { soundEngine } from '../utils/soundUtils';

interface SuggestedTopicsProps {
  onSelect: (query: string) => void;
}

export const SuggestedTopics: React.FC<SuggestedTopicsProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-10 animate-fade-in-up delay-100">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Suggested Topics</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
                soundEngine.playClick();
                onSelect(prompt.query);
            }}
            onMouseEnter={() => soundEngine.playHover()}
            className="group relative flex flex-col items-start p-4 rounded-xl bg-[#0A0C10] border border-gray-800 text-left transition-all duration-300 hover:bg-gray-800/60 hover:border-gray-600 hover:-translate-y-1 shadow-sm hover:shadow-lg hover:shadow-amber-900/10"
          >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Lightbulb className="w-3 h-3 text-amber-400/50" />
            </div>
            <span className="font-medium text-gray-300 group-hover:text-white mb-1 transition-colors">{prompt.label}</span>
            <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors line-clamp-2">{prompt.query}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
