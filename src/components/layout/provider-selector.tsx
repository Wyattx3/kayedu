"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_MODELS, PROVIDER_NAMES, type AIProvider } from "@/lib/ai-providers";

interface ProviderSelectorProps {
  provider: AIProvider;
  model: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  compact?: boolean;
}

export function ProviderSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
  compact = false,
}: ProviderSelectorProps) {
  if (compact) {
    // Compact mode: single dropdown showing provider + model
    return (
      <Select 
        value={`${provider}:${model}`} 
        onValueChange={(v) => {
          const [p, m] = v.split(":");
          onProviderChange(p as AIProvider);
          onModelChange(m);
        }}
      >
        <SelectTrigger className="h-7 text-xs border-gray-200 w-full">
          <SelectValue placeholder="Select AI" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(AVAILABLE_MODELS).map(([p, models]) => (
            models.map((m) => (
              <SelectItem key={`${p}:${m}`} value={`${p}:${m}`} className="text-xs">
                {PROVIDER_NAMES[p as AIProvider]} - {m}
              </SelectItem>
            ))
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Select value={provider} onValueChange={(v) => onProviderChange(v as AIProvider)}>
        <SelectTrigger className="h-8 text-sm border-gray-200">
          <SelectValue placeholder="Provider" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PROVIDER_NAMES).map(([key, name]) => (
            <SelectItem key={key} value={key}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={model} onValueChange={onModelChange}>
        <SelectTrigger className="h-8 text-sm border-gray-200">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS[provider].map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
