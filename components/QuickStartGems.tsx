import React from 'react';
import { Sparkles, Feather, Heart, Zap, Sun, Shield, Mountain, ArrowRight, Eye, Flower2, Hourglass, GraduationCap, Lock, Sprout } from 'lucide-react';

interface QuickStartGemsProps {
  onSelect: (query: string) => void;
}

const GEMS = [
  // Original General Gems
  { label: "Find Peace", query: "Philippians 4:6-7", Icon: Feather, color: "text-teal-400", border: "group-hover:border-teal-500/30" },
  { label: "True Love", query: "1 Corinthians 13:4-8", Icon: Heart, color: "text-rose-400", border: "group-hover:border-rose-500/30" },
  { label: "Renew Strength", query: "Isaiah 40:31", Icon: Zap, color: "text-amber-400", border: "group-hover:border-amber-500/30" },
  { label: "Future Hope", query: "Jeremiah 29:11", Icon: Sun, color: "text-blue-400", border: "group-hover:border-blue-500/30" },
  { label: "Be Courageous", query: "Joshua 1:9", Icon: Shield, color: "text-indigo-400", border: "group-hover:border-indigo-500/30" },
  { label: "Firm Foundation", query: "Psalm 23", Icon: Mountain, color: "text-emerald-400", border: "group-hover:border-emerald-500/30" },
  
  // Specific Solutions (New)
  { label: "Purity & Focus", query: "2 Timothy 2:22", Icon: Eye, color: "text-cyan-400", border: "group-hover:border-cyan-500/30" }, // Men's Lust
  { label: "Inner Beauty", query: "1 Peter 3:3-4", Icon: Flower2, color: "text-pink-400", border: "group-hover:border-pink-500/30" }, // Women's Beauty
  { label: "Enduring Strength", query: "Isaiah 46:4", Icon: Hourglass, color: "text-purple-400", border: "group-hover:border-purple-500/30" }, // Elderly Health
  { label: "Child Wisdom", query: "Proverbs 22:6", Icon: GraduationCap, color: "text-sky-400", border: "group-hover:border-sky-500/30" }, // Education
  { label: "True Security", query: "1 Timothy 6:17", Icon: Lock, color: "text-yellow-400", border: "group-hover:border-yellow-500/30" }, // Rich Fear
  { label: "Steady Growth", query: "Proverbs 28:20", Icon: Sprout, color: "text-lime-400", border: "group-hover:border-lime-500/30" }, // Get Rich Quick
];

export const QuickStartGems: React.FC<QuickStartGemsProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-10 animate-fade-in-up delay-75">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Sparkles className="w-4 h-4 text-[#f2c46d]" />
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quick Discoveries</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {GEMS.map((gem) => (
          <button
            key={gem.query}
            onClick={() => onSelect(gem.query)}
            className={`flex items-center justify-between p-4 rounded-xl bg-[#0A0C10] border border-gray-800 transition-all duration-300 group hover:bg-gray-800/40 hover:-translate-y-0.5 ${gem.border}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-900/50 ${gem.color} bg-opacity-10 min-w-[36px] flex items-center justify-center`}>
                <gem.Icon className={`w-5 h-5 ${gem.color}`} />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-gray-200 font-semibold text-sm group-hover:text-white transition-colors">{gem.label}</span>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5 truncate max-w-[120px]">{gem.query}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};