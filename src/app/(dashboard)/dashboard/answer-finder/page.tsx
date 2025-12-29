"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelSelector, type ModelType, type UploadedFile } from "@/components/ai";
import { Search, Loader2, ArrowRight, Copy, Check, Lightbulb, Sparkles, Paperclip, X, Image, FileText, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const suggestions = [
  "Explain quantum entanglement",
  "What causes inflation?",
  "How does photosynthesis work?",
  "What started World War 1?",
];

export default function AnswerFinderPage() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("general");
  const [detailLevel, setDetailLevel] = useState("detailed");
  const [selectedModel, setSelectedModel] = useState<ModelType>("normal");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
          const newFile: UploadedFile = { id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: file.name, type: "text", size: file.size, content: event.target?.result as string };
          setUploadedFiles((prev) => prev.length < 5 ? [...prev, newFile] : prev);
        };
        reader.readAsText(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleSearch = async () => {
    if (!question.trim() && uploadedFiles.length === 0) {
      toast({ title: "Enter a question or attach files", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult("");

    let fileContext = "";
    for (const file of uploadedFiles) {
      if (file.type === "text" && file.content) {
        fileContext += `[File: ${file.name}]\n${file.content.slice(0, 2000)}${file.content.length > 2000 ? '...' : ''}\n\n`;
      } else {
        fileContext += `[Attached: ${file.name}]\n`;
      }
    }

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Subject: ${subject}\nDetail Level: ${detailLevel}\n\n${fileContext}Question: ${question}`,
          mode: "answer",
          model: selectedModel,
        }),
      });
      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setResult((prev) => prev + decoder.decode(value));
        }
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
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
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Answer Finder</h1>
            <p className="text-sm text-gray-500">Get accurate answers instantly</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Instant</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-[340px_1fr] gap-4 min-h-0">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-gray-900 text-sm">Question</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <Textarea
              placeholder="What would you like to know?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="h-8 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Detail</Label>
                <Select value={detailLevel} onValueChange={setDetailLevel}>
                  <SelectTrigger className="h-8 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comprehensive">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                      <span className="text-xs text-gray-600 max-w-[80px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(file.id)} className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadedFiles.length >= 5} className="flex items-center gap-2 px-3 py-2 w-full text-sm text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-blue-300 disabled:opacity-50">
                <Paperclip className="w-4 h-4" /><span>Attach files (image, PDF, text)</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf,text/*,.txt,.md" multiple onChange={handleFileSelect} className="hidden" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-gray-500">Try asking</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(s)}
                    className="px-2 py-0.5 text-[11px] text-gray-500 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                  >
                    {s.slice(0, 22)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-gray-100 shrink-0">
            <Button
              onClick={handleSearch}
              disabled={isLoading || (!question.trim() && uploadedFiles.length === 0)}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Finding...</>
              ) : (
                <>Find Answer<ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-sm font-medium text-gray-700">Answer</span>
            </div>
            {result && (
              <button onClick={copyToClipboard} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 rounded border border-gray-200 transition-all">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {result ? (
              <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600">
                <ReactMarkdown>{result}</ReactMarkdown>
              </article>
            ) : (
              <div className="h-full flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2 animate-pulse">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Finding answer...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">Answer will appear here</p>
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
