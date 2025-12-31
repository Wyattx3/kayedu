"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelSelector, type ModelType, type UploadedFile, useAILanguage } from "@/components/ai";
import { BookOpen, Loader2, ArrowRight, Copy, Check, Calculator, Lightbulb, Paperclip, X, Image, FileText, File, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePersistedState, useTaskHistory } from "@/hooks/use-persisted-state";
import { HistoryPanel } from "@/components/ui/history-panel";
import ReactMarkdown from "react-markdown";
import { KayLoading } from "@/components/ui/kay-loading";

const helpTypes = [
  { value: "solve", label: "Solve" },
  { value: "explain", label: "Explain" },
  { value: "hints", label: "Hints" },
  { value: "check", label: "Check" },
];

export default function HomeworkHelperPage() {
  // Persisted state
  const [problem, setProblem, clearProblem] = usePersistedState("homework-problem", "");
  const [subject, setSubject] = usePersistedState("homework-subject", "general");
  const [level, setLevel] = usePersistedState("homework-level", "igcse");
  const [helpType, setHelpType] = usePersistedState("homework-helptype", "solve");
  const [selectedModel, setSelectedModel] = usePersistedState<ModelType>("homework-model", "fast");
  const [result, setResult, clearResult] = usePersistedState("homework-result", "");
  
  // Non-persisted state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aiLanguage = useAILanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { saveToHistory } = useTaskHistory();

  useEffect(() => setMounted(true), []);
  
  const handleHistorySelect = (item: { input: string; output: string }) => {
    setProblem(item.input);
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

  const handleSolve = async () => {
    if (!problem.trim() && uploadedFiles.length === 0) {
      toast({ title: "Describe your problem or attach files", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult("");

    let fileContext = "";
    const imageFiles: { data: string; mimeType: string }[] = [];
    
    for (const file of uploadedFiles) {
      if (file.type === "text" && file.content) {
        fileContext += `[File: ${file.name}]\n${file.content.slice(0, 2000)}${file.content.length > 2000 ? '...' : ''}\n\n`;
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
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: `Subject: ${subject}\nLevel: ${level}\nHelp Type: ${helpType}\n\n${fileContext}Problem: ${problem}${imageFiles.length > 0 ? '\n\nPlease look at the attached image(s) to help with this homework problem.' : ''}` }
          ],
          feature: "homework",
          model: imageFiles.length > 0 ? "pro-smart" : selectedModel,
          language: aiLanguage,
          images: imageFiles.length > 0 ? imageFiles : undefined,
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

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let fullResult = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullResult += chunk;
          setResult((prev) => prev + chunk);
        }
        // Save to history
        if (fullResult) {
          saveToHistory({
            pageType: "homework",
            pageName: "Homework Help",
            input: problem.slice(0, 200),
            output: fullResult.slice(0, 500),
            metadata: { subject, level, helpType },
          });
        }
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent("credits-updated", { detail: { amount: 3 } }));
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
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Homework Helper</h1>
            <p className="text-sm text-gray-500">Step-by-step problem solving</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HistoryPanel pageType="homework" onSelectItem={handleHistorySelect} />
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">All subjects</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-[360px_1fr] gap-4 min-h-0">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-gray-900 text-sm">Problem</span>
              </div>
              {problem && (
                <button
                  onClick={() => { clearProblem(); clearResult(); setUploadedFiles([]); }}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <Textarea
              placeholder="Describe your homework problem..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="min-h-[100px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
            />

            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Help Type</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {helpTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setHelpType(t.value)}
                    className={`py-1.5 rounded-lg border text-center transition-all text-xs font-medium ${
                      helpType === t.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-200 text-gray-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="h-8 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="mathematics">Math</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="h-8 text-sm border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle-school">Middle</SelectItem>
                    <SelectItem value="high-school">High</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="undergraduate">College</SelectItem>
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

            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700">Try &quot;Explain&quot; or &quot;Hints&quot; to understand better.</p>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-gray-100 shrink-0">
            <Button
              onClick={handleSolve}
              disabled={isLoading || (!problem.trim() && uploadedFiles.length === 0)}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Working...</>
              ) : (
                <>Get Help<ArrowRight className="ml-2 h-4 w-4" /></>
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
              <span className="ml-2 text-sm font-medium text-gray-700">Solution</span>
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
              <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded">
                <ReactMarkdown>{result}</ReactMarkdown>
              </article>
            ) : (
              <div className="h-full flex items-center justify-center">
                {isLoading ? (
                  <KayLoading message="Working on it..." dark={false} />
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">Solution will appear here</p>
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
