import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { streamWithTier, type PresentationOptions, type ModelTier } from "@/lib/ai-providers";
import { createPresentationPrompt } from "@/lib/prompts";
import { z } from "zod";

const presentationSchema = z.object({
  topic: z.string().min(1).max(5000),
  slides: z.number().min(3).max(30).default(10),
  style: z.enum(["professional", "modern", "minimal", "creative"]).optional().default("professional"),
  audience: z.enum(["students", "teachers", "business", "general"]).optional().default("students"),
  details: z.string().optional().default(""),
  provider: z.enum(["openai", "claude", "gemini", "grok"]).optional(),
  model: z.enum(["super-smart", "pro-smart", "normal", "fast"]).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = presentationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    // Map audience values
    const audienceMap: Record<string, "students" | "professionals" | "general"> = {
      students: "students",
      teachers: "professionals",
      business: "professionals",
      general: "general",
    };

    const options: PresentationOptions = {
      topic: parsed.data.topic,
      slideCount: parsed.data.slides,
      audience: audienceMap[parsed.data.audience || "students"] || "students",
      includeNotes: true,
    };

    const modelTier = (parsed.data.model || "fast") as ModelTier;
    const systemPrompt = createPresentationPrompt(options);

    // Build user message with style and details
    let userMessage = `Create a ${parsed.data.slides}-slide presentation about: ${options.topic}`;
    userMessage += `\nStyle: ${parsed.data.style || "professional"}`;
    userMessage += `\nTarget Audience: ${parsed.data.audience || "students"}`;
    if (parsed.data.details) {
      userMessage += `\nKey points to cover: ${parsed.data.details}`;
    }
    userMessage += `\n\nFor each slide, provide:
1. **Slide Title**
2. **Key bullet points** (3-5 per slide)
3. **Speaker notes** (what to say for each slide)
4. **Visual suggestion** (what image/graphic would work)

Format each slide clearly with "---" separators between slides.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
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
    console.error("Presentation generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate presentation" },
      { status: 500 }
    );
  }
}

