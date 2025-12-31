import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  aiProvider: z.enum(["openai", "claude", "gemini", "grok"]).optional(),
  // Profile fields - allow empty strings
  profileImage: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  school: z.string().optional().nullable(),
  schoolName: z.string().optional().nullable(),
  major: z.string().optional().nullable(),
  yearOfStudy: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  educationLevel: z.string().optional().nullable(),
  learningStyle: z.string().optional().nullable(),
  subjects: z.array(z.string()).optional().nullable(),
  preferredLanguage: z.string().optional().nullable(),
  studyGoal: z.string().optional().nullable(),
  hobbies: z.string().optional().nullable(),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Convert empty strings to null for optional fields
    const processedBody: any = { ...body };
    const stringFields = ['dateOfBirth', 'school', 'schoolName', 'major', 'yearOfStudy', 'occupation', 'educationLevel', 'learningStyle', 'preferredLanguage', 'studyGoal', 'hobbies'];
    for (const field of stringFields) {
      if (processedBody[field] === '') {
        processedBody[field] = null;
      }
    }
    // Remove name if empty (to skip validation)
    if (processedBody.name === '') {
      delete processedBody.name;
    }
    
    const parsed = updateProfileSchema.safeParse(processedBody);

    if (!parsed.success) {
      console.error("Validation error:", parsed.error.errors);
      console.error("Processed body:", processedBody);
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (parsed.data.name) {
      updateData.name = parsed.data.name;
    }
    
    if (parsed.data.aiProvider) {
      updateData.aiProvider = parsed.data.aiProvider;
    }

    // Profile fields
    if (parsed.data.profileImage !== undefined) {
      updateData.image = parsed.data.profileImage;
    }
    if (parsed.data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = parsed.data.dateOfBirth;
    }
    if (parsed.data.school !== undefined) {
      updateData.school = parsed.data.school;
    }
    if (parsed.data.schoolName !== undefined) {
      updateData.school = parsed.data.schoolName; // Use schoolName if provided
    }
    if (parsed.data.major !== undefined) {
      updateData.major = parsed.data.major;
    }
    if (parsed.data.yearOfStudy !== undefined) {
      updateData.yearOfStudy = parsed.data.yearOfStudy;
    }
    if (parsed.data.occupation !== undefined) {
      updateData.occupation = parsed.data.occupation;
    }
    if (parsed.data.educationLevel !== undefined) {
      updateData.educationLevel = parsed.data.educationLevel;
    }
    if (parsed.data.learningStyle !== undefined) {
      updateData.learningStyle = parsed.data.learningStyle;
    }
    if (parsed.data.subjects !== undefined) {
      updateData.subjects = JSON.stringify(parsed.data.subjects);
    }
    if (parsed.data.preferredLanguage !== undefined) {
      updateData.preferredLanguage = parsed.data.preferredLanguage;
    }
    if (parsed.data.studyGoal !== undefined) {
      updateData.studyGoal = parsed.data.studyGoal;
    }
    if (parsed.data.hobbies !== undefined) {
      updateData.hobbies = parsed.data.hobbies;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        aiProvider: user.aiProvider,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        aiProvider: true,
        dailyCredits: true,
        dailyCreditsUsed: true,
        creditsResetAt: true,
        plan: true,
        dateOfBirth: true,
        school: true,
        major: true,
        yearOfStudy: true,
        occupation: true,
        educationLevel: true,
        learningStyle: true,
        subjects: true,
        preferredLanguage: true,
        studyGoal: true,
        hobbies: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse subjects JSON string if exists
    if (user.subjects) {
      try {
        (user as any).subjects = JSON.parse(user.subjects);
      } catch {
        (user as any).subjects = [];
      }
    }

    // Check if credits should reset (daily reset)
    const now = new Date();
    const resetAt = new Date(user.creditsResetAt);
    const hoursSinceReset = (now.getTime() - resetAt.getTime()) / (1000 * 60 * 60);
    
    let creditsUsed = user.dailyCreditsUsed;
    let creditsResetAt = user.creditsResetAt;
    
    // Reset credits if more than 24 hours have passed
    if (hoursSinceReset >= 24) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          dailyCreditsUsed: 0,
          creditsResetAt: now,
        },
      });
      creditsUsed = 0;
      creditsResetAt = now;
    }

    // Calculate hours until reset
    const hoursUntilReset = Math.max(0, 24 - hoursSinceReset);
    const resetTimeText = hoursUntilReset < 1 
      ? `${Math.round(hoursUntilReset * 60)} minutes` 
      : `${Math.round(hoursUntilReset)} hours`;

    return NextResponse.json({ 
      user: {
        ...user,
        dailyCreditsUsed: creditsUsed,
        creditsResetAt: creditsResetAt,
        creditsRemaining: user.dailyCredits - creditsUsed,
        resetTimeText,
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

