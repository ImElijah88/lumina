import { Type, Schema, Modality, Chat } from "@google/genai";
import { StudyContent, SearchResultItem, PassageContext, SavedPrayer } from "../types";
import { generateContent } from "./llmProvider";

const BASE_SYSTEM_INSTRUCTION = `
You are an AI assistant specialized in helping users study the Bible accurately and clearly.
Your task is to help users understand Bible passages by explaining their meaning, context, and relevance to modern life.

Facts / Details to reference:
- Use the Bible as the primary source
- Reference historical and cultural context when relevant
- Mention original languages (Hebrew, Greek, Aramaic) if useful
- Avoid promoting a specific denomination
- Be respectful and neutral
- Do not invent verses or quotes

IMPORTANT QUERY HANDLING:
- If the user provides a verse reference with a label in parentheses (e.g., "John 3:16-21 (God's Love)"), IGNORE the text in parentheses for the lookup. Use only the scripture reference (e.g., "John 3:16-21").
`;

// Base properties for the schema (excluding optional KJV which is toggled)
const baseProperties = {
  verseReference: { type: Type.STRING },
  originalLanguageText: { type: Type.STRING },
  originalLanguageAnalysis: { type: Type.STRING },
  simplifiedText: { 
    type: Type.STRING, 
    description: "A captivating retelling of the passage in modern language, written by a master storyteller. It should be immersive, emotive, and vivid, while remaining strictly faithful to the original biblical text. Do not add fictional events, but describe the existing events with narrative flair." 
  },
  explanation: { type: Type.STRING },
  historicalContext: { type: Type.STRING },
  keyMeaning: { type: Type.STRING },
  practicalApplication: { type: Type.STRING },
  relatedVerses: {
    type: Type.ARRAY,
    description: "5-6 direct cross-references or parallel passages that explain the context or fulfillment.",
    items: {
      type: Type.OBJECT,
      properties: {
        reference: { type: Type.STRING, description: "The verse reference (e.g., 'Isaiah 53:5')" },
        context: { type: Type.STRING, description: "Brief reason for the connection" }
      },
      required: ["reference", "context"]
    }
  },
  similarVerses: {
    type: Type.ARRAY,
    description: "3-5 verses that share a 'vibe', underlying principle, or interesting contrast. These do NOT need to be about the exact same topic, but should offer a broader perspective or wisdom connection (e.g., connecting a Psalm to a Proverb, or a command to a story).",
    items: {
      type: Type.OBJECT,
      properties: {
        reference: { type: Type.STRING, description: "The verse reference" },
        context: { type: Type.STRING, description: "Brief explanation of this broader connection" }
      },
      required: ["reference", "context"]
    }
  }
};

const baseRequired = ["explanation", "simplifiedText", "historicalContext", "keyMeaning", "practicalApplication", "relatedVerses", "similarVerses"];

