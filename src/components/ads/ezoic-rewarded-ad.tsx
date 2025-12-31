"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Gift, Play, Volume2 } from "lucide-react";

declare global {
  interface Window {
    ezRewardedAds?: {
      cmd: (() => void)[];
      ready?: boolean;
      requestWithOverlay: (
        callback: (result: { status: boolean; reward: boolean; msg?: string }) => void,
        textObj?: { header?: string; body?: string[]; accept?: string; cancel?: string },
        configObj?: { rewardName?: string; alwaysCallback?: boolean; lockScroll?: boolean }
      ) => void;
    };
  }
}

interface EzoicRewardedAdProps {
  isActive: boolean;
  onComplete: (creditsEarned: number) => void;
  onClose: () => void;
  creditsReward?: number;
  headerText?: string;
  bodyText?: string;
  rewardName?: string;
}

const AD_DURATION = 15; // Fallback ad duration in seconds

export function EzoicRewardedAd({
  isActive,
  onComplete,
  onClose,
  creditsReward = 5,
}: EzoicRewardedAdProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "completed">("idle");
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [useFallback, setUseFallback] = useState(false);
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

  // Handle Ezoic ad result
  const handleEzoicResult = useCallback((result: { status: boolean; reward: boolean; msg?: string }) => {
    console.log("[Ezoic] Result:", result);
    
    if (result.status && result.reward) {
      // Success - award credits
      setStatus("completed");
      awardCredits().then(() => {
        setTimeout(() => onComplete(creditsReward), 1500);
      });
    } else if (!result.status) {
      // Error - use fallback
      console.log("[Ezoic] Failed, using fallback:", result.msg);
      setUseFallback(true);
      setStatus("playing");
      setCountdown(AD_DURATION);
    } else {
      // User cancelled
      onClose();
    }
  }, [awardCredits, creditsReward, onComplete, onClose]);

  // Start ad
  useEffect(() => {
    if (!isActive || hasTriggered.current) return;
    
    hasTriggered.current = true;
    setStatus("loading");
    setUseFallback(false);

    // Try Ezoic first
    if (window.ezRewardedAds) {
      const tryEzoic = () => {
        try {
          window.ezRewardedAds?.requestWithOverlay(
            handleEzoicResult,
            {
              header: "Watch Ad for Credits",
              body: [`You will receive ${creditsReward} credits for watching this ad.`],
              accept: "Watch Ad",
              cancel: "Cancel"
            },
            {
              rewardName: "Credits Reward",
              alwaysCallback: true,
              lockScroll: true
            }
          );
        } catch (err) {
          console.log("[Ezoic] Error:", err);
          // Fallback to simulation
          setUseFallback(true);
          setStatus("playing");
          setCountdown(AD_DURATION);
        }
      };

      if (window.ezRewardedAds.ready) {
        tryEzoic();
      } else {
        window.ezRewardedAds.cmd.push(tryEzoic);
        // Timeout - if Ezoic doesn't respond in 3s, use fallback
        setTimeout(() => {
          if (status === "loading") {
            setUseFallback(true);
            setStatus("playing");
            setCountdown(AD_DURATION);
          }
        }, 3000);
      }
    } else {
      // No Ezoic - use fallback
      setTimeout(() => {
        setUseFallback(true);
        setStatus("playing");
        setCountdown(AD_DURATION);
      }, 1000);
    }
  }, [isActive, handleEzoicResult, creditsReward, status]);

  // Fallback countdown
  useEffect(() => {
    if (status !== "playing" || !useFallback) return;

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
  }, [status, useFallback, awardCredits, creditsReward, onComplete]);

  // Reset
  useEffect(() => {
    if (!isActive) {
      hasTriggered.current = false;
      setStatus("idle");
      setUseFallback(false);
      setCountdown(AD_DURATION);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isActive]);

  if (!isActive) return null;

  // Loading
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

  // Fallback playing
  if (status === "playing" && useFallback) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-black">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2 text-white text-sm">
            <span className="px-2 py-1 bg-blue-600 rounded text-xs font-bold">AD</span>
            <span>Ends in {countdown}s</span>
          </div>
        </div>

        {/* Video placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-72 h-40 bg-gray-800 rounded-lg flex items-center justify-center mb-4 border border-gray-700">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm">Video Ad Playing</p>
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
        </div>

        {/* Footer */}
        <div className="py-3 text-center">
          <p className="text-gray-500 text-xs">Upgrade to Pro for ads-free</p>
        </div>
      </div>
    );
  }

  // Completed
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
