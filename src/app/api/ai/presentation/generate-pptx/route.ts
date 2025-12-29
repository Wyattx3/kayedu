import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pptxgen from "pptxgenjs";

interface SlideData {
  title: string;
  bullets: string[];
  notes?: string;
}

interface StyleConfig {
  bgColor: string;
  textColor: string;
  accentColor: string;
}

const styleConfigs: Record<string, StyleConfig> = {
  professional: { bgColor: "1e3a5f", textColor: "ffffff", accentColor: "3b82f6" },
  modern: { bgColor: "0f172a", textColor: "ffffff", accentColor: "6366f1" },
  minimal: { bgColor: "ffffff", textColor: "1f2937", accentColor: "2563eb" },
  creative: { bgColor: "7c3aed", textColor: "ffffff", accentColor: "fbbf24" },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topic, slides, style } = body as { topic: string; slides: SlideData[]; style: string };

    if (!topic || !slides || slides.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const styleConfig = styleConfigs[style] || styleConfigs.professional;

    const pptx = new pptxgen();
    pptx.author = "Kay AI";
    pptx.title = topic;
    pptx.subject = `Presentation about ${topic}`;

    // Title slide
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: styleConfig.bgColor };
    titleSlide.addText(topic, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: styleConfig.textColor,
      align: "center",
    });
    titleSlide.addText("Created with Kay AI", {
      x: 0.5,
      y: 4,
      w: 9,
      h: 0.5,
      fontSize: 18,
      color: styleConfig.accentColor,
      align: "center",
    });

    // Content slides
    for (const slide of slides) {
      const pptSlide = pptx.addSlide();
      pptSlide.background = { color: styleConfig.bgColor };

      // Title
      pptSlide.addText(slide.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: styleConfig.textColor,
      });

      // Accent line
      pptSlide.addShape(pptxgen.ShapeType.rect, {
        x: 0.5,
        y: 1.1,
        w: 2,
        h: 0.05,
        fill: { color: styleConfig.accentColor },
      });

      // Bullets
      if (slide.bullets.length > 0) {
        pptSlide.addText(
          slide.bullets.map(b => ({ text: b, options: { bullet: true, indentLevel: 0 } })),
          {
            x: 0.5,
            y: 1.4,
            w: 9,
            h: 3.5,
            fontSize: 20,
            color: styleConfig.textColor,
            valign: "top",
            lineSpacing: 36,
          }
        );
      }

      // Notes
      if (slide.notes) {
        pptSlide.addNotes(slide.notes);
      }
    }

    // Thank you slide
    const endSlide = pptx.addSlide();
    endSlide.background = { color: styleConfig.bgColor };
    endSlide.addText("Thank You!", {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1.5,
      fontSize: 48,
      bold: true,
      color: styleConfig.textColor,
      align: "center",
    });
    endSlide.addText("Questions?", {
      x: 0.5,
      y: 3.5,
      w: 9,
      h: 0.8,
      fontSize: 24,
      color: styleConfig.accentColor,
      align: "center",
    });

    // Generate the file as base64
    const pptxData = await pptx.write({ outputType: "base64" });

    return NextResponse.json({ 
      success: true, 
      data: pptxData,
      filename: `${topic.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`
    });
  } catch (error) {
    console.error("PPTX generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate presentation" },
      { status: 500 }
    );
  }
}


