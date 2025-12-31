import OpenAI from "openai";

export type DBMessage = OpenAI.Chat.ChatCompletionMessageParam & {
  id?: string;
};

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

const messagesStore: {
  [threadId: string]: DBMessage[];
} = {};

// Kabyar Tutor System Prompt - Concise for faster responses
const getSystemPrompt = (userProfile?: UserProfile | null) => {
  let basePrompt = `You are Kabyar, a friendly tutor helping students learn. Be patient, encouraging, and explain things clearly.

**Style:** Use markdown formatting, emojis occasionally 😊, and step-by-step explanations for math/science.

**For slides/presentations:** Create structured content with slide titles and bullet points. Use visual formatting.

Help with: homework, concepts, math, science, history, languages, writing, test prep. Guide students to understand, not just get answers!`;

  // Add personalized context if user profile is provided
  if (userProfile) {
    const profileParts: string[] = [];
    
    if (userProfile.name) {
      profileParts.push(`Student's name: ${userProfile.name}`);
    }
    if (userProfile.educationLevel) {
      profileParts.push(`Education level: ${userProfile.educationLevel.replace("-", " ")}`);
    }
    if (userProfile.school) {
      profileParts.push(`School: ${userProfile.school}`);
    }
    if (userProfile.major) {
      profileParts.push(`Major/Field: ${userProfile.major}`);
    }
    if (userProfile.yearOfStudy) {
      profileParts.push(`Year: ${userProfile.yearOfStudy}`);
    }
    if (userProfile.learningStyle) {
      profileParts.push(`Learning style: ${userProfile.learningStyle} (adapt your explanations accordingly)`);
    }
    if (userProfile.subjects && userProfile.subjects.length > 0) {
      profileParts.push(`Interested subjects: ${userProfile.subjects.join(", ")}`);
    }
    if (userProfile.studyGoal) {
      profileParts.push(`Study goal: ${userProfile.studyGoal}`);
    }
    if (userProfile.preferredLanguage) {
      profileParts.push(`Preferred language: ${userProfile.preferredLanguage}`);
    }

    if (profileParts.length > 0) {
      basePrompt += `\n\n**Student Profile (use this to personalize your responses):**\n${profileParts.join("\n")}

**Personalization tips:**
- Address the student by name when appropriate
- Adjust complexity based on their education level
- Use examples relevant to their major/interests
- Match their learning style (visual: use diagrams/charts, practical: use examples, conceptual: explain theory)
- Help them achieve their study goals`;
    }
  }

  return basePrompt;
};

export const getMessageStore = (id: string, userProfile?: UserProfile | null) => {
  const isNewThread = !messagesStore[id];
  
  if (isNewThread) {
    // Initialize with system prompt for new threads
    messagesStore[id] = [
      { role: "system", content: getSystemPrompt(userProfile) }
    ];
  } else if (userProfile) {
    // Update system prompt if profile is provided and thread exists
    // Only update if the first message is a system message
    if (messagesStore[id][0]?.role === "system") {
      messagesStore[id][0] = { role: "system", content: getSystemPrompt(userProfile) };
    }
  }
  
  const messageList = messagesStore[id];
  return {
    addMessage: (message: DBMessage) => {
      messageList.push(message);
    },
    messageList,
    getOpenAICompatibleMessageList: () => {
      return messageList.map((m) => {
        const message = {
          ...m,
        };

        delete message.id;

        return message;
      });
    },
    clearMessages: () => {
      // Reset with system prompt
      messagesStore[id] = [
        { role: "system", content: getSystemPrompt(userProfile) }
      ];
    },
  };
};

export const deleteThread = (id: string) => {
  delete messagesStore[id];
};

export const getAllThreads = () => {
  return Object.keys(messagesStore);
};



