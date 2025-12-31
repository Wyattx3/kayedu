import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chatWithTier, type ModelTier } from "@/lib/ai-providers";
import { createDetectorPrompt } from "@/lib/prompts";
import { getLanguageInstruction, type AILanguage } from "@/lib/language-utils";
import { checkCredits, deductCredits } from "@/lib/credits";
import { z } from "zod";

const detectSchema = z.object({
  text: z.string().min(50).max(50000),
  provider: z.enum(["openai", "claude", "gemini", "grok"]).optional(),
  model: z.enum(["super-smart", "pro-smart", "normal", "fast"]).optional(),
  language: z.enum(["en", "my", "zh", "th", "ko", "ja"]).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    const modelTier = (parsed.data.model || "fast") as ModelTier;
    const wordCount = parsed.data.text.split(/\s+/).length;

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

    // Deduct credits BEFORE processing
    if (creditCheck.creditsNeeded && creditCheck.creditsNeeded > 0) {
      await deductCredits(session.user.id, creditCheck.creditsNeeded, "detect", modelTier);
    }

    const language = parsed.data.language as AILanguage || "en";
    const languageInstruction = getLanguageInstruction(language);
    const systemPrompt = `${createDetectorPrompt()}\n\nIMPORTANT LANGUAGE REQUIREMENT: ${languageInstruction}`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: `Analyze this text for AI-generated content:\n\n${parsed.data.text}` },
    ];

    const response = await chatWithTier(messages, modelTier);

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

