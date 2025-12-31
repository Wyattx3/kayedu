"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ModelSelector, type ModelType, type UploadedFile, useAILanguage } from "@/components/ai";
import { Wand2, Loader2, Copy, Check, RefreshCw, Sparkles, ArrowRightLeft, Paperclip, X, Image, FileText, File, ShieldCheck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePersistedState, useTaskHistory } from "@/hooks/use-persisted-state";
import { HistoryPanel } from "@/components/ui/history-panel";
import { KayLoading } from "@/components/ui/kay-loading";

const toneOptions = [
  { value: "natural", label: "Natural" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "academic", label: "Academic" },
];

export default function HumanizerPage() {
  // Persisted state - survives page navigation
  const [inputText, setInputText, clearInput] = usePersistedState("humanizer-input", "");
  const [tone, setTone] = usePersistedState("humanizer-tone", "natural");
  const [intensity, setIntensity] = usePersistedState("humanizer-intensity", "heavy");
  const [selectedModel, setSelectedModel] = usePersistedState<ModelType>("humanizer-model", "fast");
  const [result, setResult, clearResult] = usePersistedState("humanizer-result", "");
  const [htmlResult, setHtmlResult, clearHtmlResult] = usePersistedState("humanizer-html", "");
  
  // Non-persisted state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const aiLanguage = useAILanguage();
  const { saveToHistory } = useTaskHistory();

  useEffect(() => setMounted(true), []);
  
  // Handle history item selection
  const handleHistorySelect = (item: { input: string; output: string }) => {
    setInputText(item.input);
    setResult(item.output);
    setHtmlResult("");
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
          const newFile: UploadedFile = { id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: file.name, type: fileType, size: file.size, dataUrl: event.target?.result as string };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setInputText((prev) => prev + (prev ? '\n\n' : '') + content);
          const newFile: UploadedFile = { id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: file.name, type: "text", size: file.size, content };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsText(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleHumanize = async () => {
    if (inputText.trim().length < 50) {
      toast({ title: "Need at least 50 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult("");
    setHtmlResult("");

    try {
      const response = await fetch("/api/ai/humanize-diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: inputText, 
          tone, 
          intensity, 
          model: selectedModel, 
          language: aiLanguage 
        }),
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
      
      const data = await response.json();
      setHtmlResult(data.html);
      setResult(data.plain);
      
      // Save to history
      saveToHistory({
        pageType: "humanizer",
        pageName: "Humanizer",
        input: inputText.slice(0, 200),
        output: data.plain.slice(0, 500),
        metadata: { tone, intensity },
      });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
      // Dispatch event with estimated credits
      const words = inputText.split(/\s+/).length;
      const credits = Math.max(3, Math.ceil(words / 1000) * 3);
      window.dispatchEvent(new CustomEvent("credits-updated", { detail: { amount: credits } }));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`h-full flex flex-col transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Humanizer</h1>
            <p className="text-sm text-gray-500">Transform AI text to human writing</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HistoryPanel pageType="humanizer" onSelectItem={handleHistorySelect} />
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-700">{"<"}15% AI detection score</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="font-medium text-gray-900 text-sm">AI Text</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{inputText.split(/\s+/).filter(Boolean).length} words</span>
                {inputText && (
                  <button
                    onClick={() => { clearInput(); clearResult(); clearHtmlResult(); setUploadedFiles([]); }}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Clear input"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <Textarea
              placeholder="Paste your AI-generated text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
            />

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Tone</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {toneOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`py-1.5 rounded-lg border text-center transition-all text-xs font-medium ${
                      tone === t.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-200 text-gray-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Rewrite Intensity</Label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setIntensity("light")}
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
                    intensity === "light"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-200 text-gray-600"
                  }`}
                >
                  <span className="text-xs font-medium block">Light</span>
                  <span className="text-[10px] text-gray-400">Subtle</span>
                </button>
                <button
                  onClick={() => setIntensity("balanced")}
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
                    intensity === "balanced"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-200 text-gray-600"
                  }`}
                >
                  <span className="text-xs font-medium block">Balanced</span>
                  <span className="text-[10px] text-gray-400">Standard</span>
                </button>
                <button
                  onClick={() => setIntensity("heavy")}
                  className={`py-2 px-2 rounded-lg border text-center transition-all relative ${
                    intensity === "heavy"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-200 text-gray-600"
                  }`}
                >
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded">BEST</span>
                  <span className="text-xs font-medium block">Heavy</span>
                  <span className="text-[10px] text-gray-400">Undetectable</span>
                </button>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">AI Model</Label>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Import Text</Label>
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative group flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      {file.type === "image" ? <Image className="w-3.5 h-3.5 text-blue-500" /> : file.type === "pdf" ? <FileText className="w-3.5 h-3.5 text-red-500" /> : <File className="w-3.5 h-3.5 text-gray-500" />}
                      <span className="text-xs text-gray-600 max-w-[80px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(file.id)} className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadedFiles.length >= 5} className="flex items-center gap-2 px-3 py-2 w-full text-sm text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-blue-300 disabled:opacity-50">
                <Paperclip className="w-4 h-4" /><span>Import from file (text)</span>
              </button>
              <input ref={fileInputRef} type="file" accept="text/*,.txt,.md" multiple onChange={handleFileSelect} className="hidden" />
            </div>
          </div>

          <div className="p-3 border-t border-gray-100 shrink-0">
            <Button
              onClick={handleHumanize}
              disabled={isLoading || inputText.trim().length < 50}
              className="w-full h-10 rounded-lg font-medium shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Humanizing...</>
              ) : (
                <>Humanize<Wand2 className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="font-medium text-gray-900 text-sm">Human Text</span>
              {result && !isLoading && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Humanized
                </span>
              )}
              {isLoading && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing...
                </span>
              )}
            </div>
            {result && (
              <div className="flex gap-1.5">
                <button onClick={copyToClipboard} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 rounded border border-gray-200 transition-all">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={handleHumanize} disabled={isLoading} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 rounded border border-gray-200 transition-all">
                  <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />Retry
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {(result || htmlResult) ? (
              <div>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">AI</span>
                  <ArrowRightLeft className="w-3 h-3 text-gray-300" />
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">Human</span>
                  {htmlResult && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Changes highlighted
                    </span>
                  )}
                </div>
                {htmlResult ? (
                  <div 
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: htmlResult }}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</p>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                {isLoading ? (
                  <KayLoading message="Analyzing and humanizing each sentence..." dark={false} />
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <Wand2 className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">Humanized text will appear here</p>
                    <p className="text-gray-300 text-xs mt-1">Changes will be highlighted in <span className="text-green-600 font-medium">green</span></p>
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
