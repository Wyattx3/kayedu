"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ModelSelector, type ModelType, type UploadedFile, useAILanguage } from "@/components/ai";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, Scan, Info, Paperclip, X, Image, FileText, File, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KayLoading } from "@/components/ui/kay-loading";

interface DetectionIndicator {
  text: string;
  reason: string;
  startIndex?: number;
  endIndex?: number;
}

interface DetectionResult {
  aiScore: number;
  humanScore: number;
  analysis: string;
  indicators?: DetectionIndicator[];
  suggestions?: string[];
}

export default function AIDetectorPage() {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelType>("fast");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const aiLanguage = useAILanguage();

  useEffect(() => setMounted(true), []);

  // Function to highlight AI-detected phrases in the text
  const getHighlightedText = () => {
    if (!result?.indicators || result.indicators.length === 0) return text;
    
    // Find all occurrences of indicator texts in the original text
    let highlightedParts: { start: number; end: number; reason: string }[] = [];
    
    result.indicators.forEach(indicator => {
      const searchText = indicator.text.toLowerCase();
      const textLower = text.toLowerCase();
      let startPos = 0;
      
      while (true) {
        const index = textLower.indexOf(searchText, startPos);
        if (index === -1) break;
        
        highlightedParts.push({
          start: index,
          end: index + indicator.text.length,
          reason: indicator.reason
        });
        startPos = index + 1;
      }
    });
    
    // Sort by start position and merge overlapping
    highlightedParts.sort((a, b) => a.start - b.start);
    
    return highlightedParts;
  };

  const renderHighlightedText = () => {
    const parts = getHighlightedText();
    if (typeof parts === 'string') return <span>{parts}</span>;
    if (parts.length === 0) return <span>{text}</span>;
    
    const elements: React.ReactNode[] = [];
    let lastEnd = 0;
    
    parts.forEach((part, i) => {
      // Add text before this highlight
      if (part.start > lastEnd) {
        elements.push(
          <span key={`text-${i}`}>{text.slice(lastEnd, part.start)}</span>
        );
      }
      // Add highlighted text
      elements.push(
        <span 
          key={`highlight-${i}`} 
          className="bg-red-100 text-red-700 px-0.5 rounded border-b-2 border-red-400 cursor-help"
          title={part.reason}
        >
          {text.slice(part.start, part.end)}
        </span>
      );
      lastEnd = part.end;
    });
    
    // Add remaining text
    if (lastEnd < text.length) {
      elements.push(<span key="text-end">{text.slice(lastEnd)}</span>);
    }
    
    return <>{elements}</>;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remainingSlots = 5 - uploadedFiles.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    for (const file of filesToProcess) {
      if (!file.type.startsWith("text/") && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) continue;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText((prev) => prev + (prev ? '\n\n' : '') + content);
        const newFile: UploadedFile = { id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: file.name, type: "text", size: file.size, content };
        setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleAnalyze = async () => {
    if (text.trim().length < 50) {
      toast({ title: "Need at least 50 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/ai/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model: selectedModel, language: aiLanguage }),
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
      setResult(await response.json());
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
      const words = text.split(/\s+/).length;
      const credits = Math.max(3, Math.ceil(words / 1000) * 3);
      window.dispatchEvent(new CustomEvent("credits-updated", { detail: { amount: credits } }));
    }
  };

  return (
    <div className={`h-full flex flex-col transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI Detector</h1>
            <p className="text-sm text-gray-500">Analyze content for AI patterns</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">99% accuracy</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-gray-900 text-sm">Input Text</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{text.length} chars</span>
                {text && (
                  <button
                    onClick={() => { setText(""); setUploadedFiles([]); setResult(null); }}
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
              placeholder="Paste text to analyze (min 50 characters)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[180px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 font-mono text-sm"
            />

            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${text.length >= 50 ? "bg-blue-500" : "bg-gray-300"}`}
                style={{ width: `${Math.min(100, (text.length / 50) * 100)}%` }}
              />
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
                      <File className="w-3.5 h-3.5 text-gray-500" />
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
              onClick={handleAnalyze}
              disabled={isLoading || text.trim().length < 50}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</>
              ) : (
                <>Analyze<ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Result Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-gray-900 text-sm">Results</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {result ? (
              <div className="space-y-3">
                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border ${result.aiScore >= 60 ? 'bg-red-50 border-red-200' : result.aiScore >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${result.aiScore >= 60 ? 'text-red-600' : result.aiScore >= 40 ? 'text-amber-600' : 'text-green-600'}`} />
                      <span className="text-xs font-medium text-gray-600">AI Detected</span>
                    </div>
                    <div className={`text-2xl font-bold mb-1.5 ${result.aiScore >= 60 ? 'text-red-600' : result.aiScore >= 40 ? 'text-amber-600' : 'text-green-600'}`}>{result.aiScore}%</div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${result.aiScore >= 60 ? 'bg-red-200' : result.aiScore >= 40 ? 'bg-amber-200' : 'bg-green-200'}`}>
                      <div className={`h-full transition-all duration-1000 ${result.aiScore >= 60 ? 'bg-red-500' : result.aiScore >= 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${result.aiScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">Human</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-700 mb-1.5">{result.humanScore}%</div>
                    <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full bg-gray-600 transition-all duration-1000" style={{ width: `${result.humanScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Highlighted Text Preview */}
                {result.indicators && result.indicators.length > 0 && (
                  <div className="p-3 rounded-lg bg-white border border-red-200">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      <h4 className="text-xs font-semibold text-gray-700 uppercase">Detected AI Patterns</h4>
                      <span className="ml-auto text-xs text-red-500 font-medium">{result.indicators.length} found</span>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto bg-gray-50 p-2 rounded border">
                      {renderHighlightedText()}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Hover over red highlights to see why they were flagged</p>
                  </div>
                )}

                {/* Detected Indicators List */}
                {result.indicators && result.indicators.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Scan className="w-3.5 h-3.5 text-red-600" />
                      <h4 className="text-xs font-semibold text-gray-700 uppercase">AI Fingerprints</h4>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {result.indicators.map((indicator, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="shrink-0 w-5 h-5 rounded bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <div>
                            <span className="font-medium text-red-700 bg-red-100 px-1 rounded">"{indicator.text}"</span>
                            <p className="text-xs text-gray-500 mt-0.5">{indicator.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Info className="w-3.5 h-3.5 text-gray-500" />
                    <h4 className="text-xs font-semibold text-gray-700 uppercase">Analysis</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{result.analysis}</p>
                </div>

                {/* Suggestions */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <h4 className="text-xs font-semibold text-gray-700 uppercase">How to Fix</h4>
                    </div>
                    <ul className="space-y-1.5">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                {isLoading ? (
                  <KayLoading message="Analyzing content..." dark={false} />
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <ShieldCheck className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">Results will appear here</p>
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
