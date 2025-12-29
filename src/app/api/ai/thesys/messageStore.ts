import OpenAI from "openai";

export type DBMessage = OpenAI.Chat.ChatCompletionMessageParam & {
  id?: string;
};

const messagesStore: {
  [threadId: string]: DBMessage[];
} = {};

// Kay AI Tutor System Prompt - Concise for faster responses
const TUTOR_SYSTEM_PROMPT = `You are Kay AI, a friendly tutor helping students learn. Be patient, encouraging, and explain things clearly.

**Style:** Use markdown formatting, emojis occasionally 😊, and step-by-step explanations for math/science.

**For slides/presentations:** Create structured content with slide titles and bullet points. Use visual formatting.

Help with: homework, concepts, math, science, history, languages, writing, test prep. Guide students to understand, not just get answers!`;

export const getMessageStore = (id: string) => {
  const isNewThread = !messagesStore[id];
  
  if (isNewThread) {
    // Initialize with system prompt for new threads
    messagesStore[id] = [
      { role: "system", content: TUTOR_SYSTEM_PROMPT }
    ];
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
        { role: "system", content: TUTOR_SYSTEM_PROMPT }
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



