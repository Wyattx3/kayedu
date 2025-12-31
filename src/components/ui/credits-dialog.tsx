"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Play, X, AlertCircle } from "lucide-react";

interface CreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creditsNeeded: number;
  creditsRemaining: number;
  onWatchAd: () => void;
}

export function CreditsDialog({
  isOpen,
  onClose,
  creditsNeeded,
  creditsRemaining,
  onWatchAd,
}: CreditsDialogProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const shortage = creditsNeeded - creditsRemaining;
  const adsNeeded = Math.ceil(shortage / 5);

  const handleUpgrade = () => {
    router.push("/dashboard/plans");
    onClose();
  };

  const handleWatchAd = () => {
    onClose();
    onWatchAd();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Insufficient Credits</h2>
              <p className="text-sm text-gray-500">
                Need <span className="font-semibold text-red-500">{shortage}</span> more credits
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {/* Watch Ad Option */}
          <button
            onClick={handleWatchAd}
            className="w-full p-4 rounded-xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Watch Ad & Continue</h3>
                <p className="text-xs text-gray-500">
                  Get +5 credits {adsNeeded > 1 ? `(${adsNeeded} ads needed)` : ""}
                </p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Free
              </span>
            </div>
          </button>

          {/* Upgrade Option */}
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
                <p className="text-xs text-gray-500">3500 credits/month, ads-free</p>
              </div>
              <span className="text-blue-600 font-bold">$3</span>
            </div>
          </button>
        </div>

        {/* Info */}
        <div className="px-5 pb-4">
          <p className="text-xs text-center text-gray-400">
            You have {creditsRemaining} credits, need {creditsNeeded} total
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook to manage credits dialog state
export function useCreditsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ creditsNeeded: 0, creditsRemaining: 0 });

  const showDialog = (creditsNeeded: number, creditsRemaining: number) => {
    setDialogData({ creditsNeeded, creditsRemaining });
    setIsOpen(true);
  };

  const hideDialog = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    dialogData,
    showDialog,
    hideDialog,
  };
}
