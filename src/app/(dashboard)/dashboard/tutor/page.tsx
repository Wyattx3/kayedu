"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { C1Component, ThemeProvider } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";
import { useChatHistory, type ChatMessage as ChatMessageType } from "@/hooks/use-chat-history";
import { ModelSelector, type ModelType, type UploadedFile } from "@/components/ai";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Plus,
  Trash2,
  Menu,
  X,
  Sparkles,
  PanelLeftClose,
  ArrowUp,
  Paperclip,
  CircleStop,
  Code2,
  Calculator,
  Languages,
  Zap,
  Brain,
  Image,
  FileText,
  File,
  User,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// Suggestion card component with premium animations
interface SuggestionCardProps {
  icon: React.ReactNode;
  text: string;
  subtext: string;
  delay: number;
  onClick: () => void;
}

function SuggestionCard({ icon, text, subtext, delay, onClick }: SuggestionCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden text-left px-4 py-3 rounded-xl
        bg-white border border-gray-100
        transition-all duration-500 ease-out
        hover:border-blue-200 hover:shadow-[0_4px_20px_rgb(59,130,246,0.1)]
        active:scale-[0.98]
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
      style={{ transitionDelay: isVisible ? '0ms' : `${delay}ms` }}
    >
      {/* Animated background gradient on hover */}
      <div 
        className={`absolute inset-0 bg-blue-50/50 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {/* Icon with float animation */}
      <div className={`
        relative w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center mb-2
        shadow-md shadow-blue-500/20
        transition-all duration-500 ease-out
        ${isHovered ? 'scale-110 rotate-2 shadow-blue-500/30' : ''}
      `}>
        {icon}
      </div>
      
      {/* Content */}
      <div className="relative">
        <h3 className="font-medium text-sm text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors duration-300">
          {text}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">{subtext}</p>
      </div>

      {/* Corner accent */}
      <div className={`
        absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-blue-500/5
        transition-all duration-700 ease-out
        ${isHovered ? 'scale-150 bg-blue-500/10' : 'scale-100'}
      `} />
      
      {/* Arrow indicator */}
      <div className={`
        absolute bottom-3 right-3 w-6 h-6 rounded-full bg-blue-100 
        flex items-center justify-center
        transition-all duration-300
        ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
      `}>
        <ArrowUp className="w-3 h-3 text-blue-600 rotate-45" />
      </div>
    </button>
  );
}

export default function TutorPage() {
  const {
    threads,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    createThread,
    deleteThread,
    addMessage,
    updateMessage,
    isLoaded,
  } = useChatHistory();
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [mounted, setMounted] = useState(false);
  const [hoveredThread, setHoveredThread] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("fast");
  const [usePersonalization, setUsePersonalization] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    name?: string;
    educationLevel?: string;
    learningStyle?: string;
    subjects?: string[];
    school?: string;
    major?: string;
    yearOfStudy?: string;
    studyGoal?: string;
    preferredLanguage?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isStoppedRef = useRef(false);
  const currentAssistantMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Fetch user profile for personalization
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
    
    // Handle browser refresh/close - set stopped flag
    const handleBeforeUnload = () => {
      isStoppedRef.current = true;
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      isStoppedRef.current = true;
    };
  }, []);

  // Stop generation function - abort request and show stopped message
  const stopGeneration = () => {
    // Set stopped flag first
    isStoppedRef.current = true;
    
    // Abort the fetch request to stop server response
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Immediately update the message with stopped indicator
    if (currentAssistantMessageIdRef.current && activeThreadId) {
      updateMessage(activeThreadId, currentAssistantMessageIdRef.current, "[[STOPPED]]");
    }
    
    // Clear states
    setIsLoading(false);
    setStreamingContent("");
    setStreamingMessageId(null);
    currentAssistantMessageIdRef.current = null;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, streamingContent]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);


  const getFileType = (file: File): "image" | "pdf" | "text" | null => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) return "text";
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - uploadedFiles.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToProcess) {
      const fileType = getFileType(file);
      if (!fileType) continue;

      const reader = new FileReader();
      
      if (fileType === "image") {
        reader.onload = (event) => {
          const newFile: UploadedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: "image",
            size: file.size,
            dataUrl: event.target?.result as string,
          };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsDataURL(file);
      } else if (fileType === "text") {
        reader.onload = (event) => {
          const newFile: UploadedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: "text",
            size: file.size,
            content: event.target?.result as string,
          };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsText(file);
      } else if (fileType === "pdf") {
        reader.onload = (event) => {
          const newFile: UploadedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: "pdf",
            size: file.size,
            dataUrl: event.target?.result as string,
          };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsDataURL(file);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const remainingSlots = 5 - uploadedFiles.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      for (const file of filesToProcess) {
        const fileType = getFileType(file);
        if (!fileType) continue;

        const reader = new FileReader();
        
        if (fileType === "image") {
          reader.onload = (event) => {
            const newFile: UploadedFile = {
              id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              type: "image",
              size: file.size,
              dataUrl: event.target?.result as string,
            };
            setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
          };
          reader.readAsDataURL(file);
        } else if (fileType === "text") {
          reader.onload = (event) => {
            const newFile: UploadedFile = {
              id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              type: "text",
              size: file.size,
              content: event.target?.result as string,
            };
            setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
          };
          reader.readAsText(file);
        } else if (fileType === "pdf") {
          reader.onload = (event) => {
            const newFile: UploadedFile = {
              id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              type: "pdf",
              size: file.size,
              dataUrl: event.target?.result as string,
            };
            setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const sendMessage = async (content: string) => {
    if ((!content.trim() && uploadedFiles.length === 0) || isLoading) return;

    // Cancel any existing request before starting new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Reset stopped flag for new message
    isStoppedRef.current = false;

    let threadId = activeThreadId;
    if (!threadId) threadId = createThread();

    // Extract image URLs for display
    const imageUrls = uploadedFiles.filter(f => f.type === "image").map(f => f.dataUrl!);

    const userMessageId = addMessage(threadId, {
      role: "user",
      content: content.trim(),
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    });

    setInput("");
    const currentFiles = [...uploadedFiles];
    setUploadedFiles([]);
    setIsLoading(true);
    setStreamingContent("");

    const assistantMessageId = addMessage(threadId, { role: "assistant", content: "" });
    setStreamingMessageId(assistantMessageId);
    currentAssistantMessageIdRef.current = assistantMessageId;

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      let messageContent = content.trim();
      
      // Build file context
      const fileDescriptions: string[] = [];
      for (const file of currentFiles) {
        if (file.type === "image") {
          fileDescriptions.push(`[Image: ${file.name}]`);
        } else if (file.type === "pdf") {
          fileDescriptions.push(`[PDF: ${file.name}]`);
        } else if (file.type === "text" && file.content) {
          fileDescriptions.push(`[Text file: ${file.name}]\n\`\`\`\n${file.content.slice(0, 2000)}${file.content.length > 2000 ? '...(truncated)' : ''}\n\`\`\``);
        }
      }
      
      if (fileDescriptions.length > 0) {
        messageContent = `${fileDescriptions.join('\n')}\n\n${messageContent}`;
      }

      // Get previous messages for context (exclude the current empty assistant message)
      const previousMessages = messages
        .filter(m => m.content && m.content !== "[[STOPPED]]")
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/ai/thesys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { role: "user", content: messageContent },
          threadId,
          responseId: assistantMessageId,
          model: selectedModel,
          userProfile: usePersonalization ? userProfile : null,
          chatHistory: previousMessages,
        }),
        signal,
      });

      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json();
          toast({ 
            title: "Insufficient Credits", 
            description: `You need ${data.creditsNeeded} credits but have ${data.creditsRemaining} remaining.`,
            variant: "destructive" 
          });
          return;
        }
        throw new Error("Failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Check if stopped by user or message ID changed (new request started)
            if (isStoppedRef.current || currentAssistantMessageIdRef.current !== assistantMessageId) {
              reader.cancel().catch(() => {});
              return; // Exit immediately
            }
            
            fullContent += decoder.decode(value);
            setStreamingContent(fullContent);
          }
        } catch (e) {
          // Handle errors during read - if stopped, just return
          if (isStoppedRef.current) {
            return;
          }
          // Ignore abort errors
          if (e instanceof Error && (e.name === "AbortError" || e.message.includes("aborted"))) {
            return;
          }
            throw e;
        }
      }
      
      // Only update if not stopped, has content, and message ID still matches
      if (!isStoppedRef.current && fullContent && currentAssistantMessageIdRef.current === assistantMessageId) {
        updateMessage(threadId, assistantMessageId, fullContent);
      }
    } catch (e) {
      // If stopped, don't show error
      if (isStoppedRef.current) {
        return;
      }
      // Handle abort errors gracefully
      if (e instanceof Error && (e.name === "AbortError" || e.message.includes("aborted"))) {
        return;
      }
      updateMessage(threadId, assistantMessageId, "Something went wrong. Please try again.");
    } finally {
      // Only clean up if not already cleaned up by stopGeneration
      if (!isStoppedRef.current) {
      setIsLoading(false);
      setStreamingContent("");
      setStreamingMessageId(null);
      window.dispatchEvent(new CustomEvent("credits-updated", { detail: { amount: 3 } }));
      }
      currentAssistantMessageIdRef.current = null;
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNewChat = () => {
    if (activeThread && activeThread.messages.length === 0) {
      setSidebarMobileOpen(false);
      return;
    }
    const emptyThread = threads.find(t => t.messages.length === 0);
    if (emptyThread) {
      setActiveThreadId(emptyThread.id);
      setSidebarMobileOpen(false);
      return;
    }
    createThread();
    setSidebarMobileOpen(false);
  };

  const messages = activeThread?.messages || [];
  const hasMessages = messages.length > 0;

  const suggestions = [
    { icon: <Code2 className="w-4 h-4 text-white" />, text: "Python Basics", subtext: "Learn list comprehensions and more", prompt: "Explain Python list comprehensions with examples" },
    { icon: <Brain className="w-4 h-4 text-white" />, text: "Science", subtext: "Explore how nature works", prompt: "How does photosynthesis work?" },
    { icon: <Calculator className="w-4 h-4 text-white" />, text: "Mathematics", subtext: "Solve equations step by step", prompt: "Solve x² + 5x + 6 = 0 step by step" },
    { icon: <Languages className="w-4 h-4 text-white" />, text: "Languages", subtext: "Master grammar and vocabulary", prompt: "Teach me English tenses with examples" },
  ];

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 lg:left-[260px] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-4 rounded-3xl border-2 border-blue-200 animate-ping opacity-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 lg:left-[260px] flex bg-white transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Premium Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 lg:left-[260px] z-[100] backdrop-blur-sm bg-blue-500/5 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/20 px-12 py-10 flex flex-col items-center gap-4 border-2 border-dashed border-blue-400 animate-scale-in">
            <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Paperclip className="w-10 h-10 text-white" />
            </div>
            <p className="text-xl font-semibold text-gray-900">Drop images here</p>
            <p className="text-sm text-gray-500">Up to 5 images</p>
          </div>
        </div>
      )}

      {sidebarMobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 h-full bg-[#fafafa] border-r border-gray-100
        flex flex-col transition-all duration-300 shrink-0
        ${sidebarOpen ? "w-64" : "w-0 lg:w-0"}
        ${sidebarMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${!sidebarOpen && "lg:hidden"}
      `}>
        <div className="flex items-center justify-between p-3 h-14 border-b border-gray-100">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-200 shadow-sm border border-gray-100"
          >
            <Plus className="w-4 h-4" />
            <span>New chat</span>
          </button>
          <button onClick={() => { setSidebarOpen(false); setSidebarMobileOpen(false); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors lg:flex hidden">
            <PanelLeftClose className="w-4 h-4" />
          </button>
          <button onClick={() => setSidebarMobileOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {threads.filter(t => t.messages.length > 0).length === 0 ? (
            <div className="px-3 py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400">Start a conversation</p>
            </div>
          ) : (
            <div className="space-y-1">
              {threads.filter(t => t.messages.length > 0).map((thread) => (
                <div
                  key={thread.id}
                  onMouseEnter={() => setHoveredThread(thread.id)}
                  onMouseLeave={() => setHoveredThread(null)}
                  onClick={() => { setActiveThreadId(thread.id); setSidebarMobileOpen(false); }}
                  className={`
                    group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
                    transition-all duration-200
                    ${activeThreadId === thread.id ? "bg-white shadow-sm border border-gray-100" : "hover:bg-white/60"}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeThreadId === thread.id ? "bg-blue-500" : "bg-gray-100"}`}>
                    <MessageSquare className={`w-4 h-4 ${activeThreadId === thread.id ? "text-white" : "text-gray-400"}`} />
                  </div>
                  <span className="flex-1 text-sm text-gray-700 truncate font-medium">{thread.title}</span>
                  {(hoveredThread === thread.id || activeThreadId === thread.id) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-white">

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* Premium Empty State */
            <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
              {/* Hero Section */}
              <div className={`text-center mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="relative inline-block mb-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-[3px] border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  What can I help you learn?
                </h1>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Ask me anything — from coding to science, math to languages. I&apos;m here to help.
                </p>
              </div>
              
              {/* Premium Suggestion Cards */}
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                {suggestions.map((item, i) => (
                  <SuggestionCard
                    key={i}
                    icon={item.icon}
                    text={item.text}
                    subtext={item.subtext}
                    delay={200 + i * 100}
                    onClick={() => sendMessage(item.prompt)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-8">
              <ThemeProvider mode="light">
                {messages.map((message, index) => (
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    isStreaming={message.id === streamingMessageId}
                    streamingContent={message.id === streamingMessageId ? streamingContent : undefined}
                    index={index}
                  />
                ))}
              </ThemeProvider>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Premium Input Area */}
        <div className="shrink-0 pb-6 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Model Selector & Personalization Toggle */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              
              {/* Personalization Toggle */}
              <button
                onClick={() => setUsePersonalization(!usePersonalization)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-300 border
                  ${usePersonalization 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}
                `}
                title={usePersonalization ? "AI uses your profile for personalized answers" : "AI gives general answers"}
              >
                <User className={`w-4 h-4 ${usePersonalization ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="hidden sm:inline">
                  {usePersonalization ? 'Personalized' : 'General'}
                </span>
                {usePersonalization ? (
                  <ToggleRight className="w-5 h-5 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-3 p-3 bg-gray-50 rounded-2xl">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="relative group flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    {file.type === "image" && file.dataUrl ? (
                      <img src={file.dataUrl} alt={file.name} className="h-12 w-12 object-cover rounded-lg" />
                    ) : (
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        file.type === "pdf" ? "bg-red-50" : "bg-gray-50"
                      }`}>
                        {file.type === "pdf" ? (
                          <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                          <File className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 max-w-[100px]">
                      <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {file.size < 1024 ? `${file.size} B` : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {uploadedFiles.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-16 w-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={`
                relative flex items-end rounded-2xl transition-all duration-300
                ${inputFocused ? 'bg-white shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20' : 'bg-gray-100 shadow-sm'}
              `}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadedFiles.length >= 5}
                  className="shrink-0 p-4 text-gray-400 hover:text-blue-500 disabled:text-gray-300 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*,application/pdf,text/*,.txt,.md,.json,.csv" 
                  multiple 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Ask me anything..."
                  rows={1}
                  className="flex-1 bg-transparent border-0 resize-none text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 py-4 pr-2 max-h-[200px]"
                />

                <div className="shrink-0 p-3">
                  {isLoading ? (
                    <button 
                      type="button" 
                      onClick={stopGeneration}
                      className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-all duration-200"
                      title="Stop generation"
                    >
                      <CircleStop className="w-5 h-5 text-white" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim() && uploadedFiles.length === 0}
                      className="w-10 h-10 rounded-xl bg-blue-500 disabled:bg-gray-200 flex items-center justify-center hover:bg-blue-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:shadow-none hover:scale-105 active:scale-95"
                    >
                      <ArrowUp className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Premium Chat Message Component */
interface ChatMessageItemProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  streamingContent?: string;
  index: number;
}

function ChatMessageItem({ message, isStreaming, streamingContent, index }: ChatMessageItemProps) {
  const content = isStreaming ? streamingContent || "" : message.content;
  const isUser = message.role === "user";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`py-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex gap-4">
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${isUser ? "bg-blue-500 shadow-blue-500/30" : "bg-white border border-gray-100"}`}>
          {isUser ? (
            <span className="text-white text-sm font-bold">U</span>
          ) : (
            <Sparkles className="w-5 h-5 text-blue-500" />
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <p className="text-sm font-semibold text-gray-900 mb-2">{isUser ? "You" : "AI"}</p>

          {message.imageUrls && message.imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {message.imageUrls.map((img, i) => (
                <img key={i} src={img} alt={`Attached ${i + 1}`} className="max-h-56 rounded-xl border border-gray-100 shadow-sm object-cover" />
              ))}
            </div>
          )}
          {message.imageUrl && !message.imageUrls && (
            <img src={message.imageUrl} alt="Attached" className="max-h-64 rounded-xl mb-4 border border-gray-100 shadow-sm" />
          )}

          {isUser ? (
            <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : content === "[[STOPPED]]" ? (
            // Stopped message - show in red
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <CircleStop className="w-5 h-5 text-red-500" />
              <span className="text-red-600 font-medium text-sm">AI response stopped</span>
            </div>
          ) : content ? (
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-0.5 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl text-gray-700 text-[15px] leading-relaxed">
              <C1Component c1Response={content} isStreaming={isStreaming || false} />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 py-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
