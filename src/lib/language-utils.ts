// Server-side language utilities
export type AILanguage = "en" | "my" | "zh" | "th" | "ko" | "ja";

// Language instructions - Natural, conversational style
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

