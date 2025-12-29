import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";
import { DBMessage, getMessageStore } from "./messageStore";

export async function POST(req: NextRequest) {
  // Get the abort signal from the request for cancellation handling
  const abortSignal = req.signal;
  
  const { prompt, threadId, responseId, model } = (await req.json()) as {
    prompt: DBMessage;
    threadId: string;
    responseId: string;
    model?: "smart" | "normal" | "fast";
  };
  
  const client = new OpenAI({
    baseURL: "https://api.thesys.dev/v1/embed/",
    apiKey: process.env.THESYS_API_KEY,
  });
  
  const messageStore = getMessageStore(threadId);

  messageStore.addMessage(prompt);

  // Model mapping - using TheSys C1 models
  // smart = GPT-5 (best quality), normal = Claude Sonnet 4, fast = Claude Haiku (quick responses)
  const modelConfig = {
    smart: "c1/openai/gpt-5/v-20251230",
    normal: "c1/anthropic/claude-sonnet-4/v-20251230",
    fast: "c1-exp/anthropic/claude-haiku-4.5/v-20251230",
  };

  const selectedModel = modelConfig[model || "normal"];

  // Check if already aborted before making the API call
  if (abortSignal.aborted) {
    return new NextResponse("Request cancelled", { status: 499 });
  }

  try {
    const llmStream = await client.chat.completions.create({
      model: selectedModel,
      messages: messageStore.getOpenAICompatibleMessageList(),
      stream: true,
    }, {
      signal: abortSignal, // Pass abort signal to OpenAI client
    });

    let accumulatedContent = "";
    let isAborted = false;

    // Listen for abort event
    abortSignal.addEventListener("abort", () => {
      isAborted = true;
    });

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of llmStream) {
            // Check if request was aborted
            if (isAborted || abortSignal.aborted) {
              controller.close();
              return;
            }

            const content = chunk.choices?.[0]?.delta?.content ?? "";
            if (content) {
              accumulatedContent += content;
              controller.enqueue(new TextEncoder().encode(content));
            }
          }

          // Save the complete message only if not aborted
          if (!isAborted && !abortSignal.aborted && accumulatedContent) {
            messageStore.addMessage({
              role: "assistant",
              content: accumulatedContent,
              id: responseId,
            });
          }

          controller.close();
        } catch (error) {
          // Handle abort errors gracefully
          if (error instanceof Error && error.name === "AbortError") {
            controller.close();
            return;
          }
          controller.error(error);
        }
      },
      cancel() {
        // Stream was cancelled by the client
        isAborted = true;
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // Handle abort errors
    if (error instanceof Error && error.name === "AbortError") {
      return new NextResponse("Request cancelled", { status: 499 });
    }
    throw error;
  }
}
