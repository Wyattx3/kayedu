"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { type UploadedFile, ModelSelector, type ModelType } from "@/components/ai";
import { ProfessionalSlides, type ProfessionalSlide } from "@/components/slides/ProfessionalSlides";
import { Presentation, Layers, Paperclip, X, Image, FileText, File, Sparkles, RefreshCw, Zap, BarChart3, Layout, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KayLoading } from "@/components/ui/kay-loading";

const styleOptions = [
  { value: "professional", label: "Professional", color: "#1e40af", desc: "Corporate & elegant" },
  { value: "modern", label: "Modern", color: "#7c3aed", desc: "Futuristic & tech" },
  { value: "minimal", label: "Minimal", color: "#6b7280", desc: "Clean & simple" },
  { value: "creative", label: "Creative", color: "#dc2626", desc: "Bold & vibrant" },
];

export default function PresentationPage() {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState([8]);
  const [style, setStyle] = useState<"professional" | "modern" | "minimal" | "creative">("professional");
  const [model, setModel] = useState<ModelType>("fast");
  const [audience, setAudience] = useState("students");
  const [details, setDetails] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [slides, setSlides] = useState<ProfessionalSlide[]>([]);
  const [colors, setColors] = useState<string[]>(["#1e40af", "#3b82f6"]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState({ step: "", percent: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  useEffect(() => setMounted(true), []);

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPPTX = async () => {
    if (slides.length === 0) return;
    
    setIsExporting(true);
    try {
      const response = await fetch("/api/ai/slides/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides, topic, style, colors }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${topic.replace(/[^a-zA-Z0-9]/g, "_")}_presentation.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "PowerPoint downloaded!" });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Failed to export", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
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
          const newFile: UploadedFile = { id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: file.name, type: "text", size: file.size, content: event.target?.result as string };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsText(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleGenerate = async () => {
    if (!topic.trim() && uploadedFiles.length === 0) {
      toast({ title: "Enter a topic or attach files", variant: "destructive" });
      return;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setSlides([]);
    setProgress({ step: "Analyzing topic...", percent: 10 });

    let fileContext = "";
    for (const file of uploadedFiles) {
      if (file.type === "text" && file.content) {
        fileContext += `[File: ${file.name}]\n${file.content.slice(0, 2000)}${file.content.length > 2000 ? '...' : ''}\n\n`;
      } else {
        fileContext += `[Attached: ${file.name}]\n`;
      }
    }

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev.percent < 30) return { step: "Generating slide content...", percent: prev.percent + 5 };
          if (prev.percent < 60) return { step: "Creating data visualizations...", percent: prev.percent + 3 };
          if (prev.percent < 85) return { step: "Generating images...", percent: prev.percent + 2 };
          return { step: "Finalizing presentation...", percent: Math.min(prev.percent + 1, 95) };
        });
      }, 500);

      const response = await fetch("/api/ai/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: fileContext ? `${fileContext}\n${topic}` : topic, 
          slideCount: slideCount[0], 
          style, 
          audience, 
          details, 
          model,
        }),
        signal: abortControllerRef.current.signal,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 402) {
          toast({ 
            title: "Insufficient Credits", 
            description: `You need ${error.creditsNeeded} credits but have ${error.creditsRemaining} remaining.`,
            variant: "destructive" 
          });
          setProgress({ step: "", percent: 0 });
          return;
        }
        throw new Error(error.error || "Failed to generate slides");
      }

      const data = await response.json();
      setSlides(data.slides);
      setColors(data.colors || ["#1e40af", "#3b82f6"]);
      setProgress({ step: "Complete!", percent: 100 });
      
      toast({ 
        title: `${data.slides.length} slides generated!`,
        description: "Use arrow keys to navigate, F for fullscreen"
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setProgress({ step: "", percent: 0 });
        return;
      }
      console.error("Generation error:", error);
      toast({ title: error instanceof Error ? error.message : "Something went wrong", variant: "destructive" });
      setProgress({ step: "", percent: 0 });
    } finally {
      setIsLoading(false);
      // Slides: estimate ~500 words per slide
      const credits = Math.max(3, Math.ceil((slideCount[0] * 500) / 1000) * 3);
      window.dispatchEvent(new CustomEvent("credits-updated", { detail: { amount: credits } }));
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setProgress({ step: "", percent: 0 });
    }
  };

  return (
    <div className={`h-full flex flex-col transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Presentation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI Presentation</h1>
            <p className="text-sm text-gray-500">Professional slides with charts & AI images</p>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-[320px_1fr] gap-4 min-h-0">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <Layout className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-gray-900 text-sm">Configure Slides</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Topic</Label>
              <Input
                placeholder="e.g., Climate Change Solutions"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Slides</Label>
                <span className="text-lg font-bold text-blue-600">{slideCount[0]}</span>
              </div>
              <Slider value={slideCount} onValueChange={setSlideCount} min={4} max={15} step={1} className="[&_[role=slider]]:bg-blue-600" />
              <p className="text-xs text-gray-400 mt-1">Includes title, content, charts, and closing slides</p>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Style</Label>
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value as any)}
                    className={`py-3 px-3 rounded-xl border text-left transition-all ${
                      style === s.value
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                        : "border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: s.color }} />
                      <span className={`text-sm font-medium ${style === s.value ? "text-blue-700" : "text-gray-700"}`}>
                    {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">AI Model</Label>
              <ModelSelector value={model} onChange={setModel} />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="h-9 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers / Educators</SelectItem>
                  <SelectItem value="business">Business / Corporate</SelectItem>
                  <SelectItem value="investors">Investors / Pitch</SelectItem>
                  <SelectItem value="general">General Audience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Additional Details</Label>
              <Textarea
                placeholder="Key points, data to include, specific charts..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Reference Files</Label>
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative group flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      {file.type === "image" ? <Image className="w-3.5 h-3.5 text-blue-500" /> : file.type === "pdf" ? <FileText className="w-3.5 h-3.5 text-red-500" /> : <File className="w-3.5 h-3.5 text-gray-500" />}
                      <span className="text-xs text-gray-600 max-w-[60px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(file.id)} className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadedFiles.length >= 5} className="flex items-center gap-2 px-3 py-2 w-full text-sm text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-blue-300 disabled:opacity-50">
                <Paperclip className="w-4 h-4" /><span>Attach files</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf,text/*,.txt,.md" multiple onChange={handleFileSelect} className="hidden" />
            </div>
          </div>

          <div className="p-3 border-t border-gray-100 shrink-0 space-y-2">
            {isLoading ? (
              <>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{progress.step}</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              <Button
                onClick={handleStop}
                variant="outline"
                className="w-full h-10 border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="mr-2 h-4 w-4" />Stop Generation
              </Button>
              </>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!topic.trim() && uploadedFiles.length === 0}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                <Sparkles className="mr-2 h-4 w-4" />Generate Presentation
              </Button>
            )}
            
            {slides.length > 0 && !isLoading && (
              <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                variant="outline"
                  className="flex-1 h-9 text-sm"
              >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Regenerate
                </Button>
                <Button
                  onClick={handleDownloadPPTX}
                  disabled={isExporting}
                  className="flex-1 h-9 text-sm bg-green-600 hover:bg-green-700"
                >
                  {isExporting ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  .pptx
              </Button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-sm font-medium text-gray-300">Presentation Preview</span>
            </div>
            {slides.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{slides.length} slides</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs font-medium text-green-400">Ready</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {slides.length > 0 ? (
              <ProfessionalSlides slides={slides} colors={colors} style={style} />
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                {isLoading ? (
                  <KayLoading message={progress.step || "Generating your presentation..."} />
                ) : (
                  <div className="text-center max-w-lg">
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center mx-auto mb-6 border border-gray-600">
                      <Presentation className="w-14 h-14 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Create Professional Presentations</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                      Enter a topic and let AI generate stunning slides with charts, images, and animations.
                    </p>
                    
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                        <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">AI Content</p>
                        <p className="text-[10px] text-gray-500">Smart</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                        <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">AI Images</p>
                        <p className="text-[10px] text-gray-500">Generated</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                        <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Charts</p>
                        <p className="text-[10px] text-gray-500">Dynamic</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                        <Layout className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Layouts</p>
                        <p className="text-[10px] text-gray-500">Professional</p>
                      </div>
                    </div>
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
