import React, { useState } from 'react';
import { LogIn, User } from 'lucide-react';
import { SpiritLoader } from './ui/SpiritLoader';

interface LandingPageProps {
  onLogin: (mode: 'GUEST' | 'GOOGLE') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  const handleLogin = (mode: 'GUEST' | 'GOOGLE') => {
    setAnimateOut(true);
    setTimeout(() => onLogin(mode), 800); // Allow animation to play out
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050608] transition-opacity duration-1000 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-900/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Main Interaction Area */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px]">
        
        {/* The Light / Spirit Loader */}
        <div 
          onClick={() => setShowOptions(true)}
          className={`cursor-pointer transition-all duration-700 ${showOptions ? 'scale-75 opacity-50 blur-sm' : 'scale-100 opacity-100 hover:scale-105'}`}
        >
          <SpiritLoader message="" color="#f2c46d" />
        </div>

        {/* Login Options - Reveal on Click */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6 transition-all duration-700 ${showOptions ? 'opacity-100 translate-y-20' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          
          {/* Google Button */}
          <button
            onClick={() => handleLogin('GOOGLE')}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all duration-300 group"
            title="Continue with Google"
          >
            <span className="font-bold text-2xl text-black font-sans">G</span>
          </button>

          {/* Guest Button */}
          <button
            onClick={() => handleLogin('GUEST')}
            className="w-16 h-16 bg-[#1a1d24] border border-gray-700 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 hover:border-gray-500 hover:bg-[#252830] transition-all duration-300 group"
            title="Continue as Guest"
          >
            <User className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
          </button>

        </div>
      </div>

    </div>
  );
};