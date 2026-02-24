import React, { useState } from 'react';
import { LogIn, User, CheckSquare, Square, ArrowRight, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onLogin: (mode: 'GUEST' | 'GOOGLE') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  const handleLogin = (mode: 'GUEST' | 'GOOGLE') => {
    if (!acceptedTerms) return;
    setAnimateOut(true);
    setTimeout(() => onLogin(mode), 500); // Allow animation to play
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050608] transition-opacity duration-500 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-900/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Logo Section */}
      <div className="text-center mb-16 relative z-10 flex flex-col items-center animate-fade-in-up">
        <div className="p-4 bg-blue-500/10 rounded-2xl mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <BookOpen className="w-12 h-12 text-blue-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-blue-400 font-serif tracking-tight mb-3">
          Lumina
        </h1>
        <p className="text-gray-500 text-sm tracking-[0.2em] uppercase font-medium">
          Scripture Study Assistant
        </p>
      </div>

      {/* Buttons Container */}
      <div className="w-full max-w-sm px-6 space-y-5 relative z-10">
        
        {/* Google Button */}
        <button
          onClick={() => handleLogin('GOOGLE')}
          disabled={!acceptedTerms}
          className={`group relative w-full h-16 rounded-xl border transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden
            ${acceptedTerms 
              ? 'border-blue-500/30 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-blue-950/10 hover:bg-blue-900/20' 
              : 'border-gray-800 opacity-50 cursor-not-allowed'
            }`}
        >
          <div className={`absolute left-0 w-1 h-full bg-blue-500 transition-all duration-300 ${acceptedTerms ? 'opacity-100' : 'opacity-0'}`} />
          <LogIn className={`w-5 h-5 ${acceptedTerms ? 'text-blue-400' : 'text-gray-500'}`} />
          <span className={`text-lg font-bold tracking-wide ${acceptedTerms ? 'text-white' : 'text-gray-500'}`}>
            GOOGLE
          </span>
          {acceptedTerms && <ArrowRight className="w-4 h-4 text-blue-500 absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
        </button>

        {/* Guest Button */}
        <button
          onClick={() => handleLogin('GUEST')}
          disabled={!acceptedTerms}
          className={`group relative w-full h-16 rounded-xl border transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden
            ${acceptedTerms 
              ? 'border-[#f2c46d]/30 hover:border-[#f2c46d] hover:shadow-[0_0_20px_rgba(242,196,109,0.15)] bg-amber-950/10 hover:bg-amber-900/20' 
              : 'border-gray-800 opacity-50 cursor-not-allowed'
            }`}
        >
          <div className={`absolute left-0 w-1 h-full bg-[#f2c46d] transition-all duration-300 ${acceptedTerms ? 'opacity-100' : 'opacity-0'}`} />
          <User className={`w-5 h-5 ${acceptedTerms ? 'text-[#f2c46d]' : 'text-gray-500'}`} />
          <span className={`text-lg font-bold tracking-wide ${acceptedTerms ? 'text-white' : 'text-gray-500'}`}>
            GUEST
          </span>
        </button>

      </div>

      {/* Terms Checkbox */}
      <div className="mt-10 flex items-center gap-3 cursor-pointer group select-none" onClick={() => setAcceptedTerms(!acceptedTerms)}>
        <div className={`transition-colors duration-300 ${acceptedTerms ? 'text-teal-400' : 'text-gray-600 group-hover:text-gray-500'}`}>
          {acceptedTerms ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
        </div>
        <span className="text-xs md:text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
          I accept the <span className="text-teal-500/80 hover:text-teal-400 underline underline-offset-4">Terms & Conditions</span>
        </span>
      </div>

    </div>
  );
};