export const analyzePassage = async (
  query: string, 
  comparisonQuery?: string, 
  version: string = 'KJV',
  comparisonVersion: string = 'KJV'
): Promise<StudyContent> => {
  const isComparison = !!comparisonQuery && comparisonQuery.trim().length > 0;

  let systemInstruction = BASE_SYSTEM_INSTRUCTION;
  
  // Create a copy of base properties to modify based on options
  const currentProperties: Record<string, any> = { ...baseProperties };
  
  // Add main text field for the selected version
  currentProperties.mainText = {
    type: Type.STRING,
    description: `The full text of the passage in the ${version} version.`
  };
  currentProperties.version = {
    type: Type.STRING,
    description: "The Bible version used for the main text (e.g., KJV, NIV)."
  };

  // Legacy KJV support (if KJV is selected, populate this too for backward compat)
  if (version === 'KJV') {
    currentProperties.kjvText = { 
      type: Type.STRING, 
      description: "The full text of the passage in the King James Version (KJV)" 
    };
  }

  // Add specific instruction for the simplified text with STRICT formatting rules
  systemInstruction += `
  For 'simplifiedText', act as a master storyteller. Retell the passage in vivid, modern English. Capture the emotion, atmosphere, and narrative flow. Make it engaging for a contemporary reader while preserving the theological accuracy and key details of the original text.
  
  CRITICAL FORMATTING RULES for 'simplifiedText':
  - Output strictly PLAIN TEXT.
  - DO NOT use any markdown characters (like **, *, --, ~, \`, or ##).
  - DO NOT use bullet points or lists.
  - DO NOT add arbitrary lines or separators.
  - Provide only the narrative text.`;

  let schema: Schema;

  if (isComparison) {
    systemInstruction += `
    
    You are also tasked with COMPARING the main passage ("${query}") in ${version} with a second passage ("${comparisonQuery}") in ${comparisonVersion}.
    Provide a comparative analysis highlighting similarities, differences, and a synthesis of how they relate.
    
    Structure your response strictly as a JSON object including the comparison fields.
    Ensure 'mainText' contains the ${version} text of the main passage.
    Include extensive 'relatedVerses' and 'similarVerses'.
    `;

    schema = {
      type: Type.OBJECT,
      properties: {
        ...currentProperties,
        comparison: {
          type: Type.OBJECT,
          properties: {
            secondReference: { type: Type.STRING, description: "The reference of the second passage" },
            secondVersion: { type: Type.STRING, description: "The Bible version of the second passage" },
            secondText: { type: Type.STRING, description: `The text of the second passage in ${comparisonVersion}` },
            similarities: { type: Type.STRING, description: "Key similarities between the two passages" },
            differences: { type: Type.STRING, description: "Key differences or distinct emphases" },
            synthesis: { type: Type.STRING, description: "A synthesis of how these passages work together" },
          },
          required: ["secondReference", "similarities", "differences", "synthesis"],
        },
      },
      required: [...baseRequired, "comparison", "mainText"],
    };
  } else {
    systemInstruction += `
    Structure your response strictly as a JSON object containing the standard study fields.
    Ensure 'mainText' contains the ${version} text of the requested passage.
    Ensure 'relatedVerses' contains 5-6 strong cross-references.
    Ensure 'similarVerses' contains 3-5 broader thematic connections.
    `;
    
    schema = {
      type: Type.OBJECT,
      properties: currentProperties,
      required: [...baseRequired, "mainText"],
    };
  }

  try {
    const contentQuery = isComparison 
      ? `Main Passage: ${query} (${version})\nSecond Passage for Comparison: ${comparisonQuery} (${comparisonVersion})`
      : `${query} (${version})`;

    const text = await generateContent({
      systemInstruction,
      prompt: contentQuery,
      schema,
      defaultModel: "gemini-3-flash-preview"
    });

    if (!text) {
      throw new Error("No content generated");
    }

    const result = JSON.parse(text) as StudyContent;
    
    // Ensure version fields are populated if model missed them
    if (!result.version) result.version = version as any;
    if (result.comparison && !result.comparison.secondVersion) result.comparison.secondVersion = comparisonVersion as any;
    
    // Fallback for KJV text if missing in KJV mode
    if (version === 'KJV' && !result.kjvText && result.mainText) {
        result.kjvText = result.mainText;
    }

    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Searches for verses based on a keyword, phrase, or emotion.
 * Returns a list of potential matches.
 */
export const searchScripture = async (query: string): Promise<SearchResultItem[]> => {
  const prompt = `
  You are a highly intelligent Bible Search Engine.
  User Query: "${query}"

  Task:
  1. Identify the best Bible verses that match this query. 
     - If it's a topic (e.g., "depression"), find the most comforting/relevant verses.
     - If it's a phrase (e.g., "do not fear"), find where this phrase appears.
     - If it's a specific reference (e.g., "John 3:16"), just return that one.
  2. Return a JSON array of up to 6 results.
  3. For each result, provide:
     - 'reference': The book, chapter, and verse (e.g., "Isaiah 41:10").
     - 'text': A brief snippet of the verse (KJV).
     - 'relevance': A very short (5-10 words) explanation of why this matches the query.

  Output strictly JSON.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        reference: { type: Type.STRING },
        text: { type: Type.STRING },
        relevance: { type: Type.STRING }
      },
      required: ["reference", "text", "relevance"]
    }
  };

  try {
    const text = await generateContent({
      prompt,
      schema,
      defaultModel: "gemini-3-flash-preview"
    });

    if (!text) return [];
    return JSON.parse(text) as SearchResultItem[];
  } catch (error) {
    console.error("Search failed", error);
    return [];
  }
};

/**
 * INTELLIGENT VOICE FILTER
 */
export const interpretVoiceQuery = async (rawTranscript: string): Promise<string> => {
  const prompt = `
  You are a Biblical Search Intent Classifier.
  
  Input (Raw Voice Transcript): "${rawTranscript}"
  
  Your Task:
  1. Analyze the input for biblical intent.
  2. Correct misheard words (e.g., "salt and light" vs "salt and lite").
  3. If the user quotes a verse partially or incorrectly, identify the likely verse (e.g. "valley of shadow death" -> "Psalm 23").
  4. If the user describes a feeling or situation, summarize it into a search topic.
  5. Return ONLY the corrected search query string. Do not add quotes or labels.
  `;

  try {
    const text = await generateContent({
      prompt,
      defaultModel: "gemini-3-flash-preview"
    });
    return text.trim();
  } catch (error) {
    console.error("Voice interpretation failed", error);
    return rawTranscript; // Fallback to raw if it fails
  }
};

/**
 * Gets the surrounding context for a specific verse.
 */
export const getPassageContext = async (reference: string): Promise<PassageContext> => {
  const prompt = `
  Provide the biblical context for "${reference}".
  
  Return a JSON object with:
  - 'before': The preceding verse(s) (reference and text).
  - 'after': The following verse(s) (reference and text).
  - 'narrative': A brief explanation of what is happening in this specific chapter/scene.
  - 'historicalAnalysis': A brief note on the historical or cultural setting of this moment.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      before: {
        type: Type.OBJECT,
        properties: { reference: { type: Type.STRING }, text: { type: Type.STRING } },
        required: ["reference", "text"]
      },
      after: {
        type: Type.OBJECT,
        properties: { reference: { type: Type.STRING }, text: { type: Type.STRING } },
        required: ["reference", "text"]
      },
      narrative: { type: Type.STRING },
      historicalAnalysis: { type: Type.STRING }
    },
    required: ["before", "after", "narrative", "historicalAnalysis"]
  };

  try {
    const text = await generateContent({
      prompt,
      schema,
      defaultModel: "gemini-3-flash-preview"
    });
    return JSON.parse(text) as PassageContext;
  } catch (error) {
    console.error("Context fetch failed", error);
    throw error;
  }
};

