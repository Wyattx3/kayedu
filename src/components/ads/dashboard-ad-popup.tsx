"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Crown, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { EzoicRewardedAd } from "./ezoic-rewarded-ad";

const AD_POPUP_INTERVAL_HOURS = 3;
const STORAGE_KEY = "kabyar-last-ad-popup";

interface DashboardAdPopupProps {
  userPlan: "free" | "pro" | "unlimited";
}

export function DashboardAdPopup({ userPlan }: DashboardAdPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only show for free users
    if (userPlan !== "free") return;

    const checkAndShowPopup = () => {
      const lastPopup = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (!lastPopup) {
        // First time - show after 1 minute
        setTimeout(() => {
          setShowPopup(true);
          localStorage.setItem(STORAGE_KEY, now.toString());
        }, 60000);
        return;
      }

      const lastTime = parseInt(lastPopup, 10);
      const hoursSinceLastPopup = (now - lastTime) / (1000 * 60 * 60);

      if (hoursSinceLastPopup >= AD_POPUP_INTERVAL_HOURS) {
        setShowPopup(true);
        localStorage.setItem(STORAGE_KEY, now.toString());
      }
    };

    const timer = setTimeout(checkAndShowPopup, 2000);
    return () => clearTimeout(timer);
  }, [userPlan]);

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleWatchAd = () => {
    setShowPopup(false);
    setShowRewardedAd(true);
  };

  const handleUpgrade = () => {
    setShowPopup(false);
    router.push("/dashboard/plans");
  };

  const handleAdComplete = useCallback((creditsEarned: number) => {
    setShowRewardedAd(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    if (creditsEarned > 0) {
      window.dispatchEvent(new CustomEvent("credits-updated", { detail: { amount: -creditsEarned } }));
    }
  }, []);

  if (userPlan !== "free") return null;

  return (
    <>
      {/* Main Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          
          <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 z-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-6 pt-8 pb-6 text-center border-b border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Upgrade for More</h2>
              <p className="text-sm text-gray-500">
                Get more credits and remove ads
              </p>
            </div>

            {/* Options */}
            <div className="p-5 space-y-3">
              {/* Watch Ad */}
              <button
                onClick={handleWatchAd}
                className="w-full p-4 rounded-xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Watch Ad</h3>
                    <p className="text-xs text-gray-500">Get +5 free credits</p>
                  </div>
                </div>
              </button>

              {/* Upgrade */}
              <button
                onClick={handleUpgrade}
                className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Upgrade to Pro</h3>
                    <p className="text-xs text-gray-500">Starting at $3/month</p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleClose}
                className="w-full py-2 text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewarded Ad */}
      <EzoicRewardedAd
        isActive={showRewardedAd}
        onComplete={handleAdComplete}
        onClose={() => setShowRewardedAd(false)}
        creditsReward={5}
        headerText="Support Kabyar"
        bodyText="Watch this ad to earn 5 free credits"
      />
    </>
  );
}
