import Anthropic from "@anthropic-ai/sdk";
import type { AIMessage, AIResponse } from "./types";

export async function chatWithClaude(
  messages: AIMessage[],
  apiKey: string,
  model: string = "claude-3-5-sonnet-20241022"
): Promise<AIResponse> {
  const anthropic = new Anthropic({ apiKey });

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemMessage?.content || "",
    messages: chatMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  });

  const textContent = response.content.find((block) => block.type === "text");
  const content = textContent && "text" in textContent ? textContent.text : "";

  return {
    content,
    tokens: response.usage?.input_tokens + response.usage?.output_tokens,
    model: response.model,
  };
}

export async function streamWithClaude(
  messages: AIMessage[],
  apiKey: string,
  model: string = "claude-3-5-sonnet-20241022"
): Promise<ReadableStream> {
  const anthropic = new Anthropic({ apiKey });

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 4096,
        system: systemMessage?.content || "",
        messages: chatMessages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      });

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });
}