/**
 * Generates a personalized prayer based on the study content.
 */
export const generatePrayer = async (
  studyContent: StudyContent, 
  character: string, 
  scenario: string
): Promise<SavedPrayer> => {
  const prompt = `
  You are a spiritual guide crafting a deeply personal, empathetic, and powerful prayer.
  
  Context (What the user just studied):
  Passage: ${studyContent.verseReference}
  Meaning: ${studyContent.keyMeaning}
  Application: ${studyContent.practicalApplication}
  
  User Persona:
  Character/Role: ${character}
  Current Scenario/Struggle: ${scenario}
  
  Task:
  Write a prayer that connects the biblical truth they just studied to their specific, current life situation.
  
  Guidelines:
  - The tone should be authentic, vulnerable, and hopeful.
  - Do NOT use religious jargon or clichés. Speak like a real person talking to God.
  - Acknowledge the specific pain or challenge in their "Scenario".
  - Use the truth from the "Passage" as the anchor of hope.
  - Keep it concise but impactful (about 4-6 sentences).
  
  Output strictly as a JSON object with:
  - 'text': The actual prayer.
  - 'affirmation': A short, powerful, 1-sentence mantra or affirmation derived from the prayer that they can repeat to themselves throughout the day.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING },
      affirmation: { type: Type.STRING }
    },
    required: ["text", "affirmation"]
  };

  try {
    const text = await generateContent({
      prompt,
      schema,
      defaultModel: "gemini-3-flash-preview"
    });

    const result = JSON.parse(text);
    
    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      character,
      scenario,
      content: {
        text: result.text,
        affirmation: result.affirmation
      }
    };
  } catch (error) {
    console.error("Prayer generation failed", error);
    throw error;
  }
};

/**
 * Generates an engaging story based on a biblical character or theme.
 */
export const generateStory = async (
  topic: string,
  style: string
): Promise<{ title: string; content: string; moral: string }> => {
  const prompt = `
  You are a master storyteller, like C.S. Lewis or Tolkien, but writing a biblical narrative.
  
  Topic/Character: ${topic}
  Narrative Style: ${style}
  
  Task:
  Write a captivating, immersive short story based on this biblical topic.
  
  Guidelines:
  - If the style is "First-Person", write from the perspective of the character.
  - If the style is "Cinematic", focus on sensory details, atmosphere, and dramatic tension.
  - If the style is "Historical Fiction", weave in accurate cultural details of the time.
  - The story should be engaging, emotional, and vivid.
  - Do NOT just summarize the Bible story. Bring it to life.
  - Keep it to about 3-4 paragraphs.
  
  Output strictly as a JSON object with:
  - 'title': A creative, engaging title for the story.
  - 'content': The story text itself (use paragraphs, but no markdown).
  - 'moral': A 1-sentence takeaway or spiritual truth from the story.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: { type: Type.STRING },
      moral: { type: Type.STRING }
    },
    required: ["title", "content", "moral"]
  };

  try {
    const text = await generateContent({
      prompt,
      schema,
      defaultModel: "gemini-3-flash-preview"
    });
    return JSON.parse(text);
  } catch (error) {
    console.error("Story generation failed", error);
    throw error;
  }
};

