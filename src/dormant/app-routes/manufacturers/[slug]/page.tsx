"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PageLayout from "@/components/page-layout";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Globe, Phone, Mail, Star, Shield, ChevronRight, ExternalLink, FileText } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website?: string;
  country?: string;
  founded_year?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand_id: string;
  specifications?: Record<string, string> | null;
  category?: { name: string } | null;
}

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const brandRes = await fetch(`/api/brands/${slug}`);
        if (!brandRes.ok) throw new Error("Brand not found");
        const brandData = await brandRes.json();
        setBrand(brandData);

        const productsRes = await fetch(`/api/brands/${slug}/products`);
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brand");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  if (isLoading) {
    return (
      <PageLayout title="" subtitle="">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#fbfbfd] rounded-[18px] p-6">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !brand) {
    return (
      <PageLayout title="Brand Not Found" subtitle="">
        <div className="text-center py-12 bg-[#fbfbfd] rounded-[20px]">
          <svg className="w-16 h-16 mx-auto mb-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[17px] text-[#86868b] mb-4">{error || "Brand not found"}</p>
          <Link href="/manufacturers" className="inline-flex items-center gap-2 text-[#0066cc] hover:underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Manufacturers
          </Link>
        </div>
      </PageLayout>
    );
  }

  const productCount = products.length;
  const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

  return (
    <PageLayout 
      title={brand.name} 
      subtitle={brand.description || "Leading HVAC Equipment Manufacturer"}
    >
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-[13px] text-[#86868b]">
        <Link href="/manufacturers" className="hover:text-[#0066cc]">Manufacturers</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-[#1d1d1f]">{brand.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
            {/* Brand Header Card */}
            <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed]">
              <div className="flex flex-col md:flex-row gap-6">
                {brand.logo_url ? (
                  <div className="w-24 h-24 bg-white rounded-[16px] flex items-center justify-center flex-shrink-0 border border-[#e8e8ed] p-3">
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      width={72}
                      height={72}
                      className="object-contain max-h-[60px] w-auto"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-[#0066cc] to-[#0055b3] rounded-[16px] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[32px] font-bold">{brand.name.charAt(0)}</span>
                  </div>
                )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-[28px] font-bold text-[#1d1d1f]">{brand.name}</h1>
                  <span className="inline-flex items-center gap-1 text-[11px] bg-[#e8f5e9] text-[#30d158] px-2 py-1 rounded-full">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-[15px] text-[#424245] mb-4">{brand.description || "Leading manufacturer of HVAC equipment"}</p>
                
                <div className="flex flex-wrap gap-4 text-[14px]">
                  <div className="flex items-center gap-2 text-[#86868b]">
                    <MapPin className="w-4 h-4" />
                    <span>International</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#86868b]">
                    <Star className="w-4 h-4 text-[#ff9500]" />
                    <span>{productCount} Products</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
              <div className="text-[28px] font-bold text-[#0066cc]">{productCount}</div>
              <div className="text-[13px] text-[#86868b]">Products</div>
            </div>
            <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
              <div className="text-[28px] font-bold text-[#30d158]">{categories.length || 1}</div>
              <div className="text-[13px] text-[#86868b]">Categories</div>
            </div>
            <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
              <div className="text-[28px] font-bold text-[#ff9500]">15+</div>
              <div className="text-[13px] text-[#86868b]">GCC Countries</div>
            </div>
            <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
              <div className="text-[28px] font-bold text-[#5856d6]">24/7</div>
              <div className="text-[13px] text-[#86868b]">Support</div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[21px] font-semibold text-[#1d1d1f]">Products by {brand.name}</h2>
              {productCount > 6 && (
                <Link href={`/products?brand=${brand.slug}`} className="text-[#0066cc] text-[14px] hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 bg-[#fbfbfd] rounded-[18px]">
                <svg className="w-12 h-12 mx-auto mb-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-[#86868b] mb-2">No products available yet.</p>
                <p className="text-[13px] text-[#86868b]">Check back soon for product listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.slice(0, 9).map((product) => (
                  <Link 
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-white rounded-[18px] overflow-hidden border border-[#e8e8ed] hover:border-[#0066cc] hover:shadow-lg transition-all"
                  >
                    <div className="w-full h-32 bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="p-4">
                      <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1 group-hover:text-[#0066cc] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-[13px] text-[#86868b] mb-3 line-clamp-2">
                        {product.description || "HVAC Equipment"}
                      </p>
                      {product.category && (
                        <span className="text-[11px] bg-[#e8f4ff] text-[#0066cc] px-2 py-0.5 rounded-full">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed] sticky top-24">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Contact {brand.name}</h3>
            
            {contactSubmitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#30d158]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[15px] font-medium text-[#1d1d1f]">Request Sent!</p>
                <p className="text-[13px] text-[#86868b] mt-1">We&apos;ll connect you soon.</p>
              </div>
            ) : showContactForm ? (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name *"
                  required
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                />
                <textarea
                  placeholder="Message *"
                  required
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px] resize-none"
                />
                <button
                  type="submit"
                  className="w-full bg-[#0066cc] text-white py-3 rounded-full text-[15px] font-medium hover:bg-[#0055b3] transition-colors"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="w-full text-[#86868b] text-[13px] hover:text-[#1d1d1f]"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-[#0066cc] text-white py-3 rounded-full text-[15px] font-medium hover:bg-[#0055b3] transition-colors mb-3"
                >
                  Contact Brand
                </button>
                <div className="space-y-3 pt-3 border-t border-[#e8e8ed]">
                  <a href="tel:+97144441234" className="flex items-center gap-3 text-[14px] text-[#424245] hover:text-[#0066cc]">
                    <Phone className="w-4 h-4" />
                    +971 4 444 1234
                  </a>
                  <a href="mailto:info@procuresource.ae" className="flex items-center gap-3 text-[14px] text-[#424245] hover:text-[#0066cc]">
                    <Mail className="w-4 h-4" />
                    info@procuresource.ae
                  </a>
                  <a href="#" className="flex items-center gap-3 text-[14px] text-[#424245] hover:text-[#0066cc]">
                    <Globe className="w-4 h-4" />
                    Visit Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#fbfbfd] rounded-[20px] p-6">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/products?brand=${brand.slug}`}
                className="flex items-center gap-3 p-3 bg-white rounded-[10px] hover:bg-[#f5f5f7] transition-colors"
              >
                <FileText className="w-4 h-4 text-[#0066cc]" />
                <span className="text-[14px] text-[#1d1d1f]">View All Products</span>
              </Link>
              <Link
                href="/spec-matcher"
                className="flex items-center gap-3 p-3 bg-white rounded-[10px] hover:bg-[#f5f5f7] transition-colors"
              >
                <Star className="w-4 h-4 text-[#ff9500]" />
                <span className="text-[14px] text-[#1d1d1f]">Match to Specs</span>
              </Link>
              <Link
                href="/agents"
                className="flex items-center gap-3 p-3 bg-white rounded-[10px] hover:bg-[#f5f5f7] transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#30d158]" />
                <span className="text-[14px] text-[#1d1d1f]">Find Local Supplier</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
