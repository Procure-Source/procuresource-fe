"use client";

import { useState, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import Link from "next/link";
import { MapPin, Star, FileText, Filter, Grid, List, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: Record<string, string> | null;
  brand: Brand | null;
  category: Category | null;
  equipment_type: { id: string; name: string; slug: string } | null;
  certifications: { id: string; certification_name: string }[];
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/categories").then((res) => res.ok ? res.json() : []),
      fetch("/api/products").then((res) => res.ok ? res.json() : []),
    ])
      .then(([categoriesData, productsData]) => {
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeCategory) {
      // Match by category id or category name (for supplier_products TEXT-based categories)
      const catMatch = p.category?.name === activeCategory || p.category?.slug === activeCategory || p.category?.id === activeCategory;
      if (!catMatch) return false;
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(search) ||
        p.brand?.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getTopSpecs = (specs: Record<string, string> | null) => {
    if (!specs) return [];
    const priorityKeys = ["capacity", "power", "voltage", "refrigerant", "efficiency", "cop", "origin"];
    const entries = Object.entries(specs);
    const sorted = entries.sort((a, b) => {
      const aIndex = priorityKeys.indexOf(a[0].toLowerCase());
      const bIndex = priorityKeys.indexOf(b[0].toLowerCase());
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    return sorted.slice(0, 4);
  };

  return (
    <PageLayout 
      title="Product Catalog" 
      subtitle={`${products.length} products from leading HVAC manufacturers`}
    >
      {/* Search and Filter Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 text-[14px]"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#0066cc] text-white" : "bg-[#f5f5f7] text-[#86868b]"}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#0066cc] text-white" : "bg-[#f5f5f7] text-[#86868b]"}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[#86868b]" />
          <h3 className="text-[14px] font-medium text-[#86868b] uppercase tracking-wide">Filter by Category</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
              !activeCategory 
                ? "bg-[#1d1d1f] text-white" 
                : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter(p => p.category?.name === cat.name || p.category?.slug === cat.slug).length;
            if (count === 0) return null;
            return (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                  activeCategory === cat.name
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[14px] text-[#86868b]">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </p>
        <Link href="/products/compare" className="text-[14px] text-[#0066cc] hover:underline flex items-center gap-1">
          <FileText className="w-4 h-4" />
          Compare Products
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#86868b]">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-[#fbfbfd] rounded-[18px]">
          <p className="text-[#86868b] mb-2">No products found matching your criteria.</p>
          <button onClick={() => { setActiveCategory(null); setSearchTerm(""); }} className="text-[#0066cc] hover:underline">
            Clear filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <Link 
              key={product.id}
              href={`/products/${product.slug}`}
              className="group bg-white rounded-[18px] overflow-hidden border border-[#e8e8ed] hover:border-[#0066cc] hover:shadow-xl transition-all"
            >
              {/* Product Header */}
              <div className="p-5 border-b border-[#f5f5f7]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {product.brand && (
                      <span className="text-[11px] font-semibold text-[#0066cc] uppercase tracking-wider">
                        {product.brand.name}
                      </span>
                    )}
                    <h3 className="text-[16px] font-semibold text-[#1d1d1f] leading-tight mt-1 group-hover:text-[#0066cc] transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  {product.specifications?.origin && (
                    <span className="flex items-center gap-1 text-[11px] text-[#86868b] bg-[#f5f5f7] px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3" />
                      {product.specifications.origin}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#86868b] line-clamp-2 mb-3">
                  {product.description || "HVAC equipment"}
                </p>
                {product.category && (
                  <span className="inline-block text-[11px] bg-[#e8f4ff] text-[#0066cc] px-2 py-0.5 rounded-full">
                    {product.category.name}
                  </span>
                )}
              </div>

              {/* Specifications Preview */}
              {product.specifications && (
                <div className="px-5 py-4 bg-[#fafafa]">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {getTopSpecs(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] text-[#86868b] uppercase">{key.replace(/_/g, " ")}</span>
                        <span className="text-[12px] text-[#1d1d1f] font-medium truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-3 flex items-center justify-between bg-white border-t border-[#f5f5f7]">
                <div className="flex items-center gap-1">
                  {product.specifications?.certifications && (
                    <span className="text-[10px] text-[#30d158] bg-[#e8f5e9] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Certified
                    </span>
                  )}
                  {product.specifications?.warranty && (
                    <span className="text-[10px] text-[#86868b]">
                      {product.specifications.warranty} warranty
                    </span>
                  )}
                </div>
                <span className="text-[#0066cc] text-[12px] font-medium flex items-center group-hover:translate-x-1 transition-transform">
                  Details <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Link 
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex flex-col md:flex-row bg-white rounded-[18px] overflow-hidden border border-[#e8e8ed] hover:border-[#0066cc] hover:shadow-lg transition-all"
            >
              {/* Left - Image placeholder */}
              <div className="w-full md:w-48 h-32 md:h-auto bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] flex items-center justify-center flex-shrink-0">
                <svg className="w-12 h-12 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              
              {/* Right - Content */}
              <div className="flex-1 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    {product.brand && (
                      <span className="text-[11px] font-semibold text-[#0066cc] uppercase tracking-wider">
                        {product.brand.name}
                      </span>
                    )}
                    <h3 className="text-[17px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.specifications?.origin && (
                      <span className="flex items-center gap-1 text-[11px] text-[#86868b] bg-[#f5f5f7] px-2 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        {product.specifications.origin}
                      </span>
                    )}
                    {product.category && (
                      <span className="text-[11px] bg-[#e8f4ff] text-[#0066cc] px-2 py-1 rounded-full">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-[14px] text-[#86868b] line-clamp-2 mb-4">
                  {product.description || "HVAC equipment"}
                </p>

                {product.specifications && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                    {getTopSpecs(product.specifications).slice(0, 5).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[11px] text-[#86868b] uppercase">{key.replace(/_/g, " ")}:</span>
                        <span className="text-[12px] text-[#1d1d1f] font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#f5f5f7]">
                  <div className="flex items-center gap-2">
                    {product.specifications?.certifications && (
                      <span className="text-[10px] text-[#30d158] bg-[#e8f5e9] px-2 py-0.5 rounded-full">
                        Certified
                      </span>
                    )}
                    {product.specifications?.warranty && (
                      <span className="text-[11px] text-[#86868b]">
                        {product.specifications.warranty} warranty
                      </span>
                    )}
                  </div>
                  <span className="text-[#0066cc] text-[13px] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
