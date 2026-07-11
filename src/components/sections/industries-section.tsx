"use client";

import React from 'react';
import { Building2, HardHat, Zap, Droplets, Wind, ShieldCheck } from 'lucide-react';

const IndustriesSection = () => {
  const industries = [
    {
      title: "Oil & Gas",
      description: "Critical infrastructure equipment meeting Saudi Aramco, ADNOC, and KOC standards.",
      icon: Droplets,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
      color: "from-orange-500/20 to-transparent"
    },
    {
      title: "Commercial Construction",
      description: "MEP solutions for megaprojects, residential towers, and hospitality infrastructure.",
      icon: Building2,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      color: "from-blue-500/20 to-transparent"
    },
    {
      title: "Energy & Utilities",
      description: "Power generation, transmission, and distribution equipment for regional utilities.",
      icon: Zap,
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
      color: "from-yellow-500/20 to-transparent"
    },
    {
      title: "Water Treatment",
      description: "Desalination and wastewater management systems for municipal and industrial use.",
      icon: Wind,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
      color: "from-cyan-500/20 to-transparent"
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-[600px]">
            <h2 className="text-[32px] sm:text-[48px] font-bold text-[#1d1d1f] leading-tight mb-4 tracking-tight">
              Sectors We Empower.
            </h2>
            <p className="text-[19px] text-[#86868b] leading-relaxed">
              Tailored procurement solutions for the most demanding industrial sectors in the Middle East.
            </p>
          </div>
          <button className="text-[#0066cc] text-[17px] font-medium hover:underline flex items-center gap-1">
            View all sectors <span>&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, i) => (
            <div 
              key={i} 
              className="group relative h-[450px] rounded-[28px] overflow-hidden cursor-pointer bg-gray-100 transition-transform duration-500 hover:scale-[1.02]"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${industry.image})` }}
              />
              <div className={`absolute inset-0 bg-gradient-to-b ${industry.color} via-black/20 to-black/80`} />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="mb-4 p-3 w-fit rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <industry.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{industry.title}</h3>
                <p className="text-white/70 text-[14px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {industry.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
