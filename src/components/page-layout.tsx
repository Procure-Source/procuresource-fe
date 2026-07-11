"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import BackButton from "@/components/ui/back-button";
import { useLanguage } from "@/lib/language-context";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
}

export default function PageLayout({
  title,
  subtitle,
  children,
  showCTA = false,
  ctaText = "Get Started",
  ctaHref = "/register",
  showBackButton = true,
  backButtonHref
}: PageLayoutProps) {
  const { dir } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen" dir={dir}>
      <Navbar />
      <main className="flex-grow pt-[88px]">
        <section className="bg-[#fbfbfd] pt-6 sm:pt-[55px] pb-6 sm:pb-[40px] border-b border-[#d2d2d7]">
          <div className="max-w-[980px] mx-auto px-4 sm:px-[22px]">
            {showBackButton && (
              <BackButton href={backButtonHref} />
            )}
            <div className="text-center">
              <h1
                className="text-[#1d1d1f] mb-[6px] text-[32px] sm:text-[40px] md:text-[48px]"
                style={{
                  lineHeight: '1.08',
                  fontWeight: '600',
                  letterSpacing: '-0.003em'
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="text-[#86868b] text-[16px] sm:text-[19px] md:text-[21px]"
                  style={{
                    lineHeight: '1.2381',
                    fontWeight: '400',
                    letterSpacing: '.011em'
                  }}
                >
                  {subtitle}
                </p>
              )}
              {showCTA && (
                <div className="mt-4 sm:mt-[17px]">
                  <Link
                    href={ctaHref}
                    className="inline-flex min-h-[44px] sm:h-[37px] items-center justify-center rounded-full bg-[#0066cc] px-6 sm:px-[21px] text-[15px] sm:text-[17px] font-normal tracking-[-0.022em] text-white transition-colors hover:bg-[#0077ed]"
                  >
                    {ctaText}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
        <div className="max-w-[980px] mx-auto px-4 sm:px-[22px] py-8 sm:py-[55px]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
