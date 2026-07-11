"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/page-layout";
import { Search, X, CheckCircle, Loader2, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  equipment_type?: { name: string } | null;
  certifications?: { certification_name: string; certification_body: string }[];
  specifications?: Record<string, string>;
  price_min?: number;
  price_max?: number;
  [key: string]: any;
}

export default function ProductComparePage() {
  return (
    <Suspense fallback={
      <PageLayout title="Compare Products" subtitle="Side-by-side product comparison">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      </PageLayout>
    }>
      <ProductCompareContent />
    </Suspense>
  );
}

function ProductCompareContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setAllProducts(Array.isArray(data) ? data : []);
        // Pre-select from URL params
        const preselected = searchParams.get("ids")?.split(",").filter(Boolean) || [];
        if (preselected.length > 0) {
          setSelectedIds(preselected.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProducts.slice(0, 20);
    const q = searchTerm.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [allProducts, searchTerm]);

  const compareProducts = useMemo(() => {
    return allProducts.filter((p) => selectedIds.includes(p.id));
  }, [allProducts, selectedIds]);

  // Get all unique spec keys from selected products
  const specKeys = useMemo(() => {
    const keys = new Set<string>();
    compareProducts.forEach((p) => {
      if (p.specifications) {
        Object.keys(p.specifications).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [compareProducts]);

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <PageLayout title="Compare Products" subtitle="Side-by-side product comparison">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Compare Products" subtitle="Side-by-side product comparison">
      {/* Selected Products Pills */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {compareProducts.map((p) => (
            <div key={p.id} className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-full text-[13px] font-medium">
              {p.brand?.name && <span className="opacity-70">{p.brand.name}</span>}
              {p.name}
              <button onClick={() => toggleProduct(p.id)} className="hover:bg-white/20 rounded-full p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {selectedIds.length < 3 && (
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="px-4 py-2 border-2 border-dashed border-[#d2d2d7] text-[#86868b] rounded-full text-[13px] hover:border-[#0066cc] hover:text-[#0066cc] transition-colors"
            >
              + Add Product ({3 - selectedIds.length} remaining)
            </button>
          )}
        </div>
      </div>

      {/* Product Selector */}
      {showSelector && (
        <div className="mb-8 bg-white rounded-[20px] border border-[#e8e8ed] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Select Products to Compare</h3>
            <button onClick={() => setShowSelector(false)} className="p-1 hover:bg-[#f5f5f7] rounded-full">
              <X className="w-5 h-5 text-[#86868b]" />
            </button>
          </div>
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, brand, or category..."
              className="w-full h-[44px] pl-10 pr-4 border border-[#d2d2d7] rounded-xl text-[14px] focus:outline-none focus:border-[#0066cc]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {filteredProducts.length === 0 ? (
              <p className="text-[14px] text-[#86868b] text-center py-8">No products found</p>
            ) : (
              filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    selectedIds.includes(p.id) ? "bg-[#e8f4ff] border border-[#0066cc]" : "hover:bg-[#f5f5f7] border border-transparent"
                  }`}
                >
                  <div>
                    <p className="text-[14px] font-medium text-[#1d1d1f]">{p.name}</p>
                    <p className="text-[12px] text-[#86868b]">
                      {p.brand?.name || "No brand"} {p.category?.name ? `• ${p.category.name}` : ""}
                    </p>
                  </div>
                  {selectedIds.includes(p.id) && <CheckCircle className="w-5 h-5 text-[#0066cc]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {compareProducts.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-[20px] border border-[#e8e8ed] shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#d2d2d7]">
                <th className="text-left py-5 px-6 text-[14px] font-medium text-[#86868b] w-[200px] bg-[#f5f5f7]">Specification</th>
                {compareProducts.map((product) => (
                  <th key={product.id} className="text-left py-5 px-6 min-w-[220px]">
                    <div className="text-[17px] font-semibold text-[#1d1d1f]">{product.name}</div>
                    <div className="text-[14px] text-[#86868b]">{product.brand?.name || "—"}</div>
                    {product.certifications && product.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.certifications.map((cert: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] text-[#30d158] bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            {cert.certification_name || cert.certification_body}
                          </span>
                        ))}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Category */}
              <tr className="border-b border-[#d2d2d7]/50 bg-[#fbfbfd]">
                <td className="py-4 px-6 text-[14px] text-[#86868b] font-medium">Category</td>
                {compareProducts.map((p) => (
                  <td key={p.id} className="py-4 px-6 text-[14px] text-[#1d1d1f]">
                    {p.category?.name || p.equipment_type?.name || "—"}
                  </td>
                ))}
              </tr>
              {/* Dynamic Specs */}
              {specKeys.map((key, idx) => (
                <tr key={key} className={`border-b border-[#d2d2d7]/50 ${idx % 2 === 0 ? "" : "bg-[#fbfbfd]"}`}>
                  <td className="py-4 px-6 text-[14px] text-[#86868b] font-medium capitalize">{key.replace(/_/g, " ")}</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="py-4 px-6 text-[14px] text-[#1d1d1f]">
                      {p.specifications?.[key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
              {specKeys.length === 0 && (
                <tr className="border-b border-[#d2d2d7]/50">
                  <td className="py-4 px-6 text-[14px] text-[#86868b]" colSpan={compareProducts.length + 1}>
                    No specification data available for selected products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#f5f5f7] rounded-[20px] p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-[#86868b]" />
          <p className="text-[17px] text-[#1d1d1f] mb-2">No products selected</p>
          <p className="text-[14px] text-[#86868b] mb-4">Select products to compare their specifications side by side</p>
          <button
            onClick={() => setShowSelector(true)}
            className="px-6 py-2.5 bg-[#0066cc] text-white rounded-full text-[14px] font-medium hover:bg-[#0077ed] transition-colors"
          >
            Select Products
          </button>
        </div>
      )}

      <div className="mt-10 bg-[#000] rounded-[18px] p-8 text-center text-white">
        <h3 className="text-[21px] font-semibold mb-2">Need help choosing?</h3>
        <p className="text-[14px] text-[#86868b] mb-6">Use our AI Spec Matcher to find products that meet your specifications</p>
        <Link
          href="/spec-matcher"
          className="inline-flex h-[37px] items-center justify-center rounded-full bg-[#0066cc] px-[21px] text-[17px] text-white hover:bg-[#0077ed] transition-colors"
        >
          Try AI Spec Matcher
        </Link>
      </div>
    </PageLayout>
  );
}
