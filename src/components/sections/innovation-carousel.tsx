"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const innovations = [
  {
    id: 1,
    title: "AI-Driven Spec Matching",
    description: "Our proprietary LLM analyzes thousands of technical data points to find the perfect alternative for any discontinued part.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    tag: "Software"
  },
  {
    id: 2,
    title: "Real-time Supply Chain Tracking",
    description: "Get granular visibility into your equipment's journey from factory floor to job site with IoT integration.",
    image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?auto=format&fit=crop&q=80&w=800",
    tag: "Logistics"
  },
  {
    id: 3,
    title: "Automated Compliance Auditing",
    description: "Instantly verify if your selected products meet local building codes and environmental standards with one click.",
    image: "https://images.unsplash.com/photo-1454165833767-0275510547b1?auto=format&fit=crop&q=80&w=800",
    tag: "Compliance"
  }
];

export default function InnovationCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % innovations.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % innovations.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + innovations.length) % innovations.length);

  return (
    <section className="py-24 bg-[#000] text-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-[600px]">
            <span className="text-[#0066cc] font-semibold text-[14px] uppercase tracking-[0.1em] mb-4 block">
              Innovation Hub
            </span>
            <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-tight">
              Pushing the Boundaries <br /> of Procurement.
            </h2>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={prev}
              className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={next}
              className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="relative h-[500px] md:h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden">
                <Image
                  src={innovations[currentIndex].image}
                  alt={innovations[currentIndex].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <span className="bg-[#0066cc] text-[12px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    {innovations[currentIndex].tag}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-[32px] md:text-[48px] font-semibold mb-6 leading-tight">
                  {innovations[currentIndex].title}
                </h3>
                <p className="text-[18px] md:text-[22px] text-white/60 leading-relaxed mb-8">
                  {innovations[currentIndex].description}
                </p>
                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800" />
                      ))}
                    </div>
                    <span className="text-white/40 text-[14px]">Global Engineering Network</span>
                  </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