/**
 * Generates an answer to a specific question about the current study content.
 */
export const answerQuestion = async (
  question: string,
  context: StudyContent
): Promise<string> => {
  const prompt = `
  You are a wise, empathetic, and knowledgeable biblical scholar.
  
  The user is currently studying: ${context.verseReference}
  Passage Text: "${context.mainText}"
  
  The user has asked this question: "${question}"
  
  Task:
  Answer the user's question directly, clearly, and thoughtfully.
  
  Guidelines:
  - Base your answer on the provided passage context.
  - If the question is broader than the passage, you may bring in other biblical principles, but tie it back to what they are studying.
  - Keep the tone conversational, encouraging, and insightful.
  - Do not use markdown formatting (like bolding or lists), just return plain text paragraphs.
  `;

  try {
    const text = await generateContent({
      prompt,
      defaultModel: "gemini-3-flash-preview"
    });
    return text.trim();
  } catch (error) {
    console.error("Answering question failed", error);
    throw error;
  }
};

/**
 * Generates a "Quick Gem" - a short, impactful insight based on a mood or topic.
 */
export const generateQuickGem = async (
  topic: string
): Promise<{ reference: string; text: string; insight: string }> => {
  const prompt = `
  You are providing a "Quick Gem" of biblical wisdom.
  
  Topic/Mood: ${topic}
  
  Task:
  Select a powerful, lesser-known, or deeply impactful Bible verse related to this topic.
  
  Output strictly as a JSON object with:
  - 'reference': The verse reference (e.g., "Zephaniah 3:17").
  - 'text': The text of the verse (NIV or ESV preferred for readability).
  - 'insight': A 1-2 sentence profound, encouraging insight about what this meaning for the user right now.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      reference: { type: Type.STRING },
      text: { type: Type.STRING },
      insight: { type: Type.STRING }
    },
    required: ["reference", "text", "insight"]
  };

  try {
    const text = await generateContent({
      prompt,
      schema,
      defaultModel: "gemini-3-flash-preview"
    });
    return JSON.parse(text);
  } catch (error) {
    console.error("Quick Gem generation failed", error);
    throw error;
  }
};

// Helper to get the authenticated client dynamically for Gemini-specific features
const getGeminiClient = () => {
  const activeConfig = getActiveModelConfig();
  // If the active config is Gemini, use its key, otherwise fallback to env
  const apiKey = (activeConfig && activeConfig.provider === 'gemini') 
    ? activeConfig.apiKey 
    : process.env.GEMINI_API_KEY || process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey as string });
};

export const getDailyVerseReference = async (): Promise<string> => {
  const prompt = `
  You are a spiritual guide. Select a single, powerful Bible verse for today's "Verse of the Day".
  It should be encouraging, challenging, or deeply insightful.
  
  Output ONLY the verse reference (e.g., "John 3:16" or "Psalm 23:1-3"). Do not include the text or any other words.
  `;
  
  try {
    const text = await generateContent({
      prompt,
      defaultModel: "gemini-3-flash-preview"
    });
    return text.trim();
  } catch (error) {
    console.error("Daily verse generation failed", error);
    return "Psalm 118:24"; // Fallback
  }
};

export const generateBiblicalArt = async (reference: string, context: string): Promise<string | null> => {
  try {
    const ai = getGeminiClient();
    const prompt = `Create a beautiful, cinematic, and historically accurate biblical illustration for ${reference}. Context: ${context}. The style should be like a classic oil painting or high-end concept art, dramatic lighting, respectful and awe-inspiring.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Art generation failed", error);
    return null;
  }
};

