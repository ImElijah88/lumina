
import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { getDailyVerseReference } from '../services/geminiService';
import { soundEngine } from '../utils/soundUtils';

interface DailyInsightProps {
  onSelect: (query: string) => void;
  isLoading: boolean;
}

export const DailyInsight: React.FC<DailyInsightProps> = ({ onSelect, isLoading }) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [todayDate, setTodayDate] = useState<Date>(new Date());
  
  // Format date parts
  const dayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNumber = todayDate.getDate();
  const monthName = todayDate.toLocaleDateString('en-US', { month: 'long' });
  const year = todayDate.getFullYear();

  const handleReveal = async () => {
    setIsRevealing(true);
    soundEngine.playProcessingStart(); // Swoosh sound
    
    // Check local storage for today's verse to avoid refetching
    const todayKey = todayDate.toDateString();
    const storedDate = localStorage.getItem('lumina_daily_date');
    const storedRef = localStorage.getItem('lumina_daily_ref');
    
    let reference = '';

    if (storedDate === todayKey && storedRef) {
        reference = storedRef;
    } else {
        // Fetch new verse
        reference = await getDailyVerseReference();
        localStorage.setItem('lumina_daily_date', todayKey);
        localStorage.setItem('lumina_daily_ref', reference);
    }
    
    // Small artificial delay for effect if cached
    if (storedDate === todayKey) await new Promise(r => setTimeout(r, 600));

    soundEngine.playCelestialChord(); // Success sound
    setIsRevealing(false);
    onSelect(reference);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in-up">
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-r from-[#0d1017] to-[#0A0C10] shadow-2xl group animate-holy-glow">
        
        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none transition-opacity group-hover:bg-teal-500/10"></div>
        
        <div className="flex flex-col md:flex-row items-stretch">
            
            {/* Calendar Section */}
            <div className="flex-shrink-0 w-full md:w-32 bg-gray-900/50 border-b md:border-b-0 md:border-r border-gray-800 p-6 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">{monthName}</span>
                <span className="text-4xl font-serif font-bold text-gray-100">{dayNumber}</span>
                <span className="text-xs text-gray-500 mt-1">{dayName}</span>
                <span className="text-[10px] text-gray-600 mt-0.5">{year}</span>
            </div>

            {/* Content Section */}
            <div className="flex-grow p-6 flex flex-col justify-center items-start relative">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-teal-100 uppercase tracking-wide">Verse of the Day</h3>
                </div>
                
                <p className="text-gray-400 text-sm mb-6 max-w-lg leading-relaxed">
                    Discover a passage chosen for this specific day in history. Unveil its meaning, context, and practical application for your life today.
                </p>

                <button
                    onClick={handleReveal}
                    disabled={isLoading || isRevealing}
                    onMouseEnter={() => soundEngine.playHover()}
                    className="group/btn relative inline-flex items-center gap-2 px-6 py-2.5 bg-teal-900/20 text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/20 hover:border-teal-400/50 hover:text-teal-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRevealing || isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Revealing...</span>
                        </>
                    ) : (
                        <>
                           <span>Reveal & Study</span>
                           <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
