"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

interface ChartData {
  type: "bar" | "line" | "pie" | "doughnut";
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string[] }[];
}

export interface ProfessionalSlide {
  id: number;
  type: "title" | "content" | "chart" | "image-focus" | "two-column" | "quote" | "closing";
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

interface Props {
  slides: ProfessionalSlide[];
  colors: string[];
  style?: "professional" | "modern" | "minimal" | "creative";
}

export function ProfessionalSlides({ slides, colors }: Props) {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Professional color scheme - blue accent
  const accent = colors[0] || "#2563eb";
  const accentLight = colors[1] || "#3b82f6";
  const accentDark = "#1e40af";

  const next = useCallback(() => setCurrent((p) => Math.min(p + 1, slides.length - 1)), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "g") setShowGrid(g => !g);
      if (e.key === "f") containerRef.current?.requestFullscreen?.();
      if (e.key === "Escape") setShowGrid(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  if (!slides.length) return null;
  const slide = slides[current];
  const tpl = slide.id % 8;

  const chartOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: true, position: "bottom", labels: { color: "#374151", font: { size: 10 }, padding: 8 } },
      title: { display: false }
    },
    scales: slide.chartData?.type !== "pie" && slide.chartData?.type !== "doughnut" ? {
      x: { grid: { display: false }, ticks: { color: "#6b7280", font: { size: 9 } } },
      y: { grid: { color: "#e5e7eb" }, ticks: { color: "#6b7280", font: { size: 9 } } },
    } : undefined,
  };

  const renderChart = (h = 180) => {
    if (!slide.chartData?.datasets?.length) return null;
    const data = {
      labels: slide.chartData.labels || [],
      datasets: slide.chartData.datasets.map((ds) => ({
        ...ds,
        backgroundColor: ["pie", "doughnut"].includes(slide.chartData?.type || "") 
          ? ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"] 
          : "#2563eb",
        borderColor: slide.chartData?.type === "line" ? "#2563eb" : "transparent",
        borderWidth: 2,
        tension: 0.4,
      })),
    };
    const Chart = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut }[slide.chartData.type || "bar"];
    return <div style={{ height: h }}><Chart data={data} options={chartOpts} /></div>;
  };

  // Grid view
  if (showGrid) {
    return (
      <div ref={containerRef} className="w-full h-full bg-gray-100 p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">All Slides ({slides.length})</h3>
          <Button size="sm" variant="outline" onClick={() => setShowGrid(false)}>Close Grid</Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {slides.map((s, i) => (
            <div key={i} onClick={() => { setCurrent(i); setShowGrid(false); }}
              className={`cursor-pointer border-2 rounded-lg overflow-hidden aspect-video bg-white hover:border-blue-500 transition ${current === i ? "border-blue-500" : "border-gray-200"}`}>
              <div className="p-2 h-full flex flex-col">
                <div className="text-[8px] text-gray-400 mb-1">Slide {i + 1}</div>
                <div className="text-[10px] font-medium text-gray-800 line-clamp-2">{s.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* White/Light background - professional look */}
      <div className="w-full h-full bg-white overflow-hidden flex flex-col">
        
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
        
        {/* Main content area */}
        <div className="flex-1 p-5 overflow-hidden">
          
          {/* ===== TITLE SLIDES ===== */}
          {slide.type === "title" && (
            <div className="h-full flex">
              {/* Left content */}
              <div className="flex-1 flex flex-col justify-center pr-6">
                <div className="w-16 h-1 mb-4" style={{ backgroundColor: accent }} />
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{slide.title}</h1>
                <p className="text-base text-gray-600 leading-relaxed max-w-lg">{slide.subtitle}</p>
                {slide.bullets && slide.bullets.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {slide.bullets.slice(0, 3).map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                        <span className="text-sm text-gray-700">{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Right image */}
              {slide.backgroundImage && (
                <div className="w-2/5 h-full rounded-lg overflow-hidden shadow-lg">
                  <img src={slide.backgroundImage} className="w-full h-full object-cover" alt="" />
                </div>
              )}
            </div>
          )}

          {/* ===== CONTENT SLIDES - Multiple layouts ===== */}
          {slide.type === "content" && (
            <>
              {tpl % 6 === 0 && ( // Left sidebar image
                <div className="h-full flex gap-5">
                  {slide.contentImage && (
                    <div className="w-1/4 h-full rounded-lg overflow-hidden shadow-md">
                      <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{slide.title}</h2>
                    <p className="text-xs text-gray-500 mb-3">{slide.subtitle}</p>
                    <div className="space-y-2.5">
                      {slide.bullets?.map((b, i) => (
                        <div key={i} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border-l-3" style={{ borderLeftColor: accent, borderLeftWidth: 3 }}>
                          <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: accent }}>{i + 1}</span>
                          <div>
                            <span className="text-sm text-gray-800 font-medium">{b.split(':')[0]}</span>
                            {b.includes(':') && <p className="text-xs text-gray-600 mt-0.5">{b.split(':').slice(1).join(':')}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {tpl % 6 === 1 && ( // Right sidebar image
                <div className="h-full flex gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: accent }}>
                        {slide.bullets?.length || 0}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{slide.title}</h2>
                        <p className="text-xs text-gray-500">{slide.subtitle}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {slide.bullets?.map((b, i) => (
                        <div key={i} className="p-2.5 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                            <span className="text-xs font-semibold text-gray-800">{b.split(':')[0] || b.split('.')[0]}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{b.includes(':') ? b.split(':').slice(1).join(':') : b}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {slide.contentImage && (
                    <div className="w-1/3 h-full rounded-lg overflow-hidden shadow-md">
                      <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                </div>
              )}
              {tpl % 6 === 2 && ( // Top banner image
                <div className="h-full flex flex-col">
                  {slide.contentImage && (
                    <div className="h-28 w-full rounded-lg overflow-hidden shadow-md mb-4">
                      <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{slide.title}</h2>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    {slide.bullets?.map((b, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold mb-2" style={{ backgroundColor: accent }}>
                          {i + 1}
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tpl % 6 === 3 && ( // Corner image with full text
                <div className="h-full relative">
                  {slide.contentImage && (
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-lg overflow-hidden shadow-lg">
                      <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mb-1 pr-36">{slide.title}</h2>
                  <p className="text-xs text-gray-500 mb-4">{slide.subtitle}</p>
                  <div className="space-y-2">
                    {slide.bullets?.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded text-[10px] flex items-center justify-center text-white font-bold shrink-0 mt-0.5" style={{ backgroundColor: accent }}>{i + 1}</span>
                        <div className="flex-1 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-800">{b}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tpl % 6 === 4 && ( // Bottom strip image
                <div className="h-full flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{slide.title}</h2>
                  <p className="text-xs text-gray-500 mb-3">{slide.subtitle}</p>
                  <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                    {slide.bullets?.map((b, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accent }} />
                        <p className="text-sm text-gray-700">{b}</p>
                      </div>
                    ))}
                  </div>
                  {slide.contentImage && (
                    <div className="h-24 w-full rounded-lg overflow-hidden shadow-md mt-3">
                      <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                </div>
              )}
              {tpl % 6 === 5 && ( // Split half
                <div className="h-full flex gap-5">
                  <div className="w-1/2 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{slide.title}</h2>
                    <div className="flex-1 space-y-2">
                      {slide.bullets?.slice(0, Math.ceil((slide.bullets?.length || 0) / 2)).map((b, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                          <span className="w-5 h-5 rounded text-[10px] flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: accent }}>{i + 1}</span>
                          <p className="text-sm text-gray-700">{b}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-col gap-3">
                    {slide.contentImage && (
                      <div className="h-32 rounded-lg overflow-hidden shadow-md">
                        <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      {slide.bullets?.slice(Math.ceil((slide.bullets?.length || 0) / 2)).map((b, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                          <span className="w-5 h-5 rounded text-[10px] flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: accentLight }}>{i + Math.ceil((slide.bullets?.length || 0) / 2) + 1}</span>
                          <p className="text-sm text-gray-700">{b}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== CHART SLIDES - Multiple layouts ===== */}
          {slide.type === "chart" && (
            <>
              {tpl % 4 === 0 && ( // Chart with right sidebar text
                <div className="h-full flex gap-5">
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">{slide.title}</h2>
                    {renderChart(200)}
                  </div>
                  <div className="w-1/3 flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Insights</h3>
                    <div className="space-y-2">
                      {slide.chartData?.labels?.slice(0, 5).map((l, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded" style={{ backgroundColor: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"][i % 5] }} />
                            <span className="text-xs text-gray-700">{l}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-900">{slide.chartData?.datasets?.[0]?.data?.[i]}</span>
                        </div>
                      ))}
                    </div>
                    {slide.subtitle && <p className="text-xs text-gray-500 mt-3">{slide.subtitle}</p>}
                  </div>
                </div>
              )}
              {tpl % 4 === 1 && ( // Chart with left text
                <div className="h-full flex gap-5">
                  <div className="w-2/5 flex flex-col justify-center">
                    <span className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: accent }}>Data Analysis</span>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{slide.title}</h2>
                    <p className="text-sm text-gray-600 mb-4">{slide.subtitle}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {slide.chartData?.datasets?.[0]?.data?.slice(0, 4).map((d, i) => (
                        <div key={i} className="p-2 rounded-lg" style={{ backgroundColor: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"][i % 4] }}>
                          <div className="text-lg font-bold text-white">{d}</div>
                          <div className="text-[10px] text-white/80">{slide.chartData?.labels?.[i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">{renderChart(240)}</div>
                </div>
              )}
              {tpl % 4 === 2 && ( // Full width chart with header
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{slide.title}</h2>
                      <p className="text-xs text-gray-500">{slide.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                      {slide.chartData?.labels?.slice(0, 4).map((l, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[10px]">
                          <span className="w-2 h-2 rounded" style={{ backgroundColor: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"][i % 4] }} />
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">{renderChart(220)}</div>
                </div>
              )}
              {tpl % 4 === 3 && ( // Chart with top stats row
                <div className="h-full flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">{slide.title}</h2>
                  <div className="flex gap-2 mb-4">
                    {slide.chartData?.labels?.slice(0, 5).map((l, i) => (
                      <div key={i} className="flex-1 p-2 rounded-lg border-l-3" style={{ backgroundColor: "#f8fafc", borderLeftColor: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"][i % 5], borderLeftWidth: 3 }}>
                        <div className="text-lg font-bold text-gray-900">{slide.chartData?.datasets?.[0]?.data?.[i]}</div>
                        <div className="text-[10px] text-gray-500">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">{renderChart(160)}</div>
                </div>
              )}
            </>
          )}

          {/* ===== TWO-COLUMN SLIDES ===== */}
          {slide.type === "two-column" && (
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{slide.title}</h2>
              <div className="flex-1 grid grid-cols-2 gap-5">
                {[{ col: slide.leftColumn, color: accent }, { col: slide.rightColumn, color: accentLight }].map(({ col, color }, idx) => (
                  <div key={idx} className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-2 font-semibold text-white text-sm" style={{ backgroundColor: color }}>
                      {col?.[0]}
                    </div>
                    <div className="p-4 space-y-2">
                      {col?.slice(1).map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                          <p className="text-sm text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== QUOTE SLIDES ===== */}
          {slide.type === "quote" && (
            <div className="h-full flex items-center">
              <div className="flex-1 pr-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-3xl font-serif text-white mb-4" style={{ backgroundColor: accent }}>"</div>
                <blockquote className="text-2xl text-gray-800 font-light leading-relaxed mb-4 italic">
                  {slide.quote || slide.title}
                </blockquote>
                {slide.quoteAuthor && (
                  <p className="text-sm text-gray-600">— <span className="font-medium">{slide.quoteAuthor}</span></p>
                )}
              </div>
              {slide.contentImage && (
                <div className="w-1/3 h-4/5 rounded-lg overflow-hidden shadow-xl">
                  <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                </div>
              )}
            </div>
          )}

          {/* ===== IMAGE FOCUS SLIDES - Multiple layouts ===== */}
          {slide.type === "image-focus" && (
            <>
              {tpl % 4 === 0 && ( // Large image with text overlay bottom
                <div className="h-full flex flex-col">
                  <div className="flex-1 rounded-lg overflow-hidden relative shadow-lg">
                    {slide.contentImage && <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h2 className="text-xl font-bold text-white mb-1">{slide.title}</h2>
                      <p className="text-sm text-white/80">{slide.subtitle}</p>
                    </div>
                  </div>
                </div>
              )}
              {tpl % 4 === 1 && ( // Image left, text right
                <div className="h-full flex gap-5">
                  {slide.contentImage && (
                    <div className="w-1/2 h-full rounded-lg overflow-hidden shadow-lg">
                      <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.title}</h2>
                    <p className="text-sm text-gray-600 mb-4">{slide.subtitle}</p>
                    {slide.bullets && (
                      <div className="space-y-2">
                        {slide.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded text-[10px] flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: accent }}>{i + 1}</span>
                            <p className="text-sm text-gray-700">{b}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tpl % 4 === 2 && ( // Image right, text left
                <div className="h-full flex gap-5">
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.title}</h2>
                    <p className="text-sm text-gray-600 mb-4">{slide.subtitle}</p>
                    {slide.bullets && (
                      <div className="space-y-2">
                        {slide.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accent }} />
                            <p className="text-sm text-gray-700">{b}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {slide.contentImage && (
                    <div className="w-1/2 h-full rounded-lg overflow-hidden shadow-lg">
                      <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                </div>
              )}
              {tpl % 4 === 3 && ( // Small image corner with text
                <div className="h-full relative">
                  {slide.contentImage && (
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-lg overflow-hidden shadow-xl">
                      <img src={slide.contentImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <div className="max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{slide.title}</h2>
                    <p className="text-sm text-gray-600 mb-4">{slide.subtitle}</p>
                    {slide.bullets && (
                      <div className="space-y-2">
                        {slide.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded text-[10px] flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: accent }}>{i + 1}</span>
                            <p className="text-sm text-gray-700">{b}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== CLOSING SLIDES ===== */}
          {slide.type === "closing" && (
            <div className="h-full flex flex-col justify-center items-center text-center">
              <div className="w-20 h-1 mb-6" style={{ backgroundColor: accent }} />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{slide.title}</h1>
              <p className="text-lg text-gray-600 mb-6 max-w-lg">{slide.subtitle}</p>
              {slide.bullets && (
                <div className="flex flex-wrap justify-center gap-2">
                  {slide.bullets.map((b, i) => (
                    <span key={i} className="px-4 py-2 rounded-full text-sm text-white" style={{ backgroundColor: accent }}>{b}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="h-10 border-t border-gray-200 flex items-center justify-between px-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowGrid(true)} className="h-7 text-xs text-gray-500">
              <Grid3X3 className="w-3.5 h-3.5 mr-1" /> Grid
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prev} disabled={current === 0} className="w-7 h-7">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className="w-2 h-2 rounded-full transition-all"
                  style={{ backgroundColor: i === current ? accent : "#d1d5db", width: i === current ? "16px" : "8px" }} />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={next} disabled={current === slides.length - 1} className="w-7 h-7">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{current + 1} / {slides.length}</span>
            <Button variant="ghost" size="icon" onClick={() => containerRef.current?.requestFullscreen?.()} className="w-7 h-7">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
