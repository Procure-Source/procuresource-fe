"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Centrifugal Chiller 500 TR",
    brand: "Trane",
    category: "HVAC",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecb?auto=format&fit=crop&q=80&w=800",
    description: "High-efficiency water-cooled centrifugal chiller for large-scale commercial applications."
  },
  {
    id: 2,
    name: "Air Handling Unit (AHU)",
    brand: "Carrier",
    category: "HVAC",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    description: "Customizable air handling units with advanced filtration and heat recovery systems."
  },
  {
    id: 3,
    name: "Digital Thermostat T6 Pro",
    brand: "Honeywell",
    category: "Controls",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800",
    description: "Smart programmable thermostat with energy-saving algorithms and remote access."
  },
  {
    id: 4,
    name: "Industrial Pump Series X",
    brand: "Grundfos",
    category: "Plumbing",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
    description: "Heavy-duty vertical multistage centrifugal pumps for water supply and pressure boosting."
  }
];

export default function ProductCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % products.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-[32px] md:text-[48px] font-semibold tracking-tight text-[#1d1d1f] leading-tight">
              Featured Equipment
            </h2>
            <p className="text-[19px] md:text-[21px] text-[#86868b] mt-2 max-w-[500px]">
              Explore the latest high-performance MEP products from world-class manufacturers.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={prev}
              className="p-3 rounded-full border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-[#1d1d1f]" />
            </button>
            <button 
              onClick={next}
              className="p-3 rounded-full border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-[#1d1d1f]" />
            </button>
          </div>
        </div>

        <div className="relative h-[400px] md:h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col md:flex-row gap-8 bg-[#f5f5f7] rounded-[28px] p-8 md:p-12"
            >
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-[#0066cc] font-semibold text-[14px] uppercase tracking-wider mb-4">
                  {products[currentIndex].brand} • {products[currentIndex].category}
                </span>
                <h3 className="text-[28px] md:text-[40px] font-semibold text-[#1d1d1f] mb-4 leading-tight">
                  {products[currentIndex].name}
                </h3>
                <p className="text-[17px] md:text-[19px] text-[#424245] mb-8 leading-relaxed">
                  {products[currentIndex].description}
                </p>
                <Link 
                  href={`/products/${products[currentIndex].id}`}
                  className="inline-flex items-center gap-2 bg-[#0066cc] text-white px-8 py-3 rounded-full font-medium hover:bg-[#0077ed] transition-colors w-fit"
                >
                  View Specifications <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={products[currentIndex].image}
                  alt={products[currentIndex].name}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? "w-8 bg-[#0066cc]" : "bg-[#d2d2d7]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
