import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stream, type AIProvider, type AIMessage, DEFAULT_PROVIDER } from "@/lib/ai-providers";
import { createAnswerPrompt, createHomeworkPrompt, createTutorPrompt } from "@/lib/prompts";
import { z } from "zod";

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })),
  feature: z.enum(["answer", "homework", "tutor"]),
  options: z.object({
    subject: z.string().optional(),
    topic: z.string().optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  }).optional(),
  provider: z.enum(["openai", "claude", "gemini", "grok"]).optional(),
  model: z.enum(["smart", "normal", "fast"]).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    // Default to Grok provider
    const provider: AIProvider = parsed.data.provider || DEFAULT_PROVIDER;
    // Model tier (smart, normal, fast) - default to normal
    const modelTier = parsed.data.model || "normal";
    
    let systemPrompt: string;

    switch (parsed.data.feature) {
      case "answer":
        systemPrompt = createAnswerPrompt();
        break;
      case "homework":
        systemPrompt = createHomeworkPrompt();
        break;
      case "tutor":
        systemPrompt = createTutorPrompt({
          subject: parsed.data.options?.subject || "General",
          topic: parsed.data.options?.topic || "General topic",
          question: "",
          level: parsed.data.options?.level || "intermediate",
        });
        break;
      default:
        systemPrompt = createAnswerPrompt();
    }

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      ...parsed.data.messages,
    ];

    const responseStream = await stream(provider, messages, modelTier);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}

