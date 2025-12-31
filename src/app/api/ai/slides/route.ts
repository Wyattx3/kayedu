import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateImage } from "@/lib/ai-providers/gemini";
import { auth } from "@/lib/auth";
import { checkCredits, deductCredits } from "@/lib/credits";
import type { ModelTier } from "@/lib/ai-providers";

const grokClient = new OpenAI({
  apiKey: process.env.GROK_API_KEY?.trim(),
  baseURL: "https://api.x.ai/v1",
});

interface ChartData {
  type: "bar" | "line" | "pie" | "doughnut";
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string[] }[];
}

interface SlideContent {
  type: "title" | "content" | "chart" | "image-focus" | "two-column" | "quote" | "closing";
  title: string;
  subtitle?: string;
  bullets?: string[];
  quote?: string;
  quoteAuthor?: string;
  chartData?: ChartData;
  leftColumn?: string[];
  rightColumn?: string[];
  imageKeyword?: string;
  imagePrompt?: string;
}

interface GeneratedSlide extends SlideContent {
  id: number;
  backgroundImage?: string;
  contentImage?: string;
}

function getUnsplashImage(keyword: string, width = 1920, height = 1080): string {
  const encodedKeyword = encodeURIComponent(keyword);
  return `https://source.unsplash.com/${width}x${height}/?${encodedKeyword}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topic, slideCount, style, audience, details, model } = (await req.json()) as {
    topic: string;
    slideCount: number;
    style: string;
    audience: string;
    details?: string;
    model?: "fast" | "normal" | "pro-smart";
  };

  const modelTier = (model || "fast") as ModelTier;
  
  // Check credits before processing (estimate ~500 words per slide)
  const creditCheck = await checkCredits(session.user.id, modelTier, slideCount * 500);
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
    await deductCredits(session.user.id, creditCheck.creditsNeeded, "slides", modelTier);
  }

  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  
  // Select Grok model based on user choice
  const grokModels = {
    fast: "grok-3-fast",
    normal: "grok-3",
    "pro-smart": "grok-3",
  };
  const selectedModel = grokModels[model || "fast"];

  const styleConfig: Record<string, { colors: string[]; bgStyle: string }> = {
    professional: { colors: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"], bgStyle: "corporate, business" },
    modern: { colors: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"], bgStyle: "technology, modern" },
    minimal: { colors: ["#374151", "#6b7280", "#9ca3af", "#d1d5db"], bgStyle: "minimal, clean" },
    creative: { colors: ["#dc2626", "#f97316", "#eab308", "#22c55e"], bgStyle: "creative, colorful" },
  };

  const config = styleConfig[style] || styleConfig.professional;

  try {
    const contentResponse = await grokClient.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: `You are an expert presentation designer creating CONTENT-RICH professional slides. Generate exactly ${slideCount} slides.

IMPORTANT RULES:
1. EVERY slide must have LOTS of detailed content - NOT just a title
2. Content slides must have 5-7 detailed bullet points (each 15-30 words)
3. Two-column slides must have 4-6 items per column with full explanations
4. Chart slides need full context and subtitle explaining the data
5. Image-focus slides still need 3-4 bullet points alongside

SLIDE TYPES:
- "title" - Title + subtitle + 3-4 key preview points
- "content" - Title + subtitle + 5-7 DETAILED bullet points
- "chart" - Title + subtitle + chartData + explanation bullets
- "image-focus" - Title + subtitle + 3-4 bullets + imagePrompt
- "two-column" - Title + leftColumn (5 items) + rightColumn (5 items)
- "quote" - Relevant quote with author
- "closing" - Summary + key takeaways

FOR CHARTS (include realistic data):
{
  "type": "bar" | "line" | "pie" | "doughnut",
  "labels": ["Label1", "Label2", "Label3", "Label4", "Label5"],
  "datasets": [{"label": "Description", "data": [realistic numbers]}]
}

EACH SLIDE requires:
- type: slide type
- title: concise heading
- subtitle: descriptive subheading (always include)
- bullets: 5-7 detailed points for content/image-focus
- chartData: REQUIRED for chart type with 5+ data points
- leftColumn/rightColumn: 5+ items each for two-column
- quote/quoteAuthor: for quote type
- imagePrompt: detailed image description

OUTPUT: Valid JSON array only, no markdown`,
        },
        {
          role: "user",
          content: `Topic: "${topic}"
Audience: ${audience}
Style: ${style}
${details ? `Additional context: ${details}` : ""}

Create ${slideCount} slides. Include:
- 1 title slide with preview points
- 2-3 content slides with 5-7 detailed bullets each
- 1-2 chart slides with real data
- 1 two-column comparison
- 1-2 image-focus slides with content
- 1 quote (if appropriate)
- 1 closing with takeaways

Make bullets DETAILED (15-30 words each), not just single phrases.
Generate JSON array:`,
        },
      ],
      temperature: 0.7,
    });

    const contentText = contentResponse.choices[0]?.message?.content || "[]";
    console.log("Grok response:", contentText.substring(0, 500));

    let slides: SlideContent[];
    try {
      let jsonText = contentText.trim();
      if (jsonText.startsWith("```")) {
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) jsonText = match[1].trim();
      }
      const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
      if (arrayMatch) jsonText = arrayMatch[0];
      slides = JSON.parse(jsonText);
    } catch {
      console.error("Parse error, using fallback");
      slides = generateFallbackSlides(topic, slideCount);
    }

    const generatedSlides: GeneratedSlide[] = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const generatedSlide: GeneratedSlide = { ...slide, id: i + 1 };

      // Generate images for slides that need them
      const needsImage = slide.type === "title" || slide.type === "image-focus" || 
                         slide.type === "content" || slide.type === "two-column";

      if (geminiApiKey && needsImage && slide.imagePrompt) {
        console.log(`Generating image for slide ${i + 1}`);
        try {
          const image = await generateImage(slide.imagePrompt, geminiApiKey);
          if (image) {
            const imageUrl = `data:${image.mimeType};base64,${image.base64}`;
            if (slide.type === "title") {
              generatedSlide.backgroundImage = imageUrl;
            } else {
              generatedSlide.contentImage = imageUrl;
            }
          } else {
            const keyword = slide.imageKeyword || topic.split(" ")[0];
            if (slide.type === "title") {
              generatedSlide.backgroundImage = getUnsplashImage(keyword);
            } else {
              generatedSlide.contentImage = getUnsplashImage(keyword);
            }
          }
        } catch {
          const keyword = slide.imageKeyword || topic.split(" ")[0];
          if (slide.type === "title") {
            generatedSlide.backgroundImage = getUnsplashImage(keyword);
          } else {
            generatedSlide.contentImage = getUnsplashImage(keyword);
          }
        }
      } else if (needsImage) {
        // No Gemini key, use Unsplash
        const keyword = slide.imageKeyword || topic.split(" ")[0];
        if (slide.type === "title") {
          generatedSlide.backgroundImage = getUnsplashImage(keyword);
        } else {
          generatedSlide.contentImage = getUnsplashImage(keyword);
        }
      }

      // Validate chart data
      if (slide.type === "chart") {
        if (!slide.chartData || !slide.chartData.labels || !slide.chartData.datasets) {
          generatedSlide.chartData = {
            type: "bar",
            labels: ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"],
            datasets: [{ label: slide.title || "Data", data: [25, 45, 65, 35, 85] }],
          };
        }
      }

      // Ensure bullets exist for content types
      if ((slide.type === "content" || slide.type === "image-focus") && 
          (!slide.bullets || slide.bullets.length < 3)) {
        generatedSlide.bullets = [
          `Key aspect of ${topic}: Understanding the fundamental concepts and their real-world applications`,
          `Important consideration: How this impacts various stakeholders and decision-making processes`,
          `Critical factor: The relationship between different components and their interdependencies`,
          `Practical application: Real-world examples and case studies demonstrating effectiveness`,
          `Future outlook: Emerging trends and potential developments in this area`,
        ];
      }

      generatedSlides.push(generatedSlide);
    }

    return NextResponse.json({
      slides: generatedSlides,
      topic,
      style,
      colors: config.colors,
      slideCount: generatedSlides.length,
    });
  } catch (error) {
    console.error("Slide generation error:", error);
    return NextResponse.json({ error: "Failed to generate slides" }, { status: 500 });
  }
}

