"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  ArrowRight,
  Zap,
  Brain,
  Target,
  Trophy,
  Star,
  ChevronDown,
  Check,
  Clock,
  Users,
  TrendingUp,
  Shield,
  Lightbulb,
  Rocket,
  Heart,
  Globe,
  Cpu,
  Layers,
  PenTool,
  Award,
  BarChart3,
  Play,
  Sparkle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

const tools = [
  { 
    name: "Essay Writer", 
    slug: "essay-writer",
    icon: FileText, 
    desc: "Generate well-structured academic essays with proper citations and formatting",
    color: "from-blue-500 to-blue-600",
    features: ["Auto-citations", "Multiple formats", "Plagiarism-free"]
  },
  { 
    name: "AI Detector", 
    slug: "ai-detector",
    icon: ShieldCheck, 
    desc: "Check if your content appears AI-generated and get improvement suggestions",
    color: "from-emerald-500 to-emerald-600",
    features: ["Instant scan", "Detailed report", "Fix suggestions"]
  },
  { 
    name: "Humanizer", 
    slug: "humanizer",
    icon: Wand2, 
    desc: "Transform AI-generated text into natural, human-sounding content",
    color: "from-violet-500 to-violet-600",
    features: ["Natural flow", "Tone matching", "Style preservation"]
  },
  { 
    name: "Answer Finder", 
    slug: "answer-finder",
    icon: Search, 
    desc: "Get detailed answers to your questions with step-by-step explanations",
    color: "from-amber-500 to-amber-600",
    features: ["Detailed steps", "Visual aids", "Source links"]
  },
  { 
    name: "Homework Help", 
    slug: "homework-helper",
    icon: BookOpen, 
    desc: "Get guidance and support for all your homework assignments",
    color: "from-rose-500 to-rose-600",
    features: ["All subjects", "Step-by-step", "Concept clarity"]
  },
  { 
    name: "Study Guide", 
    slug: "study-guide",
    icon: GraduationCap, 
    desc: "Create comprehensive study guides tailored to your curriculum",
    color: "from-cyan-500 to-cyan-600",
    features: ["Custom topics", "Key points", "Practice Q&A"]
  },
  { 
    name: "Presentations", 
    slug: "presentation",
    icon: Presentation, 
    desc: "Generate professional presentation outlines and slide content",
    color: "from-pink-500 to-pink-600",
    features: ["Slide outlines", "Speaker notes", "Visual tips"]
  },
  { 
    name: "AI Tutor", 
    slug: "tutor",
    icon: MessageCircle, 
    desc: "Chat with your personal AI tutor for interactive learning sessions",
    color: "from-indigo-500 to-indigo-600",
    features: ["24/7 available", "Personalized", "Interactive"]
  },
];

const stats = [
  { value: "10,000+", label: "Active Students", icon: Users },
  { value: "500,000+", label: "Essays Generated", icon: FileText },
  { value: "4.9/5", label: "User Rating", icon: Star },
  { value: "99.9%", label: "Uptime", icon: TrendingUp },
];

const testimonials = [
  { 
    name: "Sarah Mitchell", 
    program: "IGCSE", 
    text: "Kabyar completely transformed how I approach my studies. My essay grades improved from C to A in just two months.",
    avatar: "S",
    rating: 5
  },
  { 
    name: "Alex Kim", 
    program: "GED", 
    text: "Passed my GED on the first try thanks to the AI tutor. It explained concepts in ways my teachers never could.",
    avatar: "A",
    rating: 5
  },
  { 
    name: "Maya Thompson", 
    program: "OTHM", 
    text: "The homework helper is incredible. It doesn't just give answers - it teaches you the underlying concepts.",
    avatar: "M",
    rating: 5
  },
  { 
    name: "James Chen", 
    program: "A-Levels", 
    text: "Study guide generator saved me during exam season. Created perfect revision materials in minutes.",
    avatar: "J",
    rating: 5
  },
  { 
    name: "Emma Davis", 
    program: "IB", 
    text: "The AI detector and humanizer combo is essential. Never worried about my essays being flagged again.",
    avatar: "E",
    rating: 5
  },
  { 
    name: "Ryan Park", 
    program: "University", 
    text: "Best investment for my education. The presentation maker helped me ace my final project.",
    avatar: "R",
    rating: 5
  },
];

