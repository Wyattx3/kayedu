"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_PREFIX = "kabyar-page-";
const HISTORY_KEY = "kabyar-task-history";
const MAX_HISTORY_ITEMS = 50;
const HISTORY_DAYS = 30;

export interface TaskHistoryItem {
  id: string;
  pageType: string;
  pageName: string;
  input: string;
  output: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Hook to persist state to localStorage
 * State survives page navigation and browser refresh
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Invalid JSON, use initial
    }
    return initialValue;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage full or unavailable
    }
  }, [state, storageKey]);

  // Clear function
  const clear = useCallback(() => {
    setState(initialValue);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }, [initialValue, storageKey]);

  return [state, setState, clear];
}

/**
 * Hook to manage task history
 */
export function useTaskHistory() {
  const [history, setHistory] = useState<TaskHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load history on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const items: TaskHistoryItem[] = JSON.parse(stored);
        // Clean old items (older than 30 days)
        const cutoff = Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000;
        const validItems = items.filter(item => item.timestamp > cutoff);
        if (validItems.length !== items.length) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(validItems));
        }
        setHistory(validItems);
      }
    } catch {
      // Invalid storage
    }
  }, []);

  // Save a completed task to history
  const saveToHistory = useCallback((item: Omit<TaskHistoryItem, "id" | "timestamp">) => {
    if (typeof window === "undefined") return;
    
    const newItem: TaskHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Read existing history directly from localStorage to avoid stale state
    let existingHistory: TaskHistoryItem[] = [];
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        existingHistory = JSON.parse(stored);
      }
    } catch {
      // Invalid storage, start fresh
    }

    // Add new item at the beginning, limit to max items
    const updated = [newItem, ...existingHistory].slice(0, MAX_HISTORY_ITEMS);
    
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Storage full
    }
    
    // Update React state too
    setHistory(updated);

    return newItem.id;
  }, []);

  // Get history by page type - read from localStorage for freshest data
  const getHistoryByPage = useCallback((pageType: string) => {
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const items: TaskHistoryItem[] = JSON.parse(stored);
        return items.filter(item => item.pageType === pageType);
      }
    } catch {
      // Invalid storage
    }
    return [];
  }, []);

  // Delete a history item
  const deleteHistoryItem = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    
    // Read from localStorage directly
    let existingHistory: TaskHistoryItem[] = [];
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        existingHistory = JSON.parse(stored);
      }
    } catch {
      // Invalid storage
    }

    const updated = existingHistory.filter(item => item.id !== id);
    
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    
    setHistory(updated);
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    history,
    saveToHistory,
    getHistoryByPage,
    deleteHistoryItem,
    clearHistory,
    mounted,
  };
}

/**
 * Page names for display
 */
export const PAGE_NAMES: Record<string, string> = {
  essay: "Essay Writer",
  humanizer: "Humanizer",
  answer: "Answer Finder",
  homework: "Homework Help",
  "study-guide": "Study Guide",
  detector: "AI Detector",
  presentation: "Presentations",
};
