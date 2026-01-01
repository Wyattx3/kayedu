"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setIsInvalid(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "Invalid or expired token") {
          setIsInvalid(true);
          return;
        }
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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

  if (isInvalid) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Invalid or expired link</h1>
        <p className="text-gray-500 mb-8">
          This password reset link is invalid or has expired.<br />
          Please request a new one.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600">
            Request new link
          </Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Password reset successful!</h1>
        <p className="text-gray-500 mb-8">
          Your password has been reset.<br />
          Redirecting to login...
        </p>
        <Link href="/login">
          <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600">
            Go to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reset your password</h1>
      <p className="text-gray-500 mb-8">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 bg-[#F5F5F5] border-[#E5E5E5] text-gray-900 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-400">Minimum 6 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Confirm New Password
          </Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 bg-[#F5F5F5] border-[#E5E5E5] text-gray-900"
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
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center mb-10">
            <Image src="/logo.png" alt="Kabyar" width={320} height={84} className="object-contain h-20 w-auto" priority />
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
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
            Secure your account
          </h2>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-t-full bg-gradient-to-t from-blue-900/30 to-transparent"></div>
      </div>
    </div>
  );
}

