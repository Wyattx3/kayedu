import { prisma } from "./prisma";
import { getModelCredits as getModelCreditsFromProvider, isProOnlyTier, type ModelTier } from "./ai-providers";

// Daily credit amount
const DAILY_FREE_CREDITS = 50;

// Calculate credits based on word count and model
export function calculateCredits(wordCount: number, model: ModelTier): number {
  // Base: 3 credits per 1000 words (minimum 3 credits)
  const wordCredits = Math.max(3, Math.ceil(wordCount / 1000) * 3);
  
  // For pro-smart, charge 5 credits minimum
  if (model === "pro-smart") {
    return Math.max(5, wordCredits);
  }
  
  // Super-smart is free for Pro users (handled separately)
  if (model === "super-smart") {
    return 0;
  }
  
  return wordCredits;
}

// Check if 24 hours have passed since last reset (using UTC to prevent cheating)
function shouldResetCredits(resetAt: Date): boolean {
  const now = new Date();
  const resetTime = new Date(resetAt);
  
  // Calculate hours since last reset using UTC timestamps
  const hoursSinceReset = (now.getTime() - resetTime.getTime()) / (1000 * 60 * 60);
  
  // Reset if 24 hours have passed
  return hoursSinceReset >= 24;
}

// Check if user has enough credits and is allowed to use the model
export async function checkCredits(
  userId: string,
  model: ModelTier,
  estimatedWords: number = 1000
): Promise<{ allowed: boolean; error?: string; creditsNeeded?: number; creditsRemaining?: number; plan?: string }> {
  // Get user data directly from database (no caching, no mocks)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dailyCredits: true,
      dailyCreditsUsed: true,
      creditsResetAt: true,
      plan: true,
    },
  });

  if (!user) {
    return { allowed: false, error: "User not found" };
  }

  // Unlimited plan users have no restrictions
  if (user.plan === "unlimited") {
    return { allowed: true, creditsNeeded: 0, creditsRemaining: -1, plan: "unlimited" };
  }

  // Check for daily reset using UTC time
  const now = new Date();
  let creditsUsed = user.dailyCreditsUsed;
  
  if (shouldResetCredits(user.creditsResetAt)) {
    // Reset credits - update database with current UTC time
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCreditsUsed: 0,
        dailyCredits: user.plan === "pro" ? 3500 : DAILY_FREE_CREDITS, // Pro gets 3500, free gets 50
        creditsResetAt: now,
      },
    });
    creditsUsed = 0;
    console.log(`[Credits] Daily reset for user ${userId} at ${now.toISOString()}`);
  }

  const remaining = user.dailyCredits - creditsUsed;

  // Check if Pro-only model (only for free users)
  if (isProOnlyTier(model) && user.plan === "free") {
    return { 
      allowed: false, 
      error: "Super Smart model requires Pro or Unlimited plan",
      creditsRemaining: remaining,
      plan: user.plan,
    };
  }

  // Super-smart is free for Pro/Unlimited users
  if (model === "super-smart" && (user.plan === "pro" || user.plan === "unlimited")) {
    return { allowed: true, creditsNeeded: 0, creditsRemaining: remaining, plan: user.plan };
  }

  // Calculate credits needed
  const creditsNeeded = calculateCredits(estimatedWords, model);

  if (remaining < creditsNeeded) {
    return { 
      allowed: false, 
      error: "Insufficient credits",
      creditsNeeded,
      creditsRemaining: remaining,
      plan: user.plan,
    };
  }

  return { allowed: true, creditsNeeded, creditsRemaining: remaining, plan: user.plan };
}

// Deduct credits after successful API call
export async function deductCredits(
  userId: string,
  amount: number,
  feature: string,
  model: string
): Promise<boolean> {
  try {
    // Check user plan first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    
    // Unlimited users don't need credit deduction
    if (user?.plan === "unlimited") {
      console.log(`[Credits] Unlimited user ${userId} - no credits deducted for ${feature}`);
      // Still log usage for analytics
      await prisma.usage.create({
        data: {
          userId,
          feature,
          tokens: 0, // No credits deducted
          model,
        },
      });
      return true;
    }
    
    // Skip deduction for super-smart with pro users
    if (model === "super-smart" && user?.plan === "pro") {
      console.log(`[Credits] Pro user ${userId} - super-smart is free for ${feature}`);
      await prisma.usage.create({
        data: {
          userId,
          feature,
          tokens: 0,
          model,
        },
      });
      return true;
    }
    
    console.log(`[Credits] Deducting ${amount} credits for ${feature} (model: ${model}) from user ${userId}`);
    
    // Update user credits
    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCreditsUsed: { increment: amount },
      },
      select: {
        dailyCreditsUsed: true,
        dailyCredits: true,
      },
    });

    console.log(`[Credits] User now has ${result.dailyCredits - result.dailyCreditsUsed} credits remaining`);

    // Log usage
    await prisma.usage.create({
      data: {
        userId,
        feature,
        tokens: amount,
        model,
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    return false;
  }
}
