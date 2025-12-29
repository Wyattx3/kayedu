"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Wand2,
  Search,
  BookOpen,
  GraduationCap,
  Presentation,
  MessageCircle,
  ArrowUpRight,
  Zap,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Users,
  Globe,
  Play,
  Newspaper,
  Clock,
  StickyNote,
  Plus,
  X,
  RefreshCw,
  Lightbulb,
  Tag,
} from "lucide-react";

const tools = [
  { name: "Essay Writer", desc: "Academic essays with proper structure", icon: FileText, href: "/dashboard/essay-writer" },
  { name: "AI Detector", desc: "Check content authenticity", icon: ShieldCheck, href: "/dashboard/ai-detector" },
  { name: "Humanizer", desc: "Transform AI to human writing", icon: Wand2, href: "/dashboard/humanizer" },
  { name: "Answer Finder", desc: "Instant accurate answers", icon: Search, href: "/dashboard/answer-finder" },
  { name: "Homework Help", desc: "Step-by-step solutions", icon: BookOpen, href: "/dashboard/homework-helper" },
  { name: "Study Guide", desc: "Personalized study materials", icon: GraduationCap, href: "/dashboard/study-guide" },
  { name: "Presentations", desc: "Professional slide decks", icon: Presentation, href: "/dashboard/presentation" },
  { name: "AI Tutor", desc: "1-on-1 learning assistant", icon: MessageCircle, href: "/dashboard/tutor" },
];

const stats = [
  { label: "AI Models", value: "4", icon: Sparkles, suffix: "" },
  { label: "Response", value: "<2", icon: Zap, suffix: "s" },
  { label: "Accuracy", value: "99", icon: CheckCircle2, suffix: "%" },
  { label: "Students", value: "10K", icon: Users, suffix: "+" },
];

const features = [
  { title: "Multi-AI Support", icon: Globe },
  { title: "Instant Results", icon: Zap },
  { title: "Smart Learning", icon: TrendingUp },
];

interface NewsArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  fullContent?: string;
  actionTip?: string;
  relatedTopics?: string[];
  source: string;
  time: string;
  color: string;
}

// Sticky note colors
const stickyColors = [
  { bg: "bg-yellow-100", border: "border-yellow-200", shadow: "shadow-yellow-200/50" },
  { bg: "bg-pink-100", border: "border-pink-200", shadow: "shadow-pink-200/50" },
  { bg: "bg-blue-100", border: "border-blue-200", shadow: "shadow-blue-200/50" },
  { bg: "bg-green-100", border: "border-green-200", shadow: "shadow-green-200/50" },
  { bg: "bg-purple-100", border: "border-purple-200", shadow: "shadow-purple-200/50" },
];

interface StickyNote {
  id: number;
  content: string;
  colorIndex: number;
  rotation: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([
    { id: 1, content: "📚 Study calculus chapter 5 today!", colorIndex: 0, rotation: -2 },
    { id: 2, content: "💡 Remember: Practice makes perfect", colorIndex: 1, rotation: 3 },
    { id: 3, content: "🎯 Goal: Complete React course by Friday", colorIndex: 2, rotation: -1 },
  ]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch AI-generated news based on user profile from settings
  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      // Get user profile data from localStorage (saved in settings page)
      let userProfile = {
        subjects: ["Programming", "AI/ML", "Mathematics", "Web Development"],
        schoolName: "",
        major: "Computer Science",
        educationLevel: "undergraduate",
        studyGoal: "Learn programming and AI",
      };

      // Try to load saved settings from localStorage
      if (typeof window !== "undefined") {
        const savedSettings = localStorage.getItem("kay-user-settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          userProfile = {
            subjects: settings.subjects || userProfile.subjects,
            schoolName: settings.schoolName || userProfile.schoolName,
            major: settings.major || userProfile.major,
            educationLevel: settings.educationLevel || userProfile.educationLevel,
            studyGoal: settings.studyGoal || userProfile.studyGoal,
          };
        }
      }

