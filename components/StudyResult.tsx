
import React, { useState, useEffect } from 'react';
import { StudyContent, PassageContext } from '../types';
import { Card } from './ui/Card';
import { BiblicalCard } from './ui/BiblicalCard';
import { generateBiblicalArt, generateExternalArtPrompt, generateScript, generateSpeech, getPassageContext } from '../services/geminiService';
import { audioController } from '../utils/audioUtils';
import { soundEngine } from '../utils/soundUtils';
import { Scroll, History, Lightbulb, HeartHandshake, Languages, Scale, ArrowRightLeft, Merge, Quote, Link as LinkIcon, ArrowRight, Share2, Check, CloudDownload, Copy, MessageCircle, ImageIcon, Loader2, Compass, Wand2, X, Bookmark, FileText, Clapperboard, Volume2, StopCircle, BookOpen, ScrollText, Sparkles } from 'lucide-react';

import { ResultNav, ResultTab } from './ResultNav';

interface StudyResultProps {
  content: StudyContent;
  onNavigate: (query: string) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (content: StudyContent) => void;
}

export const StudyResult: React.FC<StudyResultProps> = ({ 
  content, 
  onNavigate,
  isFavorited = false,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<ResultTab>('analysis');
  const [copied, setCopied] = useState(false);
  const [kjvCopied, setKjvCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  
  // Context Copy States
  const [copiedContextKey, setCopiedContextKey] = useState<string | null>(null);

  // Feature States
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [cardImage, setCardImage] = useState<string | null>(null);

  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);

  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptContent, setScriptContent] = useState<string | null>(null);

  // Audio / TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Context State
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [passageContext, setPassageContext] = useState<PassageContext | null>(null);
  const [showContext, setShowContext] = useState(false);

  // Reset state when content changes
  useEffect(() => {
    setCardImage(null);
    setExternalPrompt(null);
    setScriptContent(null);
    setPassageContext(null);
    setShowContext(false);
    
    setIsGeneratingCard(false);
    setIsGeneratingPrompt(false);
    setIsGeneratingScript(false);
    setIsLoadingContext(false);
    
    // Stop audio if playing
    if (isPlaying) {
      audioController.stop();
      setIsPlaying(false);
    }

    setCopied(false);
    setKjvCopied(false);
    setPromptCopied(false);
    setScriptCopied(false);
    setCopiedContextKey(null);
  }, [content]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioController.stop();
    };
  }, []);

  const handleShare = async () => {
    soundEngine.playClick();
    const shareText = `Study: ${content.verseReference || 'Scripture Analysis'}
${content.kjvText ? `\n"${content.kjvText}"\n` : ''}
Simplified: ${content.simplifiedText || ''}

Meaning: ${content.keyMeaning}
- via Lumina Scripture Study`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lumina Study: ${content.verseReference}`,
          text: shareText,
        });
      } catch (err) {
        console.debug('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text', err);
      }
    }
  };

  const handleCopyKjv = async () => {
    soundEngine.playClick();
    if (content.kjvText) {
      try {
        const textToCopy = `"${content.kjvText}"\n- ${content.verseReference} (KJV)`;
        await navigator.clipboard.writeText(textToCopy);
        setKjvCopied(true);
        setTimeout(() => setKjvCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy KJV text', err);
      }
    }
  };

  const handleCopyPrompt = async () => {
    soundEngine.playClick();
    if (externalPrompt) {
      try {
        await navigator.clipboard.writeText(externalPrompt);
        setPromptCopied(true);
        setTimeout(() => setPromptCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy prompt', err);
      }
    }
  };

  const handleCopyScript = async () => {
    soundEngine.playClick();
    if (scriptContent) {
      try {
        await navigator.clipboard.writeText(scriptContent);
        setScriptCopied(true);
        setTimeout(() => setScriptCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy script', err);
      }
    }
  };

  const handleCopyContext = async (text: string, key: string) => {
    soundEngine.playClick();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedContextKey(key);
      setTimeout(() => setCopiedContextKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy context text', err);
    }
  };

  const handleGenerateCard = async () => {
    soundEngine.playClick();
    if (!content.verseReference) return;
    setIsGeneratingCard(true);
    soundEngine.playProcessingStart();
    const context = content.simplifiedText || content.keyMeaning || content.explanation;
    setTimeout(() => {
        const el = document.getElementById('biblical-card-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    const image = await generateBiblicalArt(content.verseReference, context);
    if (image) {
        setCardImage(image);
        soundEngine.playCelestialChord();
    }
    setIsGeneratingCard(false);
  };

  const handleGeneratePrompt = async () => {
    soundEngine.playClick();
    if (!content.verseReference) return;
    setIsGeneratingPrompt(true);
    soundEngine.playProcessingStart();
    const context = content.simplifiedText || content.keyMeaning || content.explanation;
    try {
      const prompt = await generateExternalArtPrompt(content.verseReference, context);
      setExternalPrompt(prompt);
      soundEngine.playCelestialChord();
      setTimeout(() => {
        const el = document.getElementById('external-prompt-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPrompt(false);
    }
  }

  const handleGenerateScript = async () => {
    soundEngine.playClick();
    if (!content.verseReference) return;
    setIsGeneratingScript(true);
    soundEngine.playProcessingStart();
    const context = content.simplifiedText || content.keyMeaning || content.explanation;
    try {
        const script = await generateScript(content.verseReference, context);
        setScriptContent(script);
        soundEngine.playCelestialChord();
        setTimeout(() => {
            const el = document.getElementById('script-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingScript(false);
    }
  }

  const handlePlayAudio = async () => {
    soundEngine.playClick();
    if (isPlaying) {
      audioController.stop();
      setIsPlaying(false);
      return;
    }

    if (!content.kjvText) return;

    setIsLoadingAudio(true);
    try {
      const voice = localStorage.getItem('lumina_preferred_voice') || 'Kore';
      const audioBase64 = await generateSpeech(content.kjvText, voice);
      
      if (audioBase64) {
        setIsLoadingAudio(false);
        setIsPlaying(true);
        await audioController.play(audioBase64, () => setIsPlaying(false));
      } else {
        setIsLoadingAudio(false);
        alert("Unable to generate audio at this time.");
      }
    } catch (error) {
      console.error(error);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  const handleShowContext = async () => {
    soundEngine.playClick();
    if (showContext) {
      setShowContext(false);
      return;
    }

    if (passageContext) {
      setShowContext(true);
      return;
    }

    if (!content.verseReference) return;

    setIsLoadingContext(true);
    const ctx = await getPassageContext(content.verseReference);
    if (ctx) {
      setPassageContext(ctx);
      setShowContext(true);
    }
    setIsLoadingContext(false);
  };

  const originalLanguageCopyText = [
    content.originalLanguageText,
    content.originalLanguageAnalysis
  ].filter(Boolean).join('\n\n');

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-12 relative">
      
      {/* Top Action Bar - Relative on Mobile to avoid overlap */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 md:absolute md:top-0 md:w-full md:z-10 px-2 md:px-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/20 border border-green-900/30 text-green-400 text-xs font-medium backdrop-blur-sm shadow-sm" title="This study is saved on your device">
          <CloudDownload className="w-3.5 h-3.5" />
          <span className="inline">Available Offline</span>
        </div>

        <div className="flex items-center gap-2">
           {onToggleFavorite && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleFavorite(content);
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium backdrop-blur-sm
                ${isFavorited 
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20' 
                  : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:text-yellow-500 hover:bg-gray-800/80 hover:border-yellow-500/30'
                }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
              <span className="inline">{isFavorited ? 'Saved' : 'Save'}</span>
            </button>
           )}

            <button
              onClick={handleShare}
              onMouseEnter={() => soundEngine.playHover()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:text-blue-400 hover:bg-gray-800/80 hover:border-blue-500/30 transition-all text-xs font-medium backdrop-blur-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
        </div>
      </div>

      {/* Header Verse Reference */}
      {content.verseReference && (
        <div className="text-center pt-2 md:pt-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#f2c46d] font-serif tracking-tight drop-shadow-sm px-4">
            {content.verseReference}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#f2c46d]/50 to-transparent mx-auto mt-4 rounded-full" />
        </div>
      )}

      {/* Result Navigation */}
      <ResultNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ANALYSIS TAB */}
      {activeTab === 'analysis' && (
        <div className="animate-fade-in space-y-6 md:space-y-8">
          {/* KJV Text Section */}
          {content.kjvText && (
        <div className="animate-fade-in-up delay-100">
          <div className="relative bg-[#0A0C10] border border-[#f2c46d]/20 rounded-xl p-6 md:p-8 text-center overflow-hidden group hover:border-[#f2c46d]/40 transition-colors duration-500 hover:shadow-lg hover:shadow-[#f2c46d]/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f2c46d]/40 to-transparent" />
            <Quote className="w-8 h-8 md:w-10 md:h-10 text-[#f2c46d]/10 absolute top-4 left-4" />
            <Quote className="w-8 h-8 md:w-10 md:h-10 text-[#f2c46d]/10 absolute bottom-4 right-4 rotate-180" />
            
            <div className="absolute top-3 right-3 z-20 flex gap-2">
               {/* Context Button */}
               <button
                 onClick={handleShowContext}
                 disabled={isLoadingContext}
                 onMouseEnter={() => soundEngine.playHover()}
                 className={`p-2 rounded-full transition-all duration-300 ${showContext ? 'text-teal-400 bg-teal-900/20' : 'text-[#f2c46d]/40 hover:text-teal-400 hover:bg-teal-900/10'}`}
                 title="View Surrounding Context"
               >
                 {isLoadingContext ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
               </button>

               {/* Audio Play Button */}
               <button
                 onClick={handlePlayAudio}
                 disabled={isLoadingAudio}
                 onMouseEnter={() => soundEngine.playHover()}
                 className={`p-2 rounded-full transition-all duration-300 ${isPlaying ? 'text-pink-400 bg-pink-900/20' : 'text-[#f2c46d]/40 hover:text-pink-400 hover:bg-pink-900/10'}`}
                 title={isPlaying ? "Stop Reading" : "Listen to Verse"}
               >
                  {isLoadingAudio ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <StopCircle className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
               </button>

               {/* Copy Button */}
               <button
                 onClick={handleCopyKjv}
                 onMouseEnter={() => soundEngine.playHover()}
                 className="p-2 rounded-full text-[#f2c46d]/40 hover:text-[#f2c46d] hover:bg-[#f2c46d]/10 transition-all duration-300"
                 title="Copy Verse"
               >
                 {kjvCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
               </button>
            </div>
            
            <p className="text-xl md:text-2xl text-[#f5f7fb] font-serif italic leading-relaxed relative z-10 font-medium select-text mt-8 md:mt-0">
              "{content.kjvText}"
            </p>
            <p className="text-[#f2c46d] text-xs font-bold tracking-[0.2em] mt-6 uppercase opacity-60">
              King James Version
            </p>
          </div>

          {/* Context Expander */}
          {showContext && passageContext && (
             <div className="mt-4 p-5 bg-[#0d1017] border border-gray-800 rounded-xl animate-fade-in-up border-l-4 border-l-teal-600/50 relative">
                <div className="flex items-center gap-2 mb-4 text-teal-400">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Surrounding Context</span>
                </div>
                
                <div className="space-y-6 text-sm text-gray-400">
                   {/* Narrative */}
                   <div className="relative group">
                     <p className="italic text-gray-300 border-b border-gray-800 pb-3 pr-8">
                       {passageContext.narrative}
                     </p>
                     <button
                        onClick={() => handleCopyContext(passageContext.narrative, 'narrative')}
                        onMouseEnter={() => soundEngine.playHover()}
                        className="absolute right-0 top-0 p-1.5 text-gray-500 hover:text-teal-400 transition-colors"
                        title="Copy narrative"
                     >
                       {copiedContextKey === 'narrative' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                     </button>
                   </div>

                   {/* Historical Analysis (New) */}
                   {passageContext.historicalAnalysis && (
                     <div className="bg-teal-950/10 border border-teal-900/30 rounded-lg p-4 relative group hover:bg-teal-950/20 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                           <History className="w-3.5 h-3.5 text-teal-500" />
                           <span className="text-[10px] text-teal-500 font-bold uppercase">Historical & Verification Context</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed pr-6">{passageContext.historicalAnalysis}</p>
                        <button
                           onClick={() => handleCopyContext(passageContext.historicalAnalysis, 'history')}
                           onMouseEnter={() => soundEngine.playHover()}
                           className="absolute right-2 top-2 p-1.5 text-gray-600 hover:text-teal-400 transition-colors"
                           title="Copy historical analysis"
                        >
                           {copiedContextKey === 'history' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                     </div>
                   )}
                   
                   {/* Preceding */}
                   <div className="space-y-1 relative group">
                      <div className="flex items-center justify-between">
                         <div className="text-[10px] text-teal-500 font-bold uppercase">{passageContext.before.reference}</div>
                         <button
                           onClick={() => handleCopyContext(passageContext.before.text, 'before')}
                           onMouseEnter={() => soundEngine.playHover()}
                           className="p-1 text-gray-600 hover:text-teal-400 transition-colors"
                           title="Copy verse"
                         >
                           {copiedContextKey === 'before' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                         </button>
                      </div>
                      <p className="font-serif leading-relaxed text-gray-500">{passageContext.before.text}</p>
                   </div>
                   
                   {/* Current (Visual Indicator) */}
                   <div className="py-2 flex items-center gap-4 opacity-50">
                      <div className="h-px bg-teal-500/30 flex-grow"></div>
                      <span className="text-[10px] uppercase text-teal-500 font-medium">Current Passage</span>
                      <div className="h-px bg-teal-500/30 flex-grow"></div>
                   </div>

                   {/* Following */}
                   <div className="space-y-1 relative group">
                      <div className="flex items-center justify-between">
                         <div className="text-[10px] text-teal-500 font-bold uppercase">{passageContext.after.reference}</div>
                         <button
                           onClick={() => handleCopyContext(passageContext.after.text, 'after')}
                           onMouseEnter={() => soundEngine.playHover()}
                           className="p-1 text-gray-600 hover:text-teal-400 transition-colors"
                           title="Copy verse"
                         >
                           {copiedContextKey === 'after' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                         </button>
                      </div>
                      <p className="font-serif leading-relaxed text-gray-500">{passageContext.after.text}</p>
                   </div>
                </div>
             </div>
          )}
        </div>
      )}

      {/* Main Study Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Modern Simplified Version */}
        {content.simplifiedText && (
          <div className="md:col-span-2">
            <Card
              title="Modern Simplified Version"
              icon={<MessageCircle className="w-5 h-5 text-indigo-400" />}
              className="border-indigo-900/30 bg-gradient-to-br from-[#0A0C10] to-indigo-900/10 hover:shadow-indigo-900/10 hover:shadow-lg transition-all"
              copyText={content.simplifiedText}
            >
              <p className="text-gray-100 text-lg leading-relaxed font-medium">
                {content.simplifiedText}
              </p>
            </Card>
          </div>
        )}

        {/* CREATIVE TOOLS SECTION - MOVED TO TAB */}
        {/* Removed from here to be placed in its own tab */}

        {/* Explanation */}
        <div className="md:col-span-2">
          <Card 
            title="Explanation" 
            icon={<Scroll className="w-5 h-5" />}
            className="border-l-4 border-l-blue-500"
            copyText={content.explanation}
          >
            {content.explanation}
          </Card>
        </div>

        {/* Original Language */}
        {(content.originalLanguageText || content.originalLanguageAnalysis) && (
          <div className="md:col-span-2">
            <Card 
              title="Original Language" 
              icon={<Languages className="w-5 h-5" />}
              className="bg-[#0A0C10] border-gray-800"
              copyText={originalLanguageCopyText}
            >
              {content.originalLanguageText && (
                <div className="mb-4 text-center p-4 bg-[#050608] rounded-lg border border-gray-800/50">
                  <p className="text-xl md:text-2xl text-[#f2c46d] font-serif tracking-wide leading-relaxed">
                    {content.originalLanguageText}
                  </p>
                </div>
              )}
              {content.originalLanguageAnalysis && (
                <p className="text-gray-400">
                  {content.originalLanguageAnalysis}
                </p>
              )}
            </Card>
          </div>
        )}

        {/* Historical Context */}
        <Card 
          title="Historical Context" 
          icon={<History className="w-5 h-5" />}
          copyText={content.historicalContext}
        >
          {content.historicalContext}
        </Card>

        {/* Key Meaning */}
        <Card 
          title="Key Meaning" 
          icon={<Lightbulb className="w-5 h-5" />}
          copyText={content.keyMeaning}
        >
          {content.keyMeaning}
        </Card>

        {/* Comparison Section - Only renders if comparison data exists */}
        {content.comparison && (
          <div className="md:col-span-2 mt-4 mb-4">
             <div className="p-1 rounded-xl bg-gradient-to-br from-teal-900/20 to-transparent border border-teal-900/30">
               <div className="flex items-center gap-3 mb-6 p-4 border-b border-teal-900/30">
                <Scale className="w-6 h-6 text-teal-400" />
                <h3 className="text-xl font-bold text-gray-200">
                  Comparative Analysis: <span className="text-teal-400">{content.comparison.secondReference}</span>
                </h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2 p-4 pt-0">
                <Card 
                  title="Similarities" 
                  icon={<ArrowRightLeft className="w-5 h-5 text-teal-400" />}
                  className="border-teal-900/30 bg-transparent"
                  copyText={content.comparison.similarities}
                >
                  {content.comparison.similarities}
                </Card>
                
                <Card 
                  title="Differences" 
                  icon={<Scale className="w-5 h-5 text-teal-400" />}
                  className="border-teal-900/30 bg-transparent"
                  copyText={content.comparison.differences}
                >
                  {content.comparison.differences}
                </Card>

                <div className="md:col-span-2">
                  <Card 
                    title="Synthesis" 
                    icon={<Merge className="w-5 h-5 text-teal-400" />}
                    className="bg-teal-950/20 border-teal-900/50"
                    copyText={content.comparison.synthesis}
                  >
                    <p className="text-gray-300">{content.comparison.synthesis}</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Practical Application */}
        <div className="md:col-span-2">
          <Card 
            title="Practical Application" 
            icon={<HeartHandshake className="w-5 h-5" />}
            className="bg-gradient-to-br from-[#0A0C10] to-[#0d1620] border-teal-900/30"
            copyText={content.practicalApplication}
          >
            <p className="text-gray-300 font-medium">{content.practicalApplication}</p>
          </Card>
        </div>
      </div>
    </div>
  )}

      {/* CROSS-REFERENCES TAB */}
      {activeTab === 'cross_refs' && (
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <LinkIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-200">Direct Cross-References</h3>
          </div>
          
          {content.relatedVerses && content.relatedVerses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {content.relatedVerses.map((verse, idx) => (
                <div 
                  key={idx}
                  onClick={() => onNavigate(verse.reference)}
                  className="p-4 rounded-xl bg-[#0A0C10] border border-gray-800 hover:border-blue-500/30 hover:bg-blue-900/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 font-bold text-sm group-hover:text-blue-300 transition-colors">
                      {verse.reference}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {verse.context}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-[#0A0C10]/50 rounded-xl border border-gray-800/50">
              <LinkIcon className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No direct cross-references found for this passage.</p>
            </div>
          )}
        </div>
      )}

      {/* CONNECTIONS TAB */}
      {activeTab === 'connections' && (
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-semibold text-gray-200">Thematic & Broader Connections</h3>
          </div>
          
          {content.similarVerses && content.similarVerses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {content.similarVerses.map((verse, idx) => (
                <div 
                  key={idx}
                  onClick={() => onNavigate(verse.reference)}
                  className="p-4 rounded-xl bg-[#0A0C10] border border-gray-800 hover:border-teal-500/30 hover:bg-teal-900/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-teal-400 font-bold text-sm group-hover:text-teal-300 transition-colors">
                      {verse.reference}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-teal-400 transition-colors" />
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {verse.context}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-[#0A0C10]/50 rounded-xl border border-gray-800/50">
              <Compass className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No thematic connections found for this passage.</p>
            </div>
          )}
        </div>
      )}

      {/* CREATIVE SUITE TAB */}
      {activeTab === 'creative' && (
        <div className="animate-fade-in space-y-8">
           
           <div className="flex items-center gap-3 mb-2">
             <Wand2 className="w-5 h-5 text-purple-400" />
             <h3 className="text-lg font-semibold text-gray-200">Creative Suite</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Biblical Card Generator */}
            <div id="biblical-card-section" className="md:col-span-2 bg-[#0A0C10] border border-gray-800 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ImageIcon className="w-24 h-24 text-purple-500" />
              </div>
              
              <div className="relative z-10">
                <h4 className="text-xl font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Biblical Card Generator
                </h4>
                <p className="text-gray-400 text-sm mb-6 max-w-lg">
                  Create a beautiful, shareable card with this verse and a cinematic AI-generated background.
                </p>

                {!cardImage ? (
                  <button
                    onClick={handleGenerateCard}
                    disabled={isGeneratingCard}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingCard ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    <span>Generate Card</span>
                  </button>
                ) : (
                  <div className="mt-8 animate-fade-in-up w-full flex justify-center">
                    <BiblicalCard 
                      image={cardImage}
                      title={content.verseReference || 'Scripture'}
                      verse={content.simplifiedText || content.kjvText || ''}
                      onClose={() => setCardImage(null)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. External Art Prompt */}
            <div id="external-prompt-section" className="bg-[#0A0C10] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-700 transition-colors">
               <h4 className="text-lg font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <Clapperboard className="w-4 h-4 text-pink-400" />
                  Midjourney Prompt
               </h4>
               <p className="text-gray-500 text-xs mb-4">
                 Get a highly detailed prompt optimized for external AI art generators.
               </p>
               
               {!externalPrompt ? (
                 <button
                    onClick={handleGeneratePrompt}
                    disabled={isGeneratingPrompt}
                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors flex justify-center items-center gap-2"
                 >
                    {isGeneratingPrompt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Prompt
                 </button>
               ) : (
                 <div className="bg-black/50 rounded-lg p-3 border border-gray-800 animate-fade-in">
                    <p className="text-xs text-gray-400 font-mono leading-relaxed max-h-32 overflow-y-auto mb-3 custom-scrollbar">
                      {externalPrompt}
                    </p>
                    <button
                      onClick={handleCopyPrompt}
                      className="w-full py-2 bg-pink-900/20 hover:bg-pink-900/30 text-pink-400 text-xs font-medium rounded transition-colors flex justify-center items-center gap-2"
                    >
                      {promptCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {promptCopied ? 'Copied' : 'Copy Prompt'}
                    </button>
                 </div>
               )}
            </div>

            {/* 3. Screenplay Script */}
            <div id="script-section" className="bg-[#0A0C10] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-700 transition-colors">
               <h4 className="text-lg font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Screenplay Adaptation
               </h4>
               <p className="text-gray-500 text-xs mb-4">
                 Convert this passage into a dramatic screenplay format for video production.
               </p>
               
               {!scriptContent ? (
                 <button
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript}
                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors flex justify-center items-center gap-2"
                 >
                    {isGeneratingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScrollText className="w-4 h-4" />}
                    Generate Script
                 </button>
               ) : (
                 <div className="bg-black/50 rounded-lg p-4 border border-gray-800 animate-fade-in">
                    <div className="max-h-60 overflow-y-auto mb-4 custom-scrollbar pr-2">
                      <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                        {scriptContent}
                      </pre>
                    </div>
                    <button
                      onClick={handleCopyScript}
                      className="w-full py-2 bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 text-xs font-medium rounded transition-colors flex justify-center items-center gap-2"
                    >
                      {scriptCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {scriptCopied ? 'Copied' : 'Copy Script'}
                    </button>
                 </div>
               )}
            </div>

           </div>

          <div className="text-center mt-12 text-xs text-gray-600 border-t border-gray-900 pt-6">
            AI-generated content. Always verify with Scripture.
          </div>
        </div>
      )}
    </div>
  );
};
