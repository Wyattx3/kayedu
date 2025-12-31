"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Volume2 } from "lucide-react";

interface PreGenerationAdProps {
  isActive: boolean;
  userPlan: "free" | "pro" | "unlimited";
  onComplete: () => void;
  onSkip?: () => void;
}

const AD_DURATION = 5; // Short ad before generation

export function PreGenerationAd({
  isActive,
  userPlan,
  onComplete,
}: PreGenerationAdProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "done">("idle");
  const [countdown, setCountdown] = useState(AD_DURATION);
  const hasTriggered = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive || hasTriggered.current) return;
    
    // Paid users skip ads
    if (userPlan !== "free") {
      onComplete();
      return;
    }

    hasTriggered.current = true;
    setStatus("loading");

    // Short loading then play
    setTimeout(() => {
      setStatus("playing");
      setCountdown(AD_DURATION);
    }, 500);
  }, [isActive, userPlan, onComplete]);

  // Countdown
  useEffect(() => {
    if (status !== "playing") return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus("done");
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, onComplete]);

  // Reset
  useEffect(() => {
    if (!isActive) {
      hasTriggered.current = false;
      setStatus("idle");
      setCountdown(AD_DURATION);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isActive]);

  if (!isActive || userPlan !== "free") return null;

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2 text-white text-sm">
          <span className="px-2 py-1 bg-blue-600 rounded text-xs font-bold">AD</span>
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing...
            </span>
          ) : (
            <span>Skip in {countdown}s</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        {status === "loading" ? (
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-white text-sm">Loading...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-72 h-40 bg-gray-800 rounded-lg flex items-center justify-center mb-4 border border-gray-700">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm">Video Ad</p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="w-72 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${((AD_DURATION - countdown) / AD_DURATION) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-3 text-center">
        <p className="text-gray-500 text-xs">Upgrade to Pro for ads-free</p>
      </div>
    </div>
  );
}
