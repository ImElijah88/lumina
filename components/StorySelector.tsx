
import React, { useState } from 'react';
import { BookOpen, Shuffle, Loader2, Scroll, Sword, Crown, Anchor } from 'lucide-react';
import { getSmartRandomStory, getFeaturedStories, BibleStory } from '../utils/bibleStories';
import { soundEngine } from '../utils/soundUtils';

interface StorySelectorProps {
  onSelect: (query: string) => void;
  isLoading: boolean;
}

export const StorySelector: React.FC<StorySelectorProps> = ({ onSelect, isLoading }) => {
  const [isShuffling, setIsShuffling] = useState(false);
  const featured = getFeaturedStories();

  const handleRandomPick = async () => {
    if (isLoading || isShuffling) return;
    
    setIsShuffling(true);
    soundEngine.playClick();
    
    // Simulate a "slot machine" shuffle effect
    const duration = 1500;
    const interval = 100;
    const startTime = Date.now();
    
    // Play a sound loop or multiple ticks
    const shuffleInterval = setInterval(() => {
       // Visual only - nothing to update in state really, just waiting
    }, interval);

    setTimeout(() => {
      clearInterval(shuffleInterval);
      const story = getSmartRandomStory();
      soundEngine.playCelestialChord(); // Victory sound
      setIsShuffling(false);
      onSelect(`${story.reference} (${story.title})`);
    }, duration);
  };

  const handlePresetClick = (story: BibleStory) => {
    soundEngine.playClick();
    onSelect(`${story.reference} (${story.title})`);
  };

  const getIconForStory = (id: string) => {
    const lowerId = id.toLowerCase();
    if (lowerId.includes('david') || lowerId.includes('gideon') || lowerId.includes('joshua') || lowerId.includes('jericho') || lowerId.includes('samson') || lowerId.includes('war') || lowerId.includes('army')) return <Sword className="w-5 h-5 text-orange-400" />;
    if (lowerId.includes('jonah') || lowerId.includes('noah') || lowerId.includes('ship') || lowerId.includes('sea') || lowerId.includes('water') || lowerId.includes('fish') || lowerId.includes('storm')) return <Anchor className="w-5 h-5 text-blue-400" />;
    if (lowerId.includes('solomon') || lowerId.includes('esther') || lowerId.includes('king') || lowerId.includes('queen') || lowerId.includes('royal') || lowerId.includes('magi')) return <Crown className="w-5 h-5 text-yellow-400" />;
    return <Scroll className="w-5 h-5 text-purple-400" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10 animate-fade-in-up delay-100">
      <div className="flex items-center gap-2 mb-4 px-2">
        <BookOpen className="w-4 h-4 text-purple-400" />
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Biblical Narratives</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        
        {/* RANDOMIZER BUTTON - Featured prominently */}
        <button
          onClick={handleRandomPick}
          disabled={isLoading}
          className="relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-xl border border-purple-500/30 bg-gradient-to-br from-[#0A0C10] to-purple-900/20 transition-all duration-300 group hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] active:scale-95"
        >
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className={`p-3 rounded-full bg-purple-900/30 mb-3 transition-transform duration-700 ${isShuffling ? 'rotate-[360deg]' : 'group-hover:rotate-12'}`}>
            {isShuffling ? (
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            ) : (
              <Shuffle className="w-8 h-8 text-purple-400" />
            )}
          </div>
          
          <div className="relative z-10 text-center">
            <h4 className="text-purple-100 font-bold text-lg mb-1">Surprise Me</h4>
            <p className="text-purple-300/60 text-xs">Discover a random story</p>
          </div>
        </button>

        {/* FEATURED PRESETS */}
        {featured.map((story) => (
          <button
            key={story.id}
            onClick={() => handlePresetClick(story)}
            disabled={isLoading || isShuffling}
            className="flex items-center gap-4 p-4 rounded-xl bg-[#0A0C10] border border-gray-800 transition-all duration-300 group hover:bg-gray-800/40 hover:-translate-y-0.5 hover:border-gray-700 text-left"
          >
            <div className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 group-hover:border-gray-700 transition-colors">
              {getIconForStory(story.id)}
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-200 font-semibold text-sm group-hover:text-white transition-colors">
                {story.title}
              </span>
              <span className="text-[10px] text-gray-500 font-mono mt-0.5 group-hover:text-purple-400 transition-colors">
                {story.reference}
              </span>
            </div>
          </button>
        ))}

      </div>
    </div>
  );
};