export const generateExternalArtPrompt = async (reference: string, context: string): Promise<string> => {
  const prompt = `
  You are an expert AI image generation prompt engineer (for Midjourney/DALL-E).
  Create a highly detailed, comma-separated prompt for the biblical passage: ${reference}.
  Context: ${context}.
  
  Include: subject, action, environment, lighting, camera angle, and artistic style (e.g., cinematic, dramatic lighting, 8k resolution, masterpiece).
  Do not include any intro or outro text, just the prompt itself.
  `;
  
  try {
    const text = await generateContent({
      prompt,
      defaultModel: "gemini-3-flash-preview"
    });
    return text.trim();
  } catch (error) {
    console.error("Prompt generation failed", error);
    return `Cinematic biblical scene of ${reference}, dramatic lighting, masterpiece, 8k, highly detailed`;
  }
};

export const generateScript = async (reference: string, context: string): Promise<string> => {
  const prompt = `
  Write a short, engaging video script (like a YouTube Short or TikTok) about this biblical passage: ${reference}.
  Context: ${context}.
  
  Include:
  - A strong hook (first 3 seconds)
  - The core message
  - A practical takeaway
  - Visual cues in brackets like [Show dramatic landscape]
  
  Keep it under 60 seconds when spoken.
  `;
  
  try {
    const text = await generateContent({
      prompt,
      defaultModel: "gemini-3-flash-preview"
    });
    return text.trim();
  } catch (error) {
    console.error("Script generation failed", error);
    return "Failed to generate script.";
  }
};

export const createChatSession = (context: StudyContent): Chat => {
  const ai = getGeminiClient();
  const systemInstruction = `
  You are an expert biblical scholar and empathetic guide.
  The user is currently studying: ${context.verseReference}
  Passage Text: "${context.mainText}"
  Key Meaning: "${context.keyMeaning}"
  
  Answer their questions based on this context. Keep answers concise, conversational, and helpful.
  Do not use markdown formatting (like bolding or lists), just return plain text paragraphs.
  `;
  
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction
    }
  });
};

export const generateSpeech = async (text: string, voice: string): Promise<string | null> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: text,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' }
          }
        }
      }
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Speech generation failed", error);
    return null;
  }
};

export const generateSpiritualPrayer = async (character?: string, theme?: string): Promise<SavedPrayer | null> => {
  const prompt = `
  You are a spiritual guide crafting a deeply personal, empathetic, and powerful prayer.
  
  ${character ? `User Persona/Character: ${character}` : ''}
  ${theme ? `Theme/Context: ${theme}` : ''}
  
  Task:
  Write a prayer that connects biblical truth to a specific life situation.
  
  Guidelines:
  - The tone should be authentic, vulnerable, and hopeful.
  - Do NOT use religious jargon or clichés. Speak like a real person talking to God.
  - Keep it concise but impactful (about 4-6 sentences).
  
  Output strictly as a JSON object with:
  - 'text': The actual prayer.
  - 'affirmation': A short, powerful, 1-sentence mantra or affirmation derived from the prayer that they can repeat to themselves throughout the day.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING },
      affirmation: { type: Type.STRING }
    },
    required: ["text", "affirmation"]
  };

  try {
    const text = await generateContent({
      prompt,
      schema,
      defaultModel: "gemini-3-flash-preview"
    });

    const result = JSON.parse(text);
    
    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      character: character || 'Seeker',
      scenario: theme || 'General',
      content: {
        text: result.text,
        affirmation: result.affirmation
      }
    };
  } catch (error) {
    console.error("Prayer generation failed", error);
    return null;
  }
};
