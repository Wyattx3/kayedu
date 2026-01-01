"use client";

import { useState, useEffect } from "react";
import { X, Cookie, Settings, Check } from "lucide-react";

const CONSENT_KEY = "kabyar-cookie-consent";

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    advertising: false,
    timestamp: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ConsentState;
      setConsent(parsed);
      applyConsent(parsed);
    } else {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const applyConsent = (state: ConsentState) => {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: state.analytics ? "granted" : "denied",
        ad_storage: state.advertising ? "granted" : "denied",
        ad_user_data: state.advertising ? "granted" : "denied",
        ad_personalization: state.advertising ? "granted" : "denied",
      });

      if (state.analytics) {
        window.dataLayer?.push({ event: "consent_accepted_analytics" });
      }
      if (state.advertising) {
        window.dataLayer?.push({ event: "consent_accepted_advertising" });
      }
    }
  };

  const saveConsent = (state: ConsentState) => {
    const newState = { ...state, timestamp: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newState));
    setConsent(newState);
    applyConsent(newState);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      advertising: true,
      timestamp: Date.now(),
    });
  };

  const rejectNonEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      advertising: false,
      timestamp: Date.now(),
    });
  };

  const savePreferences = () => {
    saveConsent(consent);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Banner */}
      {!showPreferences && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md z-[9999] animate-slide-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cookie Settings</h3>
                  <p className="text-xs text-gray-500">We value your privacy</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                We use cookies to enhance your experience and analyze our traffic.{" "}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={acceptAll}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  Accept All
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={rejectNonEssential}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPreferences(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-auto animate-scale-in">
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                You can choose which cookies to allow. Your preferences will apply across our website.
              </p>

              {/* Necessary */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Necessary</h4>
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Required
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  These cookies are necessary for the website to function properly.
                </p>
              </div>

              {/* Analytics */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Analytics</h4>
                  <button
                    onClick={() => setConsent({ ...consent, analytics: !consent.analytics })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      consent.analytics ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        consent.analytics ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Help us improve by tracking which pages are most popular.
                </p>
              </div>

              {/* Advertising */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Advertising</h4>
                  <button
                    onClick={() => setConsent({ ...consent, advertising: !consent.advertising })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      consent.advertising ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        consent.advertising ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Enable personalized ads and features.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100">
              <button
                onClick={savePreferences}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
