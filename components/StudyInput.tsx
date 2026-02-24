
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Scale, X, ScrollText, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { AutocompleteInput } from './ui/AutocompleteInput';
import { interpretVoiceQuery } from '../services/geminiService';
import { SUGGESTED_PROMPTS } from '../utils/bibleSuggestions';

interface StudyInputProps {
  onAnalyze: (query: string, comparisonQuery?: string, includeKJV?: boolean) => void;
  isLoading: boolean;
}

// Declare speech recognition types for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const StudyInput: React.FC<StudyInputProps> = ({ onAnalyze, isLoading }) => {
  const [query, setQuery] = useState('');
  const [comparisonQuery, setComparisonQuery] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [includeKJV, setIncludeKJV] = useState(true);
  
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
      onAnalyze(query, showComparison ? comparisonQuery : undefined, includeKJV);
    }
  };

  const toggleComparison = () => {
    if (showComparison) {
      setComparisonQuery(''); // Clear when hiding
    }
    setShowComparison(!showComparison);
  };

  // Helper to update state from suggestions
  const handleQuerySelect = (val: string) => setQuery(val);
  const handleComparisonSelect = (val: string) => setComparisonQuery(val);

  const handlePromptClick = (promptQuery: string) => {
    setQuery(promptQuery);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in-up">
      <form onSubmit={handleSubmit} className="relative space-y-4">
        
        {/* Main Input with Autocomplete */}
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

        {/* Comparison Input (Conditional) */}
        {showComparison && (
          <div className="animate-fade-in">
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
        )}

        {/* Suggested Prompts */}
        {!query && !isListening && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">Suggested Topics</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePromptClick(prompt.query)}
                  className="px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200 hover:border-gray-600 transition-all duration-200"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Comparison Toggle */}
            <button
              type="button"
              onClick={toggleComparison}
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

            {/* KJV Toggle */}
            <button
              type="button"
              onClick={() => setIncludeKJV(!includeKJV)}
              className={`text-sm font-medium flex items-center gap-2 transition-all px-3 py-1.5 rounded-full border ${
                includeKJV 
                  ? 'bg-[#f2c46d]/10 text-[#f2c46d] border-[#f2c46d]/30 hover:bg-[#f2c46d]/20' 
                  : 'bg-gray-800/30 text-gray-500 border-gray-700 hover:text-gray-300'
              }`}
              disabled={isLoading}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>{includeKJV ? 'KJV Included' : 'Include KJV'}</span>
            </button>
          </div>

          <Button 
            type="submit" 
            isLoading={isLoading} 
            disabled={!query.trim() || (showComparison && !comparisonQuery.trim())}
            className="w-full md:w-auto"
          >
            {!isLoading && <Sparkles className="w-4 h-4 mr-2" />}
            {isLoading ? 'Analyzing...' : showComparison ? 'Compare Passages' : 'Study Passage'}
          </Button>
        </div>
      </form>
    </div>
  );
};
