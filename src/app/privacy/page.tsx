"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center h-8">
            <Image src="/logo.png" alt="Kabyar" width={160} height={42} className="object-contain h-10 w-auto" />
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: December 31, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 mb-3">
              We collect information you provide directly to us, such as:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Account information (name, email, password)</li>
              <li>Profile information (school, major, study preferences)</li>
              <li>Content you create using our tools</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and improve our services</li>
              <li>Personalize your learning experience</li>
              <li>Send you updates and notifications</li>
              <li>Analyze usage patterns to improve features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information. 
              Your data is encrypted in transit and at rest. We do not sell your personal 
              information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h2>
            <p className="text-gray-600">
              We use cookies and similar technologies to enhance your experience, analyze traffic, 
              and for advertising purposes. You can manage your cookie preferences through our 
              cookie consent banner.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third-Party Services</h2>
            <p className="text-gray-600">
              We use third-party services including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Google Analytics for usage analysis</li>
              <li>Ezoic for advertising</li>
              <li>Authentication providers (Google)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="text-gray-600">
              You have the right to access, update, or delete your personal information. 
              Contact us at support@kabyar.net for any privacy-related requests.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:support@kabyar.net" className="text-blue-600 hover:underline">
                support@kabyar.net
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
