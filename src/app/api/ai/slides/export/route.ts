import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

interface ChartData {
  type: "bar" | "line" | "pie" | "doughnut";
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string[] }[];
}

interface Slide {
  id: number;
  type: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  quote?: string;
  quoteAuthor?: string;
  chartData?: ChartData;
  leftColumn?: string[];
  rightColumn?: string[];
  backgroundImage?: string;
  contentImage?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { slides, topic, colors } = await req.json();

    const pptx = new PptxGenJS();
    pptx.author = "Kabyar";
    pptx.title = topic;
    pptx.subject = "AI Generated Presentation";
    pptx.layout = "LAYOUT_16x9";

    const accent = (colors?.[0] || "#2563eb").replace("#", "");
    const accentLight = (colors?.[1] || "#3b82f6").replace("#", "");
    const chartColors = [accent, accentLight, "60a5fa", "93c5fd", "bfdbfe"];

    for (const slideData of slides as Slide[]) {
      const pptSlide = pptx.addSlide();
      const tpl = slideData.id % 8; // Same as preview

      // White background
      pptSlide.background = { color: "FFFFFF" };

      // Top accent bar (same as preview h-1.5)
      pptSlide.addShape("rect", {
        x: 0, y: 0, w: "100%", h: 0.12,
        fill: { color: accent },
      });

      switch (slideData.type) {
        // ===== TITLE SLIDE - Same as preview =====
        case "title": {
          // Left content area
          // Accent bar (w-16 h-1 mb-4)
          pptSlide.addShape("rect", { x: 0.5, y: 1.8, w: 1.2, h: 0.06, fill: { color: accent } });
          
          // Title (text-3xl font-bold)
          pptSlide.addText(slideData.title, {
            x: 0.5, y: 2, w: 5, h: 1,
            fontSize: 32, bold: true, color: "111827", fontFace: "Arial",
          });
          
          // Subtitle (text-base text-gray-600)
          if (slideData.subtitle) {
            pptSlide.addText(slideData.subtitle, {
              x: 0.5, y: 3, w: 5, h: 0.8,
              fontSize: 14, color: "4b5563", fontFace: "Arial",
            });
          }
          
          // Bullets (mt-4 space-y-2)
          if (slideData.bullets?.length) {
            slideData.bullets.slice(0, 3).forEach((b, i) => {
              // Dot (w-2 h-2 rounded-full)
              pptSlide.addShape("ellipse", { 
                x: 0.5, y: 3.9 + i * 0.4, w: 0.12, h: 0.12, 
                fill: { color: accent } 
              });
              pptSlide.addText(b, { 
                x: 0.7, y: 3.82 + i * 0.4, w: 4.5, h: 0.4, 
                fontSize: 11, color: "374151" 
              });
            });
          }
          
          // Right image (w-2/5 h-full rounded-lg)
          if (slideData.backgroundImage?.startsWith("data:")) {
            pptSlide.addImage({
              data: slideData.backgroundImage.split(",")[1],
              x: 5.8, y: 0.3, w: 4, h: 4.7,
            });
          }
          break;
        }

        // ===== CONTENT SLIDES - 6 layouts like preview =====
        case "content": {
          const contentTpl = tpl % 6;
          
          if (contentTpl === 0) {
            // Layout 0: Left sidebar image + right text with border-left bullets
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 0.3, y: 0.3, w: 2.3, h: 4.7,
              });
            }
            // Right content
            pptSlide.addText(slideData.title, {
              x: 2.8, y: 0.4, w: 6.8, h: 0.6,
              fontSize: 20, bold: true, color: "111827",
            });
            pptSlide.addShape("rect", { x: 2.8, y: 0.95, w: 0.7, h: 0.04, fill: { color: accent } });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, {
                x: 2.8, y: 1.05, w: 6.8, h: 0.35, fontSize: 10, color: "6b7280",
              });
            }
            // Bullets with border-left
            slideData.bullets?.forEach((b, i) => {
              pptSlide.addShape("roundRect", { x: 2.8, y: 1.45 + i * 0.58, w: 6.6, h: 0.52, fill: { color: "f9fafb" } });
              pptSlide.addShape("rect", { x: 2.8, y: 1.45 + i * 0.58, w: 0.06, h: 0.52, fill: { color: accent } });
              // Number circle
              pptSlide.addShape("ellipse", { x: 2.92, y: 1.52 + i * 0.58, w: 0.28, h: 0.28, fill: { color: accent } });
              pptSlide.addText(`${i + 1}`, { x: 2.92, y: 1.52 + i * 0.58, w: 0.28, h: 0.28, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
              pptSlide.addText(b, { x: 3.28, y: 1.5 + i * 0.58, w: 6, h: 0.45, fontSize: 10, color: "1f2937" });
            });
          } else if (contentTpl === 1) {
            // Layout 1: Number box + grid bullets + right image
            // Number box
            pptSlide.addShape("roundRect", { x: 0.4, y: 0.4, w: 0.6, h: 0.6, fill: { color: accent } });
            pptSlide.addText(`${slideData.bullets?.length || 0}`, { x: 0.4, y: 0.4, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
            pptSlide.addText(slideData.title, { x: 1.1, y: 0.45, w: 4.5, h: 0.4, fontSize: 16, bold: true, color: "111827" });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, { x: 1.1, y: 0.85, w: 4.5, h: 0.25, fontSize: 9, color: "6b7280" });
            }
            // Grid 2 columns
            slideData.bullets?.forEach((b, i) => {
              const col = i % 2, row = Math.floor(i / 2);
              const x = 0.4 + col * 3.1, y = 1.2 + row * 0.85;
              pptSlide.addShape("roundRect", { x, y, w: 3, h: 0.8, fill: { color: "f9fafb" } });
              pptSlide.addShape("ellipse", { x: x + 0.1, y: y + 0.15, w: 0.1, h: 0.1, fill: { color: accent } });
              pptSlide.addText(b, { x: x + 0.3, y: y + 0.1, w: 2.6, h: 0.65, fontSize: 9, color: "374151" });
            });
            // Right image
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 6.6, y: 0.3, w: 3.1, h: 4.7,
              });
            }
          } else if (contentTpl === 2) {
            // Layout 2: Top banner image + 3 column cards
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 0.3, y: 0.25, w: 9.4, h: 1.6,
              });
            }
            pptSlide.addText(slideData.title, { x: 0.3, y: 1.95, w: 9, h: 0.5, fontSize: 18, bold: true, color: "111827" });
            // 3 column cards
            const cardW = 3.05;
            slideData.bullets?.slice(0, 6).forEach((b, i) => {
              const col = i % 3, row = Math.floor(i / 3);
              const x = 0.3 + col * (cardW + 0.15), y = 2.5 + row * 1.25;
              pptSlide.addShape("roundRect", { x, y, w: cardW, h: 1.15, fill: { color: "f9fafb" }, line: { color: "f3f4f6", pt: 1 } });
              pptSlide.addShape("roundRect", { x: x + 0.1, y: y + 0.1, w: 0.4, h: 0.4, fill: { color: accent } });
              pptSlide.addText(`${i + 1}`, { x: x + 0.1, y: y + 0.1, w: 0.4, h: 0.4, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
              pptSlide.addText(b, { x: x + 0.1, y: y + 0.55, w: cardW - 0.2, h: 0.55, fontSize: 9, color: "374151" });
            });
          } else if (contentTpl === 3) {
            // Layout 3: Corner image + numbered list
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 7.5, y: 0.3, w: 2.2, h: 2.2,
              });
            }
            pptSlide.addText(slideData.title, { x: 0.4, y: 0.4, w: 6.8, h: 0.5, fontSize: 18, bold: true, color: "111827" });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, { x: 0.4, y: 0.9, w: 6.8, h: 0.3, fontSize: 10, color: "6b7280" });
            }
            // Numbered list
            slideData.bullets?.forEach((b, i) => {
              const y = 1.3 + i * 0.6;
              pptSlide.addShape("roundRect", { x: 0.7, y, w: 0.35, h: 0.35, fill: { color: accent } });
              pptSlide.addText(`${i + 1}`, { x: 0.7, y, w: 0.35, h: 0.35, fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
              pptSlide.addShape("roundRect", { x: 1.15, y, w: 8.2, h: 0.5, fill: { color: "f9fafb" } });
              pptSlide.addText(b, { x: 1.25, y: y + 0.05, w: 8, h: 0.4, fontSize: 11, color: "1f2937" });
            });
          } else if (contentTpl === 4) {
            // Layout 4: 2 column bullets + bottom image strip
            pptSlide.addText(slideData.title, { x: 0.4, y: 0.4, w: 9, h: 0.5, fontSize: 18, bold: true, color: "111827" });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, { x: 0.4, y: 0.9, w: 9, h: 0.3, fontSize: 10, color: "6b7280" });
            }
            // 2 column bullets
            slideData.bullets?.forEach((b, i) => {
              const col = i % 2, row = Math.floor(i / 2);
              const x = 0.4 + col * 4.7, y = 1.3 + row * 0.5;
              pptSlide.addShape("ellipse", { x, y: y + 0.12, w: 0.1, h: 0.1, fill: { color: accent } });
              pptSlide.addText(b, { x: x + 0.2, y, w: 4.3, h: 0.45, fontSize: 10, color: "374151" });
            });
            // Bottom image
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 0.3, y: 3.8, w: 9.4, h: 1.3,
              });
            }
          } else {
            // Layout 5: Split half - left bullets, right image + more bullets
            pptSlide.addText(slideData.title, { x: 0.4, y: 0.4, w: 4.5, h: 0.5, fontSize: 18, bold: true, color: "111827" });
            const half = Math.ceil((slideData.bullets?.length || 0) / 2);
            // Left bullets (blue bg)
            slideData.bullets?.slice(0, half).forEach((b, i) => {
              pptSlide.addShape("roundRect", { x: 0.4, y: 1 + i * 0.58, w: 4.5, h: 0.52, fill: { color: "eff6ff" } });
              pptSlide.addShape("rect", { x: 0.5, y: 1.08 + i * 0.58, w: 0.28, h: 0.28, fill: { color: accent } });
              pptSlide.addText(`${i + 1}`, { x: 0.5, y: 1.08 + i * 0.58, w: 0.28, h: 0.28, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
              pptSlide.addText(b, { x: 0.85, y: 1.05 + i * 0.58, w: 3.9, h: 0.45, fontSize: 10, color: "374151" });
            });
            // Right image
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 5.1, y: 0.3, w: 4.5, h: 1.8,
              });
            }
            // Right bullets (gray bg)
            slideData.bullets?.slice(half).forEach((b, i) => {
              const num = half + i + 1;
              pptSlide.addShape("roundRect", { x: 5.1, y: 2.2 + i * 0.58, w: 4.5, h: 0.52, fill: { color: "f9fafb" } });
              pptSlide.addShape("rect", { x: 5.2, y: 2.28 + i * 0.58, w: 0.28, h: 0.28, fill: { color: accentLight } });
              pptSlide.addText(`${num}`, { x: 5.2, y: 2.28 + i * 0.58, w: 0.28, h: 0.28, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
              pptSlide.addText(b, { x: 5.55, y: 2.25 + i * 0.58, w: 3.9, h: 0.45, fontSize: 10, color: "374151" });
            });
          }
          break;
        }

        // ===== CHART SLIDES - 4 layouts like preview =====
        case "chart": {
          const chartTpl = tpl % 4;
          
          if (chartTpl === 0) {
            // Layout 0: Chart left + right sidebar stats
            pptSlide.addText(slideData.title, { x: 0.4, y: 0.4, w: 5, h: 0.5, fontSize: 16, bold: true, color: "111827" });
            // Chart
            if (slideData.chartData) {
              const chartType = slideData.chartData.type === "line" ? "line" : slideData.chartData.type === "pie" ? "pie" : slideData.chartData.type === "doughnut" ? "doughnut" : "bar";
              pptSlide.addChart(chartType as any, [{
                name: slideData.chartData.datasets?.[0]?.label || "Data",
                labels: slideData.chartData.labels || [],
                values: slideData.chartData.datasets?.[0]?.data || [],
              }], { x: 0.4, y: 1, w: 5.5, h: 3.5, showLegend: true, legendPos: "b", chartColors });
            }
            // Right sidebar
            pptSlide.addText("Key Insights", { x: 6.2, y: 1, w: 3.3, h: 0.35, fontSize: 12, bold: true, color: "374151" });
            slideData.chartData?.labels?.slice(0, 5).forEach((l, i) => {
              const val = slideData.chartData?.datasets?.[0]?.data?.[i] || 0;
              pptSlide.addShape("roundRect", { x: 6.2, y: 1.4 + i * 0.55, w: 3.3, h: 0.48, fill: { color: "f9fafb" } });
              pptSlide.addShape("rect", { x: 6.25, y: 1.45 + i * 0.55, w: 0.18, h: 0.18, fill: { color: chartColors[i % 5] } });
              pptSlide.addText(l, { x: 6.5, y: 1.42 + i * 0.55, w: 2, h: 0.4, fontSize: 9, color: "374151" });
              pptSlide.addText(`${val}`, { x: 8.5, y: 1.42 + i * 0.55, w: 0.9, h: 0.4, fontSize: 10, bold: true, color: "111827", align: "right" });
            });
          } else if (chartTpl === 1) {
            // Layout 1: Left stats + right chart
            pptSlide.addText("DATA ANALYSIS", { x: 0.4, y: 0.5, w: 3.8, h: 0.3, fontSize: 10, color: accent });
            pptSlide.addText(slideData.title, { x: 0.4, y: 0.8, w: 3.8, h: 0.6, fontSize: 18, bold: true, color: "111827" });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, { x: 0.4, y: 1.4, w: 3.8, h: 0.5, fontSize: 10, color: "4b5563" });
            }
            // Stat boxes grid
            slideData.chartData?.datasets?.[0]?.data?.slice(0, 4).forEach((d, i) => {
              const col = i % 2, row = Math.floor(i / 2);
              const x = 0.4 + col * 1.9, y = 2 + row * 1.2;
              pptSlide.addShape("roundRect", { x, y, w: 1.8, h: 1.1, fill: { color: chartColors[i % 4] } });
              pptSlide.addText(`${d}`, { x, y: y + 0.15, w: 1.8, h: 0.5, fontSize: 20, bold: true, color: "FFFFFF", align: "center" });
              pptSlide.addText(slideData.chartData?.labels?.[i] || "", { x, y: y + 0.7, w: 1.8, h: 0.3, fontSize: 8, color: "FFFFFF", align: "center" });
            });
            // Right chart
            if (slideData.chartData) {
              const chartType = slideData.chartData.type === "line" ? "line" : slideData.chartData.type === "pie" ? "pie" : slideData.chartData.type === "doughnut" ? "doughnut" : "bar";
              pptSlide.addChart(chartType as any, [{
                name: slideData.chartData.datasets?.[0]?.label || "Data",
                labels: slideData.chartData.labels || [],
                values: slideData.chartData.datasets?.[0]?.data || [],
              }], { x: 4.5, y: 0.5, w: 5.2, h: 4.3, showLegend: true, legendPos: "b", chartColors });
            }
          } else if (chartTpl === 2) {
            // Layout 2: Full width with header tags
            pptSlide.addText(slideData.title, { x: 0.4, y: 0.4, w: 5, h: 0.5, fontSize: 18, bold: true, color: "111827" });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, { x: 0.4, y: 0.9, w: 5, h: 0.3, fontSize: 10, color: "6b7280" });
            }
            // Label tags
            slideData.chartData?.labels?.slice(0, 4).forEach((l, i) => {
              pptSlide.addShape("roundRect", { x: 5.5 + i * 1.2, y: 0.45, w: 1.1, h: 0.35, fill: { color: "f3f4f6" } });
              pptSlide.addShape("ellipse", { x: 5.55 + i * 1.2, y: 0.55, w: 0.12, h: 0.12, fill: { color: chartColors[i % 4] } });
              pptSlide.addText(l, { x: 5.7 + i * 1.2, y: 0.48, w: 0.85, h: 0.3, fontSize: 8, color: "374151" });
            });
            // Full chart
            if (slideData.chartData) {
              const chartType = slideData.chartData.type === "line" ? "line" : slideData.chartData.type === "pie" ? "pie" : slideData.chartData.type === "doughnut" ? "doughnut" : "bar";
              pptSlide.addChart(chartType as any, [{
                name: slideData.chartData.datasets?.[0]?.label || "Data",
                labels: slideData.chartData.labels || [],
                values: slideData.chartData.datasets?.[0]?.data || [],
              }], { x: 0.4, y: 1.3, w: 9.2, h: 3.7, showLegend: true, legendPos: "b", chartColors });
            }
          } else {
            // Layout 3: Top stats row + chart
            pptSlide.addText(slideData.title, { x: 0.4, y: 0.4, w: 9, h: 0.5, fontSize: 16, bold: true, color: "111827" });
            // Stats row
            const statCount = Math.min(slideData.chartData?.labels?.length || 5, 5);
            const statW = 9 / statCount - 0.15;
            slideData.chartData?.labels?.slice(0, statCount).forEach((l, i) => {
              const x = 0.4 + i * (statW + 0.15);
              pptSlide.addShape("roundRect", { x, y: 1, w: statW, h: 0.8, fill: { color: "f8fafc" } });
              pptSlide.addShape("rect", { x, y: 1, w: 0.08, h: 0.8, fill: { color: chartColors[i % 5] } });
              pptSlide.addText(`${slideData.chartData?.datasets?.[0]?.data?.[i] || 0}`, { x: x + 0.15, y: 1.05, w: statW - 0.2, h: 0.4, fontSize: 16, bold: true, color: "111827" });
              pptSlide.addText(l, { x: x + 0.15, y: 1.45, w: statW - 0.2, h: 0.25, fontSize: 8, color: "6b7280" });
            });
            // Chart
            if (slideData.chartData) {
              const chartType = slideData.chartData.type === "line" ? "line" : slideData.chartData.type === "pie" ? "pie" : slideData.chartData.type === "doughnut" ? "doughnut" : "bar";
              pptSlide.addChart(chartType as any, [{
                name: slideData.chartData.datasets?.[0]?.label || "Data",
                labels: slideData.chartData.labels || [],
                values: slideData.chartData.datasets?.[0]?.data || [],
              }], { x: 0.4, y: 1.95, w: 9.2, h: 3, showLegend: true, legendPos: "b", chartColors });
            }
          }
          break;
        }

        // ===== TWO-COLUMN - Same as preview =====
        case "two-column": {
          pptSlide.addText(slideData.title, { x: 0.4, y: 0.4, w: 9, h: 0.6, fontSize: 20, bold: true, color: "111827" });
          
          // Left column
          pptSlide.addShape("roundRect", { x: 0.4, y: 1.1, w: 4.5, h: 3.8, fill: { color: "f9fafb" }, line: { color: "e5e7eb", pt: 1 } });
          pptSlide.addShape("rect", { x: 0.4, y: 1.1, w: 4.5, h: 0.45, fill: { color: accent } });
          pptSlide.addText(slideData.leftColumn?.[0] || "Column 1", { x: 0.5, y: 1.15, w: 4.3, h: 0.4, fontSize: 12, bold: true, color: "FFFFFF" });
          slideData.leftColumn?.slice(1).forEach((item, i) => {
            pptSlide.addShape("ellipse", { x: 0.55, y: 1.75 + i * 0.55, w: 0.1, h: 0.1, fill: { color: accent } });
            pptSlide.addText(item, { x: 0.75, y: 1.68 + i * 0.55, w: 4, h: 0.5, fontSize: 10, color: "374151" });
          });
          
          // Right column
          pptSlide.addShape("roundRect", { x: 5.1, y: 1.1, w: 4.5, h: 3.8, fill: { color: "f9fafb" }, line: { color: "e5e7eb", pt: 1 } });
          pptSlide.addShape("rect", { x: 5.1, y: 1.1, w: 4.5, h: 0.45, fill: { color: accentLight } });
          pptSlide.addText(slideData.rightColumn?.[0] || "Column 2", { x: 5.2, y: 1.15, w: 4.3, h: 0.4, fontSize: 12, bold: true, color: "FFFFFF" });
          slideData.rightColumn?.slice(1).forEach((item, i) => {
            pptSlide.addShape("ellipse", { x: 5.25, y: 1.75 + i * 0.55, w: 0.1, h: 0.1, fill: { color: accentLight } });
            pptSlide.addText(item, { x: 5.45, y: 1.68 + i * 0.55, w: 4, h: 0.5, fontSize: 10, color: "374151" });
          });
          break;
        }

        // ===== QUOTE - Same as preview =====
        case "quote": {
          // Quote circle icon
          pptSlide.addShape("ellipse", { x: 0.5, y: 1.5, w: 0.8, h: 0.8, fill: { color: accent } });
          pptSlide.addText("\u201C", { x: 0.5, y: 1.35, w: 0.8, h: 0.9, fontSize: 36, color: "FFFFFF", fontFace: "Georgia", align: "center" });
          
          // Quote text
          pptSlide.addText(slideData.quote || slideData.title, {
            x: 0.5, y: 2.5, w: 6, h: 1.5,
            fontSize: 22, italic: true, color: "1f2937", fontFace: "Georgia",
          });
          
          // Author
          if (slideData.quoteAuthor) {
            pptSlide.addText(`\u2014 ${slideData.quoteAuthor}`, {
              x: 0.5, y: 4.1, w: 6, h: 0.4,
              fontSize: 12, color: "4b5563",
            });
          }
          
          // Right image
          if (slideData.contentImage?.startsWith("data:")) {
            pptSlide.addImage({
              data: slideData.contentImage.split(",")[1],
              x: 6.8, y: 0.5, w: 2.9, h: 4.3,
            });
          }
          break;
        }

        // ===== IMAGE FOCUS - 4 layouts like preview =====
        case "image-focus": {
          const imgTpl = tpl % 4;
          
          if (imgTpl === 0) {
            // Layout 0: Full image with text overlay at bottom
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 0.3, y: 0.2, w: 9.4, h: 4.8,
              });
            }
            // Overlay gradient effect (dark bar at bottom)
            pptSlide.addShape("rect", { x: 0.3, y: 3.7, w: 9.4, h: 1.3, fill: { color: "000000", transparency: 40 } });
            pptSlide.addText(slideData.title, { x: 0.5, y: 3.8, w: 9, h: 0.6, fontSize: 20, bold: true, color: "FFFFFF" });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, { x: 0.5, y: 4.4, w: 9, h: 0.4, fontSize: 11, color: "FFFFFF" });
            }
          } else if (imgTpl === 1) {
            // Layout 1: Image left + text right
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 0.3, y: 0.3, w: 4.8, h: 4.7,
              });
            }
            pptSlide.addText(slideData.title, { x: 5.3, y: 0.8, w: 4.3, h: 0.7, fontSize: 22, bold: true, color: "111827" });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, { x: 5.3, y: 1.5, w: 4.3, h: 0.5, fontSize: 11, color: "4b5563" });
            }
            slideData.bullets?.forEach((b, i) => {
              pptSlide.addShape("rect", { x: 5.3, y: 2.2 + i * 0.6, w: 0.3, h: 0.3, fill: { color: accent } });
              pptSlide.addText(`${i + 1}`, { x: 5.3, y: 2.2 + i * 0.6, w: 0.3, h: 0.3, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
              pptSlide.addText(b, { x: 5.7, y: 2.18 + i * 0.6, w: 3.9, h: 0.55, fontSize: 10, color: "374151" });
            });
          } else if (imgTpl === 2) {
            // Layout 2: Text left + image right
            pptSlide.addText(slideData.title, { x: 0.4, y: 0.8, w: 4.5, h: 0.7, fontSize: 22, bold: true, color: "111827" });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, { x: 0.4, y: 1.5, w: 4.5, h: 0.5, fontSize: 11, color: "4b5563" });
            }
            slideData.bullets?.forEach((b, i) => {
              pptSlide.addShape("roundRect", { x: 0.4, y: 2.1 + i * 0.55, w: 4.5, h: 0.5, fill: { color: "f9fafb" } });
              pptSlide.addShape("ellipse", { x: 0.5, y: 2.25 + i * 0.55, w: 0.1, h: 0.1, fill: { color: accent } });
              pptSlide.addText(b, { x: 0.7, y: 2.15 + i * 0.55, w: 4.1, h: 0.45, fontSize: 10, color: "374151" });
            });
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 5.1, y: 0.3, w: 4.6, h: 4.7,
              });
            }
          } else {
            // Layout 3: Corner image + full text
            if (slideData.contentImage?.startsWith("data:")) {
              pptSlide.addImage({
                data: slideData.contentImage.split(",")[1],
                x: 6.8, y: 0.3, w: 2.9, h: 2.9,
              });
            }
            pptSlide.addText(slideData.title, { x: 0.4, y: 0.5, w: 6, h: 0.7, fontSize: 22, bold: true, color: "111827" });
            if (slideData.subtitle) {
              pptSlide.addText(slideData.subtitle, { x: 0.4, y: 1.2, w: 6, h: 0.5, fontSize: 11, color: "4b5563" });
            }
            slideData.bullets?.forEach((b, i) => {
              pptSlide.addShape("rect", { x: 0.4, y: 1.8 + i * 0.6, w: 0.3, h: 0.3, fill: { color: accent } });
              pptSlide.addText(`${i + 1}`, { x: 0.4, y: 1.8 + i * 0.6, w: 0.3, h: 0.3, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
              pptSlide.addText(b, { x: 0.8, y: 1.78 + i * 0.6, w: 8.8, h: 0.55, fontSize: 10, color: "374151" });
            });
          }
          break;
        }

        // ===== CLOSING - Same as preview =====
        case "closing": {
          // Center accent bar
          pptSlide.addShape("rect", { x: 3.5, y: 1.5, w: 3, h: 0.06, fill: { color: accent } });
          
          // Title
          pptSlide.addText(slideData.title, {
            x: 0.5, y: 1.7, w: 9, h: 0.9,
            fontSize: 32, bold: true, color: "111827", align: "center",
          });
          
          // Subtitle
          if (slideData.subtitle) {
            pptSlide.addText(slideData.subtitle, {
              x: 0.5, y: 2.6, w: 9, h: 0.5,
              fontSize: 16, color: "4b5563", align: "center",
            });
          }
          
          // Bullet tags
          if (slideData.bullets?.length) {
            const tagCount = Math.min(slideData.bullets.length, 5);
            const tagW = 1.5;
            const startX = 5 - (tagCount * tagW + (tagCount - 1) * 0.2) / 2;
            slideData.bullets.slice(0, tagCount).forEach((b, i) => {
              pptSlide.addShape("roundRect", {
                x: startX + i * (tagW + 0.2), y: 3.3, w: tagW, h: 0.45,
                fill: { color: chartColors[i % 5] },
              });
              pptSlide.addText(b.substring(0, 18), {
                x: startX + i * (tagW + 0.2), y: 3.35, w: tagW, h: 0.4,
                fontSize: 9, color: "FFFFFF", align: "center", valign: "middle",
              });
            });
          }
          break;
        }

        default:
          pptSlide.addText(slideData.title, {
            x: 0.4, y: 0.4, w: 9, h: 0.8, fontSize: 24, bold: true, color: "111827",
          });
      }

      // Slide number (bottom right)
      pptSlide.addText(`${slideData.id}`, {
        x: 9.2, y: 5.1, w: 0.4, h: 0.25, fontSize: 9, color: "9ca3af", align: "right",
      });
    }

    const pptxData = await pptx.write({ outputType: "base64" });

    return new NextResponse(Buffer.from(pptxData as string, "base64"), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${topic.replace(/[^a-zA-Z0-9]/g, "_")}_presentation.pptx"`,
      },
    });
  } catch (error) {
    console.error("PowerPoint export error:", error);
    return NextResponse.json({ error: "Failed to export PowerPoint" }, { status: 500 });
  }
}
