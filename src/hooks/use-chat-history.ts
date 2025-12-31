"use client";

import { useState, useEffect, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  timestamp: number;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "kabyar-tutor-history";

export function useChatHistory() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatThread[];
        setThreads(parsed);
        if (parsed.length > 0) {
          setActiveThreadId(parsed[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever threads change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    }
  }, [threads, isLoaded]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

  const createThread = useCallback((title?: string) => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: title || "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    return newThread.id;
  }, []);

  const deleteThread = useCallback((threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (activeThreadId === threadId) {
      setActiveThreadId((prev) => {
        const remaining = threads.filter((t) => t.id !== threadId);
        return remaining.length > 0 ? remaining[0].id : null;
      });
    }
  }, [activeThreadId, threads]);

  const updateThreadTitle = useCallback((threadId: string, title: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, title, updatedAt: Date.now() } : t
      )
    );
  }, []);

  const addMessage = useCallback((threadId: string, message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        
        const updatedMessages = [...t.messages, newMessage];
        
        // Auto-generate title from first user message
        let title = t.title;
        if (t.title === "New Chat" && message.role === "user") {
          title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "");
        }
        
        return {
          ...t,
          title,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };
      })
    );

    return newMessage.id;
  }, []);

  const updateMessage = useCallback((threadId: string, messageId: string, content: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          messages: t.messages.map((m) =>
            m.id === messageId ? { ...m, content } : m
          ),
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  const clearAllHistory = useCallback(() => {
    setThreads([]);
    setActiveThreadId(null);
  }, []);

  return {
    threads,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    createThread,
    deleteThread,
    updateThreadTitle,
    addMessage,
    updateMessage,
    clearAllHistory,
    isLoaded,
  };
}

