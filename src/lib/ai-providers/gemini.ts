import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIMessage, AIResponse } from "./types";

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

/**
 * Generate an image using Gemini Imagen 3 API
 * @param prompt - Text description of the image to generate
 * @param apiKey - Gemini API key
 * @returns Base64 encoded image data
 */
export async function generateImage(
  prompt: string,
  apiKey: string
): Promise<GeneratedImage | null> {
  try {
    // Use Imagen 3 model for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: `${prompt}, high quality, professional, suitable for presentation slide`,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            personGeneration: "DONT_ALLOW",
            safetySetting: "BLOCK_MEDIUM_AND_ABOVE",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Imagen 3 generation failed:", errorText);
      
      // Fallback to Gemini 2.0 Flash with image output
      return await generateImageWithGeminiFlash(prompt, apiKey);
    }

    const data = await response.json();
    
    // Extract image from Imagen 3 response
    const predictions = data.predictions || [];
    if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
      return {
        base64: predictions[0].bytesBase64Encoded,
        mimeType: "image/png",
      };
    }

    return null;
  } catch (error) {
    console.error("Imagen 3 error:", error);
    // Fallback to Gemini Flash
    return await generateImageWithGeminiFlash(prompt, apiKey);
  }
}

/**
 * Fallback: Generate image using Gemini 2.0 Flash (multimodal output)
 */
async function generateImageWithGeminiFlash(
  prompt: string,
  apiKey: string
): Promise<GeneratedImage | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try using Gemini with image generation capability
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["image", "text"],
      } as any,
    });

    const result = await model.generateContent(
      `Generate an image: ${prompt}. Create a high-quality, professional image suitable for a presentation slide. No text in the image.`
    );

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];
    
    for (const part of parts) {
      if ((part as any).inlineData) {
        return {
          base64: (part as any).inlineData.data,
          mimeType: (part as any).inlineData.mimeType || "image/png",
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini Flash image generation error:", error);
    return null;
  }
}

/**
 * Generate multiple images in parallel
 */
export async function generateImages(
  prompts: string[],
  apiKey: string
): Promise<(GeneratedImage | null)[]> {
  const results = await Promise.all(
    prompts.map((prompt) => generateImage(prompt, apiKey))
  );
  return results;
}

export async function chatWithGemini(
  messages: AIMessage[],
  apiKey: string,
  model: string = "gemini-2.0-flash-exp"
): Promise<AIResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const chat = genModel.startChat({
    history: chatMessages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    systemInstruction: systemMessage?.content 
      ? { role: "user" as const, parts: [{ text: systemMessage.content }] }
      : undefined,
  });

  const lastMessage = chatMessages[chatMessages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;

  return {
    content: response.text(),
    tokens: response.usageMetadata?.totalTokenCount,
    model,
  };
}

export async function streamWithGemini(
  messages: AIMessage[],
  apiKey: string,
  model: string = "gemini-2.0-flash-exp"
): Promise<ReadableStream> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const chat = genModel.startChat({
    history: chatMessages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    systemInstruction: systemMessage?.content 
      ? { role: "user" as const, parts: [{ text: systemMessage.content }] }
      : undefined,
  });

  const lastMessage = chatMessages[chatMessages.length - 1];
  const result = await chat.sendMessageStream(lastMessage.content);

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });
}

// Multimodal streaming with images
export interface ImageData {
  data: string; // base64
  mimeType: string;
}

export async function streamWithGeminiVision(
  messages: AIMessage[],
  images: ImageData[],
  apiKey: string,
  model: string = "gemini-2.0-flash-exp"
): Promise<ReadableStream> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");
  const lastMessage = chatMessages[chatMessages.length - 1];

  // Build parts with text and images
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
  
  // Add images first
  for (const img of images) {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data.replace(/^data:[^;]+;base64,/, ""), // Remove data URL prefix if present
      },
    });
  }
  
  // Add text
  parts.push({ text: lastMessage.content });

  // Generate content with system instruction
  const result = await genModel.generateContentStream({
    contents: [{ role: "user", parts }],
    systemInstruction: systemMessage?.content 
      ? { role: "user" as const, parts: [{ text: systemMessage.content }] }
      : undefined,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });
}
