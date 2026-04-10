
export type BibleVersion = 'KJV' | 'NIV' | 'ESV' | 'NKJV' | 'NLT' | 'NASB' | 'MSG' | 'AMP';

export interface StudyContent {
  verseReference?: string;
  version?: BibleVersion;
  kjvText?: string; // Keeping for backward compatibility or specific KJV requests
  mainText?: string; // The text in the selected version
  simplifiedText?: string;
  originalLanguageText?: string;
  originalLanguageAnalysis?: string;
  explanation: string;
  historicalContext: string;
  keyMeaning: string;
  practicalApplication: string;
  comparison?: {
    secondReference: string;
    secondVersion?: BibleVersion;
    similarities: string;
    differences: string;
    synthesis: string;
  };
  relatedVerses?: Array<{
    reference: string;
    context: string;
  }>;
  similarVerses?: Array<{
    reference: string;
    context: string;
  }>;
  timestamp?: number;
}

export interface SavedPrayer {
  id: string;
  timestamp: number;
  character: string;
  theme?: string;
  scenario: string;
  content: {
    text: string;        // The unified, flowing prayer
    affirmation: string; // The "Persistence" phrase/mantra
  };
}

export interface PassageContext {
  before: {
    reference: string;
    text: string;
  };
  after: {
    reference: string;
    text: string;
  };
  narrative: string;
  historicalAnalysis: string;
}

export interface SearchResultItem {
  reference: string;
  text: string;
  relevance: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type UserMode = 'GUEST' | 'GOOGLE';

export interface UserContext {
    mode: UserMode;
    uid?: string;
    displayName?: string;
    photoURL?: string;
}

export type LLMProvider = 'gemini' | 'openai' | 'anthropic';

export interface ModelConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  apiKey: string;
  modelId: string;
  isActive: boolean;
}
