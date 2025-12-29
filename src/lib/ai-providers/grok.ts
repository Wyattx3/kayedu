import OpenAI from "openai";
import type { AIMessage, AIResponse } from "./types";

// Grok model mapping for Smart, Normal, Fast tiers
export const GROK_MODELS = {
  smart: "grok-4-0709",              // Most capable, best quality
  normal: "grok-3-mini",             // Balanced speed and quality  
  fast: "grok-4-1-fast-reasoning",   // Fast reasoning model
} as const;

export type GrokModelTier = keyof typeof GROK_MODELS;

// Helper to get the actual model name from tier
export function getGrokModel(modelOrTier?: string): string {
  if (!modelOrTier) return GROK_MODELS.normal;
  if (modelOrTier in GROK_MODELS) {
    return GROK_MODELS[modelOrTier as GrokModelTier];
  }
  return modelOrTier; // Return as-is if it's already a model name
}

// Grok uses OpenAI-compatible API
export async function chatWithGrok(
  messages: AIMessage[],
  apiKey: string,
  model?: string
): Promise<AIResponse> {
  const actualModel = getGrokModel(model);
  
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
  });

  const response = await client.chat.completions.create({
    model: actualModel,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: 0.7,
    max_tokens: 4096,
  });

  return {
    content: response.choices[0]?.message?.content || "",
    tokens: response.usage?.total_tokens,
    model: response.model,
  };
}

export async function streamWithGrok(
  messages: AIMessage[],
  apiKey: string,
  model?: string
): Promise<ReadableStream> {
  const actualModel = getGrokModel(model);
  
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
  });

  const response = await client.chat.completions.create({
    model: actualModel,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: 0.7,
    max_tokens: 4096,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });
}

