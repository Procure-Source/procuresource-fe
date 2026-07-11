"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please check your email link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "same-origin",
        });
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          await refreshUser();
          setTimeout(() => router.push("/dashboard"), 2500);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verify();
  }, [token, refreshUser, router]);

  return (
    <div className="w-full max-w-[440px] mx-auto px-4 py-12">
      <div className="bg-white rounded-[18px] p-8 sm:p-10 shadow-sm text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-[#0066cc] animate-spin mx-auto mb-4" />
            <h1 className="text-[22px] font-semibold text-[#1d1d1f] mb-2">
              Verifying your email...
            </h1>
            <p className="text-[14px] text-[#86868b]">
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-[22px] font-semibold text-[#1d1d1f] mb-2">
              Email Verified!
            </h1>
            <p className="text-[14px] text-[#86868b] mb-4">{message}</p>
            <p className="text-[13px] text-[#86868b]">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-[22px] font-semibold text-[#1d1d1f] mb-2">
              Verification Failed
            </h1>
            <p className="text-[14px] text-[#86868b] mb-6">{message}</p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-[#0066cc] text-white text-[15px] font-medium rounded-full hover:bg-[#0077ed] transition-colors"
            >
              Go to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <VerifyEmailContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
