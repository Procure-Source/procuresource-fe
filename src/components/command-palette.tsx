"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'brand' | 'supplier' | 'page';
  description?: string;
  href: string;
}

const quickLinks: SearchResult[] = [
  { id: 'home', name: 'Home', slug: '', type: 'page', description: 'Go to homepage', href: '/' },
  { id: 'product', name: 'RFQ tool', slug: 'product', type: 'page', description: 'Open the RFQ tool', href: '/product' },
  { id: 'flows', name: 'Screen flow map', slug: 'flows', type: 'page', description: 'View purchaser, supplier, and verification journeys', href: '/flows' },
  { id: 'purchasers', name: 'Purchasers', slug: 'purchasers', type: 'page', description: 'Open purchaser information', href: '/purchasers' },
  { id: 'suppliers', name: 'Suppliers', slug: 'suppliers', type: 'page', description: 'Open supplier information', href: '/suppliers' },
  { id: 'news', name: 'News', slug: 'news', type: 'page', description: 'Read market notes', href: '/news' },
  { id: 'advertise', name: 'Advertise', slug: 'advertise', type: 'page', description: 'View advertising options', href: '/advertise' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(quickLinks);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(quickLinks);
      return;
    }

    setIsLoading(true);
    const searchLower = searchQuery.toLowerCase();

    try {
      const [productsRes, brandsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/brands'),
      ]);

      const [products, brands] = await Promise.all([
        productsRes.ok ? productsRes.json() : [],
        brandsRes.ok ? brandsRes.json() : [],
      ]);

      const allResults: SearchResult[] = [];

      const filteredQuickLinks = quickLinks.filter(
        link => link.name.toLowerCase().includes(searchLower) || 
               link.description?.toLowerCase().includes(searchLower)
      );
      allResults.push(...filteredQuickLinks);

      (Array.isArray(products) ? products : []).slice(0, 5).forEach((p: {id: string; name: string; slug: string; description?: string; brand?: {name: string}}) => {
        if (
          p.name.toLowerCase().includes(searchLower) ||
          p.brand?.name?.toLowerCase().includes(searchLower)
        ) {
          allResults.push({
            id: `product-${p.id}`,
            name: p.name,
            slug: p.slug,
            type: 'product',
            description: p.brand?.name,
            href: `/products/${p.slug}`,
          });
        }
      });

      (Array.isArray(brands) ? brands : []).slice(0, 3).forEach((b: {id: string; name: string; slug: string; description?: string}) => {
        if (b.name.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: `brand-${b.id}`,
            name: b.name,
            slug: b.slug,
            type: 'brand',
            description: b.description || 'Manufacturer',
            href: `/manufacturers/${b.slug}`,
          });
        }
      });

      setResults(allResults.slice(0, 10));
      setSelectedIndex(0);
    } catch (error) {
      console.error('Command palette search error:', error);
      setResults(quickLinks.filter(
        link => link.name.toLowerCase().includes(searchLower)
      ));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      performSearch(query);
    }, 150);
    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'brand':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'supplier':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[560px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b border-[#e8e8ed] px-4">
          <svg className="w-5 h-5 text-[#86868b] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages or type a command..."
            className="flex-1 h-14 border-0 bg-transparent text-[16px] placeholder:text-[#86868b] focus:outline-none"
            autoFocus
          />
          {isLoading && (
            <div className="w-5 h-5 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-[#86868b]">
              <p className="text-[15px]">No results found</p>
              <p className="text-[13px] mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex ? 'bg-[#0066cc] text-white' : 'hover:bg-[#f5f5f7]'
                  }`}
                >
                  <span className={index === selectedIndex ? 'text-white' : 'text-[#86868b]'}>
                    {getTypeIcon(result.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[15px] font-medium truncate ${index === selectedIndex ? 'text-white' : 'text-[#1d1d1f]'}`}>
                      {result.name}
                    </div>
                    {result.description && (
                      <div className={`text-[13px] truncate ${index === selectedIndex ? 'text-white/70' : 'text-[#86868b]'}`}>
                        {result.description}
                      </div>
                    )}
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${
                    index === selectedIndex 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#f5f5f7] text-[#86868b]'
                  }`}>
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8e8ed] bg-[#fbfbfd] text-[12px] text-[#86868b]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#e8e8ed] rounded text-[11px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-[#e8e8ed] rounded text-[11px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#e8e8ed] rounded text-[11px]">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#e8e8ed] rounded text-[11px]">Esc</kbd>
              Close
            </span>
          </div>
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-[#e8e8ed] rounded text-[11px]">⌘K</kbd> anywhere</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
