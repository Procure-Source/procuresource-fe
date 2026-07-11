"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ShieldCheck, Cpu, Zap, Layout, Layers, Globe } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const FeatureCard = ({ title, description, icon: Icon, delay = 0 }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="bg-white/70 backdrop-blur-md border border-[#d2d2d7] rounded-[20px] sm:rounded-[28px] p-5 sm:p-8 flex flex-col items-start gap-3 sm:gap-4 hover:shadow-xl transition-all duration-500 group"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d1d1f]" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-[16px] sm:text-[19px] font-semibold text-[#1d1d1f] mb-1.5 sm:mb-2">{title}</h3>
        <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#86868b]">{description}</p>
      </div>
    </motion.div>
  );
};

export default function VisualStorytelling() {
  const { t, dir } = useLanguage();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const storySteps = [
    {
      title: t("story.schroeder"),
      description: t("story.schroederDesc"),
      icon: Cpu,
    },
    {
      title: t("story.lycoris"),
      description: t("story.lycorisDesc"),
      icon: Layout,
    },
    {
      title: t("story.gcc"),
      description: t("story.gccDesc"),
      icon: Globe,
    }
  ];

  return (
    <section ref={containerRef} className="py-12 sm:py-24 bg-[#fbfbfd] overflow-hidden" dir={dir}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-[22px]">
        <div className="mb-16 sm:mb-32 text-center max-w-[800px] mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[12px] sm:text-[14px] font-semibold tracking-widest text-[#0066cc] uppercase mb-3 sm:mb-4 block"
          >
            {t("story.genesis")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[32px] sm:text-[48px] md:text-[64px] font-semibold tracking-tight text-[#1d1d1f] leading-[1.05] mb-4 sm:mb-8"
          >
            {t("story.title").split(".")[0]}.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[17px] sm:text-[21px] md:text-[24px] text-[#86868b] leading-relaxed px-2"
          >
            {t("story.subtitle")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-20 sm:mb-40">
          {storySteps.map((step, idx) => (
            <FeatureCard 
              key={idx}
              title={step.title}
              description={step.description}
              icon={step.icon}
              delay={idx * 0.1}
            />
          ))}
        </div>

        <div className="relative h-[400px] sm:h-[500px] md:h-[600px] rounded-[24px] sm:rounded-[40px] bg-[#1d1d1f] overflow-hidden flex items-center justify-center group">
          <motion.div 
            style={{ y: y1 }}
            className="absolute inset-0 bg-gradient-to-br from-[#1d1d1f] via-[#2d2d2f] to-[#1d1d1f] opacity-50"
          />
          
          <div className="relative z-10 text-center px-4 sm:px-6">
            <motion.h3 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-[24px] sm:text-[32px] md:text-[56px] font-semibold text-white tracking-tight leading-tight mb-4 sm:mb-6"
            >
              {t("story.standard")}
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4"
            >
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[12px] sm:text-[14px] flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0066cc]" />
                {t("story.certifiedAccuracy")}
              </div>
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[12px] sm:text-[14px] flex items-center justify-center gap-2">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0066cc]" />
                {t("story.instantMatching")}
              </div>
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[12px] sm:text-[14px] flex items-center justify-center gap-2">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0066cc]" />
                {t("story.fullSubmittal")}
              </div>
            </motion.div>
          </div>

          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/4 -right-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-[#0066cc]/20 blur-[80px] sm:blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-1/4 -left-1/4 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] rounded-full bg-[#0066cc]/10 blur-[60px] sm:blur-[100px]"
          />
        </div>

        <div className="mt-20 sm:mt-40 flex flex-col md:flex-row items-center gap-8 sm:gap-16">
          <div className="flex-1 space-y-6 sm:space-y-8 w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h4 className="text-[24px] sm:text-[32px] font-semibold text-[#1d1d1f] mb-3 sm:mb-4">{t("story.lycoris")}</h4>
              <p className="text-[16px] sm:text-[19px] text-[#86868b] leading-relaxed">
                {t("story.lycorisDesc")}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4 className="text-[24px] sm:text-[32px] font-semibold text-[#1d1d1f] mb-3 sm:mb-4">{t("story.schroeder")}</h4>
              <p className="text-[16px] sm:text-[19px] text-[#86868b] leading-relaxed">
                {t("story.schroederDesc")}
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-1 w-full aspect-square max-w-[400px] md:max-w-none rounded-[24px] sm:rounded-[40px] bg-[#f5f5f7] border border-[#d2d2d7] overflow-hidden flex items-center justify-center p-6 sm:p-12"
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full h-full">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-[#d2d2d7] p-3 sm:p-4 flex flex-col justify-end"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-[#f5f5f7] mb-2" />
                  <div className="h-1.5 sm:h-2 w-3/4 bg-[#f5f5f7] rounded mb-1" />
                  <div className="h-1.5 sm:h-2 w-1/2 bg-[#f5f5f7] rounded" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
