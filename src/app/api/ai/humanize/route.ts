import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stream, type AIProvider, type HumanizeOptions, DEFAULT_PROVIDER } from "@/lib/ai-providers";
import { createHumanizerPrompt } from "@/lib/prompts";
import { z } from "zod";

const humanizeSchema = z.object({
  text: z.string().min(10).max(50000),
  tone: z.enum(["formal", "casual", "academic", "natural"]).default("natural"),
  intensity: z.enum(["light", "balanced", "heavy"]).default("balanced"),
  preserveMeaning: z.boolean().default(true),
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
    const parsed = humanizeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const options: HumanizeOptions = {
      text: parsed.data.text,
      tone: parsed.data.tone,
      intensity: parsed.data.intensity,
      preserveMeaning: parsed.data.preserveMeaning,
    };

    const provider: AIProvider = parsed.data.provider || DEFAULT_PROVIDER;
    const modelTier = parsed.data.model || "normal";
    const systemPrompt = createHumanizerPrompt(options);

    // Create a strong user message that reinforces the rewriting requirement
    const userMessage = `REWRITE THIS TEXT COMPLETELY. Do NOT just edit it - write it fresh in your own words as if you are a human explaining the same ideas. The goal is 0% AI detection.

TEXT TO REWRITE:
"""
${options.text}
"""

Remember: 
- NO AI phrases (Furthermore, Moreover, In conclusion, It is important, etc.)
- USE contractions (don't, can't, it's)
- VARY sentence lengths wildly
- ADD personal voice and opinions
- Write like a real human, not an AI`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userMessage },
    ];

    const responseStream = await stream(provider, messages, modelTier);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Humanization error:", error);
    return NextResponse.json(
      { error: "Failed to humanize text" },
      { status: 500 }
    );
  }
}

