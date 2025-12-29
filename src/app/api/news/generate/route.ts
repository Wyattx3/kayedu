import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Use Grok API for fast news generation
const grokClient = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

// Category colors
const categoryColors: Record<string, string> = {
  "Programming": "bg-blue-500",
  "AI/ML": "bg-purple-500",
  "Mathematics": "bg-indigo-500",
  "Web Development": "bg-cyan-500",
  "Data Science": "bg-green-500",
  "Physics": "bg-orange-500",
  "Chemistry": "bg-red-500",
  "Biology": "bg-emerald-500",
  "Computer Science": "bg-violet-500",
  "English": "bg-pink-500",
  "Business": "bg-amber-500",
  "Literature": "bg-rose-500",
  "History": "bg-slate-500",
  "Economics": "bg-teal-500",
  "default": "bg-gray-500",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjects, schoolName, major, educationLevel, studyGoal } = body;

    const userContext = `
User Profile:
- Subjects of Interest: ${subjects?.join(", ") || "Programming, Mathematics"}
- School/University: ${schoolName || "Not specified"}
- Major: ${major || "Not specified"}
- Education Level: ${educationLevel || "undergraduate"}
- Study Goal: ${studyGoal || "Learn and improve skills"}
    `.trim();

    const response = await grokClient.chat.completions.create({
      model: "grok-4-1-fast-reasoning",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that generates personalized educational news and updates for students. 
Based on the user's profile, generate 4 relevant and interesting news/updates that would help them in their learning journey.

Each news item should be:
1. Relevant to their subjects of interest or field of study
2. Educational and informative
3. Current and trending in their field
4. Actionable or insightful

IMPORTANT: Respond ONLY with valid JSON, no other text. Format:
{
  "news": [
    {
      "id": "1",
      "category": "Subject Category",
      "title": "News Title (max 80 chars)",
      "summary": "Brief summary of the news (max 150 chars)",
      "fullContent": "Detailed content about this news/update (2-3 paragraphs explaining the topic, its importance, and how it relates to the student's learning)",
      "actionTip": "A practical tip or action the student can take based on this news",
      "relatedTopics": ["topic1", "topic2"]
    }
  ]
}`
        },
        {
          role: "user",
          content: `Generate 4 personalized educational news/updates for this student:\n\n${userContext}`
        }
      ],
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```")) {
      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
    }
    
    const parsed = JSON.parse(jsonContent);
    
    // Add colors and time to news items
    const newsWithMeta = parsed.news.map((item: any, index: number) => ({
      ...item,
      id: `ai-news-${Date.now()}-${index}`,
      color: categoryColors[item.category] || categoryColors.default,
      time: getRandomTime(),
      source: "AI Generated",
    }));

    return NextResponse.json({ news: newsWithMeta, source: "ai" });
  } catch (error) {
    console.error("Error generating news:", error);
    
    // Fallback news
    const fallbackNews = [
      {
        id: "fallback-1",
        category: "Programming",
        title: "Top Programming Languages to Learn in 2025",
        summary: "Discover which programming languages are most in-demand for developers.",
        fullContent: "As we move into 2025, several programming languages continue to dominate the tech industry. Python remains the top choice for data science and AI applications, while JavaScript and TypeScript lead in web development.\n\nRust and Go are gaining popularity for systems programming due to their performance and safety features. For mobile development, Swift and Kotlin are essential skills.\n\nTo stay competitive, focus on mastering one language deeply while having familiarity with others in your area of interest.",
        actionTip: "Pick one new language to learn this month and build a small project with it.",
        relatedTopics: ["Python", "JavaScript", "Career Development"],
        color: "bg-blue-500",
        time: "Just now",
        source: "AI Generated",
      },
      {
        id: "fallback-2",
        category: "AI/ML",
        title: "Understanding Large Language Models for Students",
        summary: "A beginner-friendly guide to how AI models like GPT work.",
        fullContent: "Large Language Models (LLMs) have revolutionized how we interact with AI. These models are trained on vast amounts of text data to understand and generate human-like text.\n\nAs a student, understanding LLMs opens doors to exciting career opportunities. Key concepts to learn include transformers, attention mechanisms, and fine-tuning.\n\nStart with free courses on platforms like Coursera or fast.ai to build your foundation in AI and machine learning.",
        actionTip: "Try building a simple chatbot using OpenAI's API to understand how LLMs work.",
        relatedTopics: ["Machine Learning", "Natural Language Processing", "Deep Learning"],
        color: "bg-purple-500",
        time: "2 hours ago",
        source: "AI Generated",
      },
      {
        id: "fallback-3",
        category: "Mathematics",
        title: "How Math Powers Modern Technology",
        summary: "Explore the essential role of mathematics in tech innovations.",
        fullContent: "Mathematics is the backbone of modern technology. From algorithms that power search engines to cryptography securing your online transactions, math is everywhere.\n\nLinear algebra is crucial for machine learning, calculus helps optimize algorithms, and statistics enables data-driven decisions. Discrete mathematics forms the foundation of computer science.\n\nStrengthening your math skills will give you a significant advantage in any tech career path you choose.",
        actionTip: "Practice solving algorithm problems on LeetCode to apply your math skills.",
        relatedTopics: ["Linear Algebra", "Algorithms", "Cryptography"],
        color: "bg-indigo-500",
        time: "5 hours ago",
        source: "AI Generated",
      },
      {
        id: "fallback-4",
        category: "Web Development",
        title: "The Rise of Full-Stack Development Skills",
        summary: "Why knowing both frontend and backend is valuable in 2025.",
        fullContent: "Full-stack development skills are increasingly valuable as companies seek versatile developers who can work across the entire application stack.\n\nModern frameworks like Next.js blur the line between frontend and backend, making it easier to become a full-stack developer. Understanding databases, APIs, and deployment is essential.\n\nStart by mastering one stack (like React + Node.js + PostgreSQL) before expanding your knowledge to other technologies.",
        actionTip: "Build a complete full-stack project and deploy it to showcase your skills.",
        relatedTopics: ["React", "Node.js", "Database Design"],
        color: "bg-cyan-500",
        time: "1 day ago",
        source: "AI Generated",
      },
    ];

    return NextResponse.json({ news: fallbackNews, source: "fallback" });
  }
}

function getRandomTime(): string {
  const options = ["Just now", "1 hour ago", "2 hours ago", "3 hours ago", "5 hours ago", "Today"];
  return options[Math.floor(Math.random() * options.length)];
}


