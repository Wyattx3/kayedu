"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ModelSelector, type ModelType, type UploadedFile, useAILanguage } from "@/components/ai";
import { FileText, Loader2, Copy, Download, ArrowRight, Check, Sparkles, Clock, BookOpen, PenLine, Paperclip, X, Image, File, Shield, Wand2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePersistedState, useTaskHistory } from "@/hooks/use-persisted-state";
import { HistoryPanel } from "@/components/ui/history-panel";
import ReactMarkdown from "react-markdown";
import { KayLoading } from "@/components/ui/kay-loading";
import { CreditsDialog, useCreditsDialog } from "@/components/ui/credits-dialog";
import { RewardedAd, PreGenerationAd } from "@/components/ads";

const quickTopics = [
  "Climate change impact on ecosystems",
  "Social media effects on mental health",
  "Artificial intelligence in education",
  "Renewable energy solutions",
];

export default function EssayWriterPage() {
  // Persisted state - survives page navigation
  const [topic, setTopic, clearTopic] = usePersistedState("essay-topic", "");
  const [wordCount, setWordCount] = usePersistedState("essay-wordcount", [1000]);
  const [academicLevel, setAcademicLevel] = usePersistedState("essay-level", "igcse");
  const [essayType, setEssayType] = usePersistedState("essay-type", "expository");
  const [citationStyle, setCitationStyle] = usePersistedState("essay-citation", "none");
  const [selectedModel, setSelectedModel] = usePersistedState<ModelType>("essay-model", "fast");
  const [result, setResult, clearResult] = usePersistedState("essay-result", "");
  const [autoHumanize, setAutoHumanize] = usePersistedState("essay-autohumanize", true);
  
  // Non-persisted state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const aiLanguage = useAILanguage();
  const { saveToHistory } = useTaskHistory();
  
  // Credits and Ads state
  const { isOpen: showCreditsDialog, dialogData, showDialog, hideDialog } = useCreditsDialog();
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [showPreAd, setShowPreAd] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "unlimited">("free");

  useEffect(() => setMounted(true), []);
  
  // Fetch user plan
  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch("/api/user/credits");
        if (res.ok) {
          const data = await res.json();
          setUserPlan(data.plan || "free");
        }
      } catch {
        // Default to free
      }
    }
    fetchPlan();
  }, []);
  
  // Handle history item selection
  const handleHistorySelect = (item: { input: string; output: string }) => {
    setTopic(item.input);
    setResult(item.output);
  };

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
      if (fileType === "image" || fileType === "pdf") {
        reader.onload = (event) => {
          const newFile: UploadedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name, type: fileType, size: file.size, dataUrl: event.target?.result as string,
          };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          const newFile: UploadedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name, type: "text", size: file.size, content: event.target?.result as string,
          };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsText(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const humanizeText = async (text: string): Promise<string> => {
    setIsHumanizing(true);
    try {
      const response = await fetch("/api/ai/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          tone: "academic", 
          intensity: "heavy", // Use heavy for maximum undetectability
          preserveMeaning: true,
          model: selectedModel 
        }),
      });
      if (!response.ok) throw new Error("Failed to humanize");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let humanizedText = "";
      
      if (reader) {
        setResult(""); // Clear to show humanized text streaming
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          humanizedText += chunk;
          setResult(humanizedText);
        }
      }
      return humanizedText;
    } finally {
      setIsHumanizing(false);
    }
  };

  // Actual generation logic
  const performGeneration = useCallback(async () => {
    setIsLoading(true);
    setResult("");

    // Build file context and extract images
    let fileContext = "";
    const imageFiles: { data: string; mimeType: string }[] = [];
    
    for (const file of uploadedFiles) {
      if (file.type === "text" && file.content) {
        fileContext += `[File: ${file.name}]\n${file.content.slice(0, 2000)}${file.content.length > 2000 ? '...(truncated)' : ''}\n\n`;
      } else if (file.type === "image" && file.dataUrl) {
        const mimeMatch = file.dataUrl.match(/^data:([^;]+);base64,/);
        if (mimeMatch) {
          imageFiles.push({
            data: file.dataUrl,
            mimeType: mimeMatch[1],
          });
          fileContext += `[Image attached: ${file.name} - I can see this image]\n`;
        }
      } else if (file.type === "pdf") {
        fileContext += `[PDF attached: ${file.name} - Please note I cannot read PDF content directly]\n`;
      }
    }

    try {
      const response = await fetch("/api/ai/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: fileContext ? `${fileContext}\n${topic}${imageFiles.length > 0 ? '\n\nPlease analyze the attached image(s) and write an essay based on what you see.' : ''}` : topic, 
          wordCount: wordCount[0], academicLevel, essayType, citationStyle, 
          model: imageFiles.length > 0 ? "pro-smart" : selectedModel,
          language: aiLanguage,
          images: imageFiles.length > 0 ? imageFiles : undefined,
        }),
      });
      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json();
          // Show credits dialog instead of just a toast
          showDialog(data.creditsNeeded, data.creditsRemaining);
          return;
        }
        throw new Error("Failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let essayText = "";
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          essayText += chunk;
          setResult(essayText);
        }
      }

      // Auto-humanize if enabled
      if (autoHumanize && essayText.length > 100) {
        setIsLoading(false);
        const humanizedText = await humanizeText(essayText);
        // Save to history after humanization
        if (humanizedText) {
          saveToHistory({
            pageType: "essay",
            pageName: "Essay Writer",
            input: topic,
            output: humanizedText.slice(0, 500),
            metadata: { wordCount: wordCount[0], academicLevel, essayType },
          });
        }
      } else if (essayText) {
        // Save to history without humanization
        saveToHistory({
          pageType: "essay",
          pageName: "Essay Writer",
          input: topic,
          output: essayText.slice(0, 500),
          metadata: { wordCount: wordCount[0], academicLevel, essayType },
        });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
      // Dispatch event to update sidebar credits with estimated amount
      const estimatedCredits = Math.max(3, Math.ceil(wordCount[0] / 1000) * 3);
      window.dispatchEvent(new CustomEvent("credits-updated", { detail: { amount: estimatedCredits } }));
    }
  }, [topic, wordCount, academicLevel, essayType, citationStyle, selectedModel, aiLanguage, uploadedFiles, autoHumanize, humanizeText, saveToHistory, showDialog, toast]);

  const handleGenerate = async () => {
    if (!topic.trim() && uploadedFiles.length === 0) {
      toast({ title: "Enter a topic or attach files", variant: "destructive" });
      return;
    }
    
    // For free users, show pre-generation ad before Kabyar loading
    if (userPlan === "free") {
      setShowPreAd(true);
    } else {
      await performGeneration();
    }
  };
  
  // Handle pre-generation ad completion
  const handlePreAdComplete = useCallback(() => {
    setShowPreAd(false);
    performGeneration();
  }, [performGeneration]);
  
  // Handle watching rewarded ad for credits (when insufficient)
  const handleWatchAd = useCallback(() => {
    hideDialog();
    setShowRewardedAd(true);
  }, [hideDialog]);
  
  // Handle rewarded ad completion - add credits and retry generation
  const handleAdComplete = useCallback(async (creditsEarned: number) => {
    setShowRewardedAd(false);
    if (creditsEarned > 0) {
      window.dispatchEvent(new CustomEvent("credits-updated", { detail: { amount: -creditsEarned } }));
    }
    // Small delay to ensure database is updated before retry
    await new Promise(resolve => setTimeout(resolve, 500));
    // Retry generation after getting credits
    performGeneration();
  }, [performGeneration]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEssay = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `essay-${topic.slice(0, 20)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`h-full flex flex-col transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Credits Dialog - shows when insufficient credits */}
      <CreditsDialog
        isOpen={showCreditsDialog}
        onClose={hideDialog}
        creditsNeeded={dialogData.creditsNeeded}
        creditsRemaining={dialogData.creditsRemaining}
        onWatchAd={handleWatchAd}
      />
      
      {/* Rewarded Ad - shows when user chooses to watch ad for credits */}
      <RewardedAd
        isActive={showRewardedAd}
        onComplete={handleAdComplete}
        onClose={() => setShowRewardedAd(false)}
        creditsReward={5}
      />
      
      {/* Pre-Generation Ad - shows before Kabyar loading for free users */}
      <PreGenerationAd
        isActive={showPreAd}
        userPlan={userPlan}
        onComplete={handlePreAdComplete}
        onSkip={() => setShowPreAd(false)}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Essay Writer</h1>
            <p className="text-sm text-gray-500">Generate academic essays with proper structure</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <HistoryPanel pageType="essay" onSelectItem={handleHistorySelect} />
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">~30s</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Academic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-[360px_1fr] gap-4 min-h-0">
        {/* Config Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <PenLine className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-gray-900 text-sm">Configure</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Topic</Label>
                {topic && (
                  <button
                    onClick={() => { clearTopic(); clearResult(); setUploadedFiles([]); }}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Clear input"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Textarea
                placeholder="What should I write about?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
                className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {quickTopics.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setTopic(t)}
                    className="px-2 py-0.5 text-[11px] text-gray-500 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                  >
                    {t.slice(0, 18)}...
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Words</Label>
                <span className="text-base font-bold text-blue-600">{wordCount[0]}</span>
              </div>
              <Slider value={wordCount} onValueChange={setWordCount} min={250} max={3000} step={50} className="[&_[role=slider]]:bg-blue-600" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Level</Label>
                <Select value={academicLevel} onValueChange={setAcademicLevel}>
                  <SelectTrigger className="h-8 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="ged">GED</SelectItem>
                    <SelectItem value="undergraduate">Undergrad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Type</Label>
                <Select value={essayType} onValueChange={setEssayType}>
                  <SelectTrigger className="h-8 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="argumentative">Argumentative</SelectItem>
                    <SelectItem value="expository">Expository</SelectItem>
                    <SelectItem value="narrative">Narrative</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Citation</Label>
              <Select value={citationStyle} onValueChange={setCitationStyle}>
                <SelectTrigger className="h-8 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="apa">APA</SelectItem>
                  <SelectItem value="mla">MLA</SelectItem>
                  <SelectItem value="harvard">Harvard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">AI Model</Label>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
            </div>

            {/* Auto-Humanize Toggle */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Bypass AI Detection</span>
                    <p className="text-xs text-gray-500">Auto-humanize to pass detection tools</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoHumanize(!autoHumanize)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${autoHumanize ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span 
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoHumanize ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Attachments</Label>
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative group flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      {file.type === "image" ? <Image className="w-3.5 h-3.5 text-blue-500" /> : file.type === "pdf" ? <FileText className="w-3.5 h-3.5 text-red-500" /> : <File className="w-3.5 h-3.5 text-gray-500" />}
                      <span className="text-xs text-gray-600 max-w-[80px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(file.id)} className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedFiles.length >= 5}
                className="flex items-center gap-2 px-3 py-2 w-full text-sm text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-blue-300 disabled:opacity-50"
              >
                <Paperclip className="w-4 h-4" />
                <span>Attach files (image, PDF, text)</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf,text/*,.txt,.md" multiple onChange={handleFileSelect} className="hidden" />
            </div>
          </div>

          <div className="p-3 border-t border-gray-100 shrink-0">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || isHumanizing || !topic.trim()}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
              ) : isHumanizing ? (
                <><Wand2 className="mr-2 h-4 w-4 animate-pulse" />Humanizing...</>
              ) : (
                <>Generate<ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
            {autoHumanize && (
              <p className="text-xs text-center text-gray-400 mt-1.5">
                <Shield className="w-3 h-3 inline mr-1" />
                Will auto-humanize after generation
              </p>
            )}
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-sm font-medium text-gray-700">Output</span>
              {result && !isLoading && !isHumanizing && autoHumanize && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <Shield className="w-3 h-3" />
                  Humanized
                </span>
              )}
              {isHumanizing && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full animate-pulse">
                  <Wand2 className="w-3 h-3" />
                  Humanizing...
                </span>
              )}
            </div>
            {result && (
              <div className="flex gap-1.5">
                <button onClick={copyToClipboard} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 rounded border border-gray-200 transition-all">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={downloadEssay} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 rounded border border-gray-200 transition-all">
                  <Download className="w-3 h-3" />Download
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {result ? (
              <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600">
                <ReactMarkdown>{result}</ReactMarkdown>
              </article>
            ) : (
              <div className="h-full flex items-center justify-center">
                {isLoading || isHumanizing ? (
                  <KayLoading message={isHumanizing ? "Humanizing to bypass detection..." : "Crafting your essay..."} dark={false} />
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">Your essay will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
