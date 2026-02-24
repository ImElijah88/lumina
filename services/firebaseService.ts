
// NOTE: This file contains the structure for Firebase integration.
// Since we are in a demo environment without real API keys, 
// we are using a MOCK implementation that simulates the "Google" cloud database 
// by using a separate LocalStorage namespace.

import { StudyContent } from "../types";

// --- REAL FIREBASE CONFIGURATION STRUCTURE (COMMENTED OUT FOR DEMO) ---
/*
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
*/

// --- MOCK INTERFACE ---

const MOCK_GOOGLE_DB_KEY = 'lumina_cloud_mock_db';
const MOCK_GOOGLE_FAVS_KEY = 'lumina_cloud_mock_favs';

export const mockGoogleLogin = async (): Promise<{ uid: string, displayName: string, photoURL: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
        uid: 'google-user-123',
        displayName: 'Demo User',
        photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocIq8d1-123456789=s96-c' // Generic placeholder mimicking Google URL
    };
};

export const fetchCloudHistory = async (userId: string): Promise<StudyContent[]> => {
    console.log(`[Firebase Mock] Fetching history for ${userId}...`);
    // In real app: const q = query(collection(db, "users", userId, "history"), orderBy("timestamp", "desc"), limit(20));
    try {
        const stored = localStorage.getItem(MOCK_GOOGLE_DB_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
};

export const saveToCloudHistory = async (userId: string, study: StudyContent): Promise<StudyContent[]> => {
    console.log(`[Firebase Mock] Saving study to cloud for ${userId}...`);
    // In real app: await addDoc(collection(db, "users", userId, "history"), study);
    try {
        const history = await fetchCloudHistory(userId);
        const timestamp = Date.now();
        const newStudy = { ...study, timestamp };
        
        // Filter duplicates
        const filtered = history.filter(item => item.verseReference !== study.verseReference);
        const newHistory = [newStudy, ...filtered].slice(0, 50); // Cloud stores more
        
        localStorage.setItem(MOCK_GOOGLE_DB_KEY, JSON.stringify(newHistory));
        return newHistory;
    } catch (e) {
        return [];
    }
};

export const fetchCloudFavorites = async (userId: string): Promise<StudyContent[]> => {
    try {
        const stored = localStorage.getItem(MOCK_GOOGLE_FAVS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
};

export const toggleCloudFavorite = async (userId: string, study: StudyContent): Promise<StudyContent[]> => {
    console.log(`[Firebase Mock] Toggling favorite in cloud for ${userId}...`);
    try {
        const favs = await fetchCloudFavorites(userId);
        const index = favs.findIndex(f => f.verseReference === study.verseReference);
        
        let newFavs;
        if (index >= 0) {
            newFavs = favs.filter((_, i) => i !== index);
        } else {
            newFavs = [study, ...favs];
        }
        localStorage.setItem(MOCK_GOOGLE_FAVS_KEY, JSON.stringify(newFavs));
        return newFavs;
    } catch (e) {
        return [];
    }
};
