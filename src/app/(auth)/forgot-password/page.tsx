"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send reset email");
      }

      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center mb-10">
            <Image src="/logo.png" alt="Kabyar" width={100} height={28} className="object-contain h-7 w-auto" priority />
          </Link>

          {!isSubmitted ? (
            <>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>

              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Forgot your password?</h1>
              <p className="text-gray-500 mb-8">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="you@example.com"
                    className="h-12 bg-[#F5F5F5] border-[#E5E5E5] text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h1>
              <p className="text-gray-500 mb-8">
                We&apos;ve sent a password reset link to<br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try another email
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full h-12">
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Dark background */}
      <div className="hidden lg:flex flex-1 bg-[#0D0D0D] items-center justify-center relative overflow-hidden">
        <div className="text-center z-10">
          <div className="flex items-center justify-center gap-1 mb-6">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-sm ml-3"></div>
          </div>
          <h2 className="text-4xl font-bold text-white">
            We&apos;ve got you covered
          </h2>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-t-full bg-gradient-to-t from-blue-900/30 to-transparent"></div>
      </div>
    </div>
  );
}

