
import { GoogleGenAI, Type, Schema, Modality, Chat } from "@google/genai";
import { StudyContent, SearchResultItem, PassageContext, SavedPrayer } from "../types";

// Keys for Local Storage
const LS_USE_CUSTOM = 'lumina_use_custom_config';
const LS_API_KEY = 'lumina_custom_api_key';
const LS_MODEL = 'lumina_custom_model';

// Helper to get the authenticated client dynamically
const getAIClient = () => {
  const useCustom = localStorage.getItem(LS_USE_CUSTOM) === 'true';
  const customKey = localStorage.getItem(LS_API_KEY);
  
  // Priority: Custom Key (if enabled) -> Env Key
  const apiKey = (useCustom && customKey) ? customKey : process.env.API_KEY;
  
  return new GoogleGenAI({ apiKey });
};

// Helper to get the model name dynamically
const getModelName = (defaultModel: string) => {
  const useCustom = localStorage.getItem(LS_USE_CUSTOM) === 'true';
  const customModel = localStorage.getItem(LS_MODEL);
  
  // Priority: Custom Model (if enabled) -> Default Model
  // If custom model is empty string but enabled, fallback to default to avoid crash
  return (useCustom && customModel && customModel.trim() !== '') ? customModel : defaultModel;
};

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

export const analyzePassage = async (query: string, comparisonQuery?: string, includeKJV: boolean = true): Promise<StudyContent> => {
  const isComparison = !!comparisonQuery && comparisonQuery.trim().length > 0;

  let systemInstruction = BASE_SYSTEM_INSTRUCTION;
  
  // Create a copy of base properties to modify based on options
  const currentProperties: Record<string, any> = { ...baseProperties };
  
  if (includeKJV) {
    currentProperties.kjvText = { 
      type: Type.STRING, 
      description: "The full text of the passage in the King James Version (KJV)" 
    };
    systemInstruction += `\nEnsure 'kjvText' contains the King James Version text of the requested passage.`;
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
    
    You are also tasked with COMPARING the main passage ("${query}") with a second passage ("${comparisonQuery}").
    Provide a comparative analysis highlighting similarities, differences, and a synthesis of how they relate.
    
    Structure your response strictly as a JSON object including the comparison fields.
    ${includeKJV ? "Ensure 'kjvText' contains the King James Version text of the main passage." : ""}
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
            similarities: { type: Type.STRING, description: "Key similarities between the two passages" },
            differences: { type: Type.STRING, description: "Key differences or distinct emphases" },
            synthesis: { type: Type.STRING, description: "A synthesis of how these passages work together" },
          },
          required: ["secondReference", "similarities", "differences", "synthesis"],
        },
      },
      required: [...baseRequired, "comparison"],
    };
  } else {
    systemInstruction += `
    Structure your response strictly as a JSON object containing the standard study fields.
    ${includeKJV ? "Ensure 'kjvText' contains the King James Version text of the requested passage." : ""}
    Ensure 'relatedVerses' contains 5-6 strong cross-references.
    Ensure 'similarVerses' contains 3-5 broader thematic connections.
    `;
    
    schema = {
      type: Type.OBJECT,
      properties: currentProperties,
      required: baseRequired,
    };
  }

  try {
    const ai = getAIClient();
    const modelName = getModelName("gemini-3-flash-preview");

    const contentQuery = isComparison 
      ? `Main Passage: ${query}\nSecond Passage for Comparison: ${comparisonQuery}`
      : query;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contentQuery,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated");
    }

    return JSON.parse(text) as StudyContent;
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
    const ai = getAIClient();
    const modelName = getModelName("gemini-3-flash-preview");

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
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
    const ai = getAIClient();
    const modelName = getModelName("gemini-3-flash-preview");

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const text = response.text;
    return text ? text.trim() : rawTranscript;
  } catch (error) {
    console.error("Voice interpretation failed", error);
    return rawTranscript;
  }
};

/**
 * GET DAILY VERSE REFERENCE
 * Fetches a single verse reference relevant to today's date.
 */
