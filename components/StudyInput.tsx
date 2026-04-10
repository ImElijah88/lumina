
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Scale, X, ScrollText, Mic, MicOff, Loader2, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { AutocompleteInput } from './ui/AutocompleteInput';
import { interpretVoiceQuery } from '../services/geminiService';
import { soundEngine } from '../utils/soundUtils';
import { BibleVersion } from '../types';

interface StudyInputProps {
  onAnalyze: (query: string, comparisonQuery?: string, version?: BibleVersion, comparisonVersion?: BibleVersion) => void;
  isLoading: boolean;
}

const BIBLE_VERSIONS: { id: BibleVersion; label: string }[] = [
  { id: 'KJV', label: 'King James Version' },
  { id: 'NIV', label: 'New International Version' },
  { id: 'ESV', label: 'English Standard Version' },
  { id: 'NKJV', label: 'New King James Version' },
  { id: 'NLT', label: 'New Living Translation' },
  { id: 'NASB', label: 'New American Standard' },
  { id: 'MSG', label: 'The Message' },
  { id: 'AMP', label: 'Amplified Bible' },
];

export const StudyInput: React.FC<StudyInputProps> = ({ onAnalyze, isLoading }) => {
  const [query, setQuery] = useState('');
  const [comparisonQuery, setComparisonQuery] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  
  const [version, setVersion] = useState<BibleVersion>('KJV');
  const [comparisonVersion, setComparisonVersion] = useState<BibleVersion>('KJV');

  // Voice Dictation State
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onstart = () => {
        setIsListening(true);
      };
      
      recog.onend = () => {
        setIsListening(false);
      };

      recog.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            handleVoiceResult(transcript);
        }
      };

      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
            alert("Microphone access was denied. Please check your browser settings to allow microphone access for this site.");
        } else if (event.error === 'no-speech') {
            // User didn't say anything, just stop silently
        } else if (event.error === 'network') {
             alert("Voice recognition requires an internet connection.");
        } else {
             console.warn("Speech recognition error:", event.error);
        }
      };

      recognitionRef.current = recog;
    }

    // Cleanup
    return () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                // Ignore
            }
        }
    };
  }, []);

  const handleVoiceResult = async (rawText: string) => {
    setIsListening(false); // UI update immediately
    setIsProcessingVoice(true);
    
    // Use "Intelligent Filter" to clean up the query
    const interpretedQuery = await interpretVoiceQuery(rawText);
    
    setQuery(interpretedQuery);
    setIsProcessingVoice(false);
  };

  const toggleListening = () => {
    soundEngine.playClick();
    if (isProcessingVoice) return;
    
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
        return;
    }
    
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch(e) { console.error(e); }
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      soundEngine.playProcessingStart();
      onAnalyze(
        query, 
        showComparison ? comparisonQuery : undefined, 
        version,
        showComparison ? comparisonVersion : undefined
      );
    }
  };

  const toggleComparison = () => {
    soundEngine.playClick();
    if (showComparison) {
      setComparisonQuery(''); // Clear when hiding
    }
    setShowComparison(!showComparison);
  };

  // Helper to update state from suggestions
  const handleQuerySelect = (val: string) => setQuery(val);
  const handleComparisonSelect = (val: string) => setComparisonQuery(val);

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in-up">
      <form onSubmit={handleSubmit} className="relative space-y-4">
        
        {/* Main Input with Autocomplete */}
        <div id="search-input" className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          <div className="relative">
            <AutocompleteInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onSuggestionSelect={handleQuerySelect}
              placeholder={isListening ? "Listening..." : isProcessingVoice ? "Clarifying your thought..." : "Enter a verse, topic, or click the mic..."}
              disabled={isLoading || isListening || isProcessingVoice}
              icon={<Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />}
              wrapperClassName="w-full"
              className="block w-full pr-14 py-4 bg-[#0A0C10] border border-gray-800 rounded-xl 
                       text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                       transition-all duration-300 shadow-lg shadow-black/50"
            />
            
            {/* Microphone Button */}
            {recognitionRef.current && (
              <button
                type="button"
                onClick={toggleListening}
                onMouseEnter={() => soundEngine.playHover()}
                disabled={isLoading || isProcessingVoice}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : isProcessingVoice 
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-gray-500 hover:text-blue-400 hover:bg-gray-800'
                }`}
                title="Dictate Query"
              >
                {isProcessingVoice ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Comparison Input (Conditional) */}
        {showComparison && (
          <div className="animate-fade-in space-y-2">
             <div className="flex flex-col sm:flex-row gap-2">
               <div className="flex-grow">
                 <AutocompleteInput
                  value={comparisonQuery}
                  onChange={(e) => setComparisonQuery(e.target.value)}
                  onSuggestionSelect={handleComparisonSelect}
                  placeholder="Enter second verse to compare (e.g., Romans 5:8)..."
                  disabled={isLoading}
                  icon={<Scale className="h-5 w-5 text-teal-500" />}
                  className="block w-full pr-4 py-4 bg-[#0A0C10] border border-teal-900/50 rounded-xl 
                           text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50
                           transition-all duration-300 shadow-lg shadow-black/50"
                />
               </div>
               
               {/* Comparison Version Selector */}
               <div className="relative min-w-[100px] sm:w-auto h-14 sm:h-auto">
                  <select
                    value={comparisonVersion}
                    onChange={(e) => setComparisonVersion(e.target.value as BibleVersion)}
                    className="w-full h-full appearance-none bg-[#0A0C10] border border-teal-900/50 rounded-xl px-4 py-2 text-sm text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
                  >
                    {BIBLE_VERSIONS.map(v => (
                      <option key={v.id} value={v.id} className="bg-gray-900 text-gray-100">
                        {v.id}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 pointer-events-none" />
               </div>
             </div>
          </div>
        )}


        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Comparison Toggle */}
            <button
              type="button"
              onClick={toggleComparison}
              onMouseEnter={() => soundEngine.playHover()}
              className={`text-sm font-medium flex items-center gap-2 transition-colors ${
                showComparison ? 'text-teal-400 hover:text-teal-300' : 'text-gray-500 hover:text-gray-300'
              }`}
              disabled={isLoading}
            >
              {showComparison ? (
                <>
                  <X className="w-4 h-4" /> Remove Comparison
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" /> Compare with another passage
                </>
              )}
            </button>

            {/* Main Version Selector */}
            <div className="relative">
               <select
                 value={version}
                 onChange={(e) => {
                   soundEngine.playClick();
                   setVersion(e.target.value as BibleVersion);
                 }}
                 className="appearance-none bg-[#0A0C10] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
                 disabled={isLoading}
               >
                 {BIBLE_VERSIONS.map(v => (
                   <option key={v.id} value={v.id} className="bg-gray-900 text-gray-100">
                     {v.id} - {v.label}
                   </option>
                 ))}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                 <ChevronDown className="w-4 h-4" />
               </div>
            </div>
          </div>

          <Button 
            type="submit" 
            isLoading={isLoading} 
            disabled={!query.trim() || (showComparison && !comparisonQuery.trim())}
            className="w-full md:w-auto hover:scale-105 transition-transform duration-200"
            onMouseEnter={() => !isLoading && soundEngine.playHover()}
          >
            {!isLoading && <Sparkles className="w-4 h-4 mr-2" />}
            {isLoading ? 'Analyzing...' : showComparison ? 'Compare Passages' : 'Study Passage'}
          </Button>
        </div>
      </form>
    </div>
  );
};
