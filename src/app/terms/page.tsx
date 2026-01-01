"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center h-8">
            <Image src="/logo.png" alt="Kabyar" width={120} height={32} className="object-contain h-8 w-auto" />
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: December 31, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing or using Kabyar, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="text-gray-600">
              Kabyar is an AI-powered educational platform that provides tools including 
              essay writing, tutoring, homework help, and study materials. Our services 
              are designed to assist with learning, not to replace it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 13 years old to use this service</li>
              <li>One account per person is allowed</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-3">You agree NOT to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Use the service for cheating or academic dishonesty</li>
              <li>Submit content that violates others' rights</li>
              <li>Attempt to bypass usage limits or credits system</li>
              <li>Use automated tools to access the service</li>
              <li>Share your account with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Credits and Payments</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Free users receive 50 daily credits</li>
              <li>Paid plans provide additional credits and features</li>
              <li>Payments are processed securely through third-party providers</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Refunds are handled on a case-by-case basis</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Content Ownership</h2>
            <p className="text-gray-600">
              You retain ownership of content you create using our tools. However, you grant 
              us a license to use this content to improve our services. AI-generated content 
              should be reviewed and edited before submission for academic purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Disclaimer</h2>
            <p className="text-gray-600">
              Kabyar is provided "as is" without warranties of any kind. We do not guarantee 
              the accuracy of AI-generated content. Users are responsible for verifying 
              information and using the service responsibly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Termination</h2>
            <p className="text-gray-600">
              We reserve the right to suspend or terminate accounts that violate these terms. 
              You may also delete your account at any time through your settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p className="text-gray-600">
              For questions about these Terms, contact us at:
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
