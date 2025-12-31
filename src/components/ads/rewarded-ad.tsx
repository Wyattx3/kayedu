"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Gift, Volume2 } from "lucide-react";
import { AdsenseAd } from "./adsense-ad";

interface RewardedAdProps {
  isActive: boolean;
  onComplete: (creditsEarned: number) => void;
  onClose: () => void;
  creditsReward?: number;
}

const AD_DURATION = 15; // Ad display duration in seconds

export function RewardedAd({
  isActive,
  onComplete,
  onClose,
  creditsReward = 5,
}: RewardedAdProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "completed">("idle");
  const [countdown, setCountdown] = useState(AD_DURATION);
  const hasTriggered = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Award credits via API
  const awardCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/user/credits/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "rewarded_ad", amount: creditsReward }),
      });
      
      if (res.ok) {
        console.log("[Ad] Credits awarded:", creditsReward);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [creditsReward]);

  // Start ad
  useEffect(() => {
    if (!isActive || hasTriggered.current) return;
    
    hasTriggered.current = true;
    setStatus("loading");

    // Short loading then start countdown
    setTimeout(() => {
      setStatus("playing");
      setCountdown(AD_DURATION);
    }, 1000);
  }, [isActive]);

  // Countdown timer
  useEffect(() => {
    if (status !== "playing") return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus("completed");
          awardCredits().then(() => {
            setTimeout(() => onComplete(creditsReward), 1500);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, awardCredits, creditsReward, onComplete]);

  // Reset when inactive
  useEffect(() => {
    if (!isActive) {
      hasTriggered.current = false;
      setStatus("idle");
      setCountdown(AD_DURATION);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isActive]);

  if (!isActive) return null;

  // Loading state
  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-white text-sm">Loading ad...</p>
        </div>
      </div>
    );
  }

  // Playing state - show AdSense ad
  if (status === "playing") {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-black">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2 text-white text-sm">
            <span className="px-2 py-1 bg-blue-600 rounded text-xs font-bold">AD</span>
            <span>Ends in {countdown}s</span>
          </div>
          <div className="flex items-center gap-2 text-white text-xs">
            <Gift className="w-4 h-4 text-yellow-400" />
            <span>+{creditsReward} credits</span>
          </div>
        </div>

        {/* Ad Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {/* AdSense Display Ad */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <AdsenseAd 
                slot="YOUR_AD_SLOT_ID"
                format="rectangle"
                style={{ minHeight: "250px", width: "100%" }}
              />
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${((AD_DURATION - countdown) / AD_DURATION) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-3 text-center">
          <p className="text-gray-500 text-xs">Upgrade to Pro for ads-free experience</p>
        </div>
      </div>
    );
  }

  // Completed state
  if (status === "completed") {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90">
        <div className="text-center bg-white rounded-2xl p-6 mx-4 max-w-xs animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Gift className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">+{creditsReward} Credits!</h3>
          <p className="text-sm text-gray-500">Thanks for watching</p>
        </div>
      </div>
    );
  }

  return null;
}
