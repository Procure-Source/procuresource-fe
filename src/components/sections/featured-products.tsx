"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from "@/lib/language-context";
import { ChevronRight, Star, Shield, MapPin } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: Record<string, string> | null;
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
}

const BrandLogo = ({ name }: { name: string }) => {
  const letter = name.charAt(0).toUpperCase();
  const colors = [
    "bg-gradient-to-br from-[#0066cc] to-[#004999]",
    "bg-gradient-to-br from-[#30d158] to-[#248a3d]",
    "bg-gradient-to-br from-[#ff9500] to-[#cc7700]",
    "bg-gradient-to-br from-[#5856d6] to-[#3634a3]",
    "bg-gradient-to-br from-[#ff453a] to-[#cc362e]",
    "bg-gradient-to-br from-[#00c7be] to-[#009f98]",
  ];
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  return (
    <div className={`w-10 h-10 ${colors[colorIndex]} rounded-[10px] flex items-center justify-center text-white font-bold text-[16px] shadow-md`}>
      {letter}
    </div>
  );
};

const FeaturedProductsSection = () => {
  const { dir } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?limit=8')
      .then(res => res.json())
      .then(data => {
        const prods = data.products || data || [];
        setProducts(prods.slice(0, 8));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="bg-[#ffffff] py-12 sm:py-20" dir={dir}>
      <div className="max-w-[980px] mx-auto px-4 sm:px-[22px]">
        <div className="text-center mb-10">
          <h2 
            className="text-[#1d1d1f] mb-[6px] text-[32px] sm:text-[44px] md:text-[48px]"
            style={{ fontWeight: '600', letterSpacing: '-0.003em', lineHeight: '1.08' }}
          >
            Featured Products
          </h2>
          <p className="text-[#86868b] text-[17px] sm:text-[21px] mb-6">
            74 products from 44 leading manufacturers
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/products" 
              className="inline-flex items-center gap-1 text-[#0066cc] text-[17px] hover:underline"
            >
              Browse all products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#f5f5f7] rounded-[18px] p-5 h-[280px] animate-pulse" />
            ))
          ) : (
            products.map((product) => {
              const specs = product.specifications || {};
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-[18px] p-5 transition-all duration-300 hover:shadow-lg flex flex-col"
                >
                  {/* Brand Logo */}
                  <div className="flex items-start justify-between mb-4">
                    {product.brand ? (
                      <BrandLogo name={product.brand.name} />
                    ) : (
                      <div className="w-10 h-10 bg-[#86868b] rounded-[10px] flex items-center justify-center text-white font-bold">
                        ?
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-[#86868b]">
                      <Star className="w-3 h-3 text-[#ff9500] fill-current" />
                      4.8
                    </div>
                  </div>

                  {/* Product Info */}
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1 line-clamp-2 group-hover:text-[#0066cc] transition-colors">
                    {product.name}
                  </h3>
                  
                  {product.brand && (
                    <p className="text-[13px] text-[#0066cc] mb-2">{product.brand.name}</p>
                  )}
                  
                  {product.category && (
                    <span className="inline-block text-[11px] bg-white px-2 py-1 rounded-full text-[#424245] mb-3 w-fit">
                      {product.category.name}
                    </span>
                  )}

                  {/* Quick Specs */}
                  <div className="mt-auto space-y-1.5">
                    {specs.capacity && (
                      <div className="text-[12px] text-[#86868b] flex items-center gap-1">
                        <span className="font-medium text-[#424245]">Capacity:</span> {specs.capacity}
                      </div>
                    )}
                    {specs.origin && (
                      <div className="text-[12px] text-[#86868b] flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {specs.origin}
                      </div>
                    )}
                    {(specs.efficiency || specs.eer) && (
                      <div className="text-[12px] text-[#30d158] flex items-center gap-1">
                        <Shield className="w-3 h-3" /> {specs.efficiency || specs.eer}
                      </div>
                    )}
                  </div>

                  {/* View Details */}
                  <div className="mt-4 pt-3 border-t border-[#d2d2d7] flex items-center justify-between">
                    <span className="text-[13px] text-[#0066cc] group-hover:underline">View Details</span>
                    <ChevronRight className="w-4 h-4 text-[#0066cc] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Quick Links to Categories */}
        <div className="mt-10 text-center">
          <p className="text-[14px] text-[#86868b] mb-4">Popular Categories</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Motors & Drives", "Pumps", "Valves", "Heat Exchangers", "Compressors", "Controls"].map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                className="text-[13px] bg-[#f5f5f7] hover:bg-[#e8e8ed] px-4 py-2 rounded-full text-[#424245] hover:text-[#0066cc] transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
