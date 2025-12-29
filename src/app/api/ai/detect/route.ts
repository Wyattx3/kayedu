import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chat, type AIProvider, DEFAULT_PROVIDER } from "@/lib/ai-providers";
import { createDetectorPrompt } from "@/lib/prompts";
import { z } from "zod";

const detectSchema = z.object({
  text: z.string().min(50).max(50000),
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
    const parsed = detectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const provider: AIProvider = parsed.data.provider || DEFAULT_PROVIDER;
    const modelTier = parsed.data.model || "normal";
    const systemPrompt = createDetectorPrompt();

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: `Analyze this text for AI-generated content:\n\n${parsed.data.text}` },
    ];

    const response = await chat(provider, messages, modelTier);

    try {
      // Try to parse as JSON
      const result = JSON.parse(response.content);
      return NextResponse.json(result);
    } catch {
      // If not valid JSON, return the raw response
      return NextResponse.json({
        aiScore: 50,
        humanScore: 50,
        analysis: response.content,
        indicators: [],
        suggestions: [],
      });
    }
  } catch (error) {
    console.error("Detection error:", error);
    return NextResponse.json(
      { error: "Failed to analyze text" },
      { status: 500 }
    );
  }
}

