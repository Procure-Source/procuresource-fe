"use client";

import { useState, useEffect, useMemo } from "react";
import PageLayout from "@/components/page-layout";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, CheckCircle, ChevronRight, Grid3X3, List, Loader2 } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
}

const BrandLogo = ({ name, size = "lg" }: { name: string; size?: "sm" | "md" | "lg" }) => {
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

  const sizeClasses = {
    sm: "w-10 h-10 text-[16px] rounded-[10px]",
    md: "w-12 h-12 text-[18px] rounded-[12px]",
    lg: "w-14 h-14 sm:w-16 sm:h-16 text-[20px] sm:text-[22px] rounded-[14px]",
  };

  return (
    <div className={`${sizeClasses[size]} ${colors[colorIndex]} flex items-center justify-center text-white font-bold shadow-lg`}>
      {letter}
    </div>
  );
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch brands");
        return res.json();
      })
      .then((data) => {
        const brandsArray = Array.isArray(data) ? data : data.brands || [];
        setBrands(brandsArray);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const letters = useMemo(() => {
    const letterSet = new Set(brands.map(b => b.name.charAt(0).toUpperCase()));
    return Array.from(letterSet).sort();
  }, [brands]);

  const filteredBrands = useMemo(() => {
    return brands.filter(brand => {
      const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           brand.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLetter = !selectedLetter || brand.name.charAt(0).toUpperCase() === selectedLetter;
      return matchesSearch && matchesLetter;
    });
  }, [brands, searchQuery, selectedLetter]);

  const groupedBrands = useMemo(() => {
    const groups: Record<string, Brand[]> = {};
    filteredBrands.forEach(brand => {
      const letter = brand.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(brand);
    });
    return groups;
  }, [filteredBrands]);

  if (isLoading) {
    return (
      <PageLayout title="Brand Directory" subtitle="Loading brands...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Brand Directory"
      subtitle={`${brands.length} verified HVAC & MEP manufacturers`}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
          <p className="text-[28px] font-bold text-[#0066cc]">{brands.length}</p>
          <p className="text-[12px] text-[#86868b]">Total Brands</p>
        </div>
        <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
          <p className="text-[28px] font-bold text-[#30d158]">{brands.filter(b => b.logo_url).length}</p>
          <p className="text-[12px] text-[#86868b]">With Logos</p>
        </div>
        <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
          <p className="text-[28px] font-bold text-[#ff9500]">74</p>
          <p className="text-[12px] text-[#86868b]">Products</p>
        </div>
        <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
          <p className="text-[28px] font-bold text-[#5856d6]">6</p>
          <p className="text-[12px] text-[#86868b]">GCC Countries</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-full border border-[#d2d2d7] bg-white text-[15px] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 rounded-full text-[#86868b] hover:bg-[#f5f5f7] transition-colors"
            >
              {viewMode === "grid" ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Letter Filter */}
        <div className="flex flex-wrap justify-center gap-1 mt-4">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
              !selectedLetter ? 'bg-[#0066cc] text-white' : 'bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]'
            }`}
          >
            All
          </button>
          {letters.map(letter => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
              className={`w-8 h-8 rounded-full text-[13px] font-medium transition-colors ${
                selectedLetter === letter ? 'bg-[#0066cc] text-white' : 'bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-[#ff453a] mb-2">{error}</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-12 text-[#86868b]">
          {searchQuery ? `No brands found matching "${searchQuery}"` : "No brands found."}
        </div>
      ) : viewMode === "list" ? (
        /* List View */
        <div className="space-y-8">
          {Object.entries(groupedBrands).sort(([a], [b]) => a.localeCompare(b)).map(([letter, letterBrands]) => (
            <div key={letter}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-full bg-[#0066cc] text-white flex items-center justify-center font-bold text-[18px]">
                  {letter}
                </span>
                <span className="text-[14px] text-[#86868b]">{letterBrands.length} brands</span>
              </div>
              <div className="space-y-2">
                {letterBrands.map(brand => (
                  <Link
                    key={brand.id}
                    href={`/manufacturers/${brand.slug}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-[14px] border border-[#e8e8ed] hover:border-[#0066cc] hover:shadow-md transition-all group"
                  >
                    {brand.logo_url ? (
                      <div className="w-12 h-12 bg-white rounded-[10px] flex items-center justify-center p-1.5 border border-[#e8e8ed]">
                        <Image
                          src={brand.logo_url}
                          alt={brand.name}
                          width={40}
                          height={40}
                          className="object-contain max-h-[36px] w-auto"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <BrandLogo name={brand.name} size="md" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-[16px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc]">{brand.name}</h3>
                      <p className="text-[13px] text-[#86868b] line-clamp-1">{brand.description || "HVAC & MEP Equipment"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#30d158] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                      <ChevronRight className="w-5 h-5 text-[#86868b] group-hover:text-[#0066cc] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/manufacturers/${brand.slug}`}
              className="group bg-[#fbfbfd] rounded-[18px] p-5 sm:p-6 hover:bg-[#f5f5f7] transition-all border border-transparent hover:border-[#d2d2d7] hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                {brand.logo_url ? (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-[14px] flex items-center justify-center p-2 border border-[#e8e8ed]">
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      width={48}
                      height={48}
                      className="object-contain max-h-[40px] w-auto"
                      unoptimized
                    />
                  </div>
                ) : (
                  <BrandLogo name={brand.name} size="lg" />
                )}
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-[12px] text-[#30d158]">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <h3 className="text-[17px] sm:text-[19px] font-semibold text-[#1d1d1f] mb-2 group-hover:text-[#0066cc] transition-colors">{brand.name}</h3>
              <p className="text-[13px] sm:text-[14px] text-[#86868b] mb-3 line-clamp-2">{brand.description || "HVAC & MEP Equipment"}</p>
              <div className="flex items-center text-[#0066cc] text-[13px] sm:text-[14px] font-medium group-hover:gap-2 transition-all">
                View Products
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 sm:mt-10 text-center">
        <p className="text-[13px] sm:text-[14px] text-[#86868b] mb-4">Can&apos;t find your brand?</p>
        <Link
          href="/manufacturer/register"
          className="text-[#0066cc] text-[15px] sm:text-[17px] font-normal hover:underline"
        >
          List your brand &gt;
        </Link>
      </div>
    </PageLayout>
  );
}
