"use client";

import React from 'react';
import { Globe2, MapPin, Users2, Building2 } from 'lucide-react';
import { useLanguage } from "@/lib/language-context";

const GlobalPresence = () => {
  const { dir } = useLanguage();

    const regions = [
      { name: "United Arab Emirates", hubs: ["Dubai HQ", "Abu Dhabi"], projects: "1,500+", status: "Market Leader" },
      { name: "Saudi Arabia", hubs: ["Riyadh", "Jeddah", "NEOM", "Dammam"], projects: "1,200+", status: "Strategic Hub" },
      { name: "International Roots", hubs: ["London", "Singapore", "New York", "Munich"], projects: "500+", status: "Global Origin" },
      { name: "GCC Expansion", hubs: ["Doha", "Kuwait City", "Muscat", "Manama"], projects: "800+", status: "Dominant Force" },
    ];

    const stats = [
      { icon: Globe2, label: "Global Presence", value: "24/7 Operations" },
      { icon: Building2, label: "600+ Factories", value: "Verified Direct" },
      { icon: Users2, label: "15,000+ Pros", value: "Technical Network" },
      { icon: MapPin, label: "25+ Global Hubs", value: "Logistics Excellence" },
    ];

    return (
      <section className="py-24 bg-[#0a0a0b] text-white overflow-hidden" dir={dir}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <h2 className="text-[32px] sm:text-[48px] font-bold tracking-tight mb-6">
              The World's Most <span className="text-[#2997ff]">Powerful Industrial Network.</span>
            </h2>
            <p className="text-[#a1a1a6] text-[18px] sm:text-[21px] max-w-[900px] mx-auto leading-relaxed">
              ProcureSource is the architects of the modern industrial world. From our deep GCC roots to our 
              international expansion, we bridge the gap between engineering truth and operational excellence 
              on a global scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-8">
              {regions.map((region, idx) => (
                <div key={idx} className="group border-l-2 border-white/10 hover:border-[#2997ff] pl-8 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[24px] font-semibold group-hover:text-[#2997ff] transition-colors">{region.name}</h3>
                    <span className="text-[10px] bg-[#2997ff]/20 text-[#2997ff] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{region.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {region.hubs.map((hub) => (
                      <span key={hub} className="px-3 py-1 bg-white/5 rounded-full text-[12px] text-[#86868b] border border-white/10 group-hover:border-[#2997ff]/30 transition-colors">
                        {hub}
                      </span>
                    ))}
                  </div>
                  <p className="text-[#86868b] text-[14px]">Orchestrating {region.projects} high-impact industrial projects</p>
                </div>
              ))}
            </div>

          <div className="relative">
             <div className="aspect-square bg-gradient-to-br from-[#1d1d1f] to-[#000000] rounded-3xl border border-[#1d1d1f] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000')] bg-cover" />
                <div className="relative z-10 grid grid-cols-2 gap-8 p-12">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#2997ff]/10 flex items-center justify-center mb-4">
                        <stat.icon className="text-[#2997ff] w-6 h-6" />
                      </div>
                      <div className="text-[24px] font-bold mb-1">{stat.label}</div>
                      <div className="text-[#86868b] text-[14px]">{stat.value}</div>
                    </div>
                  ))}
                </div>
             </div>
             {/* Decorative Elements */}
             <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#2997ff] rounded-full blur-[80px] opacity-20" />
             <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#0066cc] rounded-full blur-[100px] opacity-20" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalPresence;