function generateFallbackSlides(topic: string, count: number): SlideContent[] {
  const slides: SlideContent[] = [
    {
      type: "title",
      title: topic,
      subtitle: "A Comprehensive Overview and Analysis",
      bullets: [
        "Understanding the core concepts and fundamental principles",
        "Exploring practical applications and real-world examples",
        "Analyzing trends, challenges, and opportunities",
      ],
      imagePrompt: `${topic} professional abstract background`,
    },
    {
      type: "content",
      title: "Introduction & Background",
      subtitle: `Understanding the fundamentals of ${topic}`,
      bullets: [
        `${topic} encompasses a wide range of concepts and principles that form the foundation of this subject area`,
        "Historical context: The evolution and development over time has shaped current understanding and practices",
        "Key terminology: Essential vocabulary and definitions needed to fully grasp the subject matter",
        "Scope and relevance: Understanding why this topic matters in today's context and its broader implications",
        "Current state: An overview of where things stand today and recent developments in the field",
      ],
      imagePrompt: `${topic} introduction concept illustration`,
    },
    {
      type: "content",
      title: "Core Principles & Concepts",
      subtitle: "The fundamental building blocks explained in detail",
      bullets: [
        "First principle: The foundational concept that underlies all other aspects of this subject and drives key decisions",
        "Second principle: Building upon the first, this concept adds depth and complexity to our understanding",
        "Third principle: A critical component that connects various elements and ensures cohesive implementation",
        "Fourth principle: Practical considerations that bridge theory with real-world application scenarios",
        "Fifth principle: Advanced concepts that enable sophisticated understanding and expert-level analysis",
        "Integration: How these principles work together to create a comprehensive framework for success",
      ],
      imagePrompt: `${topic} concept diagram illustration`,
    },
    {
      type: "chart",
      title: "Key Statistics & Data",
      subtitle: "Quantitative analysis revealing important trends and patterns",
      chartData: {
        type: "bar",
        labels: ["Category A", "Category B", "Category C", "Category D", "Category E"],
        datasets: [{ label: "Performance Metrics", data: [72, 85, 63, 91, 78] }],
      },
      bullets: [
        "Data shows significant variation across different categories with Category D leading",
        "Trend analysis indicates steady growth over the measured period",
      ],
    },
    {
      type: "two-column",
      title: "Comparative Analysis",
      subtitle: "Understanding different perspectives and approaches",
      leftColumn: [
        "Advantages & Benefits",
        "Increased efficiency and productivity through streamlined processes",
        "Cost savings and better resource allocation",
        "Improved quality and consistency of outcomes",
        "Enhanced scalability and flexibility for growth",
        "Better stakeholder satisfaction and engagement",
      ],
      rightColumn: [
        "Challenges & Considerations",
        "Initial implementation requires significant investment",
        "Learning curve and training requirements for teams",
        "Integration with existing systems and processes",
        "Ongoing maintenance and continuous improvement needs",
        "Change management and organizational adaptation",
      ],
    },
    {
      type: "image-focus",
      title: "Visual Representation",
      subtitle: "A comprehensive view of the key concepts in action",
      bullets: [
        "This visualization demonstrates the interconnected nature of various components",
        "Notice how different elements work together to create a cohesive system",
        "The design reflects best practices and industry standards",
      ],
      imagePrompt: `${topic} detailed infographic visualization`,
    },
    {
      type: "chart",
      title: "Growth Trends & Projections",
      subtitle: "Historical data and future outlook analysis",
      chartData: {
        type: "line",
        labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
        datasets: [{ label: "Growth Rate", data: [15, 28, 42, 58, 75, 92] }],
      },
      bullets: [
        "Consistent upward trend indicates strong momentum",
        "Projections suggest continued growth in coming years",
      ],
    },
    {
      type: "quote",
      title: "Inspiring Thought",
      quote: "The best way to predict the future is to create it.",
      quoteAuthor: "Peter Drucker",
    },
    {
      type: "closing",
      title: "Summary & Key Takeaways",
      subtitle: "Essential points to remember moving forward",
      bullets: [
        "Core concepts understood",
        "Practical applications identified",
        "Future opportunities explored",
        "Action items defined",
      ],
    },
  ];

  return slides.slice(0, count);
}
