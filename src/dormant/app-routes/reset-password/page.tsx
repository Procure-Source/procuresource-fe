"use client";

import React, { useState, Suspense } from "react";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, CheckCircle2, ArrowLeft, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");

  if (!token) {
    return (
      <div className="w-full max-w-[420px] mx-auto px-4 py-12">
        <div className="bg-white rounded-[18px] p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f] mb-2">
            Invalid Link
          </h1>
          <p className="text-[14px] text-[#86868b] mb-6">
            This reset link is invalid or missing. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-3 bg-[#0066cc] text-white text-[15px] font-medium rounded-full hover:bg-[#0077ed] transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Reset failed.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-[420px] mx-auto px-4 py-12">
        <div className="bg-white rounded-[18px] p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          </div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f] mb-2">
            Password Reset!
          </h1>
          <p className="text-[14px] text-[#86868b] mb-4">
            Your password has been reset successfully.
          </p>
          <p className="text-[13px] text-[#86868b]">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-[420px] mx-auto px-4 py-12">
        <div className="bg-white rounded-[18px] p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f] mb-2">
            Reset Failed
          </h1>
          <p className="text-[14px] text-[#86868b] mb-6">{errorMessage}</p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-3 bg-[#0066cc] text-white text-[15px] font-medium rounded-full hover:bg-[#0077ed] transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-[18px] p-6 sm:p-8 shadow-sm">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-[#0066cc]" />
        </div>
        <h1 className="text-[24px] font-semibold text-[#1d1d1f] text-center mb-2">
          Set new password
        </h1>
        <p className="text-[14px] text-[#86868b] text-center mb-6">
          Your new password must be at least 6 characters.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0066cc] transition-colors"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0066cc] transition-colors"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] bg-[#0066cc] text-white rounded-full text-[15px] font-medium hover:bg-[#0077ed] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#d2d2d7] text-center">
          <Link
            href="/login"
            className="text-[14px] text-[#0066cc] font-medium hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { dir } = useLanguage();
  return (
    <div className="flex flex-col min-h-screen" dir={dir}>
      <Navbar />
      <main className="flex-grow pt-[88px] flex items-center justify-center bg-[#f5f5f7]">
        <Suspense
          fallback={
            <div className="text-[#0066cc] animate-pulse">Loading...</div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
