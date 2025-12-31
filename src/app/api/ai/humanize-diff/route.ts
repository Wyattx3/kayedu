import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chatWithTier, type ModelTier } from "@/lib/ai-providers";
import { getLanguageInstruction, type AILanguage } from "@/lib/language-utils";
import { humanizeText, humanizeWithDiff } from "@/lib/humanizer-utils";
import { checkCredits, deductCredits } from "@/lib/credits";
import { z } from "zod";

const humanizeSchema = z.object({
  text: z.string().min(10).max(50000),
  tone: z.enum(["formal", "casual", "academic", "natural"]).default("natural"),
  intensity: z.enum(["light", "balanced", "heavy"]).default("heavy"),
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
    const tone = parsed.data.tone;
    const intensity = parsed.data.intensity;

    // Split text into sentences
    const sentences = parsed.data.text
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0);

    const systemPrompt = `You are a SIMPLE ENGLISH translator. You translate complex text into the 850-word Basic English vocabulary.

YOUR ONLY ALLOWED WORDS:
- Common verbs: be, do, have, make, get, give, go, come, take, see, say, put, let, keep, seem, feel, think, know, want, use, try, find, tell, ask, work, look, need, start, help, show, hear, play, run, move
- Common nouns: thing, person, place, time, way, day, man, woman, child, world, life, hand, part, year, work, word, fact, case
- Common adjectives: good, bad, big, small, old, new, first, last, long, great, little, own, other, right, same, high, different, next, early, young
- Connectors: and, but, so, then, because, if, when, as, or, also

BANNED WORDS (instant AI detection):
❌ furthermore, moreover, additionally, however, nevertheless, consequently, therefore
❌ significant, substantial, considerable, fundamental, essential, crucial, vital
❌ demonstrate, illustrate, indicate, exhibit, utilize, facilitate, implement
❌ enhance, optimize, leverage, comprehensive, intricate, nuanced
❌ "it is important to note", "plays a crucial role", "in today's world"

RULES:
1. Use ONLY simple words - if a word isn't in Basic English, replace it
2. Write SHORT sentences - max 15 words each
3. ALWAYS use contractions: don't, can't, it's, wasn't, shouldn't
4. NO filler phrases - just say the thing directly
5. Mark changes with [[green]]word[[/green]] tags

${languageInstruction}`;

    const userMessage = `Translate to BASIC ENGLISH (850 words only):

TEXT TO TRANSLATE:
${sentences.map((s, i) => `${i + 1}. ${s}`).join('\n')}

OUTPUT FORMAT:
- For each sentence, write the simplified version
- Wrap EVERY word you changed in [[green]]word[[/green]] tags
- Keep sentences under 15 words
- Use contractions always

EXAMPLES:

Input: "The implementation of this strategy demonstrates significant improvements."
Output: 1. [[green]]This way of doing things[[/green]] [[green]]shows[[/green]] [[green]]good[[/green]] [[green]]changes[[/green]].

Input: "Furthermore, it is essential to consider the environmental implications."
Output: 1. [[green]]Also[[/green]], [[green]]we need to[[/green]] [[green]]think about[[/green]] [[green]]what this does to[[/green]] [[green]]nature[[/green]].

Input: "The research indicates that approximately 60% of participants experienced substantial benefits."
Output: 1. [[green]]The study shows[[/green]] [[green]]about[[/green]] 60% [[green]]of people[[/green]] [[green]]got[[/green]] [[green]]good[[/green]] [[green]]help[[/green]].

Return ONLY numbered sentences. No commentary.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userMessage },
    ];

    const response = await chatWithTier(messages, modelTier);
    
    // Parse the response and combine sentences
    const lines = response.content.split('\n').filter(line => line.trim());
    const processedSentences: string[] = [];
    
    for (const line of lines) {
      // Remove numbering if present (e.g., "1. ", "2. ")
      const cleaned = line.replace(/^\d+\.\s*/, '').trim();
      if (cleaned) {
        processedSentences.push(cleaned);
      }
    }

    // Combine into full text
    const resultText = processedSentences.join(' ');

    // Get plain text version (without LLM tags)
    let plainText = resultText
      .replace(/\[\[green\]\]/g, '')
      .replace(/\[\[\/green\]\]/g, '');
    
    // Apply post-processing pipeline to further humanize the text
    const intensityLevel = intensity as "light" | "balanced" | "heavy";
    plainText = humanizeText(plainText, intensityLevel);
    
    // Generate diff highlighting by comparing with post-processed text
    const diffResult = humanizeWithDiff(
      resultText.replace(/\[\[green\]\]/g, '').replace(/\[\[\/green\]\]/g, ''),
      intensityLevel
    );

    // Deduct credits after successful processing
    if (creditCheck.creditsNeeded && creditCheck.creditsNeeded > 0) {
      await deductCredits(session.user.id, creditCheck.creditsNeeded, "humanize-diff", modelTier);
    }

    return NextResponse.json({
      html: diffResult.html,
      plain: diffResult.plain,
      sentences: processedSentences.length,
    });
  } catch (error) {
    console.error("Humanize diff error:", error);
    return NextResponse.json(
      { error: "Failed to humanize text" },
      { status: 500 }
    );
  }
}
