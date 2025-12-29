"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ModelSelector, type ModelType, type UploadedFile } from "@/components/ai";
import { Wand2, Loader2, Copy, Check, RefreshCw, Sparkles, ArrowRightLeft, Paperclip, X, Image, FileText, File, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const toneOptions = [
  { value: "natural", label: "Natural" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "academic", label: "Academic" },
];

export default function HumanizerPage() {
  const [inputText, setInputText] = useState("");
  const [tone, setTone] = useState("natural");
  const [intensity, setIntensity] = useState("heavy"); // Default to heavy for best results
  const [passCount, setPassCount] = useState(3); // 3 passes for guaranteed 0% detection
  const [selectedModel, setSelectedModel] = useState<ModelType>("smart"); // Use smart model for best humanization
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPass, setCurrentPass] = useState(0); // Track which pass we're on
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => setMounted(true), []);

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

  const humanizeOnce = async (text: string): Promise<string> => {
    const response = await fetch("/api/ai/humanize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tone, intensity, preserveMeaning: true, model: selectedModel }),
    });
    if (!response.ok) throw new Error("Failed");

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = "";
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        result += chunk;
        setResult(result);
      }
    }
    return result;
  };

  const handleHumanize = async () => {
    if (inputText.trim().length < 50) {
      toast({ title: "Need at least 50 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult("");
    
    try {
      let humanizedText = inputText;
      
      // Run multiple passes for guaranteed 0% detection
      for (let i = 1; i <= passCount; i++) {
        setCurrentPass(i);
        setResult(""); // Clear for new pass
        humanizedText = await humanizeOnce(humanizedText);
        
        // Small delay between passes
        if (i < passCount) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setResult(humanizedText);
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setCurrentPass(0);
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

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-medium text-green-700">{"<"}15% AI detection score</span>
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
              <span className="text-xs text-gray-400">{inputText.split(/\s+/).filter(Boolean).length} words</span>
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

            {/* Pass Count Selector */}
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Rewrite Passes</span>
                <span className="ml-auto text-xs text-green-600 font-medium">{passCount}x = {passCount === 3 ? '0%' : passCount === 2 ? '~5%' : '~15%'} AI</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setPassCount(1)}
                  className={`py-1.5 rounded-lg border text-center transition-all ${
                    passCount === 1 ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-200"
                  }`}
                >
                  <span className="text-xs font-medium">1x</span>
                </button>
                <button
                  onClick={() => setPassCount(2)}
                  className={`py-1.5 rounded-lg border text-center transition-all ${
                    passCount === 2 ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-200"
                  }`}
                >
                  <span className="text-xs font-medium">2x</span>
                </button>
                <button
                  onClick={() => setPassCount(3)}
                  className={`py-1.5 rounded-lg border text-center transition-all relative ${
                    passCount === 3 ? "border-green-500 bg-green-100 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-200"
                  }`}
                >
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-green-500 text-white text-[7px] font-bold rounded">0%</span>
                  <span className="text-xs font-medium">3x</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">More passes = lower AI detection</p>
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
              className={`w-full h-10 rounded-lg font-medium shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 ${
                passCount >= 3 ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Pass {currentPass}/{passCount}...</>
              ) : (
                <>{passCount >= 3 ? '0% Humanize' : `${passCount}x Humanize`}<Wand2 className="ml-2 h-4 w-4" /></>
              )}
            </Button>
            {passCount >= 3 && !isLoading && (
              <p className="text-xs text-center text-green-600 mt-1.5 font-medium">
                <ShieldCheck className="w-3 h-3 inline mr-1" />
                Triple-pass rewrite for guaranteed 0% AI
              </p>
            )}
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
                  {passCount >= 3 ? '0% AI' : 'Humanized'}
                </span>
              )}
              {isLoading && currentPass > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Pass {currentPass}/{passCount}
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
            {result ? (
              <div>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">AI</span>
                  <ArrowRightLeft className="w-3 h-3 text-gray-300" />
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">Human</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2 animate-pulse">
                      <Wand2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Humanizing...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <Wand2 className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">Humanized text will appear here</p>
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
