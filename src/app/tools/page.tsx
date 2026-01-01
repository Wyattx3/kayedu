import Link from "next/link";
import Image from "next/image";
import { toolPages } from "@/lib/tools-data";
import { 
  ArrowRight,
  FileText,
  ShieldCheck,
  Wand2,
  Search,
  BookOpen,
  GraduationCap,
  Presentation,
  MessageCircle,
} from "lucide-react";

export const metadata = {
  title: "AI Tools for Students - Kabyar | Free Essay Writer, Tutor & More",
  description: "Explore Kabyar's suite of AI-powered tools: Essay Writer, AI Detector, Humanizer, Answer Finder, Homework Helper, Study Guide Generator, Presentation Maker, and AI Tutor.",
};

const iconMap: Record<string, React.ElementType> = {
  FileText, ShieldCheck, Wand2, Search, BookOpen, GraduationCap, Presentation, MessageCircle,
};

const colorClasses: Record<string, { bg: string; text: string; light: string }> = {
  blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-100" },
  green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-100" },
  purple: { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-100" },
  orange: { bg: "bg-orange-600", text: "text-orange-600", light: "bg-orange-100" },
  teal: { bg: "bg-teal-600", text: "text-teal-600", light: "bg-teal-100" },
  indigo: { bg: "bg-indigo-600", text: "text-indigo-600", light: "bg-indigo-100" },
  pink: { bg: "bg-pink-600", text: "text-pink-600", light: "bg-pink-100" },
  cyan: { bg: "bg-cyan-600", text: "text-cyan-600", light: "bg-cyan-100" },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Kabyar" width={90} height={24} className="object-contain h-6 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/tools" className="text-sm font-medium text-blue-600">Tools</Link>
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

      {/* Hero */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Tools for Students
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            From essay writing to exam prep, our suite of AI tools helps you learn smarter and achieve more.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try All Tools Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {toolPages.map((tool) => {
              const Icon = iconMap[tool.icon] || FileText;
              const colors = colorClasses[tool.color] || colorClasses.blue;
              
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all bg-white"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 ${colors.light} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h2>
                  <p className={`text-sm font-medium ${colors.text} mb-3`}>
                    {tool.tagline}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:gap-3 transition-all">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Study Smarter?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of students using Kabyar's AI tools to improve their grades.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Kabyar" width={90} height={24} className="object-contain h-6 w-auto brightness-0 invert" />
            </div>
            <div className="flex gap-6 text-sm">
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
