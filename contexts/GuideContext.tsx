import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GuideStep {
  targetId: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
}

interface GuideContextType {
  activeGuide: Guide | null;
  currentStepIndex: number;
  startGuide: (guideId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  endGuide: () => void;
  availableGuides: Guide[];
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const availableGuides: Guide[] = [
  {
    id: 'byok-setup',
    title: 'Setup BYOK (Bring Your Own Key)',
    description: 'Learn how to configure your own API key for custom models.',
    steps: [
      {
        targetId: 'profile-menu-button',
        title: 'Open Profile Menu',
        content: 'Click here to access your settings and configuration.',
        placement: 'bottom'
      },
      {
        targetId: 'api-config-section',
        title: 'Enable Custom Config',
        content: 'Toggle this switch to enable custom API configuration. You can click it right now!',
        placement: 'left',
        action: () => window.dispatchEvent(new Event('open-profile-menu'))
      },
      {
        targetId: 'api-key-input',
        title: 'Enter API Key',
        content: 'Paste your Gemini API key here. It will be stored securely in your browser.',
        placement: 'left',
        action: () => window.dispatchEvent(new Event('open-profile-menu'))
      },
      {
        targetId: 'model-id-input',
        title: 'Enter Model ID',
        content: 'Optionally, specify a custom model ID (e.g., gemini-3-flash-preview).',
        placement: 'left',
        action: () => window.dispatchEvent(new Event('open-profile-menu'))
      },
      {
        targetId: 'save-settings-button',
        title: 'Save Settings',
        content: 'Click here to save your new configuration and start using your own key.',
        placement: 'top',
        action: () => window.dispatchEvent(new Event('open-profile-menu'))
      }
    ]
  },
  {
    id: 'study-flow',
    title: 'How to Study a Verse',
    description: 'A quick tour on how to search and analyze scripture.',
    steps: [
      {
        targetId: 'search-input',
        title: 'Search Scripture',
        content: 'Enter a verse, topic, or feeling here to begin your study.',
        placement: 'bottom'
      },
      {
        targetId: 'quick-nav-tabs',
        title: 'Quick Navigation',
        content: 'Use these tabs to quickly find topics, moods, or daily insights.',
        placement: 'top'
      }
    ]
  },
  {
    id: 'save-verse',
    title: 'How to Save a Verse',
    description: 'Learn how to bookmark verses for later study.',
    steps: [
      {
        targetId: 'search-input',
        title: 'Find a Verse',
        content: 'First, search for a verse you want to save.',
        placement: 'bottom'
      },
      {
        targetId: 'save-verse-button',
        title: 'Save to Library',
        content: 'Click this button to save the current study to your personal library.',
        placement: 'bottom'
      }
    ]
  },
  {
    id: 'generate-prayer',
    title: 'Generate a Divine Prayer',
    description: 'Learn how to use the Creative Suite to generate a prayer.',
    steps: [
      {
        targetId: 'result-tab-creative',
        title: 'Open Creative Suite',
        content: 'Click the Creative Suite tab to access advanced tools.',
        placement: 'top'
      },
      {
        targetId: 'generate-prayer-button',
        title: 'Generate Prayer',
        content: 'Click here to generate a personalized prayer based on the current verse and mood.',
        placement: 'top',
        action: () => window.dispatchEvent(new CustomEvent('change-result-tab', { detail: 'creative' }))
      }
    ]
  }
];

export const GuideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const startGuide = (guideId: string) => {
    const guide = availableGuides.find(g => g.id === guideId);
    if (guide) {
      setActiveGuide(guide);
      setCurrentStepIndex(0);
      
      // Execute first step action if exists
      if (guide.steps[0]?.action) {
        guide.steps[0].action();
      }
    }
  };

  const nextStep = () => {
    if (activeGuide && currentStepIndex < activeGuide.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (activeGuide.steps[nextIdx]?.action) {
        activeGuide.steps[nextIdx].action();
      }
    } else {
      endGuide();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (activeGuide?.steps[prevIdx]?.action) {
        activeGuide.steps[prevIdx].action();
      }
    }
  };

  const endGuide = () => {
    setActiveGuide(null);
    setCurrentStepIndex(0);
  };

  return (
    <GuideContext.Provider value={{
      activeGuide,
      currentStepIndex,
      startGuide,
      nextStep,
      prevStep,
      endGuide,
      availableGuides
    }}>
      {children}
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
};
