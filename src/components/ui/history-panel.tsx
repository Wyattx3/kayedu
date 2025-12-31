"use client";

import { useState, useEffect, useCallback } from "react";
import { History, X, Clock, FileText, Wand2, Search, BookOpen, GraduationCap, ShieldCheck, Presentation, Trash2, ChevronRight } from "lucide-react";
import { useTaskHistory, PAGE_NAMES, type TaskHistoryItem } from "@/hooks/use-persisted-state";

interface HistoryPanelProps {
  pageType?: string;
  onSelectItem?: (item: TaskHistoryItem) => void;
}

const PAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  essay: FileText,
  humanizer: Wand2,
  answer: Search,
  homework: BookOpen,
  "study-guide": GraduationCap,
  detector: ShieldCheck,
  presentation: Presentation,
};

const HISTORY_KEY = "kabyar-task-history";

export function HistoryPanel({ pageType, onSelectItem }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayHistory, setDisplayHistory] = useState<TaskHistoryItem[]>([]);
  const { deleteHistoryItem, clearHistory, mounted } = useTaskHistory();

  // Load history from localStorage - fresh read every time
  const loadHistory = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const items: TaskHistoryItem[] = JSON.parse(stored);
        const filtered = pageType ? items.filter(item => item.pageType === pageType) : items;
        setDisplayHistory(filtered);
      } else {
        setDisplayHistory([]);
      }
    } catch {
      setDisplayHistory([]);
    }
  }, [pageType]);

  // Load history when panel opens or component mounts
  useEffect(() => {
    if (mounted) {
      loadHistory();
    }
  }, [mounted, loadHistory, isOpen]);

  if (!mounted) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <>
      {/* History Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
        title="View history"
      >
        <History className="w-4 h-4" />
        <span className="hidden sm:inline">History</span>
        {displayHistory.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
            {displayHistory.length}
          </span>
        )}
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Task History</h2>
                  <p className="text-xs text-gray-500">
                    {pageType ? PAGE_NAMES[pageType] : "All tasks"} • Last 30 days
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto">
              {displayHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">No history yet</p>
                  <p className="text-sm text-gray-400">
                    Your completed tasks will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayHistory.map((item) => {
                    const Icon = PAGE_ICONS[item.pageType] || FileText;
                    return (
                      <div
                        key={item.id}
                        className="group px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          onSelectItem?.(item);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {PAGE_NAMES[item.pageType] || item.pageType}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(item.timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                              {truncateText(item.input, 60)}
                            </p>
                            
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {truncateText(item.output, 100)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteHistoryItem(item.id);
                                loadHistory(); // Refresh the list
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {displayHistory.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    if (confirm("Clear all history?")) {
                      clearHistory();
                      loadHistory(); // Refresh the list
                    }
                  }}
                  className="w-full py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear All History
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
