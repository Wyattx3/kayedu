import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const DAILY_FREE_CREDITS = 50;

const deductSchema = z.object({
  amount: z.number().min(1).max(100),
  feature: z.string(),
  model: z.string().optional(),
});

// Check if 24 hours have passed since last reset (using UTC timestamps to prevent cheating)
function shouldResetCredits(resetAt: Date): boolean {
  const now = new Date();
  const resetTime = new Date(resetAt);
  const hoursSinceReset = (now.getTime() - resetTime.getTime()) / (1000 * 60 * 60);
  return hoursSinceReset >= 24;
}

// Check and reset credits if 24 hours have passed
async function checkAndResetCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditsResetAt: true, dailyCredits: true, dailyCreditsUsed: true },
  });

  if (!user) return null;

  if (shouldResetCredits(user.creditsResetAt)) {
    const now = new Date();
    // Reset credits with current UTC time
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCreditsUsed: 0,
        dailyCredits: DAILY_FREE_CREDITS,
        creditsResetAt: now,
      },
    });
    console.log(`[Credits API] Daily reset for user ${userId} at ${now.toISOString()}`);
    return { creditsUsed: 0, resetAt: now };
  }

  return { creditsUsed: user.dailyCreditsUsed, resetAt: user.creditsResetAt };
}

// GET - Get current credits (real-time from database)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check and reset if needed (this updates the database)
    await checkAndResetCredits(session.user.id);

    // Fetch fresh data from database after potential reset
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dailyCredits: true,
        dailyCreditsUsed: true,
        creditsResetAt: true,
        plan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const remaining = user.dailyCredits - user.dailyCreditsUsed;
    
    // Calculate time until next reset (24 hours from last reset)
    const now = new Date();
    const resetAt = new Date(user.creditsResetAt);
    const hoursSinceReset = (now.getTime() - resetAt.getTime()) / (1000 * 60 * 60);
    const hoursUntilReset = Math.max(0, Math.ceil(24 - hoursSinceReset));

    return NextResponse.json({
      total: user.dailyCredits,
      used: user.dailyCreditsUsed,
      remaining,
      plan: user.plan,
      resetsIn: hoursUntilReset <= 1 ? "< 1h" : `${hoursUntilReset}h`,
      resetAt: user.creditsResetAt,
    });
  } catch (error) {
    console.error("Credits GET error:", error);
    return NextResponse.json({ error: "Failed to get credits" }, { status: 500 });
  }
}

// POST - Deduct credits
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = deductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { amount, feature, model } = parsed.data;

    // Check and reset if needed
    await checkAndResetCredits(session.user.id);

    // Get current credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dailyCredits: true,
        dailyCreditsUsed: true,
        plan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const remaining = user.dailyCredits - user.dailyCreditsUsed;

    // Check if user has enough credits
    if (remaining < amount) {
      return NextResponse.json({
        error: "Insufficient credits",
        remaining,
        required: amount,
      }, { status: 402 });
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dailyCreditsUsed: user.dailyCreditsUsed + amount,
      },
    });

    // Log usage
    await prisma.usage.create({
      data: {
        userId: session.user.id,
        feature,
        tokens: amount,
        model: model || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      deducted: amount,
      remaining: remaining - amount,
    });
  } catch (error) {
    console.error("Credits POST error:", error);
    return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 });
  }
}
