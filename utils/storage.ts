
import { StudyContent, SavedPrayer } from '../types';
import * as firebaseService from '../services/firebaseService';

const LOCAL_STORAGE_KEY = 'lumina_study_history';
const LOCAL_FAVORITES_KEY = 'lumina_favorites';
const LOCAL_PRAYERS_KEY = 'lumina_saved_prayers';
const MAX_HISTORY_ITEMS = 20;

// User Context Types
export type UserMode = 'GUEST' | 'GOOGLE';
export interface UserContext {
    mode: UserMode;
    uid?: string;
}

// --- LOCAL STORAGE IMPLEMENTATION (GUEST) ---

const getLocalHistory = (): StudyContent[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

const saveLocalStudy = (study: StudyContent): StudyContent[] => {
  try {
    const history = getLocalHistory();
    const timestamp = Date.now();
    const newStudy = { ...study, timestamp };

    const filteredHistory = history.filter(item => {
      const sameRef = item.verseReference === study.verseReference;
      const sameComparison = item.comparison?.secondReference === study.comparison?.secondReference;
      return !(sameRef && sameComparison);
    });

    const newHistory = [newStudy, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (e) {
    console.error("Failed to save study", e);
    return [];
  }
};

const getLocalFavorites = (): StudyContent[] => {
  try {
    const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const toggleLocalFavorite = (study: StudyContent): StudyContent[] => {
  try {
    const favs = getLocalFavorites();
    const index = favs.findIndex(f => 
      f.verseReference === study.verseReference && 
      f.comparison?.secondReference === study.comparison?.secondReference
    );
    
    let newFavs;
    if (index >= 0) {
      newFavs = favs.filter((_, i) => i !== index);
    } else {
      newFavs = [study, ...favs];
    }
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(newFavs));
    return newFavs;
  } catch (e) {
    return [];
  }
};

const getLocalPrayers = (): SavedPrayer[] => {
  try {
    const stored = localStorage.getItem(LOCAL_PRAYERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalPrayer = (prayer: SavedPrayer): SavedPrayer[] => {
  try {
    const prayers = getLocalPrayers();
    // Check if ID exists to update, or add new. For now, we assume new IDs mostly.
    const exists = prayers.some(p => p.id === prayer.id);
    if (exists) return prayers;

    const newPrayers = [prayer, ...prayers];
    localStorage.setItem(LOCAL_PRAYERS_KEY, JSON.stringify(newPrayers));
    return newPrayers;
  } catch (e) {
    return [];
  }
}

const deleteLocalPrayer = (id: string): SavedPrayer[] => {
  try {
    const prayers = getLocalPrayers();
    const newPrayers = prayers.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_PRAYERS_KEY, JSON.stringify(newPrayers));
    return newPrayers;
  } catch (e) {
    return [];
  }
}

// --- UNIFIED ADAPTER EXPORTS ---

export const getHistory = async (user: UserContext): Promise<StudyContent[]> => {
    if (user.mode === 'GOOGLE' && user.uid) {
        return await firebaseService.fetchCloudHistory(user.uid);
    }
    return getLocalHistory();
};

export const saveStudy = async (user: UserContext, study: StudyContent): Promise<StudyContent[]> => {
    if (user.mode === 'GOOGLE' && user.uid) {
        return await firebaseService.saveToCloudHistory(user.uid, study);
    }
    return saveLocalStudy(study);
};

export const getFavorites = async (user: UserContext): Promise<StudyContent[]> => {
    if (user.mode === 'GOOGLE' && user.uid) {
        return await firebaseService.fetchCloudFavorites(user.uid);
    }
    return getLocalFavorites();
};

export const toggleFavorite = async (user: UserContext, study: StudyContent): Promise<StudyContent[]> => {
    if (user.mode === 'GOOGLE' && user.uid) {
        return await firebaseService.toggleCloudFavorite(user.uid, study);
    }
    return toggleLocalFavorite(study);
};

export const isFavorited = (study: StudyContent, favorites: StudyContent[]): boolean => {
  return favorites.some(f => 
    f.verseReference === study.verseReference && 
    f.comparison?.secondReference === study.comparison?.secondReference
  );
};

// Prayer Exports
export const getSavedPrayers = async (user: UserContext): Promise<SavedPrayer[]> => {
  // Simple local storage for now, even for Google users (mock limit)
  return getLocalPrayers();
};

export const savePrayer = async (user: UserContext, prayer: SavedPrayer): Promise<SavedPrayer[]> => {
  return saveLocalPrayer(prayer);
};

export const deletePrayer = async (user: UserContext, id: string): Promise<SavedPrayer[]> => {
  return deleteLocalPrayer(id);
};
