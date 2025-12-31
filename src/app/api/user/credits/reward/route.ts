import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const rewardSchema = z.object({
  source: z.enum(["rewarded_ad", "referral", "bonus"]),
  amount: z.number().min(1).max(50).default(5),
});

// Max ad rewards per day to prevent abuse
const MAX_AD_REWARDS_PER_DAY = 20;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = rewardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { source, amount } = parsed.data;

    // Get user's current data
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

    // Pro/Unlimited users don't need ad rewards
    if (user.plan !== "free" && source === "rewarded_ad") {
      return NextResponse.json({ 
        error: "Paid users don't need to watch ads",
        plan: user.plan,
      }, { status: 400 });
    }

    // Check for abuse - count recent ad rewards
    const recentRewards = await prisma.usage.count({
      where: {
        userId: session.user.id,
        feature: "ad_reward",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (recentRewards >= MAX_AD_REWARDS_PER_DAY) {
      return NextResponse.json({ 
        error: "Daily ad reward limit reached. Try again tomorrow.",
        maxReached: true,
      }, { status: 429 });
    }

    // Reduce credits used (giving back credits)
    const newCreditsUsed = Math.max(0, user.dailyCreditsUsed - amount);
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dailyCreditsUsed: newCreditsUsed,
      },
    });

    // Log the reward
    await prisma.usage.create({
      data: {
        userId: session.user.id,
        feature: "ad_reward",
        tokens: -amount, // Negative to indicate credit given
        model: source,
      },
    });

    const remaining = user.dailyCredits - newCreditsUsed;
    
    console.log(`[Ad Reward] User ${session.user.id} earned ${amount} credits. Now has ${remaining} remaining.`);

    return NextResponse.json({
      success: true,
      credited: amount,
      remaining,
      source,
    });
  } catch (error) {
    console.error("Credit reward error:", error);
    return NextResponse.json({ error: "Failed to reward credits" }, { status: 500 });
  }
}
