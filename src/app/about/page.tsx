"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Sparkles, 
  Shield, 
  Zap,
  GraduationCap,
  Heart,
  Globe,
  Mail,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center h-8">
            <Image src="/kabyar-logo.png" alt="Kabyar" width={280} height={74} className="object-contain h-16 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/tools" className="text-gray-600 hover:text-gray-900">Tools</Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </nav>
          <Link href="/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About Kabyar
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Kabyar is an AI-powered learning assistant designed to help students 
            achieve their academic goals. We believe education should be accessible, 
            personalized, and effective for everyone.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Mission</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Empower Students</h3>
              <p className="text-sm text-gray-600">
                Help students of all levels - from GED, IGCSE to university - excel in their studies.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Learning</h3>
              <p className="text-sm text-gray-600">
                Leverage cutting-edge AI to provide personalized tutoring and assistance.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Global Access</h3>
              <p className="text-sm text-gray-600">
                Make quality education tools accessible to students worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: BookOpen, title: "Essay Writer", desc: "Generate academic essays with proper structure" },
              { icon: Shield, title: "AI Detector", desc: "Check if content is AI-generated" },
              { icon: Sparkles, title: "Humanizer", desc: "Make AI text sound more natural" },
              { icon: Zap, title: "Answer Finder", desc: "Get instant answers to questions" },
              { icon: Users, title: "Homework Helper", desc: "Step-by-step homework guidance" },
              { icon: GraduationCap, title: "Study Guide", desc: "Create comprehensive study materials" },
              { icon: BookOpen, title: "Presentation Maker", desc: "Generate professional slides" },
              { icon: Heart, title: "AI Tutor", desc: "Personal tutoring on any subject" },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-gray-600 mb-8">
            Kabyar is built by a passionate team of educators and developers 
            committed to improving education through technology.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="mailto:support@kabyar.net">
              <Button variant="outline" className="rounded-xl">
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of students using Kabyar to improve their grades.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="rounded-xl px-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center h-8">
            <Image src="/kabyar-logo.png" alt="Kabyar" width={280} height={74} className="object-contain h-16 w-auto" />
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-sm">© 2025 Kabyar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
