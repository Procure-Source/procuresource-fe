"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { friendlyError } from "@/lib/friendly-error";
import { AlertTriangle } from "lucide-react";
import AuthSplitShell from "@/components/auth/auth-split-shell";

export default function LoginPage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      if (res.ok) {
        toast.success("Verification email resent! Check your inbox.");
      } else {
        toast.error("Failed to resend. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setUnverifiedEmail(null);
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
      } else {
        toast.error(friendlyError(error, "Failed to sign in"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitShell
      dir={dir}
      mode="login"
      eyebrow="Secure platform access"
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      sideTitle="Procurement control for verified industrial teams."
      sideDescription="Access RFQs, supplier responses, product records, documents, notifications and project workflows from one regional procurement command center."
    >
      {unverifiedEmail && (
        <div className="mb-5 rounded-[14px] border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="mb-1 text-[13px] font-semibold text-amber-900">
                Email not verified
              </p>
              <p className="mb-3 text-[12px] leading-5 text-amber-800">
                Check your inbox for the verification link, or resend it now.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="text-[12px] font-semibold text-[#0066cc] hover:underline disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend verification email"}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-[#1d1d1f]">
            {t("common.email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
            className="h-[48px] w-full rounded-[12px] border border-[#d2d2d7] px-4 text-[16px] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-4 focus:ring-[#0066cc]/10"
            required
          />
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label className="block text-[14px] font-semibold text-[#1d1d1f]">
              {t("common.password")}
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-[#0066cc] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            className="h-[48px] w-full rounded-[12px] border border-[#d2d2d7] px-4 text-[16px] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-4 focus:ring-[#0066cc]/10"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="min-h-[48px] w-full rounded-full bg-[#0066cc] px-5 text-[16px] font-semibold text-white transition-colors hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : t("common.signIn")}
        </button>
      </form>

      <div className="mt-6 border-t border-[#d2d2d7] pt-6 text-center">
        <p className="text-[14px] text-[#69707d]">
          {t("login.newUser")}{" "}
          <Link href="/register" className="font-semibold text-[#0066cc] hover:underline">
            {t("common.signUp")}
          </Link>
        </p>
      </div>
    </AuthSplitShell>
  );
}
