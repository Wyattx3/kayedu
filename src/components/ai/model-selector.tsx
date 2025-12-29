"use client";

import { useState, useRef, useEffect } from "react";
import { Brain, Sparkles, Rocket, ChevronDown, Check } from "lucide-react";

export type ModelType = "smart" | "normal" | "fast";

interface ModelOption {
  id: ModelType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const modelOptions: ModelOption[] = [
  { 
    id: "smart", 
    name: "Smart", 
    description: "Best for complex tasks", 
    icon: <Brain className="w-4 h-4" />,
    color: "text-blue-500"
  },
  { 
    id: "normal", 
    name: "Normal", 
    description: "Balanced performance", 
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-gray-500"
  },
  { 
    id: "fast", 
    name: "Fast", 
    description: "Quick responses", 
    icon: <Rocket className="w-4 h-4" />,
    color: "text-green-500"
  },
];

interface ModelSelectorProps {
  value: ModelType;
  onChange: (model: ModelType) => void;
  className?: string;
}

export function ModelSelector({ value, onChange, className = "" }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedModel = modelOptions.find(m => m.id === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200 border border-gray-100"
      >
        <span className={selectedModel?.color}>
          {selectedModel?.icon}
        </span>
        <span>{selectedModel?.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-52 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-50">
          {modelOptions.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                value === model.id ? 'bg-blue-50' : ''
              }`}
            >
              <span className={model.color}>
                {model.icon}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${value === model.id ? 'text-blue-600' : 'text-gray-800'}`}>
                  {model.name}
                </p>
                <p className="text-xs text-gray-500">{model.description}</p>
              </div>
              {value === model.id && (
                <Check className="w-4 h-4 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for managing model state
export function useModelSelector(defaultModel: ModelType = "normal") {
  const [selectedModel, setSelectedModel] = useState<ModelType>(defaultModel);
  return { selectedModel, setSelectedModel };
}


