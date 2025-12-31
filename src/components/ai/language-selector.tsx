"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AILanguage = "en" | "my" | "zh" | "th" | "ko" | "ja";

interface Language {
  code: AILanguage;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ", flag: "🇲🇲" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
];

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSelector({ compact = false, className }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<AILanguage>("en");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved language
    const saved = localStorage.getItem("kabyar-language");
    if (saved && languages.find(l => l.code === saved)) {
      setSelectedLanguage(saved as AILanguage);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: AILanguage) => {
    setSelectedLanguage(code);
    localStorage.setItem("kabyar-language", code);
    setIsOpen(false);
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent("languageChange", { detail: code }));
  };

  const currentLanguage = languages.find(l => l.code === selectedLanguage) || languages[0];

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg transition-all duration-200",
          compact
            ? "w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700"
            : "px-3 py-2 bg-white border border-gray-200 hover:border-blue-300 shadow-sm"
        )}
      >
        <Globe className="w-4 h-4 text-blue-600" />
        <span className="text-lg">{currentLanguage.flag}</span>
        {!compact && (
          <span className="text-sm font-medium text-gray-700">{currentLanguage.nativeName}</span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[180px] animate-scale-in",
          compact ? "bottom-full mb-1" : "top-full"
        )}>
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">AI Response Language</p>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                selectedLanguage === lang.code
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 text-gray-700"
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{lang.nativeName}</p>
                <p className="text-xs text-gray-400">{lang.name}</p>
              </div>
              {selectedLanguage === lang.code && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to get language instruction for AI - Natural, conversational style
export function getLanguageInstruction(langCode?: AILanguage): string {
  const instructions: Record<AILanguage, string> = {
    en: "Respond in natural, conversational English. Be friendly and easy to understand.",
    my: `Respond in natural, conversational Burmese (မြန်မာဘာသာ). Use Myanmar script. Write like a friendly native speaker, NOT robotic. Use casual everyday expressions. Make it comfortable to read.`,
    zh: `Respond in natural, conversational Chinese (中文). Use Simplified Chinese. Write like a friendly native speaker, not robotic. Use natural expressions.`,
    th: `Respond in natural, conversational Thai (ภาษาไทย). Use Thai script. Write like a friendly native Thai speaker. Use natural expressions.`,
    ko: `Respond in natural, conversational Korean (한국어). Use Hangul. Write like a friendly native speaker. Use casual, natural expressions.`,
    ja: `Respond in natural, conversational Japanese (日本語). Use appropriate kanji, hiragana, katakana. Write like a friendly native speaker.`,
  };
  return instructions[langCode || "en"];
}

// Hook to get current AI language
export function useAILanguage() {
  const [language, setLanguage] = useState<AILanguage>("en");

  useEffect(() => {
    const saved = localStorage.getItem("kabyar-language");
    if (saved) {
      setLanguage(saved as AILanguage);
    }

    const handleChange = (e: CustomEvent) => {
      setLanguage(e.detail as AILanguage);
    };

    window.addEventListener("languageChange", handleChange as EventListener);
    return () => window.removeEventListener("languageChange", handleChange as EventListener);
  }, []);

  return language;
}

