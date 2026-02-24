import React from 'react';
import { SearchResultItem } from '../types';
import { ArrowRight, BookOpen, Search } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResultItem[];
  query: string;
  onSelect: (reference: string) => void;
  onBack: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, query, onSelect, onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-200">
          Results for <span className="text-blue-400">"{query}"</span>
        </h2>
      </div>

      <div className="grid gap-4">
        {results.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect(item.reference)}
            className="group flex flex-col items-start p-5 bg-[#0A0C10] border border-gray-800 rounded-xl 
                     hover:border-blue-500/30 hover:bg-gray-900/50 transition-all duration-300 text-left w-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/0 group-hover:bg-blue-500/50 transition-colors duration-300"></div>
            
            <div className="flex justify-between w-full mb-2">
              <span className="font-serif font-bold text-[#f2c46d] text-lg group-hover:text-[#ffe4a0] transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4 opacity-50" />
                {item.reference}
              </span>
              <ArrowRight className="w-5 h-5 text-gray-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>

            <p className="text-gray-300 font-medium italic mb-3 text-lg leading-relaxed">
              "{item.text}"
            </p>

            <div className="inline-flex items-center px-2 py-1 rounded bg-blue-900/10 border border-blue-900/20 text-xs text-blue-300/80">
              {item.relevance}
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">Select a verse to explore its full meaning and context.</p>
      </div>
    </div>
  );
};