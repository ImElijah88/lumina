
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { StudyInput } from './components/StudyInput';
import { StudyResult } from './components/StudyResult';
import { HistoryList } from './components/HistoryList';
import { QuickStartGems } from './components/QuickStartGems';
import { MoodSelector } from './components/MoodSelector';
import { StorySelector } from './components/StorySelector';
import { PrayerGenerator } from './components/PrayerGenerator';
import { SearchResults } from './components/SearchResults';
import { Sidebar } from './components/Sidebar';
import { UserProfileMenu } from './components/UserProfileMenu';
import { PageAssistant } from './components/PageAssistant';
import { DailyInsight } from './components/DailyInsight';
import { SuggestedTopics } from './components/SuggestedTopics';
import { QuickNav, QuickNavTab } from './components/QuickNav';
import { ParticleBackground } from './components/ui/ParticleBackground';
import { SpiritLoader } from './components/ui/SpiritLoader';
import { analyzePassage, searchScripture } from './services/geminiService';
import { mockGoogleLogin } from './services/firebaseService';
import { StudyContent, LoadingState, SearchResultItem, SavedPrayer } from './types';
import { Book, AlertCircle, WifiOff, ArrowLeft } from 'lucide-react';
import { getHistory, saveStudy, getFavorites, toggleFavorite, isFavorited, getSavedPrayers, savePrayer, deletePrayer, UserContext, UserMode } from './utils/storage';
import { soundEngine } from './utils/soundUtils';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<UserContext | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // --- App State ---
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [studyContent, setStudyContent] = useState<StudyContent | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Data State (Dependent on User)
  const [history, setHistory] = useState<StudyContent[]>([]);
  const [favorites, setFavorites] = useState<StudyContent[]>([]);
  const [savedPrayers, setSavedPrayers] = useState<SavedPrayer[]>([]);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState<QuickNavTab>('discoveries');

  // Check for existing session on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('lumina_auth_mode') as UserMode;
    const savedUid = localStorage.getItem('lumina_auth_uid');
    const savedName = localStorage.getItem('lumina_auth_name');
    const savedPhoto = localStorage.getItem('lumina_auth_photo');

    if (savedMode) {
      setUser({ 
        mode: savedMode, 
        uid: savedUid || undefined,
        displayName: savedName || undefined,
        photoURL: savedPhoto || undefined
      });
    }
    setIsInitializing(false);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load Data whenever User changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const hist = await getHistory(user);
        const favs = await getFavorites(user);
        const prayers = await getSavedPrayers(user);
        setHistory(hist);
        setFavorites(favs);
        setSavedPrayers(prayers);
      } else {
        setHistory([]);
        setFavorites([]);
        setSavedPrayers([]);
      }
    };
    loadUserData();
  }, [user]);

  const handleLogin = async (mode: UserMode) => {
    soundEngine.playClick();
    if (mode === 'GOOGLE') {
      try {
        // Mock Google Login
        const googleUser = await mockGoogleLogin();
        const newUser = { 
          mode: 'GOOGLE' as UserMode, 
          uid: googleUser.uid,
          displayName: googleUser.displayName,
          photoURL: googleUser.photoURL
        };
        setUser(newUser);
        localStorage.setItem('lumina_auth_mode', 'GOOGLE');
        localStorage.setItem('lumina_auth_uid', googleUser.uid);
        localStorage.setItem('lumina_auth_name', googleUser.displayName);
        localStorage.setItem('lumina_auth_photo', googleUser.photoURL);
      } catch (e) {
        console.error("Login failed", e);
        // Fallback to guest on error for now
        setUser({ mode: 'GUEST' });
      }
    } else {
      setUser({ mode: 'GUEST' });
      localStorage.setItem('lumina_auth_mode', 'GUEST');
    }
  };

  const handleLogout = () => {
    soundEngine.playClick();
    setUser(null);
    setStudyContent(null);
    setSearchResults(null);
    setSearchQuery('');
    setLoadingState(LoadingState.IDLE);
    
    // Clear Auth
    localStorage.removeItem('lumina_auth_mode');
    localStorage.removeItem('lumina_auth_uid');
    localStorage.removeItem('lumina_auth_name');
    localStorage.removeItem('lumina_auth_photo');
  };

  // 1. SEARCH STEP
  const handleInitialInput = async (query: string, comparisonQuery?: string, includeKJV: boolean = true) => {
    soundEngine.playProcessingStart();
    if (!isOnline && user?.mode === 'GOOGLE') {
        // Warn google users if offline
    }

    setLoadingState(LoadingState.SEARCHING);
    setError(null);
    setSearchResults(null);
    setStudyContent(null);
    setSearchQuery(query);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (comparisonQuery) {
      handleAnalyzeStudy(query, comparisonQuery, includeKJV);
      return;
    }

    try {
      const results = await searchScripture(query);
      if (!results || results.length === 0) {
        handleAnalyzeStudy(query, undefined, includeKJV);
      } else {
        setSearchResults(results);
        setLoadingState(LoadingState.IDLE);
        soundEngine.playCelestialChord();
      }
    } catch (err) {
      handleAnalyzeStudy(query, undefined, includeKJV);
    }
  };

  // 2. STUDY STEP
  const handleAnalyzeStudy = async (query: string, comparisonQuery?: string, includeKJV: boolean = true) => {
    if (!user) return;
    
    setLoadingState(LoadingState.ANALYZING);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await analyzePassage(query, comparisonQuery, includeKJV);
      setStudyContent(result);
      setLoadingState(LoadingState.SUCCESS);
      soundEngine.playCelestialChord();
      
      // Auto-save to history using new async storage
      const updatedHistory = await saveStudy(user, result);
      setHistory(updatedHistory);
    } catch (err) {
      console.error(err);
      setError("Unable to analyze passage. Please try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleHistorySelect = (study: StudyContent) => {
    soundEngine.playClick();
    setStudyContent(study);
    setSearchResults(null);
    setLoadingState(LoadingState.SUCCESS);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackToSearch = () => {
    soundEngine.playClick();
    setStudyContent(null);
    setLoadingState(LoadingState.IDLE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAll = () => {
    soundEngine.playClick();
    setStudyContent(null);
    setSearchResults(null);
    setSearchQuery('');
    setLoadingState(LoadingState.IDLE);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (content: StudyContent) => {
    if (!user) return;
    soundEngine.playClick();
    const newFavs = await toggleFavorite(user, content);
    setFavorites(newFavs);
  };

  const handleRemoveFavorite = (content: StudyContent, e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleFavorite(content);
  }

  // --- Prayer Handlers ---
  const handleSavePrayer = async (prayer: SavedPrayer) => {
    if (!user) return;
    const newPrayers = await savePrayer(user, prayer);
    setSavedPrayers(newPrayers);
  };

  const handleRemovePrayer = async (id: string, e: React.MouseEvent) => {
    if (!user) return;
    e.stopPropagation();
    soundEngine.playClick();
    const newPrayers = await deletePrayer(user, id);
    setSavedPrayers(newPrayers);
  }

  // --- RENDER ---

  if (isInitializing) {
      return <div className="min-h-screen bg-[#050608] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!user) {
      return (
        <>
          <ParticleBackground />
          <LandingPage onLogin={handleLogin} />
        </>
      );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Visual Background */}
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onHomeClick={clearAll} />
        
        {/* Sidebar for Favorites & Prayers */}
        <Sidebar 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          favorites={favorites}
          savedPrayers={savedPrayers}
          onSelect={handleHistorySelect}
          onRemoveFavorite={handleRemoveFavorite}
          onRemovePrayer={handleRemovePrayer}
        />
        
        {/* Profile / User Menu */}
        <div className="absolute top-3.5 right-4 z-50 md:top-4 md:right-8">
            <UserProfileMenu user={user} onLogout={handleLogout} />
        </div>
        
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-yellow-900/20 border-b border-yellow-900/30 py-2 px-4 text-center text-xs text-yellow-500 flex justify-center items-center gap-2">
            <WifiOff className="w-3 h-3" />
            <span>You are offline. Showing saved content.</span>
          </div>
        )}
        
        <main className={`flex-grow px-4 py-8 md:py-12 w-full max-w-5xl mx-auto transition-all duration-300 ${isSidebarOpen ? 'md:pl-80' : ''}`}>
          
          {!studyContent && !searchResults && (
            <div className="text-center mb-10 space-y-3 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 drop-shadow-lg">
                Explore the <span className="text-blue-400">Word</span>
              </h1>
              <p className="text-gray-400 max-w-xl mx-auto text-lg drop-shadow-md">
                Gain deeper understanding with historical context, theological meaning, and practical application.
              </p>
            </div>
          )}

          {!studyContent && !searchResults && (
            <>
              <StudyInput 
                onAnalyze={handleInitialInput} 
                isLoading={loadingState === LoadingState.SEARCHING || loadingState === LoadingState.ANALYZING} 
              />
              
              {/* Daily Insight Section */}
              {loadingState === LoadingState.IDLE && (
                  <DailyInsight onSelect={(q) => handleInitialInput(q)} isLoading={loadingState === LoadingState.ANALYZING} />
              )}
              
              {/* Quick Presets Navbar */}
              {loadingState === LoadingState.IDLE && (
                <>
                  <QuickNav activeTab={activeTab} onTabChange={setActiveTab} />
                  
                  <div className="min-h-[400px]">
                    {activeTab === 'narrative' && (
                      <StorySelector onSelect={(q) => handleInitialInput(q)} isLoading={loadingState === LoadingState.ANALYZING} />
                    )}
                    {activeTab === 'topics' && (
                      <SuggestedTopics onSelect={(q) => handleInitialInput(q)} />
                    )}
                    {activeTab === 'mood' && (
                      <MoodSelector onSelectMood={(mood) => handleInitialInput(mood)} />
                    )}
                    {activeTab === 'discoveries' && (
                      <QuickStartGems onSelect={(q) => handleInitialInput(q)} />
                    )}
                    {activeTab === 'prayer' && (
                      <PrayerGenerator onSave={handleSavePrayer} isLoading={loadingState === LoadingState.ANALYZING} />
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {loadingState === LoadingState.SEARCHING && (
            <SpiritLoader message="Searching Scriptures..." color="#60a5fa" />
          )}

          {loadingState === LoadingState.ANALYZING && (
            <SpiritLoader message="Analyzing Meaning & Context..." color="#2dd4bf" />
          )}

          {loadingState === LoadingState.ERROR && (
            <div className="max-w-3xl mx-auto p-4 bg-red-900/10 border border-red-900/30 rounded-xl flex items-center gap-3 text-red-400 mb-8 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
              <button onClick={clearAll} className="ml-auto text-sm underline hover:text-white">Reset</button>
            </div>
          )}

          {searchResults && !studyContent && loadingState !== LoadingState.ANALYZING && (
            <SearchResults 
              results={searchResults}
              query={searchQuery}
              onSelect={(ref) => handleAnalyzeStudy(ref)}
              onBack={clearAll}
            />
          )}

          {studyContent ? (
            <div>
              <div className="mb-8">
                <button 
                  onClick={searchResults ? goBackToSearch : clearAll}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {searchResults ? 'Back to Results' : 'Back to Search & History'}
                </button>
              </div>

              <StudyResult 
                content={studyContent} 
                onNavigate={(ref) => handleAnalyzeStudy(ref)} 
                isFavorited={isFavorited(studyContent, favorites)}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ) : (
            <>
              {!searchResults && history.length === 0 && loadingState === LoadingState.IDLE && (
                <div className="max-w-xl mx-auto mt-8 text-center p-8 border border-gray-800/50 rounded-2xl bg-[#0A0C10]/50 backdrop-blur-md">
                  <div className="inline-flex p-4 rounded-full bg-gray-800/50 mb-4">
                    <Book className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-gray-300 font-medium mb-2">Start Your Journey</h3>
                  <p className="text-sm text-gray-500">
                    Search for any verse, topic, or select a quick discovery above.
                    <br />
                    <span className="text-gray-600 mt-2 block">Tip: Use the comparison tool to see how two passages relate.</span>
                  </p>
                </div>
              )}

              {!searchResults && history.length > 0 && loadingState === LoadingState.IDLE && (
                <HistoryList history={history} onSelect={handleHistorySelect} />
              )}
            </>
          )}
        </main>

        {/* Helper Assistant */}
        <PageAssistant studyContent={studyContent} />

        <footer className={`py-8 border-t border-gray-900/50 mt-auto text-center text-gray-600 text-sm transition-all duration-300 relative z-10 backdrop-blur-sm ${isSidebarOpen ? 'md:pl-80' : ''}`}>
          <p>&copy; {new Date().getFullYear()} Lumina Scripture Study. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
