"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from "@/lib/language-context";
import { 
  Snowflake, Wind, Thermometer, Gauge, Settings, Zap, 
  Droplets, Building2, Waves, Shield, Wrench, Filter,
  Sun, Flame, Activity, Box, CircuitBoard, Pipette
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "air-conditioning": <Snowflake className="w-5 h-5" />,
  "hvac": <Wind className="w-5 h-5" />,
  "refrigeration": <Thermometer className="w-5 h-5" />,
  "compressors": <Gauge className="w-5 h-5" />,
  "controls-automation": <Settings className="w-5 h-5" />,
  "motors-drives": <Zap className="w-5 h-5" />,
  "pumps": <Droplets className="w-5 h-5" />,
  "cooling-towers": <Building2 className="w-5 h-5" />,
  "ventilation": <Waves className="w-5 h-5" />,
  "insulation-materials": <Shield className="w-5 h-5" />,
  "tools-equipment": <Wrench className="w-5 h-5" />,
  "filters": <Filter className="w-5 h-5" />,
  "heat-exchangers": <Flame className="w-5 h-5" />,
  "district-cooling": <Building2 className="w-5 h-5" />,
  "ductwork": <Box className="w-5 h-5" />,
  "valves": <Pipette className="w-5 h-5" />,
  "building-automation": <CircuitBoard className="w-5 h-5" />,
  "heating": <Sun className="w-5 h-5" />,
  "air-quality": <Activity className="w-5 h-5" />,
};

const gccCountries = [
  { name: 'UAE', flag: '🇦🇪', code: 'AE', suppliers: 45 },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA', suppliers: 8 },
  { name: 'Qatar', flag: '🇶🇦', code: 'QA', suppliers: 3 },
  { name: 'Kuwait', flag: '🇰🇼', code: 'KW', suppliers: 2 },
  { name: 'Bahrain', flag: '🇧🇭', code: 'BH', suppliers: 1 },
  { name: 'Oman', flag: '🇴🇲', code: 'OM', suppliers: 1 },
];

const PromoGridSection = () => {
  const { t, dir } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        const cats = data.categories || data || [];
        setCategories(cats.slice(0, 12));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="bg-[#f5f5f7] py-3 px-3 sm:px-[12px]" dir={dir}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-[12px] max-w-[980px] mx-auto">
        {/* Categories Section */}
        <div className="relative overflow-hidden bg-[#fbfbfd] min-h-[420px] sm:min-h-[500px] md:min-h-[580px] flex flex-col items-center pt-8 sm:pt-[47px] rounded-[18px] text-center">
          <div className="z-10 px-4 sm:px-6">
            <h3 
              className="text-[#1d1d1f] mb-[6px] text-[28px] sm:text-[36px] md:text-[40px]"
              style={{ fontWeight: '600', letterSpacing: '0em', lineHeight: '1.1' }}
            >
              {t("products.title")}
            </h3>
            <p 
              className="text-[#1d1d1f] mb-[17px] text-[16px] sm:text-[19px] md:text-[21px]"
              style={{ fontWeight: '400', letterSpacing: '.011em', lineHeight: '1.2381' }}
            >
              30 categories • 636 equipment types
            </p>
            <div className="flex justify-center gap-[16px] items-center">
              <Link 
                href="/categories" 
                className="text-[#0066cc] text-[15px] sm:text-[17px] font-normal hover:underline"
              >
                All Categories &gt;
              </Link>
              <Link 
                href="/products" 
                className="text-[#0066cc] text-[15px] sm:text-[17px] font-normal hover:underline"
              >
                {t("products.browse")} &gt;
              </Link>
            </div>
          </div>
          
          <div className="mt-6 w-full px-4 sm:px-6 pb-6 flex-1 flex items-center">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
              {loading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[10px] p-3 animate-pulse h-16" />
                ))
              ) : (
                categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    href={`/categories/${cat.slug}`}
                    className="group bg-white hover:bg-[#f5f5f7] rounded-[10px] sm:rounded-[12px] p-2.5 sm:p-3 shadow-sm text-center transition-all duration-200 hover:shadow-md flex flex-col items-center justify-center"
                  >
                    <div className="text-[#0066cc] mb-1 group-hover:scale-110 transition-transform">
                      {categoryIcons[cat.slug] || <Box className="w-5 h-5" />}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors leading-tight">
                      {cat.name}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Suppliers / Agents Section */}
        <div className="relative overflow-hidden bg-[#fbfbfd] min-h-[420px] sm:min-h-[500px] md:min-h-[580px] flex flex-col items-center pt-8 sm:pt-[47px] rounded-[18px] text-center">
          <div className="z-10 px-4 sm:px-6">
            <h3 
              className="text-[#1d1d1f] mb-[6px] text-[28px] sm:text-[36px] md:text-[40px]"
              style={{ fontWeight: '600', letterSpacing: '0em', lineHeight: '1.1' }}
            >
              {t("agents.title")}
            </h3>
            <p 
              className="text-[#1d1d1f] mb-[17px] text-[16px] sm:text-[19px] md:text-[21px]"
              style={{ fontWeight: '400', letterSpacing: '.011em', lineHeight: '1.2381' }}
            >
              60 verified suppliers across GCC
            </p>
            <div className="flex justify-center gap-[16px] items-center">
              <Link 
                href="/agents" 
                className="text-[#0066cc] text-[15px] sm:text-[17px] font-normal hover:underline"
              >
                {t("agents.find")} &gt;
              </Link>
            </div>
          </div>
          
          <div className="mt-6 w-full px-4 sm:px-6 pb-6 flex-1 flex items-center">
            <div className="w-full space-y-3">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {gccCountries.map((country) => (
                  <Link 
                    key={country.code} 
                    href={`/agents?country=${country.code}`}
                    className="group bg-white hover:bg-[#f5f5f7] rounded-[12px] px-3 sm:px-4 py-3 sm:py-4 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col items-center"
                  >
                    <span className="text-2xl mb-1">{country.flag}</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors">{country.name}</span>
                    <span className="text-[9px] sm:text-[10px] text-[#86868b]">{country.suppliers} suppliers</span>
                  </Link>
                ))}
              </div>
              
              {/* Quick supplier list */}
              <div className="bg-white rounded-[12px] p-4 mt-4">
                <p className="text-[12px] text-[#86868b] mb-3">Featured Suppliers</p>
                <div className="flex flex-wrap gap-2">
                  {["Abu Saeed Trading", "Armstrong Fluid", "Byrne Group", "Castel Gulf"].map((name) => (
                    <span key={name} className="text-[11px] bg-[#f5f5f7] px-2 py-1 rounded-full text-[#424245]">
                      {name}
                    </span>
                  ))}
                  <Link href="/agents" className="text-[11px] text-[#0066cc] px-2 py-1">
                    +56 more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoGridSection;
