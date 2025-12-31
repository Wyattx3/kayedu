"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { LanguageSelector } from "@/components/ai";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Sparkles, hoverAnimation: "group-hover:rotate-180 group-hover:scale-110" },
  { name: "Essay Writer", href: "/dashboard/essay-writer", icon: FileText, hoverAnimation: "group-hover:-rotate-12 group-hover:scale-110" },
  { name: "AI Detector", href: "/dashboard/ai-detector", icon: ShieldCheck, hoverAnimation: "group-hover:scale-125 group-hover:rotate-6" },
  { name: "Humanizer", href: "/dashboard/humanizer", icon: Wand2, hoverAnimation: "group-hover:rotate-[20deg] group-hover:scale-110" },
  { name: "Answer Finder", href: "/dashboard/answer-finder", icon: Search, hoverAnimation: "group-hover:scale-125 group-hover:-translate-y-0.5" },
  { name: "Homework", href: "/dashboard/homework-helper", icon: BookOpen, hoverAnimation: "group-hover:scale-110 group-hover:-rotate-6" },
  { name: "Study Guide", href: "/dashboard/study-guide", icon: GraduationCap, hoverAnimation: "group-hover:-translate-y-1 group-hover:scale-110" },
  { name: "Slides", href: "/dashboard/presentation", icon: Presentation, hoverAnimation: "group-hover:scale-110 group-hover:rotate-3" },
  { name: "Tutor", href: "/dashboard/tutor", icon: MessageCircle, hoverAnimation: "group-hover:scale-125 group-hover:animate-pulse" },
];

interface UserProfile {
  name: string;
  email: string;
  image: string | null;
  dailyCredits: number;
  dailyCreditsUsed: number;
  creditsRemaining: number;
  resetTimeText: string;
  plan: "free" | "pro" | "unlimited";
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profilePopupRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async () => {
    console.log("[Sidebar] Fetching profile...");
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        console.log("[Sidebar] Profile fetched:", data.user?.name);
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  // Listen for profile update events from settings page
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log("[Sidebar] Profile update event received!");
      fetchProfile();
    };
    
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  // Listen for credits update events (after generation completes)
  useEffect(() => {
    const handleCreditsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ amount?: number }>;
      const deductedAmount = customEvent.detail?.amount || 3;
      
      // Immediately update UI (optimistic update)
      setUserProfile(prev => {
        if (!prev) return prev;
        const newUsed = prev.dailyCreditsUsed + deductedAmount;
        return {
          ...prev,
          dailyCreditsUsed: newUsed,
          creditsRemaining: prev.dailyCredits - newUsed,
        };
      });
      
      // Then fetch actual data from server in background
      fetchProfile();
    };
    
    window.addEventListener("credits-updated", handleCreditsUpdate);
    return () => window.removeEventListener("credits-updated", handleCreditsUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profilePopupRef.current && !profilePopupRef.current.contains(event.target as Node)) {
        setShowProfilePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use database values or defaults
  const dailyCredits = {
    total: userProfile?.dailyCredits ?? 50,
    used: userProfile?.dailyCreditsUsed ?? 0,
    remaining: userProfile?.creditsRemaining ?? 50,
    resetTime: userProfile?.resetTimeText ?? "24 hours",
  };

  const creditsPercentage = (dailyCredits.remaining / dailyCredits.total) * 100;
  const userName = userProfile?.name || session?.user?.name || "User";
  const userImage = userProfile?.image || session?.user?.image;

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
          <Image src="/logo.png" alt="Kabyar" width={36} height={36} className="object-contain" priority />
          <span className="font-bold text-lg text-gray-900 tracking-tight">Kabyar</span>
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
                <item.icon className={cn(
                  "w-[18px] h-[18px] transition-all duration-300 ease-out",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600",
                  !isActive && item.hoverAnimation
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Language Selector */}
        <div className="px-3 py-2 border-t border-gray-50">
          <LanguageSelector compact />
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-gray-50 relative" ref={profilePopupRef}>
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
                    {userImage && <AvatarImage src={userImage} alt={userName} />}
                    <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">
                      {userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{userName}</p>
                    <p className="text-xs text-blue-200 truncate">{userProfile?.email || session?.user?.email}</p>
                  </div>
                </div>
                {/* Plan Badge */}
                <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  userProfile?.plan === "unlimited" ? "bg-amber-500" : 
                  userProfile?.plan === "pro" ? "bg-purple-500" : "bg-white/20"
                }`}>
                  {userProfile?.plan === "unlimited" ? (
                    <>
                      <Sparkles className="w-3 h-3 text-white" />
                      <span className="text-[10px] font-semibold text-white">Unlimited</span>
                    </>
                  ) : userProfile?.plan === "pro" ? (
                    <>
                      <Crown className="w-3 h-3 text-white" />
                      <span className="text-[10px] font-semibold text-white">Pro</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span className="text-[10px] font-semibold text-white">Free</span>
                    </>
                  )}
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
                    <p className="text-lg font-bold text-gray-900">{dailyCredits.remaining}</p>
                    <p className="text-[10px] text-gray-400">of {dailyCredits.total}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${creditsPercentage}%` }}
                  />
                </div>


                {/* Upgrade Button - Only show for free users */}
                {userProfile?.plan === "free" && (
                  <Link 
                    href="/dashboard/plans"
                    onClick={() => setShowProfilePopup(false)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro
                  </Link>
                )}
                {userProfile?.plan === "pro" && (
                  <div className="flex items-center justify-center gap-2 py-2 text-blue-600 font-medium text-sm">
                    <Crown className="w-4 h-4" />
                    <span>Pro Member</span>
                  </div>
                )}
                {userProfile?.plan === "unlimited" && (
                  <div className="flex items-center justify-center gap-2 py-2 text-blue-600 font-medium text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Unlimited Access</span>
                  </div>
                )}
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
              {userImage && <AvatarImage src={userImage} alt={userName} />}
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] text-amber-600 font-medium">{dailyCredits.remaining} credits left</span>
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
