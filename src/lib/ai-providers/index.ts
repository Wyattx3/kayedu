import { chatWithOpenAI, streamWithOpenAI } from "./openai";
import { chatWithClaude, streamWithClaude } from "./claude";
import { chatWithGemini, streamWithGemini } from "./gemini";
import { chatWithGrok, streamWithGrok, GROK_MODELS, getGrokModel } from "./grok";
import type { AIMessage, AIResponse, AIProvider } from "./types";

export type { AIMessage, AIResponse, AIProvider };
export * from "./types";
export { GROK_MODELS, getGrokModel };

// Default provider - Grok
export const DEFAULT_PROVIDER: AIProvider = "grok";

interface ProviderConfig {
  openai?: string;
  claude?: string;
  gemini?: string;
  grok?: string;
}

function getApiKey(provider: AIProvider): string {
  const keys: Record<AIProvider, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    claude: process.env.ANTHROPIC_API_KEY,
    gemini: process.env.GOOGLE_AI_API_KEY,
    grok: process.env.XAI_API_KEY,
  };

  const key = keys[provider];
  if (!key) {
    throw new Error(`API key not configured for provider: ${provider}`);
  }
  return key;
}

export async function chat(
  provider: AIProvider,
  messages: AIMessage[],
  model?: string,
  customApiKey?: string
): Promise<AIResponse> {
  const apiKey = customApiKey || getApiKey(provider);

  switch (provider) {
    case "openai":
      return chatWithOpenAI(messages, apiKey, model);
    case "claude":
      return chatWithClaude(messages, apiKey, model);
    case "gemini":
      return chatWithGemini(messages, apiKey, model);
    case "grok":
      return chatWithGrok(messages, apiKey, model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function stream(
  provider: AIProvider,
  messages: AIMessage[],
  model?: string,
  customApiKey?: string
): Promise<ReadableStream> {
  const apiKey = customApiKey || getApiKey(provider);

  switch (provider) {
    case "openai":
      return streamWithOpenAI(messages, apiKey, model);
    case "claude":
      return streamWithClaude(messages, apiKey, model);
    case "gemini":
      return streamWithGemini(messages, apiKey, model);
    case "grok":
      return streamWithGrok(messages, apiKey, model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Model tiers for user selection
export const MODEL_TIERS = {
  smart: { name: "Smart", description: "Grok 4 - Most capable", grokModel: GROK_MODELS.smart },
  normal: { name: "Normal", description: "Grok 3 Mini - Balanced", grokModel: GROK_MODELS.normal },
  fast: { name: "Fast", description: "Grok 4 Fast Reasoning", grokModel: GROK_MODELS.fast },
} as const;

export const AVAILABLE_MODELS: Record<AIProvider, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  claude: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  gemini: ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"],
  grok: [GROK_MODELS.smart, GROK_MODELS.normal, GROK_MODELS.fast],
};

export const PROVIDER_NAMES: Record<AIProvider, string> = {
  openai: "OpenAI",
  claude: "Claude",
  gemini: "Gemini",
  grok: "Grok",
};

