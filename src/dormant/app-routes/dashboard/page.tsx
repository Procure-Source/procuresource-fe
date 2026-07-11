"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { getDashboardPathForRole } from "@/lib/tags";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    router.push(getDashboardPathForRole(user.role));
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[17px] text-[#1d1d1f] font-medium">{t("common.loading")}</p>
      </div>
    </div>
  );
}
