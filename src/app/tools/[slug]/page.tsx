import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getToolPage, toolPages } from "@/lib/tools-data";
import { 
  ArrowRight, 
  Check, 
  ChevronDown,
  FileText,
  ShieldCheck,
  Wand2,
  Search,
  BookOpen,
  GraduationCap,
  Presentation,
  MessageCircle,
  Layers,
  Type,
  Sparkles,
  Quote,
  Globe,
  Download,
  Target,
  BarChart,
  List,
  Lightbulb,
  Zap,
  RefreshCw,
  Shield,
  Repeat,
  Mic,
  Columns,
  ListOrdered,
  Calculator,
  Link as LinkIcon,
  Compass,
  Footprints,
  Brain,
  Key,
  HelpCircle,
  AlignLeft,
  Share2,
  Settings,
  Layout,
  Palette,
  MessageSquare,
  Hash,
  User,
  Clock,
  Heart,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const iconMap: Record<string, React.ElementType> = {
  FileText, ShieldCheck, Wand2, Search, BookOpen, GraduationCap, Presentation, MessageCircle,
  Layers, Type, Sparkles, Quote, Globe, Download, Target, BarChart, List, Lightbulb, Zap,
  RefreshCw, Shield, Repeat, Mic, Columns, ListOrdered, Calculator, Link: LinkIcon, Compass,
  Footprints, Brain, Key, HelpCircle, AlignLeft, Share2, Settings, Layout, Palette, MessageSquare,
  Hash, User, Clock, Heart, Check,
};

const colorClasses: Record<string, { bg: string; text: string; light: string; border: string }> = {
  blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-100", border: "border-blue-200" },
  green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-100", border: "border-green-200" },
  purple: { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-100", border: "border-purple-200" },
  orange: { bg: "bg-orange-600", text: "text-orange-600", light: "bg-orange-100", border: "border-orange-200" },
  teal: { bg: "bg-teal-600", text: "text-teal-600", light: "bg-teal-100", border: "border-teal-200" },
  indigo: { bg: "bg-indigo-600", text: "text-indigo-600", light: "bg-indigo-100", border: "border-indigo-200" },
  pink: { bg: "bg-pink-600", text: "text-pink-600", light: "bg-pink-100", border: "border-pink-200" },
  cyan: { bg: "bg-cyan-600", text: "text-cyan-600", light: "bg-cyan-100", border: "border-cyan-200" },
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolPage(slug);
  
  if (!tool) {
    return { title: "Tool Not Found - Kabyar" };
  }

  return {
    title: `${tool.name} - Kabyar | Free AI Tool for Students`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} - ${tool.tagline}`,
      description: tool.description,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  return toolPages.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolPage(slug);

  if (!tool) {
    notFound();
  }

  const colors = colorClasses[tool.color] || colorClasses.blue;
  const MainIcon = iconMap[tool.icon] || FileText;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center h-8">
              <Image src="/logo.png" alt="Kabyar" width={280} height={74} className="object-contain h-16 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">Blog</Link>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
              <Link 
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 ${colors.light} rounded-2xl mb-6`}>
              <MainIcon className={`w-10 h-10 ${colors.text}`} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {tool.name}
            </h1>
            <p className={`text-xl font-medium ${colors.text} mb-4`}>
              {tool.tagline}
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {tool.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/dashboard/${tool.slug}`}
                className={`inline-flex items-center gap-2 px-8 py-4 ${colors.bg} text-white font-semibold rounded-xl hover:opacity-90 transition-opacity`}
              >
                Try {tool.name} Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                See How It Works
                <ChevronDown className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed with our {tool.name.toLowerCase()}.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tool.features.map((feature, index) => {
              const FeatureIcon = iconMap[feature.icon] || Check;
              return (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl border ${colors.border} bg-white hover:shadow-lg transition-shadow`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.light} rounded-xl mb-4`}>
                    <FeatureIcon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in just three simple steps.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {tool.howItWorks.map((step, index) => (
                <div key={index} className="flex gap-6">
                  <div className={`flex-shrink-0 w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {step.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Students Love It
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tool.benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50"
                >
                  <div className={`flex-shrink-0 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {tool.faqs.map((faq, index) => (
                <details 
                  key={index}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${colors.bg}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {tool.cta.title}
          </h2>
          <p className="text-white/80 text-lg mb-8">
            {tool.cta.description}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Other Tools Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore More Tools
            </h2>
            <p className="text-lg text-gray-600">
              Discover our full suite of AI-powered learning tools.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {toolPages.filter(t => t.slug !== tool.slug).slice(0, 4).map((otherTool) => {
              const OtherIcon = iconMap[otherTool.icon] || FileText;
              const otherColors = colorClasses[otherTool.color] || colorClasses.blue;
              return (
                <Link
                  key={otherTool.slug}
                  href={`/tools/${otherTool.slug}`}
                  className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all text-center group"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${otherColors.light} rounded-xl mb-3 group-hover:scale-110 transition-transform`}>
                    <OtherIcon className={`w-6 h-6 ${otherColors.text}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {otherTool.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center h-8">
              <Image src="/logo.png" alt="Kabyar" width={120} height={32} className="object-contain h-8 w-auto brightness-0 invert" />
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            </div>
            <p className="text-sm">© 2025 Kabyar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
