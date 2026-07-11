"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Globe, Factory } from 'lucide-react';
import { useLanguage } from "@/lib/language-context";

const HeroIndustrial = () => {
  const { t, dir } = useLanguage();

  return (
    <section 
      className="relative w-full bg-[#000000] overflow-hidden"
      style={{ minHeight: '85vh' }}
      dir={dir}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 h-full flex flex-col justify-center items-center text-center pt-20 pb-32">
        <h1 
          className="text-white mb-6 text-[30px] sm:text-[54px] md:text-[70px] font-bold tracking-tight leading-[1.05]"
          style={{
            letterSpacing: '-0.02em'
          }}
        >
          The Undisputed World Leader in <br />
          <span className="text-[#2997ff]">Industrial Procurement.</span>
        </h1>
        
        <p 
          className="text-[#a1a1a6] mb-12 text-[18px] sm:text-[22px] max-w-[900px] mx-auto leading-relaxed"
        >
          The most powerful procurement ecosystem ever built. Dominating the GCC, Europe, and North American markets with 
          unrivaled technical intelligence, verified manufacturer data, and a global distribution network that 
          sets the gold standard for engineering excellence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-[600px] mx-auto">
          <Link 
            href="/products" 
            className="group w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-[#0066cc] text-white rounded-full text-[18px] font-semibold hover:bg-[#0077ed] transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(0,102,204,0.4)]"
          >
            Explore Global Inventory
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/agents" 
            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-white/5 backdrop-blur-xl text-white border border-white/20 rounded-full text-[18px] font-semibold hover:bg-white/10 transition-all duration-300"
          >
            Partner with Us
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-[1000px] mx-auto">
          {[
            { icon: Factory, label: "Global Powerhouse", sub: "Verified Manufacturers" },
            { icon: Globe, label: "GCC & International", sub: "Deep-Rooted Excellence" },
            { icon: ShieldCheck, label: "Engineering Truth", sub: "Verified Compliance" },
            { icon: ArrowRight, label: "Unlimited Reach", sub: "Worldwide Distribution" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                <stat.icon className="w-6 h-6 text-[#2997ff]" />
              </div>
              <span className="text-white font-semibold text-[16px]">{stat.label}</span>
              <span className="text-[#86868b] text-[12px]">{stat.sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default HeroIndustrial;
