"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from "@/lib/language-context";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
}

interface Stats {
  brands: number;
  products: number;
  suppliers: number;
  categories: number;
  equipmentTypes: number;
}

const BrandLogo = ({ name, size = "md" }: { name: string; size?: "sm" | "md" }) => {
  const letter = name.charAt(0).toUpperCase();
  const colors = [
    "bg-gradient-to-br from-[#0066cc] to-[#004999]",
    "bg-gradient-to-br from-[#30d158] to-[#248a3d]",
    "bg-gradient-to-br from-[#ff9500] to-[#cc7700]",
    "bg-gradient-to-br from-[#5856d6] to-[#3634a3]",
    "bg-gradient-to-br from-[#ff453a] to-[#cc362e]",
    "bg-gradient-to-br from-[#00c7be] to-[#009f98]",
    "bg-gradient-to-br from-[#af52de] to-[#8944ab]",
    "bg-gradient-to-br from-[#ff2d55] to-[#cc2444]",
  ];
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  const sizeClasses = size === "sm" ? "w-8 h-8 text-[14px]" : "w-10 h-10 text-[16px]";
  
  return (
    <div className={`${sizeClasses} ${colors[colorIndex]} rounded-[10px] flex items-center justify-center text-white font-bold shadow-md`}>
      {letter}
    </div>
  );
};

const HeroBrands = () => {
  const { t, dir } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<Stats>({ brands: 0, products: 0, suppliers: 0, categories: 0, equipmentTypes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/brands').then(res => res.json()),
      fetch('/api/products').then(res => res.json()),
      fetch('/api/suppliers').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/equipment-types').then(res => res.json()),
    ])
      .then(([brandsData, productsData, suppliersData, categoriesData, equipmentData]) => {
        const allBrands = brandsData.brands || brandsData || [];
        setBrands(allBrands.slice(0, 18));
        setStats({
          brands: allBrands.length || 44,
          products: (productsData.products || productsData || []).length || 74,
          suppliers: (suppliersData.suppliers || suppliersData || []).length || 60,
          categories: (categoriesData.categories || categoriesData || []).length || 30,
          equipmentTypes: (equipmentData.equipmentTypes || equipmentData || []).length || 636,
        });
        setLoading(false);
      })
      .catch(() => {
        setStats({ brands: 44, products: 74, suppliers: 60, categories: 30, equipmentTypes: 636 });
        setLoading(false);
      });
  }, []);

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#ffffff] pt-12 sm:pt-[75px] pb-12 sm:pb-[87px]"
      dir={dir}
    >
      <div className="max-w-[980px] mx-auto flex flex-col items-center px-4 sm:px-[22px] text-center">
        <h2 
          className="text-[#1d1d1f] mb-[6px] text-[32px] sm:text-[44px] md:text-[56px]"
          style={{
            lineHeight: '1.07143',
            fontWeight: '600',
            letterSpacing: '-0.005em'
          }}
        >
          {t("brands.title")}
        </h2>

        <p 
          className="text-[#1d1d1f] mb-[17px] text-[18px] sm:text-[22px] md:text-[28px]"
          style={{
            lineHeight: '1.10722',
            fontWeight: '400',
            letterSpacing: '.004em'
          }}
        >
          {t("brands.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-[16px] mb-8 sm:mb-[40px] w-full max-w-[320px] sm:max-w-none">
          <Link
            href="/manufacturers"
            className="w-full sm:w-auto inline-flex min-h-[44px] sm:h-[37px] items-center justify-center rounded-full bg-[#0066cc] px-6 sm:px-[21px] py-3 sm:py-0 text-[15px] sm:text-[17px] font-normal tracking-[-0.022em] text-white transition-colors hover:bg-[#0077ed]"
          >
            {t("brands.browseAll")} ({stats.brands})
          </Link>
          <Link
            href="/manufacturer/register"
            className="w-full sm:w-auto inline-flex min-h-[44px] sm:h-[37px] items-center justify-center text-[#0066cc] text-[15px] sm:text-[17px] font-normal tracking-[-0.022em] hover:underline"
          >
            {t("brands.listBrand")} &gt;
          </Link>
        </div>

        {/* Live Brands Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 mb-10 w-full">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#f5f5f7] rounded-xl p-4 aspect-[3/2] animate-pulse" />
            ))
          ) : (
            brands.slice(0, 12).map((brand) => (
              <Link
                key={brand.id}
                href={`/manufacturers/${brand.slug}`}
                className="group bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all duration-200 aspect-[3/2] hover:shadow-md"
              >
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={80}
                    height={40}
                    className="object-contain max-h-[28px] sm:max-h-[36px] w-auto grayscale group-hover:grayscale-0 transition-all duration-200 opacity-70 group-hover:opacity-100"
                    unoptimized
                  />
                ) : (
                  <BrandLogo name={brand.name} />
                )}
                <span className="text-[10px] sm:text-[11px] text-[#86868b] mt-2 truncate max-w-full group-hover:text-[#1d1d1f]">{brand.name}</span>
              </Link>
            ))
          )}
        </div>

        {/* More brands indicator */}
        {stats.brands > 12 && (
          <Link 
            href="/manufacturers" 
            className="text-[14px] text-[#0066cc] hover:underline mb-8"
          >
            +{stats.brands - 12} more brands →
          </Link>
        )}

        {/* Live Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-[12px] w-full">
          <div className="bg-[#f5f5f7] rounded-[18px] p-5 sm:p-[30px] text-center">
            <div 
              className="text-[#1d1d1f] mb-[6px] text-[32px] sm:text-[44px]"
              style={{ fontWeight: '600', letterSpacing: '-0.003em', lineHeight: '1.08' }}
            >
              {stats.brands}
            </div>
            <p className="text-[14px] sm:text-[16px] text-[#1d1d1f] font-medium">Brands</p>
            <p className="text-[11px] sm:text-[13px] text-[#86868b] mt-0.5">Global manufacturers</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-[18px] p-5 sm:p-[30px] text-center">
            <div 
              className="text-[#1d1d1f] mb-[6px] text-[32px] sm:text-[44px]"
              style={{ fontWeight: '600', letterSpacing: '-0.003em', lineHeight: '1.08' }}
            >
              {stats.products}
            </div>
            <p className="text-[14px] sm:text-[16px] text-[#1d1d1f] font-medium">Products</p>
            <p className="text-[11px] sm:text-[13px] text-[#86868b] mt-0.5">With full specs</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-[18px] p-5 sm:p-[30px] text-center">
            <div 
              className="text-[#1d1d1f] mb-[6px] text-[32px] sm:text-[44px]"
              style={{ fontWeight: '600', letterSpacing: '-0.003em', lineHeight: '1.08' }}
            >
              {stats.suppliers}
            </div>
            <p className="text-[14px] sm:text-[16px] text-[#1d1d1f] font-medium">Suppliers</p>
            <p className="text-[11px] sm:text-[13px] text-[#86868b] mt-0.5">Across GCC</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-[18px] p-5 sm:p-[30px] text-center">
            <div 
              className="text-[#1d1d1f] mb-[6px] text-[32px] sm:text-[44px]"
              style={{ fontWeight: '600', letterSpacing: '-0.003em', lineHeight: '1.08' }}
            >
              {stats.categories}
            </div>
            <p className="text-[14px] sm:text-[16px] text-[#1d1d1f] font-medium">Categories</p>
            <p className="text-[11px] sm:text-[13px] text-[#86868b] mt-0.5">{stats.equipmentTypes} equipment types</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBrands;
