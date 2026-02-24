
import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Save, Quote, User } from 'lucide-react';
import { generateSpiritualPrayer } from '../services/geminiService';
import { soundEngine } from '../utils/soundUtils';
import { SavedPrayer } from '../types';
import { PRAYER_CHARACTERS, PRAYER_THEMES } from '../utils/bibleStories';

interface PrayerGeneratorProps {
  onSave: (prayer: SavedPrayer) => void;
  isLoading: boolean;
}

export const PrayerGenerator: React.FC<PrayerGeneratorProps> = ({ onSave, isLoading: globalLoading }) => {
  const [prayer, setPrayer] = useState<SavedPrayer | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Track used characters to ensure diversity
  const [usedCharacters, setUsedCharacters] = useState<string[]>([]);

  // Pick a random character that hasn't been used yet in this session
  const getNextCharacter = () => {
    // Filter out used characters
    const available = PRAYER_CHARACTERS.filter(c => !usedCharacters.includes(c));
    
    // If we've used them all (unlikely in one session, but safe to handle), reset list
    if (available.length === 0) {
        const resetChar = PRAYER_CHARACTERS[Math.floor(Math.random() * PRAYER_CHARACTERS.length)];
        setUsedCharacters([resetChar]);
        return resetChar;
    }

    const randomChar = available[Math.floor(Math.random() * available.length)];
    setUsedCharacters(prev => [...prev, randomChar]);
    return randomChar;
  };

  const getNextTheme = () => {
    return PRAYER_THEMES[Math.floor(Math.random() * PRAYER_THEMES.length)];
  };

  const handleGenerate = async () => {
    if (isGenerating || globalLoading) return;
    
    setIsGenerating(true);
    setPrayer(null);
    setIsSaved(false);
    setIsCopied(false);
    soundEngine.playProcessingStart();
    
    try {
      // 1. Select a unique character and theme client-side
      const character = getNextCharacter();
      const theme = getNextTheme();
      console.log("Generating prayer inspired by:", character, "Theme:", theme);

      // 2. Pass this character and theme to the service
      const result = await generateSpiritualPrayer(character, theme);
      
      if (result) {
        // Artificial delay for effect
        setTimeout(() => {
             setPrayer(result);
             setIsGenerating(false);
             soundEngine.playCelestialChord();
        }, 1200);
      } else {
        setIsGenerating(false);
      }
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  };

  const handleCopyFull = async () => {
    if (!prayer) return;
    const text = `${prayer.content.text}\n\n"${prayer.content.affirmation}"`;
    
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    soundEngine.playClick();
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    if (!prayer) return;
    onSave(prayer);
    setIsSaved(true);
    soundEngine.playClick();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-16 animate-fade-in-up delay-150">
      
      {/* Header / Trigger */}
      <div className="flex flex-col items-center justify-center mb-6">
         <div className="flex items-center gap-2 mb-4 px-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prayer Creation Module</h3>
         </div>
         
         {!prayer && !isGenerating && (
             <button
               onClick={handleGenerate}
               className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0A0C10] border border-rose-500/30 rounded-2xl hover:bg-rose-950/10 hover:border-rose-500/60 transition-all duration-300 shadow-lg hover:shadow-rose-900/20 active:scale-95"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-purple-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                <Sparkles className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform duration-500" />
                <span className="text-rose-100 font-medium">Generate Divine Prayer</span>
             </button>
         )}
      </div>

      {/* Loading State */}
      {isGenerating && (
         <div className="w-full h-64 flex flex-col items-center justify-center border border-gray-800 rounded-2xl bg-[#0A0C10]/50 backdrop-blur-sm animate-pulse mx-4 md:mx-0">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin mb-4" />
            <p className="text-rose-200/70 font-medium">Weaving intentions...</p>
            <p className="text-xs text-gray-500 mt-2">Connecting with the Divine pattern</p>
         </div>
      )}

      {/* Result Display - UNIFIED FLOW */}
      {prayer && !isGenerating && (
        <div className="relative bg-[#0A0C10] border border-rose-900/30 rounded-3xl overflow-hidden shadow-2xl animate-fade-in mx-4 md:mx-0">
           
           {/* Decorative Background */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none"></div>

           <div className="p-6 md:p-10 relative z-10">
              
              {/* Context Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-rose-900/20 pb-4 gap-4 md:gap-0">
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif text-rose-100 font-bold mb-1">{prayer.scenario}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-rose-400/80 text-xs uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Inspired by {prayer.character}</span>
                        </div>
                        {prayer.theme && (
                            <>
                                <span className="text-rose-900">•</span>
                                <span>{prayer.theme}</span>
                            </>
                        )}
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-rose-500 opacity-50 hidden md:block" />
              </div>

              {/* THE PRAYER BODY */}
              <div className="mb-10">
                <p className="text-lg md:text-xl text-gray-200 leading-loose font-serif italic opacity-90 first-letter:text-5xl first-letter:font-bold first-letter:text-rose-400 first-letter:mr-2 first-letter:float-left">
                    {prayer.content.text}
                </p>
              </div>

              {/* Daily Affirmation Gem */}
              <div className="relative p-6 rounded-xl bg-gradient-to-r from-rose-900/20 to-transparent border border-rose-500/20 mb-8">
                  <div className="absolute -top-3 left-6 bg-[#0A0C10] px-2 text-rose-400">
                    <Quote className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-center text-rose-200 font-medium tracking-wide">
                    "{prayer.content.affirmation}"
                  </p>
                  <p className="text-center text-[10px] text-rose-500/60 uppercase tracking-widest mt-2">Daily Affirmation</p>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                 <button 
                   onClick={handleGenerate}
                   className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm transition-colors whitespace-nowrap"
                 >
                    <Sparkles className="w-4 h-4" /> New Prayer
                 </button>
                 
                 <button 
                   onClick={handleCopyFull}
                   className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm transition-colors whitespace-nowrap"
                 >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "Copied" : "Copy"}
                 </button>

                 <button 
                   onClick={handleSave}
                   disabled={isSaved}
                   className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all
                     ${isSaved ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)]'}`}
                 >
                    {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isSaved ? 'Saved' : 'Save to Library'}
                 </button>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};
