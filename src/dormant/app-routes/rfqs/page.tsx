"use client";

import React, { useState, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import Link from "next/link";
import {
  Briefcase, Clock, Globe, ArrowRight,
  Search, Filter, ExternalLink
} from "lucide-react";

export default function RFQsPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRfqs() {
      try {
        const res = await fetch("/api/rfqs?status=open", {
          credentials: "same-origin",
        });
        if (res.ok) {
          const data = await res.json();
          setRfqs(data || []);
        }
      } catch {
        console.error("Failed to load RFQs");
      }
      setIsLoading(false);
    }
    fetchRfqs();
  }, []);

  return (
    <PageLayout
      title="Live RFQ Market"
      subtitle="Broadcast your requirements or bid on open projects"
      showCTA={true}
      ctaText="Create RFQ"
      ctaHref="/pm/dashboard"
    >
      <div className="mb-10 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects by title or metric system..."
            className="w-full h-[52px] pl-12 pr-4 bg-white border border-[#d2d2d7] rounded-full text-[16px] focus:outline-none focus:border-[#0066cc]"
          />
        </div>
        <button className="h-[52px] px-6 bg-white border border-[#d2d2d7] rounded-full flex items-center gap-2 text-[15px] font-medium hover:bg-[#f5f5f7]">
          <Filter className="w-4 h-4" /> Filter Categories
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center animate-pulse text-[#86868b]">Loading live RFQs...</div>
      ) : rfqs.length === 0 ? (
        <div className="bg-[#f5f5f7] rounded-[24px] p-20 text-center border border-dashed border-[#d2d2d7]">
          <Globe className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
          <h3 className="text-[21px] font-semibold text-[#1d1d1f]">No active RFQs</h3>
          <p className="text-[15px] text-[#86868b] mt-2">Check back later or create your own request.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {rfqs.map(rfq => (
            <div key={rfq.id} className="group bg-white rounded-[24px] p-8 border border-[#d2d2d7]/30 hover:border-[#0066cc]/40 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-[#0066cc]/10 text-[#0066cc] text-[11px] font-bold rounded-full uppercase tracking-wider">
                      {rfq.metric_system} System
                    </span>
                    <span className="text-[12px] text-[#86868b]">
                      Posted by <span className="text-[#1d1d1f] font-semibold">{rfq.profiles?.company_name}</span>
                    </span>
                  </div>
                  <h3 className="text-[24px] font-bold text-[#1d1d1f] mb-3 group-hover:text-[#0066cc] transition-colors">
                    {rfq.title}
                  </h3>
                  <p className="text-[16px] text-[#424245] leading-relaxed line-clamp-2 mb-6">
                    {rfq.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#86868b]">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Posted {new Date(rfq.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> MEP Engineering</span>
                  </div>
                </div>
                <div className="flex md:flex-col justify-end gap-3">
                  <Link
                    href={`/rfqs/${rfq.unique_link}`}
                    className="inline-flex items-center justify-center h-[52px] px-8 bg-[#0066cc] text-white rounded-full font-semibold hover:bg-[#0077ed] transition-all whitespace-nowrap"
                  >
                    Submit Quote <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <button className="p-3 bg-[#f5f5f7] rounded-full text-[#1d1d1f] hover:bg-[#e8e8ed] transition-all" title="View Details">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
