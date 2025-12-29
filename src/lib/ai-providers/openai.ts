import OpenAI from "openai";
import type { AIMessage, AIResponse } from "./types";

export async function chatWithOpenAI(
  messages: AIMessage[],
  apiKey: string,
  model: string = "gpt-4o-mini"
): Promise<AIResponse> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model,
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

export async function streamWithOpenAI(
  messages: AIMessage[],
  apiKey: string,
  model: string = "gpt-4o-mini"
): Promise<ReadableStream> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model,
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

