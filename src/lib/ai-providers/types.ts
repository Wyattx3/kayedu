export type AIProvider = "openai" | "claude" | "gemini" | "grok";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  tokens?: number;
  model?: string;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface EssayOptions {
  topic: string;
  wordCount: number;
  academicLevel: "high-school" | "igcse" | "ged" | "othm" | "undergraduate" | "graduate";
  citationStyle?: "apa" | "mla" | "harvard" | "chicago" | "none";
  essayType?: "argumentative" | "expository" | "narrative" | "descriptive" | "persuasive";
}

export interface DetectionResult {
  aiScore: number;
  humanScore: number;
  analysis: string;
  highlightedSections?: Array<{
    text: string;
    confidence: number;
  }>;
}

export interface HumanizeOptions {
  text: string;
  tone: "formal" | "casual" | "academic" | "natural";
  intensity: "light" | "balanced" | "heavy";
  preserveMeaning: boolean;
}

export interface TutorOptions {
  subject: string;
  topic: string;
  question: string;
  level: "beginner" | "intermediate" | "advanced";
}

export interface PresentationOptions {
  topic: string;
  slideCount: number;
  audience: "students" | "professionals" | "general";
  includeNotes: boolean;
}

export interface StudyGuideOptions {
  topic: string;
  subject: string;
  depth: "overview" | "detailed" | "comprehensive";
  includeExamples: boolean;
  includeQuestions: boolean;
}

