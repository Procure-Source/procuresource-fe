"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from "@/lib/language-context";

const HeroSpecMatcher = () => {
  const { t, dir } = useLanguage();

  return (
    <section 
      className="relative flex flex-col items-center bg-[#000000] pt-10 sm:pt-[55px] overflow-hidden"
      style={{ minHeight: '580px' }}
      dir={dir}
    >
      <div className="relative z-10 text-center w-full px-4 sm:px-[22px]">
        <h2 
          className="text-white mb-[6px] text-[32px] sm:text-[44px] md:text-[56px]"
          style={{
            lineHeight: '1.07143',
            fontWeight: '600',
            letterSpacing: '-0.005em'
          }}
        >
          {t("hero.title")}
        </h2>
        
        <p 
          className="text-[#86868b] mb-[17px] text-[18px] sm:text-[22px] md:text-[28px]"
          style={{
            lineHeight: '1.10722',
            fontWeight: '400',
            letterSpacing: '.004em'
          }}
        >
          {t("hero.subtitle")}
        </p>

        <div className="mb-6 sm:mb-8 opacity-60">
          <span className="text-[10px] sm:text-[12px] text-white/50 uppercase tracking-[0.2em] font-medium">{t("hero.poweredBy")}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-[18px] mb-[40px] w-full max-w-[320px] sm:max-w-none mx-auto">
          <Link 
            href="/spec-matcher" 
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-[21px] py-3 sm:py-[8px] min-h-[44px] sm:h-[37px] bg-[#0066cc] text-white rounded-full text-[15px] sm:text-[17px] font-normal tracking-[-0.022em] hover:bg-[#0077ed] transition-colors"
          >
            {t("hero.tryNow")}
          </Link>
          <Link 
            href="/about" 
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-[21px] py-3 sm:py-[8px] min-h-[44px] sm:h-[37px] text-[#2997ff] text-[15px] sm:text-[17px] font-normal tracking-[-0.022em] hover:underline"
          >
            {t("hero.learnMore")} &gt;
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[980px] mx-auto px-4 sm:px-[22px] pb-[50px]">
        <div className="bg-[#1d1d1f] rounded-[18px] p-4 sm:p-8 text-left">
          <div className="text-[10px] sm:text-[12px] text-[#86868b] mb-3 sm:mb-4 uppercase tracking-wider font-medium">{t("hero.sampleSpec")}</div>
          <p className="text-[14px] sm:text-[17px] text-[#f5f5f7] font-mono leading-[1.6] opacity-90">
            Water cooled centrifugal chiller, 500 TR nominal cooling capacity at ARI conditions. 
            Unit shall be AHRI certified to Standard 550/590 with IPLV not exceeding 0.450 kW/ton. 
            Refrigerant shall be R-134a or R-513A.
          </p>
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-[#424245] flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[14px] text-[#30d158]">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              15 {t("hero.matchingProducts")}
            </span>
            <span className="hidden sm:inline text-[#424245]">•</span>
            <span className="text-[12px] sm:text-[14px] text-[#86868b]">3 {t("hero.ahriVerified")}</span>
            <span className="hidden sm:inline text-[#424245]">•</span>
            <span className="text-[12px] sm:text-[14px] text-[#86868b]">{t("hero.localAgents")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSpecMatcher;
