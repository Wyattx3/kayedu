"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ModelSelector, type ModelType, type UploadedFile } from "@/components/ai";
import { Presentation, Loader2, ArrowRight, Download, Layers, Paperclip, X, Image, FileText, File, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const styleOptions = [
  { value: "professional", label: "Pro", bgColor: "#1e3a5f", textColor: "#ffffff", accentColor: "#3b82f6" },
  { value: "modern", label: "Modern", bgColor: "#0f172a", textColor: "#ffffff", accentColor: "#6366f1" },
  { value: "minimal", label: "Minimal", bgColor: "#ffffff", textColor: "#1f2937", accentColor: "#2563eb" },
  { value: "creative", label: "Creative", bgColor: "#7c3aed", textColor: "#ffffff", accentColor: "#fbbf24" },
];

interface SlideData {
  title: string;
  bullets: string[];
  notes?: string;
}

export default function PresentationPage() {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState([10]);
  const [style, setStyle] = useState("professional");
  const [audience, setAudience] = useState("students");
  const [details, setDetails] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelType>("normal");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPptx, setIsGeneratingPptx] = useState(false);
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
          const newFile: UploadedFile = { id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: file.name, type: "text", size: file.size, content: event.target?.result as string };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsText(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  // Parse AI response into slides
  const parseSlides = (text: string): SlideData[] => {
    const slideBlocks = text.split(/---+/).filter(block => block.trim());
    const parsedSlides: SlideData[] = [];

    for (const block of slideBlocks) {
      const lines = block.trim().split('\n').filter(l => l.trim());
      let title = '';
      const bullets: string[] = [];
      let notes = '';

      for (const line of lines) {
        const trimmed = line.trim();
        // Title detection
        if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('**Slide')) {
          title = trimmed.replace(/^#+\s*/, '').replace(/^\*\*Slide.*?:\s*/, '').replace(/\*\*/g, '').trim();
        }
        // Bullet points
        else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.match(/^\d+\./)) {
          const bullet = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
          if (bullet && !bullet.toLowerCase().includes('speaker note') && !bullet.toLowerCase().includes('visual')) {
            bullets.push(bullet);
          }
        }
        // Notes
        else if (trimmed.toLowerCase().includes('note:') || trimmed.toLowerCase().includes('speaker')) {
          notes = trimmed.replace(/.*notes?:\s*/i, '').trim();
        }
      }

      if (title || bullets.length > 0) {
        parsedSlides.push({ title: title || `Slide ${parsedSlides.length + 1}`, bullets: bullets.slice(0, 6), notes });
      }
    }

    // If parsing failed, create slides from text chunks
    if (parsedSlides.length === 0) {
      const chunks = text.split('\n\n').filter(c => c.trim());
      for (let i = 0; i < Math.min(chunks.length, slideCount[0]); i++) {
        parsedSlides.push({
          title: `Slide ${i + 1}`,
          bullets: chunks[i].split('\n').filter(l => l.trim()).slice(0, 5),
        });
      }
    }

    return parsedSlides;
  };

  const handleGenerate = async () => {
    if (!topic.trim() && uploadedFiles.length === 0) {
      toast({ title: "Enter a topic or attach files", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSlides([]);
    setCurrentSlide(0);

    let fileContext = "";
    for (const file of uploadedFiles) {
      if (file.type === "text" && file.content) {
        fileContext += `[File: ${file.name}]\n${file.content.slice(0, 2000)}${file.content.length > 2000 ? '...' : ''}\n\n`;
      } else {
        fileContext += `[Attached: ${file.name}]\n`;
      }
    }

    try {
      const response = await fetch("/api/ai/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: fileContext ? `${fileContext}\n${topic}` : topic, 
          slides: slideCount[0], 
          style, 
          audience, 
          details, 
          model: selectedModel 
        }),
      });
      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value);
        }
      }

      const parsedSlides = parseSlides(fullText);
      if (parsedSlides.length === 0) {
        throw new Error("Failed to parse slides");
      }
      setSlides(parsedSlides);
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPptx = async () => {
    if (slides.length === 0) return;
    setIsGeneratingPptx(true);

    try {
      const response = await fetch("/api/ai/presentation/generate-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, slides, style }),
      });

      if (!response.ok) throw new Error("Failed to generate PPTX");

      const result = await response.json();
      
      // Convert base64 to blob and download
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "PowerPoint downloaded!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to create PowerPoint", variant: "destructive" });
    } finally {
      setIsGeneratingPptx(false);
    }
  };

  const currentStyleConfig = styleOptions.find(s => s.value === style) || styleOptions[0];

  return (
    <div className={`h-full flex flex-col transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Presentation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Presentation</h1>
            <p className="text-sm text-gray-500">Create & download real PowerPoint slides</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full">
          <Download className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-medium text-green-700">.PPTX Export</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-[320px_1fr] gap-4 min-h-0">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <Presentation className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-gray-900 text-sm">Configure</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Topic</Label>
              <Input
                placeholder="e.g., Climate Change, AI Ethics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Slides</Label>
                <span className="text-base font-bold text-blue-600">{slideCount[0]}</span>
              </div>
              <Slider value={slideCount} onValueChange={setSlideCount} min={5} max={20} step={1} className="[&_[role=slider]]:bg-blue-600" />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Style</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {styleOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`py-2 rounded-lg border text-center transition-all text-xs font-medium relative overflow-hidden ${
                      style === s.value
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="w-full h-2 mb-1" style={{ backgroundColor: s.bgColor }} />
                    <span className="text-gray-700">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="h-8 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Key Points</Label>
              <Textarea
                placeholder="Main points to cover..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">AI Model</Label>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Attachments</Label>
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

          <div className="p-3 border-t border-gray-100 shrink-0">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || (!topic.trim() && uploadedFiles.length === 0)}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Slides...</>
              ) : (
                <>Generate Slides<ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Slide Preview Panel */}
        <div className="bg-gray-900 rounded-xl overflow-hidden flex flex-col">
          {/* Preview Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">
                {slides.length > 0 ? `Slide ${currentSlide + 1} of ${slides.length}` : 'Preview'}
              </span>
            </div>
            {slides.length > 0 && (
              <Button
                onClick={downloadPptx}
                disabled={isGeneratingPptx}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white h-8"
              >
                {isGeneratingPptx ? (
                  <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Exporting...</>
                ) : (
                  <><Download className="mr-1.5 h-3.5 w-3.5" />Download .PPTX</>
                )}
              </Button>
            )}
          </div>

          {/* Slide Display */}
          <div className="flex-1 flex items-center justify-center p-6">
            {slides.length > 0 ? (
              <div 
                className="w-full max-w-3xl aspect-[16/9] rounded-lg shadow-2xl overflow-hidden relative"
                style={{ backgroundColor: currentStyleConfig.bgColor }}
              >
                {/* Slide Content */}
                <div className="absolute inset-0 p-8 flex flex-col">
                  {/* Title */}
                  <h2 
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ color: currentStyleConfig.textColor }}
                  >
                    {slides[currentSlide]?.title}
                  </h2>
                  
                  {/* Accent line */}
                  <div 
                    className="w-20 h-1 rounded mb-6"
                    style={{ backgroundColor: currentStyleConfig.accentColor }}
                  />
                  
                  {/* Bullets */}
                  <ul className="space-y-3 flex-1">
                    {slides[currentSlide]?.bullets.map((bullet, i) => (
                      <li 
                        key={i} 
                        className="flex items-start gap-3 text-sm md:text-base"
                        style={{ color: currentStyleConfig.textColor }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full mt-2 shrink-0"
                          style={{ backgroundColor: currentStyleConfig.accentColor }}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {/* Slide number */}
                  <div 
                    className="absolute bottom-4 right-6 text-sm opacity-50"
                    style={{ color: currentStyleConfig.textColor }}
                  >
                    {currentSlide + 1} / {slides.length}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                {isLoading ? (
                  <div>
                    <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <Presentation className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Generating slides...</p>
                    <p className="text-gray-500 text-xs mt-1">This may take a moment</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-20 h-20 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-3">
                      <Presentation className="w-10 h-10 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-sm">Your slides will appear here</p>
                    <p className="text-gray-500 text-xs mt-1">Enter a topic and click Generate</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          {slides.length > 0 && (
            <div className="px-4 py-3 bg-gray-800 flex items-center justify-center gap-4 shrink-0">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Slide thumbnails */}
              <div className="flex gap-2 overflow-x-auto max-w-md">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all ${
                      i === currentSlide 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === slides.length - 1}
                className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
