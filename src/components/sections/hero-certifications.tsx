"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from "@/lib/language-context";

const HeroCertifications = () => {
  const { t, dir } = useLanguage();

  return (
    <section 
      className="relative w-full overflow-hidden flex flex-col items-center pt-10 sm:pt-[55px] pb-12"
      style={{
        minHeight: '580px',
        background: 'linear-gradient(180deg, #e8f4f8 0%, #ffffff 100%)'
      }}
      dir={dir}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-[22px]">
        <p className="text-[#0066cc] text-[15px] sm:text-[17px] md:text-[21px] font-semibold mb-[4px]">{t("certifications.badge")}</p>
        
        <h2 
          className="text-[#1d1d1f] mb-[6px] text-[28px] sm:text-[38px] md:text-[48px]"
          style={{
            lineHeight: '1.08',
            fontWeight: '600',
            letterSpacing: '-0.003em'
          }}
        >
          {t("certifications.title")}
        </h2>
        
        <p 
          className="text-[#1d1d1f] mb-[17px] text-[14px] sm:text-[16px] md:text-[21px] max-w-[600px]"
          style={{
            lineHeight: '1.2381',
            fontWeight: '400',
            letterSpacing: '.011em'
          }}
        >
          {t("certifications.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-[16px] mb-8 sm:mb-[45px] w-full">
          <Link
            href="/certifications/verify"
            className="w-full sm:w-auto max-w-[320px] rounded-full bg-[#0066cc] text-white hover:bg-[#0077ed] transition-colors px-6 sm:px-[21px] min-h-[44px] sm:h-[37px] inline-flex items-center justify-center text-[15px] sm:text-[17px] font-normal tracking-[-0.022em]"
          >
            {t("certifications.verifyNow")}
          </Link>
          <Link
            href="/certifications"
            className="w-full sm:w-auto max-w-[320px] text-[#0066cc] text-[15px] sm:text-[17px] font-normal tracking-[-0.022em] hover:underline inline-flex items-center justify-center min-h-[44px] sm:h-auto"
          >
            {t("hero.learnMore")} &gt;
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[980px] mx-auto px-4 sm:px-[22px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {[
            { name: 'AHRI', desc: 'Air Conditioning & Refrigeration' },
            { name: 'UL', desc: 'Safety Certification' },
            { name: 'FM Global', desc: 'Property Loss Prevention' },
            { name: 'Eurovent', desc: 'European Performance' },
            { name: 'ETL', desc: 'Electrical Testing' },
            { name: 'CSA', desc: 'Canadian Standards' },
          ].map((cert) => (
            <div 
              key={cert.name}
              className="bg-white rounded-[12px] px-3 sm:px-6 py-3 sm:py-4 shadow-sm border border-[#d2d2d7]/50 text-center"
            >
              <div className="text-[15px] sm:text-[21px] font-semibold text-[#1d1d1f] mb-0.5 sm:mb-1">{cert.name}</div>
              <div className="text-[9px] sm:text-[12px] text-[#86868b] line-clamp-2">{cert.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCertifications;
