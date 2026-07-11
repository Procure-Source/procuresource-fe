"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, FileText, Home, RefreshCw, SearchX, ShieldCheck } from "lucide-react";

import { ProcureSourceMark } from "@/components/launch/procuresource-mark";
import { ProductSection, ProductShell } from "@/components/product/product-shell";

type StateVariant = "public" | "dashboard" | "auth";

function SkeletonLine({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-full bg-[#e6e1d8] ${className}`} />;
}

function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`rounded-[28px] border border-white/80 bg-white/82 p-5 shadow-[0_18px_44px_rgba(61,48,40,0.06)] ${tall ? "min-h-[220px]" : "min-h-[150px]"}`}>
      <div className="flex items-center justify-between">
        <span className="h-11 w-11 animate-pulse rounded-full bg-[#eef7ff]" />
        <SkeletonLine className="h-7 w-20 bg-[#f4f3ed]" />
      </div>
      <SkeletonLine className="mt-8 h-4 w-28" />
      <SkeletonLine className="mt-4 h-8 w-16" />
      <SkeletonLine className="mt-5 h-3 w-full" />
      <SkeletonLine className="mt-2 h-3 w-3/4" />
    </div>
  );
}

export function ProductLoadingScreen({
  variant = "public",
  label = "Loading ProcureSource",
}: {
  variant?: StateVariant;
  label?: string;
}) {
  if (variant === "dashboard") {
    return <DashboardLoadingScreen label={label} />;
  }

  if (variant === "auth") {
    return <AuthLoadingScreen />;
  }

  return (
    <ProductShell>
      <ProductSection className="py-12 sm:py-16">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="rounded-[38px] border border-[#e1ddd5] bg-white p-6 shadow-[0_24px_70px_rgba(61,48,40,0.08)]">
            <div className="flex items-center gap-3">
              <ProcureSourceMark className="h-10 w-10" />
              <p className="text-[13px] font-semibold text-[#0066cc]">{label}</p>
            </div>
            <SkeletonLine className="mt-10 h-12 w-4/5 sm:h-16" />
            <SkeletonLine className="mt-5 h-4 w-2/3" />
            <SkeletonLine className="mt-3 h-4 w-1/2" />
            <div className="mt-8 flex flex-wrap gap-3">
              <SkeletonLine className="h-11 w-32 bg-[#cfe7ff]" />
              <SkeletonLine className="h-11 w-28" />
            </div>
          </section>
          <aside className="grid gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </aside>
        </div>
      </ProductSection>
    </ProductShell>
  );
}

export function DashboardLoadingScreen({ label = "Loading dashboard" }: { label?: string }) {
  return (
    <ProductShell showFooter={false} showHeader={false}>
      <main className="min-h-screen bg-[#e8e6df] p-2 text-[#352a24] sm:p-4">
        <div className="mx-auto grid min-h-[calc(100vh-16px)] max-w-[1440px] gap-3 sm:min-h-[calc(100vh-32px)] sm:gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden rounded-[36px] border border-white/80 bg-white/72 p-4 shadow-[0_24px_70px_rgba(61,48,40,0.08)] lg:block">
            <div className="flex h-14 items-center gap-3 rounded-full border border-[#d8d2c8] bg-[#fbfbf7] pl-2 pr-4">
              <ProcureSourceMark className="h-9 w-9" />
              <div className="flex-1">
                <SkeletonLine className="h-4 w-28" />
                <SkeletonLine className="mt-2 h-3 w-20" />
              </div>
            </div>
            <div className="mt-7 grid gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex h-12 items-center gap-3 rounded-full bg-white/72 px-3">
                  <span className="h-8 w-8 animate-pulse rounded-full bg-[#eef7ff]" />
                  <SkeletonLine className="h-3 w-24" />
                </div>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-3 flex h-14 items-center gap-2 rounded-full border border-white/80 bg-white/82 p-2 shadow-[0_16px_42px_rgba(61,48,40,0.08)] lg:hidden">
              <ProcureSourceMark className="h-9 w-9" />
              <SkeletonLine className="h-4 w-32" />
            </div>
            <div className="rounded-[30px] border border-white/80 bg-[#fbfbf7] p-4 shadow-[0_24px_70px_rgba(61,48,40,0.08)] sm:rounded-[42px] sm:p-6">
              <p className="text-[12px] font-semibold text-[#0066cc]">{label}</p>
              <SkeletonLine className="mt-4 h-10 w-4/5 sm:h-14 sm:w-2/3" />
              <SkeletonLine className="mt-5 h-4 w-3/4" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={index} tall />
                ))}
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <SkeletonCard tall />
                <SkeletonCard tall />
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProductShell>
  );
}

