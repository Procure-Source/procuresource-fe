"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from "@/lib/language-context";

const BrandCarousel = () => {
  const { t, dir } = useLanguage();
  const [brands, setBrands] = useState<{ name: string; id: string }[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands');
        const data = await res.json();
        setBrands(data.data || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  if (brands.length === 0) return null;

  // Double the brands for infinite scroll effect
  const displayBrands = [...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-white py-12 border-y border-gray-100 overflow-hidden" dir={dir}>
      <div className="max-w-[1200px] mx-auto px-4 mb-8 text-center">
        <h3 className="text-[14px] font-semibold text-gray-400 uppercase tracking-widest">
          Global Industry Leaders
        </h3>
      </div>
      
      <div className="relative flex">
        <div className="flex animate-marquee whitespace-nowrap gap-16 items-center">
          {displayBrands.map((brand, i) => (
            <div 
              key={`${brand.id}-${i}`} 
              className="flex items-center justify-center min-w-[150px] grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-2 text-[#0066cc] font-bold text-xl">
                  {brand.name.charAt(0)}
                </div>
                <span className="text-[13px] font-medium text-gray-600">{brand.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default BrandCarousel;
