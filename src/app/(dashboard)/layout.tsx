"use client";

import { redirect } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { Loader2 } from "lucide-react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

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
