import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { streamWithTier, streamWithTierVision, type EssayOptions, type ModelTier, type ImageData } from "@/lib/ai-providers";
import { createEssayPrompt } from "@/lib/prompts";
import { getLanguageInstruction, type AILanguage } from "@/lib/language-utils";
import { checkCredits, deductCredits } from "@/lib/credits";
import { z } from "zod";

const essaySchema = z.object({
  topic: z.string().min(3).max(500),
  wordCount: z.number().min(100).max(5000),
  academicLevel: z.enum(["high-school", "igcse", "ged", "othm", "undergraduate", "graduate"]),
  citationStyle: z.enum(["apa", "mla", "harvard", "chicago", "none"]).optional(),
  essayType: z.enum(["argumentative", "expository", "narrative", "descriptive", "persuasive"]).optional(),
  provider: z.enum(["openai", "claude", "gemini", "grok"]).optional(),
  model: z.enum(["super-smart", "pro-smart", "normal", "fast"]).optional(),
  language: z.enum(["en", "my", "zh", "th", "ko", "ja"]).optional(),
  images: z.array(z.object({
    data: z.string(),
    mimeType: z.string(),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    const modelTier = (parsed.data.model || "fast") as ModelTier;
    const wordCount = parsed.data.wordCount;

    // Check credits before processing
    const creditCheck = await checkCredits(session.user.id, modelTier, wordCount);
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { 
          error: creditCheck.error,
          creditsNeeded: creditCheck.creditsNeeded,
          creditsRemaining: creditCheck.creditsRemaining,
        },
        { status: 402 }
      );
    }

    const options: EssayOptions = {
      topic: parsed.data.topic,
      wordCount: parsed.data.wordCount,
      academicLevel: parsed.data.academicLevel,
      citationStyle: parsed.data.citationStyle,
      essayType: parsed.data.essayType,
    };

    const language = parsed.data.language as AILanguage || "en";
    const languageInstruction = getLanguageInstruction(language);
    const systemPrompt = createEssayPrompt(options);

    const messages = [
      { role: "system" as const, content: `${systemPrompt}\n\nIMPORTANT LANGUAGE REQUIREMENT: ${languageInstruction}` },
      { role: "user" as const, content: `Please write an essay about: ${options.topic}` },
    ];

    // Deduct credits BEFORE starting the stream
    if (creditCheck.creditsNeeded && creditCheck.creditsNeeded > 0) {
      await deductCredits(session.user.id, creditCheck.creditsNeeded, "essay", modelTier);
    }

    // Check if images are provided - use vision API
    const images = body.images as ImageData[] | undefined;
    let responseStream: ReadableStream;
    
    if (images && images.length > 0) {
      // Use vision-capable model for images
      responseStream = await streamWithTierVision(messages, images, modelTier);
    } else {
      responseStream = await streamWithTier(messages, modelTier);
    }

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

