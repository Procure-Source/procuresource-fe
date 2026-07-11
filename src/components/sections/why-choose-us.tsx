"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe, BarChart3, Users2, Database } from "lucide-react";

const features = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Global Intelligence",
      description: "Harness the power of 2M+ technical datasets from 10,000+ global manufacturers, unified for instant engineering precision."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Unrivaled Velocity",
      description: "Accelerate your procurement with AI-driven submittal generation and RFQ workflows that outperform traditional methods by 10x."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Dominant GCC Footprint",
      description: "The primary authority for industrial data in Dubai, Riyadh, and every major hub across the GCC and international territories."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Ironclad Compliance",
      description: "Zero-compromise verification against UL, FM Global, Civil Defense, and SASO standards. Engineering truth, guaranteed."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Strategic Advantage",
      description: "Leverage global pricing indices and real-time lead-time intelligence to dominate your project's bottom line."
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      title: "Elite Engineering",
      description: "Backed by the world's most sophisticated technical support network, ready to solve the most complex procurement challenges."
    }
  ];

  export default function WhyChooseUs() {
    return (
      <section className="py-24 bg-[#fbfbfd]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-20">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#0066cc] font-bold text-[14px] uppercase tracking-[0.2em] mb-4 block"
            >
              The Gold Standard
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[40px] md:text-[60px] font-bold tracking-tight text-[#1d1d1f] leading-tight"
            >
              Architecting the <br className="hidden md:block" /> Industrial Future.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[20px] md:text-[24px] text-[#86868b] mt-6 max-w-[850px] mx-auto leading-relaxed"
            >
              ProcureSource is not just a platform; it is the global engine of industrial excellence. We provide 
              the technical foundation for the world's most ambitious infrastructure projects.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-[24px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#0066cc] mb-8 group-hover:scale-110 group-hover:bg-[#0066cc] group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-[22px] font-bold text-[#1d1d1f] mb-4">
                  {feature.title}
                </h3>
                <p className="text-[17px] text-[#86868b] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

