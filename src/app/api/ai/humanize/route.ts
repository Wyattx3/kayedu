import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { streamWithTier, type HumanizeOptions, type ModelTier } from "@/lib/ai-providers";
import { createHumanizerPrompt } from "@/lib/prompts";
import { getLanguageInstruction, type AILanguage } from "@/lib/language-utils";
import { checkCredits, deductCredits } from "@/lib/credits";
import { z } from "zod";

const humanizeSchema = z.object({
  text: z.string().min(10).max(50000),
  tone: z.enum(["formal", "casual", "academic", "natural"]).default("natural"),
  intensity: z.enum(["light", "balanced", "heavy"]).default("balanced"),
  preserveMeaning: z.boolean().default(true),
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

    // Use super-smart model for humanization - best chance to bypass detection
    const modelTier = (parsed.data.model || "super-smart") as ModelTier;
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
    const language = parsed.data.language as AILanguage || "en";
    const languageInstruction = getLanguageInstruction(language);
    const systemPrompt = `${createHumanizerPrompt(options)}\n\nIMPORTANT LANGUAGE REQUIREMENT: ${languageInstruction}`;

    // Use Basic English approach - proven to bypass GPTZero
    const userMessage = `GOAL: Translate this to BASIC ENGLISH to get 0% AI detection.

TEXT TO REWRITE:
"""
${options.text}
"""

BASIC ENGLISH RULES (from the 850-word vocabulary):

1. USE ONLY SIMPLE WORDS:
   - Common verbs: be, do, have, make, get, give, go, come, take, see, say, put, let, keep, think, know, want, use, try, find, tell, ask, work, look, need, start, help, show
   - Common nouns: thing, person, place, time, way, day, man, woman, child, world, life, hand, part, year, work, word
   - Common adjectives: good, bad, big, small, old, new, first, last, long, great, little, own, other, right, same, high, different

2. SHORT SENTENCES - maximum 15 words each. One idea per sentence.

3. ALWAYS USE CONTRACTIONS: don't, can't, it's, wasn't, couldn't, shouldn't, won't

4. SIMPLE CONNECTORS ONLY: and, but, so, then, because, if, when

5. NO FILLER PHRASES - just say the thing directly

BANNED WORDS (AI detection flags):
❌ furthermore, moreover, additionally, however, nevertheless, consequently
❌ significant, substantial, considerable, fundamental, essential, crucial, vital
❌ demonstrate, illustrate, indicate, utilize, facilitate, implement, optimize
❌ "it is important to note", "plays a crucial role", "in today's world"
❌ comprehensive, intricate, nuanced, holistic, paradigm

EXAMPLE TRANSLATIONS:
"The implementation demonstrates significant improvements" → "This way shows good changes"
"It is essential to consider environmental implications" → "We need to think about nature"
"Furthermore, the data indicates substantial benefits" → "Also, the numbers show it helps a lot"

Return ONLY the rewritten text. No preamble or commentary.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userMessage },
    ];

    // Deduct credits BEFORE starting the stream
    if (creditCheck.creditsNeeded && creditCheck.creditsNeeded > 0) {
      await deductCredits(session.user.id, creditCheck.creditsNeeded, "humanize", modelTier);
    }

    const responseStream = await streamWithTier(messages, modelTier);

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

