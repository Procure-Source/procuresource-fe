"use client";

import Link from "next/link";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import BackButton from "@/components/ui/back-button";
import { ArrowRight, BadgeCheck, Globe2, ShieldCheck, Sparkles } from "lucide-react";

type AuthSplitShellProps = {
  dir?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  sideTitle: string;
  sideDescription: string;
  mode: "login" | "register";
};

const proofPoints = [
  { label: "Verified GCC supplier records", icon: BadgeCheck },
  { label: "AHRI, UL, SASO and ISO readiness", icon: ShieldCheck },
  { label: "Dubai, Riyadh and regional coverage", icon: Globe2 },
];

export default function AuthSplitShell({
  dir,
  eyebrow,
  title,
  subtitle,
  children,
  sideTitle,
  sideDescription,
  mode,
}: AuthSplitShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fb]" dir={dir}>
      <Navbar />
      <main className="flex-grow pt-[88px]">
        <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)]">
          <aside className="relative hidden overflow-hidden bg-[#05070b] px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-14">
            <div className="absolute inset-0 opacity-80">
              <div className="absolute left-[-18%] top-[-10%] h-[420px] w-[420px] rounded-full bg-[#0066cc]/30 blur-[100px]" />
              <div className="absolute bottom-[-12%] right-[-12%] h-[360px] w-[360px] rounded-full bg-[#2997ff]/20 blur-[90px]" />
              <div className="absolute inset-x-10 top-32 h-px bg-gradient-to-r from-transparent via-[#2997ff]/60 to-transparent" />
            </div>

            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-semibold text-white/80 hover:text-white">
                ProcureSource
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#8fd0ff]">
                <Sparkles className="h-3.5 w-3.5" />
                Industrial procurement intelligence
              </div>
              <h2 className="text-[44px] font-bold leading-[1.02] tracking-normal xl:text-[58px]">
                {sideTitle}
              </h2>
              <p className="mt-5 max-w-lg text-[17px] leading-7 text-white/70">
                {sideDescription}
              </p>
            </div>

            <div className="relative grid gap-3">
              {proofPoints.map((point) => (
                <div key={point.label} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 py-3">
                  <point.icon className="h-5 w-5 text-[#2997ff]" />
                  <span className="text-[14px] font-medium text-white/82">{point.label}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="flex w-full items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
            <div className="w-full max-w-[620px]">
              <div className="mb-5">
                <BackButton href="/" />
              </div>

              <div className="mb-5 rounded-[18px] border border-[#d8dce5] bg-white px-4 py-3 shadow-sm lg:hidden">
                <p className="text-[12px] font-semibold uppercase text-[#0066cc]">{mode === "login" ? "Secure access" : "Verified onboarding"}</p>
                <p className="mt-1 text-[13px] leading-5 text-[#5f6673]">{sideDescription}</p>
              </div>

              <div className="rounded-[22px] border border-[#d8dce5] bg-white p-5 shadow-[0_24px_70px_rgba(18,34,64,0.10)] sm:p-8 lg:p-10">
                <div className="mb-7 text-center sm:text-left">
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-normal text-[#0066cc]">
                    {eyebrow}
                  </p>
                  <h1 className="text-[30px] font-bold leading-tight text-[#101217] sm:text-[36px]">
                    {title}
                  </h1>
                  <p className="mt-3 text-[15px] leading-6 text-[#69707d]">
                    {subtitle}
                  </p>
                </div>
                {children}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
