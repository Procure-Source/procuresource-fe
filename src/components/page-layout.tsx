"use client";

import React from 'react';
import Link from 'next/link';
import BackButton from "@/components/ui/back-button";
import { ProductSection, ProductShell } from "@/components/product/product-shell";

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
  return (
    <ProductShell>
      <main>
        <ProductSection className="pb-8 pt-12 sm:pt-16">
          <div className="mx-auto max-w-[980px]">
            {showBackButton && (
              <BackButton href={backButtonHref} />
            )}
            <div className="text-center">
              <h1
                className="mb-2 text-[32px] font-semibold leading-tight tracking-normal text-[#352a24] sm:text-[40px] md:text-[48px]"
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="mx-auto max-w-[720px] text-[16px] leading-7 text-[#5d5148] sm:text-[19px]"
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
        </ProductSection>
        <ProductSection className="pt-0">
          <div className="mx-auto max-w-[980px]">
          {children}
          </div>
        </ProductSection>
      </main>
    </ProductShell>
  );
}
