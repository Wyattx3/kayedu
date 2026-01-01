import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPost, getRecentPosts, type BlogPost } from "@/lib/blog-data";
import { ArrowLeft, Calendar, Clock, Tag, User, Share2, Twitter, Facebook, Linkedin } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  
  if (!post) {
    return { title: "Post Not Found - Kabyar Blog" };
  }

  return {
    title: `${post.title} - Kabyar Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

function RelatedPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h4>
        <p className="text-sm text-gray-500">{post.readTime}</p>
      </article>
    </Link>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const recentPosts = getRecentPosts(4).filter(p => p.slug !== post.slug).slice(0, 3);

  const categoryColors: Record<string, string> = {
    "ai-writing": "bg-blue-100 text-blue-700",
    "study-tips": "bg-green-100 text-green-700",
    "homework-help": "bg-purple-100 text-purple-700",
    "education": "bg-orange-100 text-orange-700",
    "productivity": "bg-pink-100 text-pink-700",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center h-8">
              <Image src="/kabyar-logo.png" alt="Kabyar" width={280} height={74} className="object-contain h-16 w-auto" />
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/blog" className="text-sm font-medium text-blue-600">
                Blog
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Category */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColors[post.category] || "bg-gray-100 text-gray-700"}`}>
              {post.category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString("en-US", { 
                  month: "long", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-600 prose-ol:text-gray-600">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share this article
              </h3>
              <div className="flex gap-2">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://kaykabyar.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-gray-100 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://kaykabyar.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-gray-100 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://kaykabyar.com/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-gray-100 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="sticky top-24 space-y-8">
              {/* CTA Card */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-2">Try Kabyar Free</h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI-powered tools to help you write better essays, study smarter, and ace your exams.
                </p>
                <Link
                  href="/register"
                  className="block w-full py-2.5 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Related Posts */}
              {recentPosts.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Related Articles</h3>
                  <div className="space-y-3">
                    {recentPosts.map((relatedPost) => (
                      <RelatedPost key={relatedPost.slug} post={relatedPost} />
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">Stay Updated</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the latest study tips and AI writing guides delivered to your inbox.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center h-8">
              <Image src="/kabyar-logo.png" alt="Kabyar" width={280} height={74} className="object-contain h-16 w-auto" />
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
