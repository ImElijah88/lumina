
import React, { useState, useEffect } from 'react';
import { StudyContent, PassageContext } from '../types';
import { Card } from './ui/Card';
import { BiblicalCard } from './ui/BiblicalCard';
import { generateBiblicalArt, generateExternalArtPrompt, generateScript, generateSpeech, getPassageContext } from '../services/geminiService';
import { audioController } from '../utils/audioUtils';
import { Scroll, History, Lightbulb, HeartHandshake, Languages, Scale, ArrowRightLeft, Merge, Quote, Link as LinkIcon, ArrowRight, Share2, Check, CloudDownload, Copy, MessageCircle, ImageIcon, Loader2, Compass, Wand2, X, Bookmark, FileText, Clapperboard, Volume2, StopCircle, BookOpen, ScrollText } from 'lucide-react';

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
    try {
      await navigator.clipboard.writeText(text);
      setCopiedContextKey(key);
      setTimeout(() => setCopiedContextKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy context text', err);
    }
  };

  const handleGenerateCard = async () => {
    if (!content.verseReference) return;
    setIsGeneratingCard(true);
    const context = content.simplifiedText || content.keyMeaning || content.explanation;
    setTimeout(() => {
        const el = document.getElementById('biblical-card-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    const image = await generateBiblicalArt(content.verseReference, context);
    if (image) setCardImage(image);
    setIsGeneratingCard(false);
  };

  const handleGeneratePrompt = async () => {
    if (!content.verseReference) return;
    setIsGeneratingPrompt(true);
    const context = content.simplifiedText || content.keyMeaning || content.explanation;
    try {
      const prompt = await generateExternalArtPrompt(content.verseReference, context);
      setExternalPrompt(prompt);
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
    if (!content.verseReference) return;
    setIsGeneratingScript(true);
    const context = content.simplifiedText || content.keyMeaning || content.explanation;
    try {
        const script = await generateScript(content.verseReference, context);
        setScriptContent(script);
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
              onClick={() => onToggleFavorite(content)}
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

      {/* KJV Text Section */}
      {content.kjvText && (
        <div className="animate-fade-in-up delay-100">
          <div className="relative bg-[#0A0C10] border border-[#f2c46d]/20 rounded-xl p-6 md:p-8 text-center overflow-hidden group hover:border-[#f2c46d]/40 transition-colors duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f2c46d]/40 to-transparent" />
            <Quote className="w-8 h-8 md:w-10 md:h-10 text-[#f2c46d]/10 absolute top-4 left-4" />
            <Quote className="w-8 h-8 md:w-10 md:h-10 text-[#f2c46d]/10 absolute bottom-4 right-4 rotate-180" />
            
            <div className="absolute top-3 right-3 z-20 flex gap-2">
               {/* Context Button */}
               <button
                 onClick={handleShowContext}
                 disabled={isLoadingContext}
                 className={`p-2 rounded-full transition-all duration-300 ${showContext ? 'text-teal-400 bg-teal-900/20' : 'text-[#f2c46d]/40 hover:text-teal-400 hover:bg-teal-900/10'}`}
                 title="View Surrounding Context"
               >
                 {isLoadingContext ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
               </button>

               {/* Audio Play Button */}
               <button
                 onClick={handlePlayAudio}
                 disabled={isLoadingAudio}
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
                        className="absolute right-0 top-0 p-1.5 text-gray-500 hover:text-teal-400 transition-colors"
                        title="Copy narrative"
                     >
                       {copiedContextKey === 'narrative' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                     </button>
                   </div>

                   {/* Historical Analysis (New) */}
                   {passageContext.historicalAnalysis && (
                     <div className="bg-teal-950/10 border border-teal-900/30 rounded-lg p-4 relative group">
                        <div className="flex items-center gap-2 mb-2">
                           <History className="w-3.5 h-3.5 text-teal-500" />
                           <span className="text-[10px] text-teal-500 font-bold uppercase">Historical & Verification Context</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed pr-6">{passageContext.historicalAnalysis}</p>
                        <button
                           onClick={() => handleCopyContext(passageContext.historicalAnalysis, 'history')}
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
              className="border-indigo-900/30 bg-gradient-to-br from-[#0A0C10] to-indigo-900/10"
              copyText={content.simplifiedText}
            >
              <p className="text-gray-100 text-lg leading-relaxed font-medium">
                {content.simplifiedText}
              </p>
            </Card>
          </div>
        )}

        {/* CREATIVE TOOLS SECTION */}
        <div className="md:col-span-2 space-y-6 py-6 border-y border-gray-900/50 bg-[#0A0C10]/30 -mx-4 px-4 sm:mx-0 sm:rounded-2xl sm:border sm:bg-transparent">
           
           <div className="flex items-center gap-3 mb-2">
             <Wand2 className="w-5 h-5 text-purple-400" />
             <h3 className="text-lg font-semibold text-gray-200">Creative Suite</h3>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Tool 1: Character Card Generator */}
              <div id="biblical-card-section" className="flex flex-col items-center">
                {!cardImage ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 border border-gray-800 rounded-xl bg-[#0A0C10] hover:border-yellow-500/30 transition-all">
                    <p className="text-sm text-gray-400 mb-4 text-center">Generate a collectible card for this verse.</p>
                    <button
                      onClick={handleGenerateCard}
                      disabled={isGeneratingCard}
                      className="w-full inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-yellow-500 to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-yellow-200 dark:focus:ring-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-[#0A0C10] rounded-md group-hover:bg-opacity-0 flex items-center justify-center gap-2">
                        {isGeneratingCard ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                        {isGeneratingCard ? 'Crafting...' : 'Create Card'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full animate-fade-in-up">
                    <BiblicalCard 
                        image={cardImage} 
                        title={content.verseReference || "Scripture Card"}
                        verse={content.simplifiedText || content.kjvText || ""}
                        label="Modern Simplified"
                        onClose={() => setCardImage(null)}
                    />
                  </div>
                )}
              </div>

              {/* Tool 2: External Art Prompt Generator */}
              <div id="external-prompt-section" className="flex flex-col items-center">
                 {!externalPrompt ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 border border-gray-800 rounded-xl bg-[#0A0C10] hover:border-purple-500/30 transition-all">
                      <p className="text-sm text-gray-400 mb-4 text-center">Create a detailed prompt for Midjourney/DALL-E.</p>
                      <button
                        onClick={handleGeneratePrompt}
                        disabled={isGeneratingPrompt}
                        className="w-full inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-500 to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-[#0A0C10] rounded-md group-hover:bg-opacity-0 flex items-center justify-center gap-2">
                          {isGeneratingPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                          {isGeneratingPrompt ? 'Designing...' : 'Scene Prompt'}
                        </span>
                      </button>
                    </div>
                 ) : (
                    <div className="w-full animate-fade-in-up h-full flex flex-col">
                       <div className="relative bg-[#0A0C10] border border-purple-500/30 rounded-xl p-4 flex-grow flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Midjourney Prompt</span>
                             <button onClick={() => setExternalPrompt(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                          </div>
                          <div className="flex-grow bg-black/50 rounded-lg p-3 border border-gray-800 mb-3 overflow-y-auto max-h-[200px] scrollbar-thin">
                             <p className="text-xs text-gray-300 font-mono leading-relaxed">{externalPrompt}</p>
                          </div>
                          <button
                            onClick={handleCopyPrompt}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
                          >
                            {promptCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            {promptCopied ? "Copied" : "Copy Prompt"}
                          </button>
                       </div>
                    </div>
                 )}
              </div>

              {/* Tool 3: Screenplay Generator */}
              <div id="script-section" className="flex flex-col items-center">
                 {!scriptContent ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 border border-gray-800 rounded-xl bg-[#0A0C10] hover:border-red-500/30 transition-all">
                      <p className="text-sm text-gray-400 mb-4 text-center">Write a professional scene script for this passage.</p>
                      <button
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript}
                        className="w-full inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-red-500 to-orange-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-red-200 dark:focus:ring-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-[#0A0C10] rounded-md group-hover:bg-opacity-0 flex items-center justify-center gap-2">
                          {isGeneratingScript ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clapperboard className="w-5 h-5" />}
                          {isGeneratingScript ? 'Writing...' : 'Write Script'}
                        </span>
                      </button>
                    </div>
                 ) : (
                    <div className="w-full animate-fade-in-up h-full flex flex-col">
                       <div className="relative bg-[#0A0C10] border border-red-500/30 rounded-xl p-4 flex-grow flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Screenplay</span>
                             <button onClick={() => setScriptContent(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                          </div>
                          <div className="flex-grow bg-[#fffceb] text-black rounded-lg p-4 border border-gray-800 mb-3 overflow-y-auto max-h-[300px] scrollbar-thin shadow-inner">
                             <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap font-courier">{scriptContent}</pre>
                          </div>
                          <button
                            onClick={handleCopyScript}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
                          >
                            {scriptCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            {scriptCopied ? "Copied" : "Copy Script"}
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

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

        {/* RELATED VERSES SECTION */}
        {content.relatedVerses && content.relatedVerses.length > 0 && (
          <div className="md:col-span-2">
            <div className="mt-8 border-t border-gray-800 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <LinkIcon className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-200">Direct Cross-References</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {content.relatedVerses.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(item.reference)}
                    className="group flex flex-col items-start p-4 bg-[#0A0C10] border border-gray-800 rounded-xl hover:border-blue-500/40 hover:bg-gray-800/30 transition-all text-left h-full"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="font-bold text-[#f2c46d] text-sm group-hover:text-blue-300 transition-colors">
                        {item.reference}
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <span className="text-xs text-gray-500 leading-relaxed">
                      {item.context}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SIMILAR VERSES SECTION */}
        {content.similarVerses && content.similarVerses.length > 0 && (
          <div className="md:col-span-2">
            <div className="mt-2 pt-4">
              <div className="flex items-center gap-3 mb-6">
                <Compass className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-semibold text-gray-200">Thematic & Broader Connections</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {content.similarVerses.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(item.reference)}
                    className="group flex flex-col items-start p-4 bg-gradient-to-r from-[#0A0C10] to-teal-900/10 border border-teal-900/30 rounded-xl hover:border-teal-500/40 hover:to-teal-900/20 transition-all text-left h-full"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="font-bold text-teal-100 text-sm group-hover:text-teal-300 transition-colors">
                        {item.reference}
                      </span>
                      <ArrowRight className="w-3 h-3 text-teal-700 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <span className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {item.context}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-12 text-xs text-gray-600 border-t border-gray-900 pt-6">
        AI-generated content. Always verify with Scripture.
      </div>
    </div>
  );
};
