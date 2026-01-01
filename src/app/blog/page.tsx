import Link from "next/link";
import Image from "next/image";
import { blogPosts, type BlogPost } from "@/lib/blog-data";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";

export const metadata = {
  title: "Blog - Kabyar | AI Writing & Study Tips",
  description: "Expert guides on AI writing, study techniques, homework help, and academic success. Learn how to study smarter with Kabyar.",
};

const categories = [
  { id: "all", name: "All Posts" },
  { id: "ai-writing", name: "AI Writing" },
  { id: "study-tips", name: "Study Tips" },
  { id: "homework-help", name: "Homework Help" },
  { id: "education", name: "Education" },
  { id: "productivity", name: "Productivity" },
];

function PostCard({ post }: { post: BlogPost }) {
  const categoryColors: Record<string, string> = {
    "ai-writing": "bg-blue-100 text-blue-700",
    "study-tips": "bg-green-100 text-green-700",
    "homework-help": "bg-purple-100 text-purple-700",
    "education": "bg-orange-100 text-orange-700",
    "productivity": "bg-pink-100 text-pink-700",
  };

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300">
        {/* Category Badge */}
        <div className="p-6 pb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryColors[post.category] || "bg-gray-100 text-gray-700"}`}>
            {post.category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.date).toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric", 
                year: "numeric" 
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Read More */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:gap-3 transition-all">
            Read Article
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  // Sort posts by date (newest first)
  const sortedPosts = [...blogPosts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center h-8">
              <Image src="/logo.png" alt="Kabyar" width={280} height={74} className="object-contain h-16 w-auto" />
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/blog" className="text-sm font-medium text-blue-600">
                Blog
              </Link>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kabyar Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert guides on AI writing, study techniques, and academic success. Learn smarter, not harder.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  cat.id === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
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
            <div className="flex items-center h-8">
              <Image src="/logo.png" alt="Kabyar" width={120} height={32} className="object-contain h-8 w-auto brightness-0 invert" />
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
