
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Sparkles, User, Bot, Loader2, ChevronDown, Mic, MicOff } from 'lucide-react';
import { StudyContent } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat } from '@google/genai';

interface PageAssistantProps {
  studyContent: StudyContent | null;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Declare speech recognition types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const PageAssistant: React.FC<PageAssistantProps> = ({ studyContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize chat when content changes
  useEffect(() => {
    if (studyContent) {
      const newChat = createChatSession(studyContent);
      setChat(newChat);
      setMessages([{ role: 'model', text: `I'm here to help with ${studyContent.verseReference || 'this passage'}. Ask me anything about definitions, history, or context!` }]);
    } else {
        setChat(null);
        setMessages([]);
        setIsOpen(false);
    }
  }, [studyContent]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onstart = () => setIsListening(true);
      
      recog.onend = () => setIsListening(false);

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
           setInputValue(prev => {
             const trimmed = prev.trim();
             return trimmed ? `${trimmed} ${transcript}` : transcript;
           });
        }
      };

      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chat) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chat.sendMessage({ message: userMsg });
      const text = result.text;
      setMessages(prev => [...prev, { role: 'model', text: text || "I couldn't generate a response." }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!studyContent) return null; // Only show when studying

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? 'bg-red-500/80 hover:bg-red-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'}
          text-white border border-white/10 backdrop-blur-sm`}
        aria-label="Toggle Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 z-40 bg-[#0A0C10] border border-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right
        right-4 left-4 md:left-auto md:right-6 md:w-[400px]
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
        style={{ maxHeight: 'calc(100vh - 120px)', height: '500px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50 rounded-t-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
               <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-200 text-sm">Lumina Guide</h3>
              <p className="text-[10px] text-gray-500">Context-Aware Assistant</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
               <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-800' : 'bg-indigo-900/30'}`}>
                 {msg.role === 'user' ? <User className="w-4 h-4 text-gray-400" /> : <Bot className="w-4 h-4 text-indigo-400" />}
               </div>
               <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                 msg.role === 'user' 
                   ? 'bg-blue-600 text-white rounded-tr-sm' 
                   : 'bg-gray-900 border border-gray-800 text-gray-300 rounded-tl-sm'
               }`}>
                 {msg.text}
               </div>
             </div>
           ))}
           {isLoading && (
             <div className="flex gap-3">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/30 flex items-center justify-center">
                 <Bot className="w-4 h-4 text-indigo-400" />
               </div>
               <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 flex items-center gap-2">
                 <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                 <span className="text-xs text-gray-500">Thinking...</span>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/30 rounded-b-2xl">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask about a word or context..."}
              disabled={isLoading}
              className="w-full bg-[#050608] border border-gray-700 rounded-xl pl-4 pr-24 py-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 placeholder-gray-600"
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {recognitionRef.current && (
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-all ${
                    isListening 
                      ? 'bg-red-500/20 text-red-400 animate-pulse' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  disabled={isLoading}
                  title="Speak"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-700 transition-colors hover:bg-blue-500"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
