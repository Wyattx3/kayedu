"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Rocket, ChevronDown, Check, Crown, Lock, Coins } from "lucide-react";

export type ModelType = "super-smart" | "pro-smart" | "normal" | "fast";

interface ModelOption {
  id: ModelType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  credits: number;
  proOnly?: boolean;
}

const modelOptions: ModelOption[] = [
  { 
    id: "super-smart", 
    name: "Super Smart", 
    description: "Most powerful AI", 
    icon: <Crown className="w-4 h-4" />,
    color: "text-purple-500",
    credits: 0,
    proOnly: true,
  },
  { 
    id: "pro-smart", 
    name: "Pro Smart", 
    description: "Fast & intelligent", 
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-pink-500",
    credits: 5,
  },
  { 
    id: "normal", 
    name: "Normal", 
    description: "Balanced performance", 
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-gray-500",
    credits: 3,
  },
  { 
    id: "fast", 
    name: "Fast", 
    description: "Quick responses", 
    icon: <Rocket className="w-4 h-4" />,
    color: "text-green-500",
    credits: 3,
  },
];

interface ModelSelectorProps {
  value: ModelType;
  onChange: (model: ModelType) => void;
  className?: string;
}

export function ModelSelector({ value, onChange, className = "" }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user plan on mount
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedModel = modelOptions.find(m => m.id === value) || modelOptions[3]; // Default to fast

  return (
    <div className={`relative z-50 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200 border border-gray-100"
      >
        <span className={selectedModel?.color}>
          {selectedModel?.icon}
        </span>
        <span>{selectedModel?.name}</span>
        {selectedModel?.credits > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
            <Coins className="w-3 h-3" />
            {selectedModel.credits}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-[9999]">
          {modelOptions.map((model) => {
            const isLocked = model.proOnly && userPlan !== "pro";
            
            return (
              <button
                key={model.id}
                onClick={() => {
                  if (!isLocked) {
                    onChange(model.id);
                    setIsOpen(false);
                  }
                }}
                disabled={isLocked}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  value === model.id ? 'bg-blue-50' : ''
                } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <span className={model.color}>
                  {model.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-medium ${value === model.id ? 'text-blue-600' : 'text-gray-800'}`}>
                      {model.name}
                    </p>
                    {model.proOnly && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-600 rounded">
                        <Crown className="w-2.5 h-2.5" />
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{model.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {model.credits > 0 ? (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      <Coins className="w-3 h-3" />
                      {model.credits}
                    </span>
                  ) : model.proOnly ? (
                    isLocked ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <span className="text-xs text-purple-500 font-medium">Free</span>
                    )
                  ) : null}
                  {value === model.id && !isLocked && (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Get credit cost for a model
export function getModelCredits(model: ModelType): number {
  const modelOption = modelOptions.find(m => m.id === model);
  return modelOption?.credits || 3;
}

// Check if model is Pro only
export function isProOnlyModel(model: ModelType): boolean {
  const modelOption = modelOptions.find(m => m.id === model);
  return modelOption?.proOnly || false;
}

// Hook for managing model state
export function useModelSelector(defaultModel: ModelType = "normal") {
  const [selectedModel, setSelectedModel] = useState<ModelType>(defaultModel);
  return { selectedModel, setSelectedModel };
}


