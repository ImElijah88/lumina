
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Settings, User, Key, Cpu, ToggleLeft, ToggleRight, Save, Mic2 } from 'lucide-react';
import { UserContext } from '../types';

interface UserProfileMenuProps {
  user: UserContext;
  onLogout: () => void;
}

const AVAILABLE_VOICES = [
  { id: 'Kore', label: 'Kore (Calm Female)', gender: 'Female' },
  { id: 'Puck', label: 'Puck (Playful Male)', gender: 'Male' },
  { id: 'Charon', label: 'Charon (Deep Male)', gender: 'Male' },
  { id: 'Fenrir', label: 'Fenrir (Intense Male)', gender: 'Male' },
  { id: 'Zephyr', label: 'Zephyr (Soft Female)', gender: 'Female' },
];

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [useCustomConfig, setUseCustomConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [preferredVoice, setPreferredVoice] = useState('Kore');
  const [isSaved, setIsSaved] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedUse = localStorage.getItem('lumina_use_custom_config') === 'true';
    const savedKey = localStorage.getItem('lumina_custom_api_key') || '';
    const savedModel = localStorage.getItem('lumina_custom_model') || '';
    const savedVoice = localStorage.getItem('lumina_preferred_voice') || 'Kore';

    setUseCustomConfig(savedUse);
    setCustomApiKey(savedKey);
    setCustomModel(savedModel);
    setPreferredVoice(savedVoice);
  }, [isOpen]); // Reload when menu opens

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSaved(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('lumina_use_custom_config', String(useCustomConfig));
    localStorage.setItem('lumina_custom_api_key', customApiKey);
    localStorage.setItem('lumina_custom_model', customModel);
    localStorage.setItem('lumina_preferred_voice', preferredVoice);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleToggle = () => {
    setUseCustomConfig(!useCustomConfig);
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Profile Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full transition-all duration-300 hover:ring-2 hover:ring-blue-500/50 focus:outline-none"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || "Profile"} 
            className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-700 object-cover"
          />
        ) : (
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <User className="w-4 h-4" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#0A0C10] border border-gray-800 rounded-xl shadow-2xl animate-fade-in origin-top-right overflow-hidden max-h-[85vh] overflow-y-auto scrollbar-none">
          
          {/* User Info Header */}
          <div className="p-4 bg-gray-900/30 border-b border-gray-800">
            <p className="text-sm font-bold text-gray-200 truncate">
              {user.displayName || (user.mode === 'GUEST' ? 'Guest User' : 'User')}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {user.mode === 'GOOGLE' ? 'Google Account' : 'Local Session'}
            </p>
          </div>

          <div className="p-4 space-y-6">
            
            {/* Voice Settings */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 mb-2">
                 <Mic2 className="w-4 h-4 text-pink-400" />
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audio Preference</span>
               </div>
               
               <div className="space-y-1">
                 <label className="text-[10px] text-gray-500 font-medium">Text-to-Speech Voice</label>
                 <div className="relative">
                   <select 
                      value={preferredVoice}
                      onChange={(e) => setPreferredVoice(e.target.value)}
                      className="w-full appearance-none bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 cursor-pointer"
                   >
                      {AVAILABLE_VOICES.map(v => (
                        <option key={v.id} value={v.id}>{v.label}</option>
                      ))}
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                     <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                   </div>
                 </div>
               </div>
            </div>
            
            {/* BYOK Settings Section */}
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Settings className="w-4 h-4 text-teal-500" />
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">API Configuration</span>
                 </div>
                 <button onClick={handleToggle} className="text-gray-400 hover:text-white transition-colors">
                    {useCustomConfig ? <ToggleRight className="w-6 h-6 text-teal-500" /> : <ToggleLeft className="w-6 h-6" />}
                 </button>
              </div>

              <div className={`space-y-3 transition-all duration-300 ${useCustomConfig ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                
                {/* API Key Input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                    <Key className="w-3 h-3" /> Gemini API Key
                  </label>
                  <input 
                    type="password" 
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 placeholder-gray-700"
                  />
                </div>

                {/* Model Input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Model ID
                  </label>
                  <input 
                    type="text" 
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="gemini-3-flash-preview"
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 placeholder-gray-700 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSaveSettings}
              className="w-full flex items-center justify-center gap-2 py-2 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/50 rounded-lg text-blue-400 text-xs font-medium transition-colors"
            >
              {isSaved ? (
                 <>Settings Saved!</>
              ) : (
                 <><Save className="w-3 h-3" /> Save All Settings</>
              )}
            </button>
          </div>

          <div className="h-px bg-gray-800 mx-4" />

          {/* Logout Action */}
          <button 
            onClick={onLogout}
            className="w-full p-4 flex items-center gap-3 text-sm text-red-400 hover:bg-red-900/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
