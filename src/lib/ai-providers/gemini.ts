import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIMessage, AIResponse } from "./types";

export async function chatWithGemini(
  messages: AIMessage[],
  apiKey: string,
  model: string = "gemini-2.0-flash-exp"
): Promise<AIResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const chat = genModel.startChat({
    history: chatMessages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    systemInstruction: systemMessage?.content,
  });

  const lastMessage = chatMessages[chatMessages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;

  return {
    content: response.text(),
    tokens: response.usageMetadata?.totalTokenCount,
    model,
  };
}

export async function streamWithGemini(
  messages: AIMessage[],
  apiKey: string,
  model: string = "gemini-2.0-flash-exp"
): Promise<ReadableStream> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const chat = genModel.startChat({
    history: chatMessages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    systemInstruction: systemMessage?.content,
  });

  const lastMessage = chatMessages[chatMessages.length - 1];
  const result = await chat.sendMessageStream(lastMessage.content);

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });
}

