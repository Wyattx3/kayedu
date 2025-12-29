"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sparkles,
  FileText,
  ShieldCheck,
  Wand2,
  Search,
  BookOpen,
  GraduationCap,
  Presentation,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Coins,
  Crown,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Sparkles },
  { name: "Essay Writer", href: "/dashboard/essay-writer", icon: FileText },
  { name: "AI Detector", href: "/dashboard/ai-detector", icon: ShieldCheck },
  { name: "Humanizer", href: "/dashboard/humanizer", icon: Wand2 },
  { name: "Answer Finder", href: "/dashboard/answer-finder", icon: Search },
  { name: "Homework", href: "/dashboard/homework-helper", icon: BookOpen },
  { name: "Study Guide", href: "/dashboard/study-guide", icon: GraduationCap },
  { name: "Slides", href: "/dashboard/presentation", icon: Presentation },
  { name: "Tutor", href: "/dashboard/tutor", icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profilePopupRef = useRef<HTMLDivElement>(null);

  // Daily free credits (in real app, fetch from API)
  const dailyCredits = {
    used: 15,
    total: 50,
    resetTime: "6 hours",
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profilePopupRef.current && !profilePopupRef.current.contains(event.target as Node)) {
        setShowProfilePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const creditsPercentage = ((dailyCredits.total - dailyCredits.used) / dailyCredits.total) * 100;

  return (
    <>
      <button
        className="fixed top-5 left-5 z-50 lg:hidden w-10 h-10 rounded-xl bg-white shadow-lg shadow-black/5 flex items-center justify-center border border-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-[260px] bg-white border-r border-gray-100 transition-transform duration-300 lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">K</span>
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">Kay AI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600")} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 mt-auto border-t border-gray-50 relative" ref={profilePopupRef}>
          {/* Profile Popup */}
          {showProfilePopup && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden animate-scale-in z-50">
              {/* Header */}
              <div className="bg-blue-600 px-4 py-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l3 3-3 3zm-3-6V0h-2v14.5l3 3-3 3zM7 0v3H4V0H2v5h5V0H7zm0 7v3H4V7H2v5h5V7H7z'/%3E%3C/g%3E%3C/svg%3E")`,
                }} />
                <div className="relative flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white/30">
                    <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{session?.user?.name || "User"}</p>
                    <p className="text-xs text-blue-200 truncate">{session?.user?.email}</p>
                  </div>
                </div>
                {/* Plan Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span className="text-[10px] font-semibold text-white">Free</span>
                </div>
              </div>

              {/* Credits Section */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Coins className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Daily Free Credits</p>
                      <p className="text-[10px] text-gray-400">Resets in {dailyCredits.resetTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{dailyCredits.total - dailyCredits.used}</p>
                    <p className="text-[10px] text-gray-400">of {dailyCredits.total}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${creditsPercentage}%` }}
                  />
                </div>


                {/* Upgrade Button */}
                <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                </button>
              </div>

              {/* Quick Links */}
              <div className="px-4 pb-4 pt-0 flex gap-2">
                <Link 
                  href="/dashboard/settings" 
                  onClick={() => setShowProfilePopup(false)}
                  className="flex-1 py-2 text-center text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 inline mr-1" />
                  Settings
                </Link>
                <button 
                  onClick={() => { setShowProfilePopup(false); signOut({ callbackUrl: "/" }); }}
                  className="flex-1 py-2 text-center text-xs font-medium text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 inline mr-1" />
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* User Card - Clickable */}
          <button
            onClick={() => setShowProfilePopup(!showProfilePopup)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors text-left"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{session?.user?.name || "User"}</p>
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] text-amber-600 font-medium">{dailyCredits.total - dailyCredits.used} credits left</span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfilePopup ? 'rotate-90' : ''}`} />
          </button>

          {/* Settings & Logout - Only show when popup is closed */}
          {!showProfilePopup && (
            <div className="flex gap-1.5 mt-2">
              <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs text-gray-500 hover:text-gray-900" asChild>
                <Link href="/dashboard/settings"><Settings className="w-3.5 h-3.5 mr-1.5" />Settings</Link>
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs text-gray-500 hover:text-red-600" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="w-3.5 h-3.5 mr-1.5" />Logout
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
