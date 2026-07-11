"use client";

import Link from "next/link";
import { ArrowRight, LogIn, Mail, Menu, X } from "lucide-react";
import { useState } from "react";

import { ProcureSourceMark } from "@/components/launch/procuresource-mark";

const productLinks = [
  { href: "/", label: "Home" },
  { href: "/faq", label: "FAQ" },
  { href: "/news", label: "News" },
  { href: "/access", label: "Access" },
];

const footerColumns = [
  {
    title: "Links",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/product", label: "RFQ workspace" },
      { href: "/spec-finder", label: "Spec finder" },
      { href: "/purchasers", label: "Purchasers" },
      { href: "/suppliers", label: "Suppliers" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/news", label: "News" },
      { href: "/advertise", label: "Advertise" },
      { href: "/security", label: "Security" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function ProductShell({
  children,
  tone = "light",
  showFooter = true,
  showHeader = true,
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
  showFooter?: boolean;
  showHeader?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbfbf7] text-[#352a24]" data-product-tone={tone}>
      {showHeader && (
        <header className="sticky top-0 z-50 px-3 py-3 sm:px-5">
          <nav className="mx-auto flex min-h-16 max-w-[1080px] items-center justify-between gap-3 rounded-full border border-white/80 bg-white/88 px-3 py-2 shadow-[0_18px_54px_rgba(61,48,40,0.10)] ring-1 ring-[#d8d2c8]/70 backdrop-blur-2xl sm:px-4">
            <Link
              href="/"
              className="flex h-11 items-center gap-3 rounded-full bg-[#fbfbf7] pl-2 pr-4 shadow-[inset_0_0_0_1px_rgba(216,210,200,0.82)]"
              aria-label="ProcureSource home"
            >
              <ProcureSourceMark className="h-8 w-8" />
              <span className="text-[15px] font-semibold tracking-normal text-[#352a24]">ProcureSource</span>
            </Link>

            <div className="hidden min-h-11 items-center gap-1 rounded-full border border-[#e5ded4] bg-[#fbfbf7] p-1 lg:flex">
              {productLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-[13px] font-semibold tracking-normal text-[#5d5148] transition-colors hover:bg-white hover:text-[#0066cc] hover:shadow-[0_8px_20px_rgba(0,102,204,0.08)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/login"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8d2c8] bg-white px-4 text-[13px] font-semibold text-[#352a24] shadow-[0_10px_28px_rgba(61,48,40,0.06)] hover:bg-[#eef7ff]"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-5 text-[13px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.24)] hover:bg-[#1677e8]"
              >
                Open account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8d2c8] bg-[#fbfbf7] text-[#352a24] hover:bg-[#edf2f7] lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Toggle product navigation"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>

          {open && (
            <div className="mx-auto mt-2 max-w-[1180px] rounded-[30px] border border-[#d8d2c8] bg-white/96 px-4 py-4 shadow-[0_18px_42px_rgba(61,48,40,0.12)] backdrop-blur-2xl lg:hidden">
              <div className="grid gap-2">
                {productLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-4 py-3 text-[14px] font-semibold text-[#5d5148] hover:bg-[#eef7ff] hover:text-[#0066cc]"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/register"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#0066cc] px-3 py-3 text-[14px] font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Open account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8d2c8] bg-white px-3 py-3 text-[14px] font-semibold text-[#352a24]"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </header>
      )}

      {children}

      {showFooter && <ProductFooter />}
    </div>
  );
}

export function ProductSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`mx-auto max-w-[1240px] px-4 py-6 sm:px-6 ${className}`}>{children}</section>;
}

export function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="ps-glass-card rounded-[24px] p-4">
      <p className="text-[11px] font-semibold text-[#0066cc]">{label}</p>
      <p className="mt-2 text-[24px] font-semibold text-[#352a24]">{value}</p>
      <p className="mt-1 text-[12px] leading-4 text-[#6c6258]">{detail}</p>
    </div>
  );
}

function ProductFooter() {
  return (
    <footer className="overflow-hidden bg-[#fbfbf7] px-3 py-7 text-[#352a24] sm:px-5 sm:py-10">
      <div className="relative mx-auto max-w-[1420px] overflow-hidden rounded-[34px] border border-[#cfe6fa] bg-[linear-gradient(135deg,#eff8ff_0%,#fbfbf7_48%,#f2f8ff_100%)] px-5 pb-0 pt-8 shadow-[0_28px_80px_rgba(61,48,40,0.10)] sm:rounded-[44px] sm:px-8 sm:pt-10 lg:px-14 lg:pt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-8 top-8 hidden h-28 w-44 opacity-50 md:block"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,102,204,0.42) 1.8px, transparent 2.2px)",
            backgroundSize: "15px 15px",
          }}
        />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.74fr)]">
          <nav className="grid gap-8 sm:grid-cols-3" aria-label="Footer navigation">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[12px] font-bold tracking-normal text-[#0066cc]">{column.title}</h3>
                <ul className="mt-5 grid gap-2.5 border-l border-[#b9ddff] pl-5">
                  {column.links.map((item) => (
                    <li key={`${column.title}-${item.href}-${item.label}`}>
                      <Link
                        href={item.href}
                        className="text-[19px] font-semibold leading-8 text-[#352a24] transition-colors hover:text-[#0066cc] sm:text-[21px] lg:text-[22px]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="lg:pl-4">
            <p className="text-[12px] font-bold tracking-normal text-[#0066cc]">Say hello</p>
            <a
              href="mailto:hello@procuresource.co"
              className="mt-4 block max-w-full text-[clamp(1.7rem,2.75vw,3rem)] font-bold leading-none text-[#352a24] underline decoration-[#0066cc]/25 decoration-2 underline-offset-8 transition-colors hover:text-[#0066cc]"
            >
              hello@procuresource.co
            </a>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="mailto:hello@procuresource.co"
                aria-label="Email ProcureSource"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0066cc] text-white transition-colors hover:bg-[#1677e8]"
              >
                <Mail className="h-4 w-4" />
              </a>
              <Link href="/access" className="inline-flex h-10 items-center rounded-full border border-[#b9ddff] bg-white/72 px-4 text-[12px] font-semibold text-[#0066cc] hover:bg-white">
                Request access
              </Link>
              <Link href="/advertise" className="inline-flex h-10 items-center rounded-full border border-[#d8d2c8] bg-white/54 px-4 text-[12px] font-semibold text-[#352a24] hover:bg-white">
                Advertise
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold tracking-normal text-[#6c6258]">
              <Link href="/privacy" className="hover:text-[#0066cc]">
                Privacy policy
              </Link>
              <Link href="/terms" className="hover:text-[#0066cc]">
                Terms and conditions
              </Link>
              <span>Copyright 2026</span>
            </div>
          </div>
        </div>

        <div className="relative mt-10 min-h-[140px] overflow-hidden sm:min-h-[220px] lg:min-h-[300px]">
          <p className="absolute -bottom-8 left-0 whitespace-nowrap pt-8 text-[clamp(4.1rem,14.8vw,14rem)] font-semibold leading-[0.8] tracking-normal text-[#352a24]">
            ProcureSource
          </p>
        </div>
      </div>
    </footer>
  );
}
