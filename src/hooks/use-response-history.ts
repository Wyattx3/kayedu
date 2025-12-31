"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "kabyar-response-history";
const MAX_HISTORY_DAYS = 30;

export interface HistoryItem {
  id: string;
  type: "essay" | "answer" | "homework" | "study-guide" | "humanizer" | "presentation" | "detect";
  input: string;
  output: string;
  model?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface ResponseHistory {
  items: HistoryItem[];
  lastCleanup: number;
}

export function useResponseHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: ResponseHistory = JSON.parse(stored);
        
        // Clean up old entries (older than 30 days)
        const thirtyDaysAgo = Date.now() - (MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000);
        const validItems = data.items.filter(item => item.timestamp > thirtyDaysAgo);
        
        // Update storage if we cleaned up items
        if (validItems.length !== data.items.length) {
          const newData: ResponseHistory = {
            items: validItems,
            lastCleanup: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        }
        
        setHistory(validItems);
      }
    } catch (error) {
      console.error("Failed to load response history:", error);
    }
  }, []);

  // Save a new response to history
  const saveResponse = useCallback((item: Omit<HistoryItem, "id" | "timestamp">) => {
    if (!mounted) return;
    
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 100); // Keep max 100 items
      
      // Save to localStorage
      try {
        const data: ResponseHistory = {
          items: updated,
          lastCleanup: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save response history:", error);
      }
      
      return updated;
    });

    return newItem.id;
  }, [mounted]);

  // Get history by type
  const getHistoryByType = useCallback((type: HistoryItem["type"]) => {
    return history.filter(item => item.type === type);
  }, [history]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear response history:", error);
    }
  }, []);

  // Delete a specific item
  const deleteItem = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      
      try {
        const data: ResponseHistory = {
          items: updated,
          lastCleanup: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to update response history:", error);
      }
      
      return updated;
    });
  }, []);

  return {
    history,
    saveResponse,
    getHistoryByType,
    clearHistory,
    deleteItem,
    mounted,
  };
}
