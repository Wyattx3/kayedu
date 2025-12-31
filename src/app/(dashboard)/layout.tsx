"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { OnboardingCheck } from "@/components/auth/onboarding-check";
import { DashboardAdPopup } from "@/components/ads/dashboard-ad-popup";
import { Loader2 } from "lucide-react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "unlimited">("free");

  useEffect(() => {
    // Fetch user plan
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
    
    if (status === "authenticated") {
      fetchPlan();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center animate-pulse">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 lg:ml-[260px] h-screen flex flex-col">
        <div className="flex-1 p-4 lg:p-5 pt-16 lg:pt-5 overflow-y-auto">
          {children}
        </div>
      </main>
      <OnboardingCheck />
      {/* 3-hour interval ad popup for free users */}
      <DashboardAdPopup userPlan={userPlan} />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
