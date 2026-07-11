"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageLayout from "@/components/page-layout";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'brand' | 'supplier';
  description?: string;
  brand?: string;
  category?: string;
}

const searchCategories = [
  { name: "Products", count: "74+", href: "/products", type: "product" },
  { name: "Manufacturers", count: "44+", href: "/manufacturers", type: "brand" },
  { name: "Suppliers", count: "15+", href: "/agents", type: "supplier" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const [productsRes, brandsRes, suppliersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/brands'),
        fetch('/api/suppliers'),
      ]);

      const [products, brands, suppliers] = await Promise.all([
        productsRes.ok ? productsRes.json() : [],
        brandsRes.ok ? brandsRes.json() : [],
        suppliersRes.ok ? suppliersRes.json() : [],
      ]);

      const searchLower = searchQuery.toLowerCase();
      const allResults: SearchResult[] = [];

      (Array.isArray(products) ? products : []).forEach((p: {id: string; name: string; slug: string; description?: string; brand?: {name: string}; category?: {name: string}}) => {
        if (
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.brand?.name?.toLowerCase().includes(searchLower)
        ) {
          allResults.push({
            id: p.id,
            name: p.name,
            slug: p.slug,
            type: 'product',
            description: p.description || undefined,
            brand: p.brand?.name,
            category: p.category?.name,
          });
        }
      });

      (Array.isArray(brands) ? brands : []).forEach((b: {id: string; name: string; slug: string; description?: string}) => {
        if (b.name.toLowerCase().includes(searchLower) || b.description?.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: b.id,
            name: b.name,
            slug: b.slug,
            type: 'brand',
            description: b.description || undefined,
          });
        }
      });

      (Array.isArray(suppliers) ? suppliers : []).forEach((s: {id: string; name: string; slug: string; city?: string; country?: string}) => {
        if (s.name.toLowerCase().includes(searchLower) || s.city?.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: s.id,
            name: s.name,
            slug: s.slug,
            type: 'supplier',
            description: s.city ? `${s.city}, ${s.country}` : s.country,
          });
        }
      });

      setResults(allResults.slice(0, 20));
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  const filteredResults = activeFilter
    ? results.filter(r => r.type === activeFilter)
    : results;

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'product':
        return `/products/${result.slug}`;
      case 'brand':
        return `/manufacturers/${result.slug}`;
      case 'supplier':
        return `/agents`;
      default:
        return '#';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product': return 'Product';
      case 'brand': return 'Manufacturer';
      case 'supplier': return 'Supplier';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-[#e8f4ff] text-[#0066cc]';
      case 'brand': return 'bg-[#e8f5e9] text-[#30d158]';
      case 'supplier': return 'bg-[#fff3e0] text-[#ff9500]';
      default: return 'bg-[#f5f5f7] text-[#86868b]';
    }
  };

  return (
    <PageLayout title="Search" subtitle="Find manufacturers, products, and suppliers across the GCC">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, manufacturers, suppliers..."
            className="w-full h-[56px] pl-14 pr-6 border border-[#d2d2d7] rounded-full text-[17px] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 transition-all"
            autoFocus
            aria-label="Search input"
          />
          <svg 
            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isSearching && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {query && !isSearching && (
            <button
              onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Category Links */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {searchCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="px-4 py-2 bg-[#f5f5f7] rounded-full text-[14px] text-[#1d1d1f] hover:bg-[#e8e8ed] transition-colors"
            >
              {cat.name} <span className="text-[#86868b]">({cat.count})</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="max-w-3xl mx-auto">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#e8e8ed]">
            <span className="text-[14px] text-[#86868b]">Filter:</span>
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                !activeFilter ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              All ({results.length})
            </button>
            {['product', 'brand', 'supplier'].map((type) => {
              const count = results.filter(r => r.type === type).length;
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                    activeFilter === type ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                  }`}
                >
                  {getTypeLabel(type)}s ({count})
                </button>
              );
            })}
          </div>

          {isSearching ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#fbfbfd] rounded-[12px] p-4 border border-[#e8e8ed]">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12 bg-[#fbfbfd] rounded-[18px]">
              <svg className="w-12 h-12 mx-auto mb-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[17px] text-[#86868b] mb-2">No results found for &quot;{query}&quot;</p>
              <p className="text-[14px] text-[#86868b]">Try different keywords or browse categories</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[14px] text-[#86868b] mb-4">
                Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for &quot;{query}&quot;
              </p>
              {filteredResults.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={getResultLink(result)}
                  className="block bg-[#fbfbfd] rounded-[12px] p-4 border border-[#e8e8ed] hover:border-[#0066cc] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold text-[#1d1d1f] truncate">{result.name}</h3>
                      {result.description && (
                        <p className="text-[14px] text-[#86868b] line-clamp-1 mt-1">{result.description}</p>
                      )}
                      {result.brand && (
                        <p className="text-[13px] text-[#0066cc] mt-1">by {result.brand}</p>
                      )}
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-1 rounded-full flex-shrink-0 ${getTypeColor(result.type)}`}>
                      {getTypeLabel(result.type)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial State - Before Search */}
      {!hasSearched && (
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Quick Links</h2>
            <div className="space-y-2">
              {[
                { label: 'Browse all products', href: '/products', icon: '📦' },
                { label: 'View manufacturers', href: '/manufacturers', icon: '🏭' },
                { label: 'Find local suppliers', href: '/agents', icon: '🌍' },
                { label: 'AI Spec Matcher', href: '/spec-matcher', icon: '🤖' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 p-3 bg-[#fbfbfd] rounded-[10px] hover:bg-[#f5f5f7] transition-colors"
                >
                  <span className="text-[18px]">{link.icon}</span>
                  <span className="text-[14px] text-[#1d1d1f]">{link.label}</span>
                  <svg className="w-4 h-4 ml-auto text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Popular Categories</h2>
            <div className="flex flex-wrap gap-2">
              {[
                'Air Conditioning', 'Compressors', 'Chillers', 'Pumps',
                'Valves', 'Controls', 'Heat Exchangers', 'Ventilation'
              ].map((category) => (
                <Link
                  key={category}
                  href={`/products?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2 bg-[#f5f5f7] rounded-full text-[13px] text-[#1d1d1f] hover:bg-[#e8e8ed] transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-[14px] text-[#86868b] mb-4">Need help finding specific products?</p>
        <Link 
          href="/spec-matcher"
          className="inline-flex h-[44px] sm:h-[37px] items-center justify-center rounded-full bg-[#0066cc] px-6 sm:px-[21px] text-[15px] sm:text-[17px] text-white hover:bg-[#0077ed] transition-colors"
        >
          Try AI Spec Matcher
        </Link>
      </div>
    </PageLayout>
  );
}
