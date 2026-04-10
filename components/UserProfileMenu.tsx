import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Settings, User, Key, Cpu, ToggleLeft, ToggleRight, Save, Mic2, Volume2, VolumeX, Smartphone, ChevronDown, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { UserContext, ModelConfig, LLMProvider } from '../types';
import { soundEngine } from '../utils/soundUtils';

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

const PROVIDERS: { id: LLMProvider; label: string }[] = [
  { id: 'gemini', label: 'Google Gemini' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
];

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [preferredVoice, setPreferredVoice] = useState('Kore');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Multi-Model State
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [tempModelConfig, setTempModelConfig] = useState<Partial<ModelConfig>>({ provider: 'gemini', name: '', apiKey: '', modelId: '' });

  useEffect(() => {
    const handleOpenMenu = () => setIsOpen(true);
    window.addEventListener('open-profile-menu', handleOpenMenu);
    return () => window.removeEventListener('open-profile-menu', handleOpenMenu);
  }, []);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedVoice = localStorage.getItem('lumina_preferred_voice') || 'Kore';
    const savedSound = localStorage.getItem('lumina_sound_enabled') !== 'false';
    const savedVibration = localStorage.getItem('lumina_vibration_enabled') !== 'false';

    setPreferredVoice(savedVoice);
    setSoundEnabled(savedSound);
    setVibrationEnabled(savedVibration);

    // Apply initial sound settings
    soundEngine.setEnabled(savedSound);
    soundEngine.setVibrationEnabled(savedVibration);

    // Load Model Configs
    const savedConfigsStr = localStorage.getItem('lumina_model_configs');
    if (savedConfigsStr) {
      try {
        setModelConfigs(JSON.parse(savedConfigsStr));
      } catch (e) {
        console.error("Failed to parse model configs", e);
      }
    } else {
      // Migrate old config if exists
      const savedUse = localStorage.getItem('lumina_use_custom_config') === 'true';
      const savedKey = localStorage.getItem('lumina_custom_api_key') || '';
      const savedModel = localStorage.getItem('lumina_custom_model') || '';
      
      if (savedKey || savedModel) {
        setModelConfigs([{
          id: 'migrated-config',
          name: 'My Gemini Key',
          provider: 'gemini',
          apiKey: savedKey,
          modelId: savedModel,
          isActive: savedUse
        }]);
      }
    }
  }, [isOpen]); // Reload when menu opens

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        menuRef.current && 
        !menuRef.current.contains(target) &&
        !target.closest('.guide-overlay-element')
      ) {
        setIsOpen(false);
        setIsSaved(false);
        setIsAddingModel(false);
        setEditingModelId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('lumina_preferred_voice', preferredVoice);
    localStorage.setItem('lumina_sound_enabled', String(soundEnabled));
    localStorage.setItem('lumina_vibration_enabled', String(vibrationEnabled));
    localStorage.setItem('lumina_model_configs', JSON.stringify(modelConfigs));
    
    // Apply settings immediately
    soundEngine.setEnabled(soundEnabled);
    soundEngine.setVibrationEnabled(vibrationEnabled);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleToggleActiveModel = (id: string) => {
    const newConfigs = modelConfigs.map(config => ({
      ...config,
      isActive: config.id === id ? !config.isActive : false // Only one active at a time
    }));
    setModelConfigs(newConfigs);
    // Auto save configs when toggling
    localStorage.setItem('lumina_model_configs', JSON.stringify(newConfigs));
  };

  const handleDeleteModel = (id: string) => {
    const newConfigs = modelConfigs.filter(c => c.id !== id);
    setModelConfigs(newConfigs);
    localStorage.setItem('lumina_model_configs', JSON.stringify(newConfigs));
  };

  const handleSaveModelConfig = () => {
    if (!tempModelConfig.name || !tempModelConfig.apiKey) return;

    let newConfigs: ModelConfig[];
    if (editingModelId) {
      newConfigs = modelConfigs.map(c => c.id === editingModelId ? { ...c, ...tempModelConfig } as ModelConfig : c);
      setEditingModelId(null);
    } else {
      const newConfig: ModelConfig = {
        id: Date.now().toString(),
        name: tempModelConfig.name || 'New Model',
        provider: tempModelConfig.provider as LLMProvider || 'gemini',
        apiKey: tempModelConfig.apiKey || '',
        modelId: tempModelConfig.modelId || '',
        isActive: modelConfigs.length === 0 // Auto-activate if it's the first one
      };
      newConfigs = [...modelConfigs, newConfig];
      setIsAddingModel(false);
    }
    setModelConfigs(newConfigs);
    localStorage.setItem('lumina_model_configs', JSON.stringify(newConfigs));
    setTempModelConfig({ provider: 'gemini', name: '', apiKey: '', modelId: '' });
  };

  const startEditing = (config: ModelConfig) => {
    setTempModelConfig(config);
    setEditingModelId(config.id);
    setIsAddingModel(false);
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Profile Trigger */}
      <button 
        id="profile-menu-button"
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
        <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 max-w-xs sm:max-w-none bg-[#0A0C10] border border-gray-800 rounded-xl shadow-2xl animate-fade-in origin-top-right overflow-hidden max-h-[85vh] overflow-y-auto scrollbar-none">
          
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
            
            {/* Sound & Haptics Settings */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 mb-2">
                 <Settings className="w-4 h-4 text-purple-400" />
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</span>
               </div>

               <div className="flex items-center justify-between">
                 <label className="text-[10px] text-gray-500 font-medium flex items-center gap-2">
                   {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                   Sound Effects
                 </label>
                 <button 
                   onClick={() => setSoundEnabled(!soundEnabled)} 
                   className="text-gray-400 hover:text-white transition-colors"
                 >
                    {soundEnabled ? <ToggleRight className="w-6 h-6 text-purple-500" /> : <ToggleLeft className="w-6 h-6" />}
                 </button>
               </div>

               <div className="flex items-center justify-between">
                 <label className="text-[10px] text-gray-500 font-medium flex items-center gap-2">
                   <Smartphone className="w-3 h-3" />
                   Haptic Feedback
                 </label>
                 <button 
                   onClick={() => setVibrationEnabled(!vibrationEnabled)} 
                   className="text-gray-400 hover:text-white transition-colors"
                 >
                    {vibrationEnabled ? <ToggleRight className="w-6 h-6 text-purple-500" /> : <ToggleLeft className="w-6 h-6" />}
                 </button>
               </div>
            </div>

            {/* Voice Settings */}
            <div className="space-y-3 pt-4 border-t border-gray-800">
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
                      className="w-full appearance-none bg-[#0A0C10] border border-gray-800 rounded-xl px-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 cursor-pointer"
                   >
                      {AVAILABLE_VOICES.map(v => (
                        <option key={v.id} value={v.id} className="bg-gray-900 text-gray-100">
                          {v.label}
                        </option>
                      ))}
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                     <ChevronDown className="w-3 h-3" />
                   </div>
                 </div>
               </div>
            </div>
            
            {/* BYOK Settings Section */}
            <div id="api-config-section" className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Settings className="w-4 h-4 text-teal-500" />
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">API Configuration</span>
                 </div>
                 <button 
                   onClick={() => {
                     setIsAddingModel(true);
                     setEditingModelId(null);
                     setTempModelConfig({ provider: 'gemini', name: '', apiKey: '', modelId: '' });
                   }} 
                   className="text-teal-400 hover:text-teal-300 transition-colors p-1 bg-teal-500/10 rounded-full"
                   title="Add New Model"
                 >
                    <Plus className="w-4 h-4" />
                 </button>
              </div>

              {/* List of Models */}
              {modelConfigs.length > 0 && !isAddingModel && !editingModelId && (
                <div className="space-y-2">
                  {modelConfigs.map(config => (
                    <div key={config.id} className={`p-2 rounded-lg border ${config.isActive ? 'border-teal-500/50 bg-teal-500/5' : 'border-gray-800 bg-gray-900/30'} flex items-center justify-between`}>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-medium text-gray-200 truncate">{config.name}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{config.provider}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => startEditing(config)} className="text-gray-500 hover:text-blue-400">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteModel(config.id)} className="text-gray-500 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleToggleActiveModel(config.id)} className="text-gray-400 hover:text-white ml-1">
                          {config.isActive ? <ToggleRight className="w-5 h-5 text-teal-500" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Model Form */}
              {(isAddingModel || editingModelId) && (
                <div className="space-y-3 p-3 border border-gray-800 rounded-lg bg-gray-900/20 animate-fade-in">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-300">{editingModelId ? 'Edit Model' : 'New Model'}</span>
                    <button onClick={() => { setIsAddingModel(false); setEditingModelId(null); }} className="text-gray-500 hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-medium">Provider</label>
                    <select 
                      value={tempModelConfig.provider}
                      onChange={(e) => setTempModelConfig({...tempModelConfig, provider: e.target.value as LLMProvider})}
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
                    >
                      {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-medium">Config Name</label>
                    <input 
                      type="text" 
                      value={tempModelConfig.name}
                      onChange={(e) => setTempModelConfig({...tempModelConfig, name: e.target.value})}
                      placeholder="e.g., My GPT-4"
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                      <Key className="w-3 h-3" /> API Key
                    </label>
                    <input 
                      type="password" 
                      value={tempModelConfig.apiKey}
                      onChange={(e) => setTempModelConfig({...tempModelConfig, apiKey: e.target.value})}
                      placeholder="sk-..."
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Model ID (Optional)
                    </label>
                    <input 
                      type="text" 
                      value={tempModelConfig.modelId}
                      onChange={(e) => setTempModelConfig({...tempModelConfig, modelId: e.target.value})}
                      placeholder="e.g., gpt-4o"
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50 font-mono"
                    />
                  </div>

                  <button 
                    onClick={handleSaveModelConfig}
                    disabled={!tempModelConfig.name || !tempModelConfig.apiKey}
                    className="w-full py-1.5 bg-teal-900/30 hover:bg-teal-900/50 border border-teal-500/30 rounded-lg text-teal-400 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" /> {editingModelId ? 'Update' : 'Add'}
                  </button>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button 
              id="save-settings-button"
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
