import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const abortSignal = req.signal;
  
  const { topic, slideCount, style, audience, details, model } = (await req.json()) as {
    topic: string;
    slideCount: number;
    style: string;
    audience: string;
    details?: string;
    model?: "smart" | "normal" | "fast";
  };
  
  const client = new OpenAI({
    baseURL: "https://api.thesys.dev/v1/embed/",
    apiKey: process.env.THESYS_API_KEY?.trim(),
  });

  // Model mapping - using TheSys C1 models
  const modelConfig = {
    smart: "c1/openai/gpt-5/v-20251230",
    normal: "c1/anthropic/claude-sonnet-4/v-20251230",
    fast: "c1-exp/anthropic/claude-haiku-4.5/v-20251230",
  };

  const selectedModel = modelConfig[model || "normal"];

  // Style configurations for the AI to use
  const styleGuide: Record<string, string> = {
    professional: "Use dark blue (#1e3a5f) backgrounds with clean white text. Corporate and elegant design.",
    modern: "Use dark slate (#0f172a) backgrounds with purple (#6366f1) accents. Sleek and futuristic.",
    minimal: "Use clean white backgrounds with subtle gray text. Focus on typography and whitespace.",
    creative: "Use vibrant purple (#7c3aed) backgrounds with gold (#fbbf24) accents. Bold and engaging.",
  };

  const systemPrompt = `You are an expert presentation designer. Create beautiful, interactive presentation slides using modern UI components.

IMPORTANT: Generate exactly ${slideCount} slides about: "${topic}"
Target audience: ${audience}
Design style: ${styleGuide[style] || styleGuide.professional}
${details ? `Additional requirements: ${details}` : ""}

For EACH slide, create a stunning visual design with:
1. A compelling title
2. Key bullet points or content (3-5 per slide)  
3. Visual elements (icons, shapes, or decorative elements)
4. Smooth animations and transitions

Create a complete presentation with:
- Slide 1: Title slide with topic name and subtitle
- Slides 2-${slideCount - 1}: Content slides with key information
- Slide ${slideCount}: Thank you/Q&A slide

Use modern UI patterns:
- Card-based layouts with shadows
- Gradient backgrounds or solid colors based on style
- Clean typography with proper hierarchy
- Icon decorations where appropriate
- Smooth hover effects and transitions

Each slide should be visually distinct but maintain the overall theme.
Make the presentation engaging, professional, and ready for business or academic use.`;

  if (abortSignal.aborted) {
    return new NextResponse("Request cancelled", { status: 499 });
  }

  try {
    const llmStream = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a ${slideCount}-slide presentation about: ${topic}. Make each slide beautiful and professional.` }
      ],
      stream: true,
    }, {
      signal: abortSignal,
    });

    let isAborted = false;
    abortSignal.addEventListener("abort", () => {
      isAborted = true;
    });

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of llmStream) {
            if (isAborted || abortSignal.aborted) {
              controller.close();
              return;
            }

            const content = chunk.choices?.[0]?.delta?.content ?? "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            controller.close();
            return;
          }
          controller.error(error);
        }
      },
      cancel() {
        isAborted = true;
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new NextResponse("Request cancelled", { status: 499 });
    }
    console.error("Presentation GenUI error:", error);
    return NextResponse.json({ error: "Failed to generate presentation" }, { status: 500 });
  }
}

