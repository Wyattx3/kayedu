import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { checkCredits, deductCredits } from "@/lib/credits";
import type { ModelTier } from "@/lib/ai-providers";

interface UserProfile {
  name?: string;
  educationLevel?: string;
  learningStyle?: string;
  subjects?: string[];
  school?: string;
  major?: string;
  yearOfStudy?: string;
  studyGoal?: string;
  preferredLanguage?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
}

// Generate system prompt based on user profile
const getSystemPrompt = (userProfile?: UserProfile | null) => {
  let basePrompt = `You are Kabyar, a friendly tutor helping students learn. Be patient, encouraging, and explain things clearly.

**Style:** Use markdown formatting, emojis occasionally 😊, and step-by-step explanations for math/science.

**For slides/presentations:** Create structured content with slide titles and bullet points. Use visual formatting.

Help with: homework, concepts, math, science, history, languages, writing, test prep. Guide students to understand, not just get answers!`;

  if (userProfile) {
    const profileParts: string[] = [];
    
    if (userProfile.name) profileParts.push(`Student's name: ${userProfile.name}`);
    if (userProfile.educationLevel) profileParts.push(`Education level: ${userProfile.educationLevel.replace("-", " ")}`);
    if (userProfile.school) profileParts.push(`School: ${userProfile.school}`);
    if (userProfile.major) profileParts.push(`Major/Field: ${userProfile.major}`);
    if (userProfile.yearOfStudy) profileParts.push(`Year: ${userProfile.yearOfStudy}`);
    if (userProfile.learningStyle) profileParts.push(`Learning style: ${userProfile.learningStyle}`);
    if (userProfile.subjects?.length) profileParts.push(`Interested subjects: ${userProfile.subjects.join(", ")}`);
    if (userProfile.studyGoal) profileParts.push(`Study goal: ${userProfile.studyGoal}`);
    if (userProfile.preferredLanguage) profileParts.push(`Preferred language: ${userProfile.preferredLanguage}`);

    if (profileParts.length > 0) {
      basePrompt += `\n\n**Student Profile:**\n${profileParts.join("\n")}`;
    }
  }

  return basePrompt;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, threadId, responseId, model, userProfile, chatHistory } = (await req.json()) as {
    prompt: ChatMessage;
    threadId: string;
    responseId: string;
    model?: "pro-smart" | "normal" | "fast";
    userProfile?: UserProfile | null;
    chatHistory?: ChatMessage[];
  };
  
  const modelTier = (model || "fast") as ModelTier;
  
  // Check credits before processing
  const creditCheck = await checkCredits(session.user.id, modelTier, 500);
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
    await deductCredits(session.user.id, creditCheck.creditsNeeded, "tutor", modelTier);
  }

  const client = new OpenAI({
    baseURL: "https://api.thesys.dev/v1/embed/",
    apiKey: process.env.THESYS_API_KEY?.trim(),
  });
  
  // Build messages array from client chat history
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: getSystemPrompt(userProfile) }
  ];
  
  // Add previous messages from chat history (if provided)
  if (chatHistory && chatHistory.length > 0) {
    for (const msg of chatHistory) {
      if (msg.content && msg.content !== "[[STOPPED]]") {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }
  
  // Add current user message
  messages.push({ role: "user", content: prompt.content });

  // Model mapping - using TheSys C1 models
  const modelConfig: Record<string, string> = {
    fast: "c1-exp/anthropic/claude-haiku-4.5/v-20251230",
    normal: "c1/anthropic/claude-sonnet-4/v-20251230",
    "pro-smart": "c1/openai/gpt-5/v-20251230",
    "super-smart": "c1/openai/gpt-5/v-20251230",
  };

  const selectedModel = modelConfig[model || "normal"] || modelConfig["normal"];

  try {
  const llmStream = await client.chat.completions.create({
      model: selectedModel,
      messages: messages,
    stream: true,
    });

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of llmStream) {
            const content = chunk.choices?.[0]?.delta?.content ?? "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          // Handle errors gracefully
          if (error instanceof Error && error.name === "AbortError") {
            controller.close();
            return;
          }
          controller.error(error);
        }
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
    console.error("AI API error:", error);
    return new NextResponse("AI request failed", { status: 500 });
  }
}
