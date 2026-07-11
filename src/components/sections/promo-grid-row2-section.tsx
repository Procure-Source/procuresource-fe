"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from "@/lib/language-context";

const PromoGridRow2Section = () => {
  const { t, dir } = useLanguage();

  return (
    <section className="bg-[#f5f5f7] pb-3 px-3 sm:px-[12px]" dir={dir}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-[12px] max-w-[980px] mx-auto">
        <div className="relative overflow-hidden bg-white h-[420px] sm:h-[500px] md:h-[580px] flex flex-col items-center pt-8 sm:pt-[47px] rounded-[18px] text-center">
          <div className="z-10 px-4 sm:px-6">
            <h3 
              className="text-[#1d1d1f] mb-[6px] text-[28px] sm:text-[36px] md:text-[40px]"
              style={{ fontWeight: '600', letterSpacing: '0em', lineHeight: '1.1' }}
            >
              {t("submittals.title")}
            </h3>
            <p 
              className="text-[#1d1d1f] mb-[17px] text-[16px] sm:text-[19px] md:text-[21px]"
              style={{ fontWeight: '400', letterSpacing: '.011em', lineHeight: '1.2381' }}
            >
              {t("submittals.subtitle")}
            </p>
            <div className="flex justify-center gap-[16px] items-center">
              <Link 
                href="/submittals" 
                className="text-[#0066cc] text-[15px] sm:text-[17px] font-normal hover:underline"
              >
                {t("hero.learnMore")} &gt;
              </Link>
            </div>
          </div>
          <div className="absolute bottom-6 sm:bottom-8 w-full flex justify-center">
            <div className="bg-[#f5f5f7] rounded-[12px] p-4 sm:p-5 mx-4 sm:mx-6 w-full max-w-[300px] sm:max-w-[350px]">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#0066cc] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-medium text-[#1d1d1f] truncate">Chiller Submittal</div>
                  <div className="text-[11px] sm:text-[12px] text-[#86868b]">Auto-generated • 3 docs</div>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {['Datasheet', 'AHRI Certificate', 'Compliance Matrix'].map((doc) => (
                  <div key={doc} className="flex items-center gap-2 text-[11px] sm:text-[12px] text-[#86868b]">
                    <svg className="w-3 h-3 text-[#30d158] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white h-[420px] sm:h-[500px] md:h-[580px] flex flex-col items-center pt-8 sm:pt-[47px] rounded-[18px] text-center">
          <div className="z-10 px-4 sm:px-6">
            <h3 
              className="text-[#1d1d1f] mb-[6px] text-[28px] sm:text-[36px] md:text-[40px]"
              style={{ fontWeight: '600', letterSpacing: '0em', lineHeight: '1.1' }}
            >
              {t("rfq.title")}
            </h3>
            <p 
              className="text-[#1d1d1f] mb-[17px] text-[16px] sm:text-[19px] md:text-[21px]"
              style={{ fontWeight: '400', letterSpacing: '.011em', lineHeight: '1.2381' }}
            >
              {t("rfq.subtitle")}
            </p>
            <div className="flex justify-center gap-[16px] items-center">
              <Link 
                href="/rfqs" 
                className="text-[#0066cc] text-[15px] sm:text-[17px] font-normal hover:underline"
              >
                {t("rfq.create")} &gt;
              </Link>
            </div>
          </div>
          <div className="absolute bottom-6 sm:bottom-8 w-full flex justify-center">
            <div className="bg-[#f5f5f7] rounded-[12px] p-4 sm:p-5 mx-4 sm:mx-6 w-full max-w-[300px] sm:max-w-[350px]">
              <div className="text-[13px] sm:text-[14px] font-medium text-[#1d1d1f] mb-2 sm:mb-3">Quote Comparison</div>
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  { agent: 'Agent A', price: 'AED 185,000', time: '12 wks' },
                  { agent: 'Agent B', price: 'AED 192,000', time: '10 wks' },
                  { agent: 'Agent C', price: 'AED 178,500', time: '14 wks' },
                ].map((quote, i) => (
                  <div key={quote.agent} className={`flex items-center justify-between text-[11px] sm:text-[12px] p-1.5 sm:p-2 rounded-lg ${i === 2 ? 'bg-[#e8f5e9]' : ''}`}>
                    <span className="text-[#1d1d1f] font-medium">{quote.agent}</span>
                    <span className="text-[#1d1d1f]">{quote.price}</span>
                    <span className="text-[#86868b]">{quote.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoGridRow2Section;