export function AuthLoadingScreen() {
  return (
    <ProductShell showFooter={false}>
      <main className="min-h-[calc(100vh-88px)] bg-[#f4f3ed] p-3 sm:p-4">
        <div className="grid min-h-[calc(100vh-120px)] gap-4 lg:grid-cols-[minmax(420px,0.92fr)_minmax(0,1.08fr)]">
          <section className="rounded-[44px] border border-white/80 bg-white/74 p-7 shadow-[0_24px_70px_rgba(61,48,40,0.08)]">
            <SkeletonLine className="h-12 w-40" />
            <SkeletonLine className="mt-12 h-10 w-36" />
            <SkeletonLine className="mt-5 h-4 w-72" />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <SkeletonLine className="h-14 w-full bg-[#eef7ff]" />
              <SkeletonLine className="h-14 w-full" />
            </div>
            <div className="mt-8 grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonLine key={index} className="h-[52px] w-full" />
              ))}
            </div>
          </section>
          <aside className="rounded-[44px] border border-white/80 bg-white p-8 shadow-[0_24px_70px_rgba(61,48,40,0.08)]">
            <SkeletonLine className="h-4 w-44 bg-[#cfe7ff]" />
            <SkeletonLine className="mt-7 h-16 w-4/5" />
            <SkeletonLine className="mt-8 h-56 w-full bg-[#eef7ff]" />
          </aside>
        </div>
      </main>
    </ProductShell>
  );
}

export function ProductErrorScreen({
  reset,
  variant = "public",
  title = "This screen could not load.",
  message = "Please try again. If the problem continues, return to the previous screen.",
  backHref = "/",
  backLabel = "Go home",
}: {
  reset?: () => void;
  variant?: StateVariant;
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const shellProps = variant === "dashboard" ? { showFooter: false, showHeader: false } : {};

  return (
    <ProductShell {...shellProps}>
      <main className={variant === "dashboard" ? "min-h-screen bg-[#e8e6df] p-3 sm:p-4" : "bg-[#fbfbf7]"}>
        <ProductSection className="flex min-h-[calc(100vh-140px)] items-center justify-center py-12">
          <section className="w-full max-w-[760px] rounded-[40px] border border-[#e1ddd5] bg-white p-6 text-center shadow-[0_24px_70px_rgba(61,48,40,0.08)] sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4ed] text-[#b54708]">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <p className="mt-5 text-[13px] font-semibold text-[#0066cc]">Recovery path</p>
            <h1 className="mt-3 text-[34px] font-semibold leading-tight text-[#352a24] sm:text-[46px]">{title}</h1>
            <p className="mx-auto mt-4 max-w-[500px] text-[14px] leading-6 text-[#5d5148]">{message}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {reset && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white hover:bg-[#1677e8]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              )}
              <Link
                href={backHref}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8d2c8] bg-white px-5 text-[14px] font-semibold text-[#352a24] hover:bg-[#eef7ff]"
              >
                <Home className="h-4 w-4" />
                {backLabel}
              </Link>
              <Link
                href="/flows"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#b9ddff] bg-[#eef7ff] px-5 text-[14px] font-semibold text-[#0066cc] hover:bg-white"
              >
                View paths
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </ProductSection>
      </main>
    </ProductShell>
  );
}

export function ProductNotFoundScreen() {
  return (
    <ProductShell>
      <ProductSection className="flex min-h-[calc(100vh-180px)] items-center justify-center py-12">
        <section className="w-full max-w-[860px] rounded-[40px] border border-[#e1ddd5] bg-white p-6 shadow-[0_24px_70px_rgba(61,48,40,0.08)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <div className="flex min-h-[220px] items-center justify-center rounded-[32px] bg-[#eef7ff]">
              <SearchX className="h-16 w-16 text-[#0066cc]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0066cc]">Page not found</p>
              <h1 className="mt-3 text-[36px] font-semibold leading-tight text-[#352a24] sm:text-[48px]">
                This link does not match an active ProcureSource screen.
              </h1>
              <p className="mt-4 text-[14px] leading-6 text-[#5d5148]">
                Return to the right purchaser, supplier, or verification screen.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white hover:bg-[#1677e8]">
                  <Home className="h-4 w-4" />
                  Go home
                </Link>
                <Link href="/flows" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#b9ddff] bg-[#eef7ff] px-5 text-[14px] font-semibold text-[#0066cc] hover:bg-white">
                  <FileText className="h-4 w-4" />
                  View paths
                </Link>
                <Link href="/product" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8d2c8] bg-white px-5 text-[14px] font-semibold text-[#352a24] hover:bg-[#eef7ff]">
                  <ShieldCheck className="h-4 w-4" />
                  Open RFQ workspace
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ProductSection>
    </ProductShell>
  );
}