const aiModels = [
  { name: "GPT-4", desc: "OpenAI's most capable model", icon: Brain },
  { name: "Claude", desc: "Anthropic's advanced AI", icon: Cpu },
  { name: "Gemini", desc: "Google's multimodal AI", icon: Sparkle },
  { name: "Grok", desc: "xAI's reasoning model", icon: Zap },
];

const howItWorks = [
  { step: "01", title: "Sign Up Free", desc: "Create your account in seconds. No credit card required.", icon: Users },
  { step: "02", title: "Choose Your Tool", desc: "Select from 8 powerful AI tools designed for students.", icon: Layers },
  { step: "03", title: "Enter Your Request", desc: "Describe what you need - essay topic, homework question, etc.", icon: PenTool },
  { step: "04", title: "Get Results", desc: "Receive high-quality, academic-ready content instantly.", icon: Rocket },
];

const programs = [
  { name: "GED", students: "2,500+", icon: Award },
  { name: "IGCSE", students: "3,200+", icon: Globe },
  { name: "OTHM", students: "1,800+", icon: Trophy },
  { name: "A-Levels", students: "2,100+", icon: BarChart3 },
  { name: "IB", students: "1,500+", icon: Target },
  { name: "AP", students: "1,200+", icon: Lightbulb },
  { name: "SAT/ACT", students: "900+", icon: TrendingUp },
  { name: "University", students: "4,000+", icon: GraduationCap },
];

const benefits = [
  { 
    title: "Save 10+ Hours Weekly", 
    desc: "Automate repetitive tasks and focus on what matters - actually learning the material.",
    icon: Clock,
    stat: "10hrs+"
  },
  { 
    title: "Improve Your Grades", 
    desc: "Students report an average grade improvement of 1.5 letter grades within the first semester.",
    icon: TrendingUp,
    stat: "+1.5"
  },
  { 
    title: "Learn Faster", 
    desc: "Our AI tutor adapts to your learning style, helping you understand concepts 3x faster.",
    icon: Zap,
    stat: "3x"
  },
  { 
    title: "Stay Undetected", 
    desc: "Our humanizer ensures your content passes all major AI detection tools with flying colors.",
    icon: Shield,
    stat: "99%"
  },
];

