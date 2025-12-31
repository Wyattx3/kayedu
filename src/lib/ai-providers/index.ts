import { chatWithOpenAI, streamWithOpenAI } from "./openai";
import { chatWithClaude, streamWithClaude } from "./claude";
import { chatWithGemini, streamWithGemini, streamWithGeminiVision, type ImageData } from "./gemini";
import { chatWithGrok, streamWithGrok, GROK_MODELS, getGrokModel } from "./grok";
import type { AIMessage, AIResponse, AIProvider } from "./types";

export type { AIMessage, AIResponse, AIProvider, ImageData };
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
    openai: process.env.OPENAI_API_KEY?.trim(),
    claude: process.env.ANTHROPIC_API_KEY?.trim(),
    gemini: process.env.GOOGLE_AI_API_KEY?.trim(),
    grok: process.env.GROK_API_KEY?.trim(),
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

// Gemini API key for super-smart model
const GEMINI_SUPER_SMART_KEY = "AIzaSyC6WnkMJO5FvHwUG1dZwpRfwPWOQbNxAwo";

// Model tiers for user selection (removed "smart" - Grok 4)
export const MODEL_TIERS = {
  "super-smart": { name: "Super Smart", description: "Most powerful AI model", provider: "gemini" as AIProvider, model: "gemini-3-pro-preview", apiKey: GEMINI_SUPER_SMART_KEY, credits: 0, proOnly: true },
  "pro-smart": { name: "Pro Smart", description: "Fast & intelligent", provider: "gemini" as AIProvider, model: "gemini-3-flash-preview", apiKey: GEMINI_SUPER_SMART_KEY, credits: 5 },
  normal: { name: "Normal", description: "Grok 3 Mini - Balanced", grokModel: GROK_MODELS.normal, credits: 3 },
  fast: { name: "Fast", description: "Grok 4 Fast Reasoning", grokModel: GROK_MODELS.fast, credits: 3 },
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

// Helper to get provider config for a model tier
export type ModelTier = "super-smart" | "pro-smart" | "normal" | "fast";

export function getModelConfig(tier: ModelTier): { provider: AIProvider; model: string; apiKey?: string } {
  if (tier === "super-smart") {
    return {
      provider: "gemini",
      model: "gemini-3-pro-preview",
      apiKey: GEMINI_SUPER_SMART_KEY,
    };
  }
  
  if (tier === "pro-smart") {
    return {
      provider: "gemini",
      model: "gemini-3-flash-preview",
      apiKey: GEMINI_SUPER_SMART_KEY,
    };
  }
  
  // Default to Grok for normal and fast tiers
  return {
    provider: "grok",
    model: getGrokModel(tier),
  };
}

// Get credits cost for a model tier
export function getModelCredits(tier: ModelTier): number {
  const tierConfig = MODEL_TIERS[tier];
  return tierConfig?.credits ?? 3;
}

// Check if model tier is Pro only
export function isProOnlyTier(tier: ModelTier): boolean {
  return tier === "super-smart";
}

// Stream with model tier (uses the right provider based on tier)
export async function streamWithTier(
  messages: AIMessage[],
  tier: ModelTier = "fast"
): Promise<ReadableStream> {
  const config = getModelConfig(tier);
  return stream(config.provider, messages, config.model, config.apiKey);
}

// Chat with model tier (uses the right provider based on tier)
export async function chatWithTier(
  messages: AIMessage[],
  tier: ModelTier = "fast"
): Promise<AIResponse> {
  const config = getModelConfig(tier);
  return chat(config.provider, messages, config.model, config.apiKey);
}

// Stream with model tier and images (vision) - uses Gemini for image support
export async function streamWithTierVision(
  messages: AIMessage[],
  images: ImageData[],
  tier: ModelTier = "pro-smart"
): Promise<ReadableStream> {
  // For vision, we always use Gemini as it has best vision support
  const config = getModelConfig(tier);
  
  // If the tier is Gemini-based, use that model, otherwise use Gemini Flash
  if (config.provider === "gemini") {
    return streamWithGeminiVision(messages, images, config.apiKey!, config.model);
  }
  
  // For non-Gemini tiers, use Gemini Flash for vision
  return streamWithGeminiVision(messages, images, GEMINI_SUPER_SMART_KEY, "gemini-2.0-flash-exp");
}

