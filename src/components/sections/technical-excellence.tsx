"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { ShieldCheck, FileCheck, Award, Microscope, Search, CheckCircle2 } from 'lucide-react';
import { useLanguage } from "@/lib/language-context";

const complianceStandards = [
  {
    title: "AHRI Certified",
    description: "Performance testing and certification for heating, ventilation, air conditioning, and refrigeration equipment.",
    icon: ShieldCheck,
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "UL Listed",
    description: "Global safety certification ensuring products meet rigorous safety and reliability requirements.",
    icon: FileCheck,
    color: "from-red-500 to-orange-400"
  },
  {
    title: "FM Global",
    description: "Property insurance and risk management certification for industrial products and systems.",
    icon: Award,
    color: "from-indigo-500 to-purple-400"
  },
  {
    title: "Eurovent",
    description: "European performance certification for HVAC products, ensuring data accuracy and quality.",
    icon: Microscope,
    color: "from-emerald-500 to-teal-400"
  },
  {
    title: "SASO Compliant",
    description: "Strict adherence to Saudi Arabian Standards Organization requirements for all industrial imports.",
    icon: CheckCircle2,
    color: "from-green-500 to-emerald-400"
  },
  {
    title: "Civil Defense",
    description: "Approved for fire safety and emergency response standards across all GCC territories.",
    icon: ShieldCheck,
    color: "from-orange-500 to-red-400"
  }
];

const TechnicalExcellence = () => {
  const { dir } = useLanguage();
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPos((prev) => (prev + 1) % (complianceStandards.length * 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-[#f5f5f7]" dir={dir}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-[32px] sm:text-[48px] font-bold tracking-tight text-[#1d1d1f] mb-6">
              Technical Excellence. <br />
              <span className="text-[#86868b]">Verified Standards.</span>
            </h2>
            <p className="text-[#86868b] text-[18px] sm:text-[21px]">
              Our database is strictly reserved for high-performance equipment that meets global and regional 
              compliance certifications. We don't just list products; we verify engineering truth.
            </p>
          </div>
          <Link href="/certifications/verify" className="flex items-center gap-2 text-[#0066cc] font-medium hover:underline">
            <Search className="w-5 h-5" />
            Search Compliance Database
          </Link>
        </div>

        <div className="relative overflow-hidden group rounded-[28px]">
          <div 
            className="flex transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${(scrollPos % complianceStandards.length) * (100 / 3.2)}%)` }}
          >
            {[...complianceStandards, ...complianceStandards].map((standard, idx) => (
              <div 
                key={idx} 
                className="min-w-full sm:min-w-[45%] lg:min-w-[30%] p-3"
              >
                <div className="bg-white rounded-[28px] p-8 h-full border border-[#d2d2d7] hover:shadow-xl transition-all duration-500 group/card">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${standard.color} flex items-center justify-center mb-6 text-white shadow-lg transform group-hover/card:scale-110 transition-transform duration-500`}>
                    <standard.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-[21px] font-bold text-[#1d1d1f] mb-4">{standard.title}</h3>
                  <p className="text-[#86868b] text-[16px] leading-relaxed mb-6">
                    {standard.description}
                  </p>
                  <div className="pt-6 border-t border-[#f5f5f7]">
                    <span className="text-[14px] font-semibold text-[#1d1d1f]">Verified Status: ACTIVE</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnicalExcellence;
