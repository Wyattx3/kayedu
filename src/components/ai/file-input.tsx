"use client";

import { useState, useRef } from "react";
import { Paperclip, Image, FileText, X, File, Upload } from "lucide-react";

export interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "pdf" | "text";
  size: number;
  dataUrl?: string;
  content?: string;
}

interface FileInputProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: ("image" | "pdf" | "text")[];
  className?: string;
}

export function FileInput({ 
  files, 
  onFilesChange, 
  maxFiles = 5, 
  acceptedTypes = ["image", "pdf", "text"],
  className = "" 
}: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const getAcceptString = () => {
    const accepts: string[] = [];
    if (acceptedTypes.includes("image")) accepts.push("image/*");
    if (acceptedTypes.includes("pdf")) accepts.push("application/pdf");
    if (acceptedTypes.includes("text")) accepts.push("text/*", ".txt", ".md", ".json", ".csv");
    return accepts.join(",");
  };

  const getFileType = (file: File): "image" | "pdf" | "text" | null => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.startsWith("text/") || 
        file.name.endsWith(".txt") || 
        file.name.endsWith(".md") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".csv")) return "text";
    return null;
  };

  const processFile = async (file: File): Promise<UploadedFile | null> => {
    const fileType = getFileType(file);
    if (!fileType || !acceptedTypes.includes(fileType)) return null;

    const baseFile: UploadedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: fileType,
      size: file.size,
    };

    return new Promise((resolve) => {
      const reader = new FileReader();
      
      if (fileType === "image") {
        reader.onload = (e) => {
          resolve({ ...baseFile, dataUrl: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      } else if (fileType === "text") {
        reader.onload = (e) => {
          resolve({ ...baseFile, content: e.target?.result as string });
        };
        reader.readAsText(file);
      } else if (fileType === "pdf") {
        reader.onload = (e) => {
          resolve({ ...baseFile, dataUrl: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      } else {
        resolve(baseFile);
      }
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const remainingSlots = maxFiles - files.length;
    const filesToProcess = Array.from(selectedFiles).slice(0, remainingSlots);

    const processedFiles = await Promise.all(
      filesToProcess.map(file => processFile(file))
    );

    const validFiles = processedFiles.filter((f): f is UploadedFile => f !== null);
    onFilesChange([...files, ...validFiles]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
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

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const remainingSlots = maxFiles - files.length;
    const filesToProcess = Array.from(droppedFiles).slice(0, remainingSlots);

    const processedFiles = await Promise.all(
      filesToProcess.map(file => processFile(file))
    );

    const validFiles = processedFiles.filter((f): f is UploadedFile => f !== null);
    onFilesChange([...files, ...validFiles]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: "image" | "pdf" | "text") => {
    switch (type) {
      case "image": return <Image className="w-4 h-4 text-blue-500" />;
      case "pdf": return <FileText className="w-4 h-4 text-red-500" />;
      case "text": return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={className}>
      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="relative group flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100"
            >
              {file.type === "image" && file.dataUrl ? (
                <img 
                  src={file.dataUrl} 
                  alt={file.name} 
                  className="w-10 h-10 object-cover rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}
              <div className="flex-1 min-w-0 max-w-[120px]">
                <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                <p className="text-[10px] text-gray-400">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {files.length < maxFiles && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-all"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Drop Zone (shown when dragging) */}
      {isDragging && (
        <div 
          className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="bg-white rounded-2xl shadow-2xl px-12 py-8 flex flex-col items-center gap-4 border-2 border-dashed border-blue-400">
            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-semibold text-gray-900">Drop files here</p>
            <p className="text-sm text-gray-500">Images, PDFs, or text files</p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptString()}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Attach Button (for when no files are selected) */}
      {files.length === 0 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-100 hover:border-blue-200"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Paperclip className="w-4 h-4" />
          <span>Attach files</span>
          <span className="text-xs text-gray-400">(images, PDF, text)</span>
        </button>
      )}
    </div>
  );
}

// Hook for managing file state
export function useFileInput(maxFiles: number = 5) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const addFiles = (newFiles: UploadedFile[]) => {
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return { files, setFiles, addFiles, removeFile, clearFiles };
}


