import { GoogleGenAI, Schema } from "@google/genai";
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ModelConfig } from '../types';

export const getActiveModelConfig = (): ModelConfig | null => {
  const savedConfigsStr = localStorage.getItem('lumina_model_configs');
  if (savedConfigsStr) {
    try {
      const configs: ModelConfig[] = JSON.parse(savedConfigsStr);
      return configs.find(c => c.isActive) || null;
    } catch (e) {
      return null;
    }
  }
  
  // Fallback to old config
  const savedUse = localStorage.getItem('lumina_use_custom_config') === 'true';
  if (savedUse) {
    const savedKey = localStorage.getItem('lumina_custom_api_key') || '';
    const savedModel = localStorage.getItem('lumina_custom_model') || '';
    if (savedKey) {
      return {
        id: 'legacy',
        name: 'Legacy',
        provider: 'gemini',
        apiKey: savedKey,
        modelId: savedModel,
        isActive: true
      };
    }
  }
  
  return null;
};

// Convert Gemini Schema to JSON Schema for OpenAI
function convertGeminiSchemaToJsonSchema(geminiSchema: any): any {
    if (!geminiSchema) return {};
    
    const result: any = {};
    
    if (geminiSchema.type) {
        result.type = geminiSchema.type.toLowerCase();
    }
    
    if (geminiSchema.description) {
        result.description = geminiSchema.description;
    }
    
    if (geminiSchema.properties) {
        result.properties = {};
        for (const key in geminiSchema.properties) {
            result.properties[key] = convertGeminiSchemaToJsonSchema(geminiSchema.properties[key]);
        }
        result.additionalProperties = false;
    }
    
    if (geminiSchema.items) {
        result.items = convertGeminiSchemaToJsonSchema(geminiSchema.items);
    }
    
    if (geminiSchema.required) {
        result.required = geminiSchema.required;
    } else if (geminiSchema.properties) {
        result.required = Object.keys(geminiSchema.properties);
    }
    
    return result;
}

export interface GenerateContentOptions {
    systemInstruction?: string;
    prompt: string;
    schema?: Schema;
    defaultModel?: string;
}

export const generateContent = async (options: GenerateContentOptions): Promise<string> => {
    const activeConfig = getActiveModelConfig();
    const provider = activeConfig?.provider || 'gemini';
    const apiKey = activeConfig?.apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
    
    // Determine model
    let modelId = activeConfig?.modelId;
    if (!modelId) {
        if (provider === 'gemini') modelId = options.defaultModel || 'gemini-3-flash-preview';
        else if (provider === 'openai') modelId = 'gpt-4o';
        else if (provider === 'anthropic') modelId = 'claude-3-5-sonnet-20241022';
    }

    if (provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey });
        const config: any = {};
        if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
        if (options.schema) {
            config.responseMimeType = "application/json";
            config.responseSchema = options.schema;
        }
        
        const response = await ai.models.generateContent({
            model: modelId as string,
            contents: options.prompt,
            config
        });
        return response.text || '';
    } 
    else if (provider === 'openai') {
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        const messages: any[] = [];
        if (options.systemInstruction) {
            messages.push({ role: 'system', content: options.systemInstruction });
        }
        messages.push({ role: 'user', content: options.prompt });
        
        const requestParams: any = {
            model: modelId as string,
            messages
        };

        if (options.schema) {
            const jsonSchema = convertGeminiSchemaToJsonSchema(options.schema);
            requestParams.response_format = {
                type: "json_schema",
                json_schema: {
                    name: "response",
                    schema: jsonSchema,
                    strict: true
                }
            };
        }

        const response = await openai.chat.completions.create(requestParams);
        return response.choices[0].message.content || '';
    }
    else if (provider === 'anthropic') {
        const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
        
        let prompt = options.prompt;
        if (options.schema) {
            const jsonSchema = convertGeminiSchemaToJsonSchema(options.schema);
            prompt += "\n\nPlease output ONLY valid JSON matching this schema: " + JSON.stringify(jsonSchema);
        }

        const requestParams: any = {
            model: modelId as string,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }]
        };

        if (options.systemInstruction) {
            requestParams.system = options.systemInstruction;
        }

        const response = await anthropic.messages.create(requestParams);
        const text = (response.content[0] as any).text;
        
        if (options.schema) {
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
            return jsonMatch ? jsonMatch[1] : text;
        }
        return text;
    }
    
    throw new Error(`Unsupported provider: ${provider}`);
};
