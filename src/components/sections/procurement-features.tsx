"use client";

import React from 'react';
import { FileText, Search, ShieldCheck, Zap, BarChart3, Users } from 'lucide-react';

const ProcurementFeatures = () => {
  const features = [
    {
      title: "Smart RFQ System",
      description: "Request quotes from multiple verified local agents with a single click.",
      icon: Zap
    },
    {
      title: "Submittal Builder",
      description: "Generate professional MEP submittals with verified manufacturer data.",
      icon: FileText
    },
    {
      title: "Spec Comparison",
      description: "Compare technical specifications across different brands side-by-side.",
      icon: BarChart3
    },
    {
      title: "Agent Network",
      description: "Access a verified network of 60+ authorized suppliers across the GCC.",
      icon: Users
    },
    {
      title: "Compliance Search",
      description: "Find equipment meeting specific Saso, UL, or Civil Defense requirements.",
      icon: ShieldCheck
    },
    {
      title: "Advanced Search",
      description: "Filter 636+ equipment types by performance metrics and regional availability.",
      icon: Search
    }
  ];

  return (
    <section className="py-24 bg-[#fbfbfd]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <h2 className="text-[32px] sm:text-[48px] font-bold text-[#1d1d1f] tracking-tight mb-4">
            Everything you need for industrial procurement.
          </h2>
          <p className="text-[19px] text-[#86868b]">
            Modern tools designed to streamline the complex process of sourcing, 
            verifying, and documenting MEP equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="p-8 rounded-[24px] bg-white border border-[#d2d2d7] hover:shadow-xl transition-all duration-300 group"
            >
              <div className="p-3 w-fit rounded-2xl bg-[#f5f5f7] mb-6 group-hover:bg-[#0066cc] group-hover:text-white transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-3">{feature.title}</h3>
              <p className="text-[17px] text-[#86868b] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcurementFeatures;