      const response = await fetch("/api/news/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userProfile),
      });

      if (response.ok) {
        const data = await response.json();
        setNews(data.news);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const addStickyNote = () => {
    if (!newNoteContent.trim()) return;
    const newNote: StickyNote = {
      id: Date.now(),
      content: newNoteContent,
      colorIndex: Math.floor(Math.random() * stickyColors.length),
      rotation: Math.floor(Math.random() * 7) - 3,
    };
    setStickyNotes([...stickyNotes, newNote]);
    setNewNoteContent("");
    setShowAddNote(false);
  };

  const deleteStickyNote = (id: number) => {
    setStickyNotes(stickyNotes.filter(note => note.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedNews(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between">
              <div className="flex-1 pr-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${selectedNews.color} mb-2`}>
                  {selectedNews.category}
                </span>
                <h2 className="text-xl font-bold text-gray-900">{selectedNews.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {selectedNews.time}
                  <span className="text-gray-300">•</span>
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  {selectedNews.source}
                </div>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(80vh-180px)]">
              {/* Summary */}
              <div className="bg-blue-50 rounded-xl p-4 mb-5">
                <p className="text-blue-800 font-medium">{selectedNews.summary}</p>
              </div>

              {/* Full Content */}
              {selectedNews.fullContent && (
                <div className="prose prose-sm max-w-none mb-5">
                  {selectedNews.fullContent.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
                  ))}
                </div>
              )}

              {/* Action Tip */}
              {selectedNews.actionTip && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">Action Tip</h4>
                      <p className="text-sm text-amber-700">{selectedNews.actionTip}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Topics */}
              {selectedNews.relatedTopics && selectedNews.relatedTopics.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Related Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNews.relatedTopics.map((topic, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setSelectedNews(null)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div 
        className={`relative overflow-hidden rounded-2xl bg-blue-600 p-6 lg:p-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-blue-200 text-sm">{time}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              {getGreeting()}, {session?.user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-blue-200">What would you like to learn today?</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {features.map((f, i) => (
              <div 
                key={i}
                className={`flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
                style={{ transitionDelay: `${300 + i * 100}ms` }}
              >
                <f.icon className="w-4 h-4 text-blue-200" />
                <span className="text-xs text-white font-medium">{f.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily News & Sticky Notes Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily News Section */}
        <div className="lg:col-span-2">
          <div className={`flex items-center justify-between mb-4 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "400ms" }}>
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-600 rounded-full" />
              <Newspaper className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Daily News For You</h2>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Curated
              </span>
            </div>
            <button
              onClick={fetchNews}
              disabled={newsLoading}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${newsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {newsLoading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl p-4 border border-gray-100 animate-pulse ${mounted ? "opacity-100" : "opacity-0"}`}
                  style={{ transitionDelay: `${500 + i * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-20 h-6 bg-gray-200 rounded-full" />
                    <div className="w-16 h-4 bg-gray-100 rounded" />
                  </div>
                  <div className="w-full h-5 bg-gray-200 rounded mb-2" />
                  <div className="w-3/4 h-5 bg-gray-100 rounded mb-2" />
                  <div className="w-full h-4 bg-gray-100 rounded mb-1" />
                  <div className="w-2/3 h-4 bg-gray-50 rounded" />
                </div>
              ))
            ) : (
              news.map((article, i) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedNews(article)}
                  className={`group relative bg-white rounded-xl p-4 border border-gray-100 cursor-pointer text-left transition-all duration-500 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1 hover:border-blue-200 overflow-hidden ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${500 + i * 100}ms` }}
                >
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${article.color}`}>
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {article.time}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.summary}</p>

                  {/* Click to read */}
                  <div className="flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to read summary <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>

                  {/* Animated border */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Sticky Notes Section */}
        <div className="lg:col-span-1">
          <div className={`flex items-center justify-between mb-4 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "400ms" }}>
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-yellow-500 rounded-full" />
              <StickyNote className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-gray-900">Quick Notes</h2>
            </div>
            <button
              onClick={() => setShowAddNote(true)}
              className="w-8 h-8 rounded-lg bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center text-yellow-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {showAddNote && (
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-dashed border-yellow-300">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your note..."
                  rows={3}
                  className="w-full bg-transparent border-0 resize-none text-sm text-gray-700 placeholder:text-yellow-500 focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    onClick={() => { setShowAddNote(false); setNewNoteContent(""); }}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addStickyNote}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            )}

            {stickyNotes.map((note, i) => {
              const color = stickyColors[note.colorIndex];
              return (
                <div
                  key={note.id}
                  className={`group relative ${color.bg} ${color.border} border rounded-xl p-4 shadow-md ${color.shadow} transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ 
                    transitionDelay: `${600 + i * 100}ms`,
                    transform: `rotate(${note.rotation}deg)`,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-400 shadow-md" />
                  <button
                    onClick={() => deleteStickyNote(note.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                  <p className="text-sm text-gray-700 font-medium pr-6" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    {note.content}
                  </p>
                </div>
              );
            })}

            {stickyNotes.length === 0 && !showAddNote && (
              <div className="text-center py-8 text-gray-400">
                <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notes yet. Add one!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`group bg-white rounded-xl p-4 border border-gray-100 transition-all duration-500 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-0.5 hover:border-blue-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: `${800 + i * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <stat.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  <span className="text-sm font-bold text-gray-400">{stat.suffix}</span>
                </div>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <div>
        <div className={`flex items-center gap-2 mb-4 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "1000ms" }}>
          <div className="w-1 h-5 bg-blue-600 rounded-full" />
          <h2 className="text-lg font-bold text-gray-900">AI Tools</h2>
          <span className="text-xs text-gray-400 ml-2">8 tools</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tools.map((tool, i) => (
            <Link
              key={tool.name}
              href={tool.href}
              onMouseEnter={() => setHoveredTool(i)}
              onMouseLeave={() => setHoveredTool(null)}
              className={`group relative bg-white rounded-xl p-5 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1 hover:border-blue-200 overflow-hidden ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${1100 + i * 50}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{tool.name}</h3>
                <div className={`w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center transition-all duration-300 ${hoveredTool === i ? "opacity-100" : "opacity-0"}`}>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-400">{tool.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-xl" />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`grid md:grid-cols-2 gap-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "1300ms" }}>
        <div className="group bg-blue-50 rounded-xl p-5 border border-blue-100 hover:shadow-md transition-all">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-0.5">New to Kay AI?</h3>
              <p className="text-sm text-gray-500 mb-2">Start with Essay Writer or AI Tutor.</p>
              <Link href="/dashboard/essay-writer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                Get Started<ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="group bg-amber-50 rounded-xl p-5 border border-amber-100 hover:shadow-md transition-all">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-0.5">Pro Tip</h3>
              <p className="text-sm text-gray-500 mb-2">Set up your profile for personalized AI responses.</p>
              <Link href="/dashboard/settings" className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700">
                Personalize AI<ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-center gap-4 py-3 text-sm text-gray-400 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "1400ms" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>All systems operational</span>
        </div>
        <span>•</span>
        <span>Powered by OpenAI, Claude, Gemini & Grok</span>
      </div>
    </div>
  );
}
