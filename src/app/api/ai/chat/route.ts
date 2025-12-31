import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { streamWithTier, streamWithTierVision, type AIMessage, type ModelTier, type ImageData } from "@/lib/ai-providers";
import { createAnswerPrompt, createHomeworkPrompt, createTutorPrompt } from "@/lib/prompts";
import { checkCredits, deductCredits } from "@/lib/credits";
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
  model: z.enum(["super-smart", "pro-smart", "normal", "fast"]).optional(),
  language: z.enum(["en", "my", "zh", "th", "ko", "ja"]).optional(),
  webSearch: z.boolean().optional(),
  images: z.array(z.object({
    data: z.string(), // base64 data
    mimeType: z.string(),
  })).optional(),
});

// Accuracy instruction - added to all prompts
const ACCURACY_INSTRUCTION = `
CRITICAL ACCURACY RULES - YOU MUST FOLLOW THESE:

1. **FOR CELEBRITY/PERSON INFO**: When asked about specific people (actors, singers, celebrities, public figures):
   - Birthdays, zodiac signs, ages, personal details = SAY "I don't have verified information about this person's details. Please check their official social media or Wikipedia."
   - DO NOT make up birthdays, zodiac signs, or personal facts
   - DO NOT cite Wikipedia, Facebook, or any sources - you cannot verify them

2. **NEVER MAKE UP SOURCES**: Do NOT cite Wikipedia, news articles, interviews, or any sources unless you can actually verify them. Saying "Wikipedia says..." when you don't know is LYING.

3. **DEFAULT RESPONSE FOR UNKNOWN FACTS**: "I don't have verified information about [topic]. I recommend checking official sources."

4. **WHAT YOU CAN DO**: 
   - Explain concepts, theories, general knowledge
   - Help with homework, math, science problems
   - Answer questions about well-established facts
   
5. **WHAT YOU CANNOT DO**:
   - Provide personal details of specific real people (unless extremely famous like world leaders)
   - Make up birthdates, zodiac signs, ages
   - Cite sources you cannot verify

REMEMBER: It's 100x better to say "I don't know" than to confidently give WRONG information.`;

// Language instructions - Natural, conversational style
const languageInstructions: Record<string, string> = {
  en: "Respond in natural, conversational English. Be friendly and easy to understand.",
  my: `Respond in natural, conversational Burmese (မြန်မာဘာသာ). 
Use Myanmar script throughout. 
IMPORTANT: Write like a friendly native Burmese speaker would naturally talk, NOT like a robot or Google Translate. 
Use casual, everyday expressions. Avoid overly formal or literal translations.
Make it comfortable and easy to read for Myanmar students.`,
  zh: `Respond in natural, conversational Chinese (中文). 
Use Simplified Chinese characters.
Write like a friendly native Chinese speaker, not robotic.
Use natural expressions and make it easy to understand.`,
  th: `Respond in natural, conversational Thai (ภาษาไทย). 
Use Thai script throughout.
Write like a friendly native Thai speaker would naturally talk.
Avoid literal translations - use natural Thai expressions.`,
  ko: `Respond in natural, conversational Korean (한국어). 
Use Korean script (Hangul).
Write like a friendly native Korean speaker.
Use casual, natural expressions - not formal or robotic.`,
  ja: `Respond in natural, conversational Japanese (日本語). 
Use appropriate mix of kanji, hiragana, and katakana.
Write like a friendly native Japanese speaker.
Use natural expressions, not literal translations.`,
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    // Model tier (super-smart, pro-smart, normal, fast) - default to fast
    const modelTier = (parsed.data.model || "fast") as ModelTier;

    // Check credits before processing
    const creditCheck = await checkCredits(session.user.id, modelTier, 500);
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
    // Language instruction
    const langInstruction = languageInstructions[parsed.data.language || "en"] || languageInstructions.en;
    
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
    
    // Add accuracy instruction to system prompt
    systemPrompt = `${systemPrompt}\n${ACCURACY_INSTRUCTION}`;
    
    // Add language instruction to system prompt
    systemPrompt = `${systemPrompt}\n\nIMPORTANT: ${langInstruction}`;
    
    // Add web search instruction if enabled
    if (parsed.data.webSearch) {
      systemPrompt = `${systemPrompt}\n\nWEB SEARCH MODE: You have access to real-time web information. Search for and include the most current, accurate, and relevant information available. Cite sources when possible. Provide up-to-date facts, statistics, and references.`;
    }

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      ...parsed.data.messages,
    ];

    // Deduct credits BEFORE starting the stream
    if (creditCheck.creditsNeeded && creditCheck.creditsNeeded > 0) {
      await deductCredits(session.user.id, creditCheck.creditsNeeded, parsed.data.feature, modelTier);
    }

    // Check if images are provided - use vision API
    const images = parsed.data.images as ImageData[] | undefined;
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
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}

