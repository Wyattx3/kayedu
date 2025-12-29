import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stream, type AIProvider, type EssayOptions, DEFAULT_PROVIDER } from "@/lib/ai-providers";
import { createEssayPrompt } from "@/lib/prompts";
import { z } from "zod";

const essaySchema = z.object({
  topic: z.string().min(3).max(500),
  wordCount: z.number().min(100).max(5000),
  academicLevel: z.enum(["high-school", "igcse", "ged", "othm", "undergraduate", "graduate"]),
  citationStyle: z.enum(["apa", "mla", "harvard", "chicago", "none"]).optional(),
  essayType: z.enum(["argumentative", "expository", "narrative", "descriptive", "persuasive"]).optional(),
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
    const parsed = essaySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const options: EssayOptions = {
      topic: parsed.data.topic,
      wordCount: parsed.data.wordCount,
      academicLevel: parsed.data.academicLevel,
      citationStyle: parsed.data.citationStyle,
      essayType: parsed.data.essayType,
    };

    const provider: AIProvider = parsed.data.provider || DEFAULT_PROVIDER;
    const modelTier = parsed.data.model || "normal";
    const systemPrompt = createEssayPrompt(options);

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: `Please write an essay about: ${options.topic}` },
    ];

    const responseStream = await stream(provider, messages, modelTier);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Essay generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate essay" },
      { status: 500 }
    );
  }
}

