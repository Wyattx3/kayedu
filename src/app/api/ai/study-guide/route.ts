import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { streamWithTier, type StudyGuideOptions, type ModelTier } from "@/lib/ai-providers";
import { createStudyGuidePrompt } from "@/lib/prompts";
import { getLanguageInstruction, type AILanguage } from "@/lib/language-utils";
import { checkCredits, deductCredits } from "@/lib/credits";
import { z } from "zod";

const studyGuideSchema = z.object({
  topic: z.string().min(1).max(5000),
  subject: z.string().min(1).max(100).default("general"),
  level: z.string().optional().default("igcse"),
  format: z.enum(["comprehensive", "outline", "flashcards", "questions"]).optional().default("comprehensive"),
  notes: z.string().optional().default(""),
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
    const parsed = studyGuideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    // Map format to depth and options
    const formatToDepth: Record<string, "overview" | "detailed" | "comprehensive"> = {
      comprehensive: "comprehensive",
      outline: "overview",
      flashcards: "detailed",
      questions: "detailed",
    };

    const options: StudyGuideOptions = {
      topic: parsed.data.topic,
      subject: parsed.data.subject,
      depth: formatToDepth[parsed.data.format || "comprehensive"] || "comprehensive",
      includeExamples: parsed.data.format !== "flashcards",
      includeQuestions: parsed.data.format === "questions" || parsed.data.format === "comprehensive",
    };

    const modelTier = (parsed.data.model || "fast") as ModelTier;

    // Check credits before processing
    const creditCheck = await checkCredits(session.user.id, modelTier, 2000);
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

    // Deduct credits BEFORE starting the stream
    if (creditCheck.creditsNeeded && creditCheck.creditsNeeded > 0) {
      await deductCredits(session.user.id, creditCheck.creditsNeeded, "study-guide", modelTier);
    }

    const language = parsed.data.language as AILanguage || "en";
    const languageInstruction = getLanguageInstruction(language);
    const systemPrompt = createStudyGuidePrompt(options);

    // Build user message with level, format, and notes
    let userMessage = `Create a study guide about: ${options.topic}`;
    userMessage += `\nSubject: ${options.subject}`;
    userMessage += `\nLevel: ${parsed.data.level || "igcse"}`;
    userMessage += `\nFormat: ${parsed.data.format || "comprehensive"}`;
    if (parsed.data.notes) {
      userMessage += `\nSpecific focus areas: ${parsed.data.notes}`;
    }

    const messages = [
      { role: "system" as const, content: `${systemPrompt}\n\nIMPORTANT LANGUAGE REQUIREMENT: ${languageInstruction}` },
      { role: "user" as const, content: userMessage },
    ];

    const responseStream = await streamWithTier(messages, modelTier);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Study guide generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate study guide" },
      { status: 500 }
    );
  }
}