export const getDailyVerseReference = async (): Promise<string> => {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const prompt = `
  Today is ${dateString}.
  Select a single, meaningful Bible verse reference that aligns with this time of year, history, or general daily encouragement.
  Examples: "Psalm 118:24", "Isaiah 43:19", "Luke 2:10" (if Christmas), etc.
  Return ONLY the verse reference string. No text, no explanation.
  `;

  try {
    const ai = getAIClient();
    const modelName = getModelName("gemini-3-flash-preview");
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text?.trim() || "Psalm 119:105";
  } catch (e) {
    console.error(e);
    return "Psalm 119:105"; // Fallback
  }
}

/**
 * GENERATE SPEECH (TTS)
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  try {
    const ai = getAIClient();
    // Use the specific TTS model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName }
            }
        }
      }
    });

    // The API returns base64 encoded audio in the response
    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64 || null;
  } catch (e) {
    console.error("TTS generation failed", e);
    return null;
  }
};

/**
 * GET PASSAGE CONTEXT
 * Fetches surrounding verses and a narrative summary.
 */
export const getPassageContext = async (reference: string): Promise<PassageContext | null> => {
  const prompt = `
  For the Bible passage "${reference}":
  1. Provide the 2-3 verses IMMEDIATELY PRECEDING it (KJV).
  2. Provide the 2-3 verses IMMEDIATELY FOLLOWING it (KJV).
  3. Provide a brief 1-sentence narrative explanation of what is happening in this specific section.
  4. Provide a detailed "Historical & Verification Analysis" (approx 3-4 sentences). 
     - Mention what was happening historically/politically at that time.
     - Mention social conditions relevant to the text.
     - Mention if this event/figure is verified by extra-biblical sources (e.g., Josephus, Roman records, archaeology) or fits known history.
  
  Output as JSON.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      before: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING, description: "e.g. 'John 3:13-15'" },
          text: { type: Type.STRING, description: "The text of these preceding verses (KJV)" }
        },
        required: ["reference", "text"]
      },
      after: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING, description: "e.g. 'John 3:22-24'" },
          text: { type: Type.STRING, description: "The text of these following verses (KJV)" }
        },
        required: ["reference", "text"]
      },
      narrative: { type: Type.STRING, description: "What leads to this moment?" },
      historicalAnalysis: { 
        type: Type.STRING, 
        description: "Historical context, social conditions, and extra-biblical verification if available." 
      }
    },
    required: ["before", "after", "narrative", "historicalAnalysis"]
  };

  try {
    const ai = getAIClient();
    const modelName = getModelName("gemini-3-flash-preview");

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as PassageContext;
  } catch (error) {
    console.error("Context fetch failed", error);
    return null;
  }
};

export const generateBiblicalArt = async (verse: string, context: string): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const modelName = getModelName("gemini-2.5-flash-image");

    const prompt = `
    **Role**: You are a world-class Cinematic Concept Artist.
    **Task**: Create a photorealistic, emotionally charged masterpiece for a "Legendary Trading Card" illustrating: "${verse}".
    **Context**: ${context}

    **Visual Direction (2026 Reality)**:
    1.  **Setting**: A grounded, near-future world (Year 2026). Use realistic modern environments (bustling cyber-cities, quiet smart-homes, nature reclaiming urban spaces) rather than abstract fantasy.
    2.  **Metaphor**: Translate the spiritual concept into a relatable human situation. 
        - Example: For "protection", show a figure walking confidently through a chaotic, rain-slicked neon street, shielded by an unseen warmth.
        - Example: For "peace", show someone finding silence in a high-tech, busy transit hub.
    3.  **Characters**: Diverse ethnicity, wearing distinct modern-future fashion (streetwear, tech-wear). Focus intensely on facial emotion and body language.
    4.  **Atmosphere**: Cinematic lighting, volumetric fog, lens flares, high contrast. Make it feel epic and significant.
    
    **Strict Constraints**: NO TEXT, NO WORDS, NO WATERMARKS.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4", 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
};

export const generateExternalArtPrompt = async (verse: string, context: string): Promise<string> => {
  const strategyInstruction = `
  You are an **Expert Visual Prompt Engineer**.
  Input Verse: "${verse}"
  Context: "${context}"
  Output a concise Midjourney prompt.
  `;

  try {
    const ai = getAIClient();
    const modelName = getModelName("gemini-3-flash-preview");

    const response = await ai.models.generateContent({
      model: modelName,
      contents: strategyInstruction,
    });

    return response.text?.trim() || "Could not generate prompt.";
  } catch (error) {
    console.error("External prompt generation failed", error);
    throw error;
  }
}