const comparisons = [
  { feature: "Essay Generation", kay: true, others: true },
  { feature: "AI Detection Check", kay: true, others: false },
  { feature: "Content Humanizer", kay: true, others: false },
  { feature: "Multiple AI Models", kay: true, others: false },
  { feature: "24/7 AI Tutor", kay: true, others: true },
  { feature: "Study Guide Creator", kay: true, others: false },
  { feature: "Presentation Maker", kay: true, others: false },
  { feature: "All Academic Levels", kay: true, others: false },
];

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    
    // Intersection Observer for animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observerRef.current?.observe(el);
    });

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % tools.length);
    }, 4000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observerRef.current?.disconnect();
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center h-8">
            <Image src="/logo.png" alt="Kabyar" width={280} height={74} className="object-contain h-16 w-auto" priority />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
            <Link href="/tools" className="text-gray-600 hover:text-gray-900 transition">Tools</Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition">Blog</Link>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Reviews</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition">
              Log in
            </Link>
            <Button asChild size="sm" className="bg-blue-500 hover:bg-blue-600 rounded-xl px-5 shadow-lg shadow-blue-500/25">
              <Link href="/register">Start Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        {/* Floating 3D Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-2xl shadow-blue-500/30"
            style={{ 
              top: "15%", 
              left: "10%",
              transform: `translateY(${scrollY * 0.1}px) rotate(${12 + scrollY * 0.02}deg)`,
              transition: "transform 0.3s ease-out"
            }}
          />
          <div 
            className="absolute w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-2xl shadow-emerald-500/30"
            style={{ 
              top: "25%", 
              right: "15%",
              transform: `translateY(${scrollY * 0.15}px) rotate(${-15 + scrollY * 0.03}deg)`,
              transition: "transform 0.3s ease-out"
            }}
          />
          <div 
            className="absolute w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-400 to-violet-500 shadow-2xl shadow-violet-500/30"
            style={{ 
              top: "60%", 
              left: "5%",
              transform: `translateY(${scrollY * 0.08}px) rotate(${8 + scrollY * 0.01}deg)`,
              transition: "transform 0.3s ease-out"
            }}
          />
          <div 
            className="absolute w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-2xl shadow-amber-500/30"
            style={{ 
              top: "70%", 
              right: "10%",
              transform: `translateY(${scrollY * 0.12}px) rotate(${-20 + scrollY * 0.02}deg)`,
              transition: "transform 0.3s ease-out"
            }}
          />
          <div 
            className="absolute w-12 h-12 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 shadow-2xl shadow-rose-500/30"
            style={{ 
              top: "40%", 
              left: "20%",
              transform: `translateY(${scrollY * 0.18}px) rotate(${25 + scrollY * 0.04}deg)`,
              transition: "transform 0.3s ease-out"
            }}
          />
          <div 
            className="absolute w-18 h-18 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-2xl shadow-cyan-500/30"
            style={{ 
              top: "50%", 
              right: "20%",
              transform: `translateY(${scrollY * 0.1}px) rotate(${-10 + scrollY * 0.015}deg)`,
              transition: "transform 0.3s ease-out"
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 text-sm font-medium text-blue-600 mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>The #1 AI Study Platform for Students</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.05] mb-8 tracking-tight">
            <span className="block animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Study Smarter.
            </span>
            <span className="block bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Achieve More.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: "0.3s" }}>
            8 powerful AI tools in one platform. Write essays, get tutoring, 
            create study guides, and more. Built for GED, IGCSE, OTHM & all students.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-14 px-10 text-lg rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:scale-105 border-0">
              <Link href="/register">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 group">
              <Link href="#demo">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                    <IconComponent className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="font-bold text-xl md:text-2xl text-gray-900">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
          <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce" />
        </div>
      </section>

      {/* Feature Showcase - Interactive Cards */}
      <section id="features" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" id="features-header" data-animate>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 mb-6">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              8 Powerful Tools.<br />One Platform.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to excel in your studies, powered by the world's most advanced AI models.
            </p>
          </div>

          {/* Interactive Feature Display */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Left: Feature List */}
            <div className="space-y-4">
              {tools.map((tool, i) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={tool.name}
                    className={`p-6 rounded-3xl cursor-pointer transition-all duration-500 ${
                      activeFeature === i 
                        ? "bg-white shadow-2xl shadow-gray-200/50 scale-[1.02]" 
                        : "bg-transparent hover:bg-white/50"
                    }`}
                    onClick={() => setActiveFeature(i)}
                    onDoubleClick={() => window.location.href = `/tools/${tool.slug}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg transition-transform duration-500 ${activeFeature === i ? "scale-110 rotate-3" : ""}`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900">{tool.name}</h3>
                        <p className={`text-gray-500 transition-all duration-500 ${activeFeature === i ? "opacity-100 h-auto mt-2" : "opacity-0 h-0 overflow-hidden"}`}>
                          {tool.desc}
                        </p>
                      </div>
                      <Link href={`/tools/${tool.slug}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <ArrowRight className={`w-5 h-5 text-gray-400 transition-all duration-300 ${activeFeature === i ? "translate-x-2 text-blue-500" : ""}`} />
                      </Link>
                    </div>
                    
                    {/* Feature tags */}
                    <div className={`flex gap-2 mt-4 transition-all duration-500 ${activeFeature === i ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 h-0 overflow-hidden"}`}>
                      {tool.features.map((f) => (
                        <span key={f} className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: 3D Card Preview */}
            <div className="relative h-[600px] hidden lg:block perspective-1000">
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ perspective: "1000px" }}
              >
                <div 
                  className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 transition-all duration-700"
                  style={{ 
                    transform: `rotateY(${(activeFeature % 2 === 0 ? -5 : 5)}deg) rotateX(${5}deg) translateZ(50px)`,
                    transformStyle: "preserve-3d"
                  }}
                >
                  <div className={`w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl mb-6 transition-all duration-500`}>
                    {(() => {
                      const Icon = tools[activeFeature].icon;
                      return <Icon className="w-10 h-10 text-white" />;
                    })()}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{tools[activeFeature].name}</h3>
                  <p className="text-lg text-gray-600 mb-6">{tools[activeFeature].desc}</p>
                  <div className="space-y-3">
                    {tools[activeFeature].features.map((f, i) => (
                      <div 
                        key={f} 
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button asChild className={`w-full mt-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 border-0`}>
                    <Link href={`/tools/${tools[activeFeature].slug}`}>
                      Try {tools[activeFeature].name}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 -z-10 rotate-12" />
              <div className="absolute bottom-20 left-10 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 -z-10 -rotate-12" />
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, i) => {
              const IconComponent = tool.icon;
              return (
                <Link
                  key={tool.name}
                  href={`/tools/${tool.slug}`}
                  className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 shadow-lg shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 cursor-pointer overflow-hidden hover:-translate-y-2 block"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">{tool.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{tool.desc}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((f) => (
                        <span key={f} className="px-2 py-1 rounded-lg bg-gray-50 text-xs text-gray-600">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className={`w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg`}>
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-xl shadow-violet-500/30 mb-6">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Powered by<br />World-Class AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from 4 leading AI models. Switch anytime to get different perspectives and results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiModels.map((model, i) => {
              const IconComponent = model.icon;
              return (
                <div 
                  key={model.name}
                  className="group relative bg-gray-50 rounded-3xl p-8 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900 mb-2">{model.name}</h3>
                  <p className="text-gray-500">{model.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/30 mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes. No complicated setup required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => {
              const IconComponent = step.icon;
              return (
                <div 
                  key={step.step}
                  className="relative group"
                >
                  {/* Connector line */}
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gray-200 z-0" />
                  )}
                  
                  <div className="relative z-10 bg-white rounded-3xl p-8 shadow-lg shadow-gray-100/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-5xl font-black text-gray-100 group-hover:text-blue-100 transition-colors">{step.step}</span>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-xl shadow-amber-500/30 mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Real Results.<br />Real Impact.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how Kabyar helps students achieve their academic goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon;
              return (
                <div 
                  key={benefit.title}
                  className="group relative bg-gray-50 rounded-3xl p-8 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Big stat in background */}
                  <div className="absolute -top-4 -right-4 text-8xl font-black text-gray-100 group-hover:text-blue-50 transition-colors">{benefit.stat}</div>
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-500 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-xl shadow-cyan-500/30 mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Every Academic<br />Program Supported
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From GED to University. We've got you covered no matter where you are in your education journey.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {programs.map((prog) => {
              const IconComponent = prog.icon;
              return (
                <div 
                  key={prog.name}
                  className="group relative bg-white rounded-3xl p-8 shadow-lg shadow-gray-100/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900 mb-1">{prog.name}</h3>
                  <p className="text-sm text-gray-500">{prog.students} students</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-xl shadow-rose-500/30 mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Loved by<br />Students Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who are already achieving more with Kabyar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="group bg-gray-50 rounded-3xl p-8 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-8 leading-relaxed">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.program} Student</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl shadow-indigo-500/30 mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Kabyar?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how we compare to other AI writing tools.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 font-bold">
              <div className="text-gray-500">Feature</div>
              <div className="text-center text-blue-600">Kabyar</div>
              <div className="text-center text-gray-400">Others</div>
            </div>
            {comparisons.map((c, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 p-6 border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="text-gray-700">{c.feature}</div>
                <div className="text-center">
                  {c.kay ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                      <span className="text-gray-400">-</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  {c.others ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                      <span className="text-gray-400">-</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/30 mb-8">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Ready to Transform<br />Your Studies?
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Join 10,000+ students already using Kabyar to achieve their academic goals. 
                Start free today - no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-14 px-10 text-lg rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:scale-105 border-0">
                  <Link href="/register">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" className="h-14 px-10 text-lg rounded-2xl bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm">
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <Image src="/logo.png" alt="Kabyar" width={280} height={74} className="object-contain h-16 w-auto" />
              </div>
              <p className="text-sm">Your intelligent study companion. AI-powered tools for better learning.</p>
            </div>
            
            {/* Tools */}
            <div>
              <h4 className="font-semibold text-white mb-4">Tools</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tools/essay-writer" className="hover:text-white transition">Essay Writer</Link></li>
                <li><Link href="/tools/ai-detector" className="hover:text-white transition">AI Detector</Link></li>
                <li><Link href="/tools/humanizer" className="hover:text-white transition">Humanizer</Link></li>
                <li><Link href="/tools/answer-finder" className="hover:text-white transition">Answer Finder</Link></li>
                <li><Link href="/tools/tutor" className="hover:text-white transition">AI Tutor</Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/tools" className="hover:text-white transition">All Tools</Link></li>
                <li><Link href="/tools/study-guide" className="hover:text-white transition">Study Guides</Link></li>
                <li><Link href="/tools/presentation" className="hover:text-white transition">Presentations</Link></li>
                <li><Link href="/tools/homework-helper" className="hover:text-white transition">Homework Help</Link></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; 2025 Kabyar. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 1s ease-out forwards;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
