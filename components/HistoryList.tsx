import React from 'react';
import { StudyContent } from '../types';
import { Clock, ChevronRight, Bookmark } from 'lucide-react';
import { soundEngine } from '../utils/soundUtils';

interface HistoryListProps {
  history: StudyContent[];
  onSelect: (study: StudyContent) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 animate-fade-in">
      <div className="flex items-center gap-2 mb-6 px-2">
        <Clock className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-200">Recent Studies</h3>
        <span className="text-xs text-green-500/80 bg-green-900/20 px-2 py-0.5 rounded border border-green-900/30 ml-auto">
          Available Offline
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {history.map((study, index) => (
          <button
            key={study.timestamp || index}
            onClick={() => onSelect(study)}
            onMouseEnter={() => soundEngine.playHover()}
            className="group relative flex flex-col items-start p-5 bg-[#0A0C10] border border-gray-800 rounded-xl 
                     hover:border-blue-500/30 hover:bg-gray-900/50 hover:shadow-lg hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300 text-left w-full"
          >
            <div className="flex justify-between w-full mb-2">
              <span className="font-serif font-medium text-[#f2c46d] group-hover:text-[#ffe4a0] transition-colors">
                {study.verseReference}
              </span>
              <Bookmark className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>

            {study.comparison && (
              <div className="text-xs text-teal-500 mb-2">
                vs. {study.comparison.secondReference}
              </div>
            )}

            <p className="text-sm text-gray-400 line-clamp-2 mb-3 group-hover:text-gray-300 transition-colors">
              {study.keyMeaning}
            </p>

            <div className="mt-auto w-full flex items-center justify-between pt-3 border-t border-gray-800/50">
              <span className="text-xs text-gray-600">
                {study.timestamp 
                  ? new Date(study.timestamp).toLocaleString() 
                  : 'Saved'}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};