export const generateScript = async (verse: string, context: string): Promise<string> => {
    const instruction = `
    You are an Award-Winning Screenwriter.
    Write a short screenplay scene based on: "${verse}".
    Context: "${context}"
    Use industry standard formatting.
    `;
  
    try {
      const ai = getAIClient();
      const modelName = getModelName("gemini-3-flash-preview");

      const response = await ai.models.generateContent({
        model: modelName,
        contents: instruction,
      });
  
      return response.text || "Could not generate script.";
    } catch (error) {
      console.error("Script generation failed", error);
      throw error;
    }
  }

export const createChatSession = (context?: StudyContent): Chat => {
  const ai = getAIClient();
  const modelName = getModelName("gemini-3-flash-preview");

  let systemInstruction = `
  You are 'Lumina', a helpful and wise Bible study assistant. 
  Your goal is to help the user understand the Bible passage they are currently studying.
  
  Tone: Warm, encouraging, scholarly but accessible.
  `;

  if (context) {
    systemInstruction += `
    
    CURRENT STUDY CONTEXT:
    The user is looking at an analysis of: ${context.verseReference || "Unknown Passage"}
    
    Here is the detailed content on the page:
    ${JSON.stringify(context)}
    
    INSTRUCTIONS:
    1. Answer questions specifically about this content.
    2. Define terms found in the text (e.g., if the text mentions "Mammon", explain it).
    3. If the user asks for clarification on the "Historical Context" or "Key Meaning" provided, explain it further.
    4. You can bring in outside biblical knowledge to support your answers.
    5. Keep answers concise (under 150 words) unless asked for more detail.
    `;
  }

  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

/**
 * GENERATE SPIRITUAL PRAYER (New Module)
 */
export const generateSpiritualPrayer = async (characterName?: string, theme?: string): Promise<SavedPrayer | null> => {
  const prompt = `
  Generate a unique, spiritually profound prayer based on the Bible character: "${characterName || "a random biblical figure"}" and the theme: "${theme || "a relevant spiritual theme"}".
  
  Your goal is to create a "United Holy Prayer".
  
  INTERNAL LOGIC (Do NOT label these steps in the output):
  1. **Anchor**: Start with awe of God, referencing how He helped this character or His nature in that context.
  2. **Alignment**: Link the specific need/feeling to a greater divine purpose or growth, focusing on the theme of ${theme || "spiritual growth"}.
  3. **Surrender**: State the request boldly, but end with releasing control ("Your will be done").
  4. **Persistence**: A sense of ongoing trust.

  OUTPUT INSTRUCTIONS:
  - You must use "${characterName || "a random biblical figure"}" as the source of inspiration.
  - The prayer MUST focus on the theme: "${theme || "general spiritual well-being"}".
  - Select a plausible feeling/scenario relevant to the modern human experience that aligns with ${characterName ? characterName + "'s" : "their"} specific biblical story (e.g. if Noah, maybe 'patience during long waits'; if Esther, 'courage for a specific moment').
  - **'text'**: Write the prayer as ONE continuous, beautiful, flowing paragraph. It should move naturally from awe to request to surrender. DO NOT add headers like "Anchor:" or "Surrender:". Make it feel like a heartfelt conversation with the Divine.
  - **'affirmation'**: Extract a short, powerful, single-sentence affirmation or mantra from this prayer that the user can repeat throughout the day (e.g. "I walk in faith, not by sight.").

  Output strictly JSON.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      character: { type: Type.STRING, description: "The Bible character selected" },
      scenario: { type: Type.STRING, description: "The scenario or feeling being addressed" },
      content: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The unified, flowing prayer text." },
          affirmation: { type: Type.STRING, description: "A short, repeatable daily affirmation." }
        },
        required: ["text", "affirmation"]
      }
    },
    required: ["character", "scenario", "content"]
  };

  try {
    const ai = getAIClient();
    const modelName = getModelName("gemini-3-flash-preview");

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) return null;
    
    const parsed = JSON.parse(text);
    // Add client-side ID and timestamp
    return {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        theme: theme,
        ...parsed
    };

  } catch (error) {
    console.error("Prayer generation failed", error);
    return null;
  }
};
