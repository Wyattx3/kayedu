"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  bullets?: string[];
  backgroundImage?: string;
  contentImage?: string;
  notes?: string;
}

interface SlideRendererProps {
  slides: Slide[];
  style?: "professional" | "modern" | "minimal" | "creative";
}

const styleConfigs = {
  professional: {
    bg: "from-slate-900 via-blue-900 to-slate-900",
    text: "text-white",
    accent: "text-blue-300",
    bullet: "bg-blue-500",
  },
  modern: {
    bg: "from-slate-950 via-violet-950 to-slate-950",
    text: "text-white",
    accent: "text-violet-300",
    bullet: "bg-violet-500",
  },
  minimal: {
    bg: "from-gray-50 via-white to-gray-100",
    text: "text-gray-900",
    accent: "text-gray-600",
    bullet: "bg-gray-400",
  },
  creative: {
    bg: "from-purple-900 via-pink-800 to-orange-700",
    text: "text-white",
    accent: "text-amber-300",
    bullet: "bg-amber-400",
  },
};

export function SlideRenderer({ slides, style = "professional" }: SlideRendererProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const config = styleConfigs[style];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, toggleFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className={`relative w-full h-full ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Slide Container */}
      <div
        className={`relative w-full h-full overflow-hidden ${
          slide.backgroundImage ? "" : `bg-gradient-to-br ${config.bg}`
        }`}
        style={
          slide.backgroundImage
            ? {
                backgroundImage: `url(${slide.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {/* Overlay for better text readability on images */}
        {slide.backgroundImage && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        )}

        {/* Slide Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 lg:p-16">
          {/* Title Slide Layout */}
          {isFirstSlide ? (
            <div className="text-center max-w-4xl">
              <h1 className={`text-4xl lg:text-6xl font-bold ${config.text} mb-6 leading-tight`}>
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className={`text-xl lg:text-2xl ${config.accent} font-light`}>
                  {slide.subtitle}
                </p>
              )}
            </div>
          ) : isLastSlide ? (
            /* Thank You Slide Layout */
            <div className="text-center max-w-4xl">
              <h1 className={`text-4xl lg:text-6xl font-bold ${config.text} mb-6`}>
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className={`text-xl lg:text-2xl ${config.accent}`}>{slide.subtitle}</p>
              )}
              {slide.bullets && slide.bullets.length > 0 && (
                <div className="mt-8 space-y-3">
                  {slide.bullets.map((bullet, i) => (
                    <p key={i} className={`text-lg ${config.accent}`}>
                      {bullet}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Content Slide Layout */
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h2 className={`text-3xl lg:text-4xl font-bold ${config.text}`}>
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className={`text-lg ${config.accent}`}>{slide.subtitle}</p>
                )}
                {slide.bullets && slide.bullets.length > 0 && (
                  <ul className="space-y-4">
                    {slide.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className={`w-2 h-2 ${config.bullet} rounded-full mt-2 shrink-0`}
                        />
                        <span className={`text-lg ${config.text}/90`}>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {slide.contentImage && (
                <div className="flex justify-center">
                  <img
                    src={slide.contentImage}
                    alt={slide.title}
                    className="max-w-full max-h-[400px] rounded-2xl shadow-2xl object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`${config.text} hover:bg-white/10 disabled:opacity-30`}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide
                    ? `${config.bullet} w-6`
                    : `bg-white/30 hover:bg-white/50`
                }`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`${config.text} hover:bg-white/10 disabled:opacity-30`}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Slide Counter */}
        <div className={`absolute bottom-6 right-6 text-sm ${config.accent} z-20`}>
          {currentSlide + 1} / {slides.length}
        </div>

        {/* Fullscreen Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className={`absolute top-6 right-6 ${config.text} hover:bg-white/10 z-20`}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>

        {/* Exit Fullscreen Button (visible only in fullscreen) */}
        {isFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.exitFullscreen()}
            className={`absolute top-6 left-6 ${config.text} hover:bg-white/10 z-20`}
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Keyboard Hints (non-fullscreen only) */}
      {!isFullscreen && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-white/60 text-xs py-2 px-4 flex justify-center gap-6">
          <span>← → Navigate</span>
          <span>Space Next</span>
          <span>F Fullscreen</span>
        </div>
      )}
    </div>
  );
}

