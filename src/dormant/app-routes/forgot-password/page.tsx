"use client";

import React, { useState } from "react";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import BackButton from "@/components/ui/back-button";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { dir } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" dir={dir}>
      <Navbar />
      <main className="flex-grow pt-[88px] flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-full max-w-[420px] mx-auto px-4 py-8 sm:py-12">
          <div className="mb-4">
            <BackButton href="/login" />
          </div>
          <div className="bg-white rounded-[18px] p-6 sm:p-8 shadow-sm">
            {!sent ? (
              <>
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Mail className="w-7 h-7 text-[#0066cc]" />
                </div>
                <h1 className="text-[24px] font-semibold text-[#1d1d1f] text-center mb-2">
                  Forgot password?
                </h1>
                <p className="text-[14px] text-[#86868b] text-center mb-6">
                  No worries, we&apos;ll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0066cc] transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[44px] bg-[#0066cc] text-white rounded-full text-[15px] font-medium hover:bg-[#0077ed] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
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
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <h1 className="text-[22px] font-semibold text-[#1d1d1f] mb-2">
                  Check your email
                </h1>
                <p className="text-[14px] text-[#86868b] mb-1">
                  We sent a password reset link to
                </p>
                <p className="text-[14px] font-medium text-[#1d1d1f] mb-6">
                  {email}
                </p>
                <p className="text-[13px] text-[#86868b] mb-6">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setSent(false)}
                    className="text-[#0066cc] hover:underline font-medium"
                  >
                    try again
                  </button>
                </p>
                <Link
                  href="/login"
                  className="text-[14px] text-[#0066cc] font-medium hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
