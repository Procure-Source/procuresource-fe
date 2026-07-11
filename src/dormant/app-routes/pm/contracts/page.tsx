"use client";

import React, { useState, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { FileText, ChevronRight, Award, Clock, CheckCircle2, Truck } from "lucide-react";

export default function PMContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchContracts() {
      const res = await fetch("/api/contracts", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setContracts(data || []);
      }
      setLoading(false);
    }
    fetchContracts();
  }, [user]);

  const statusBadge = (s: string) => {
    const m: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      awarded: { bg: "bg-amber-100", text: "text-amber-700", icon: <Award className="w-3 h-3" /> },
      active: { bg: "bg-blue-100", text: "text-blue-700", icon: <Clock className="w-3 h-3" /> },
      completed: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
    };
    const c = m[s] || m.awarded;
    return <span className={`flex items-center gap-1 px-2 py-0.5 ${c.bg} ${c.text} text-[10px] font-bold rounded-full uppercase`}>{c.icon}{s}</span>;
  };

  if (loading) {
    return <PageLayout title="Contracts" subtitle=""><div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin" /></div></PageLayout>;
  }

  return (
    <PageLayout title="My Contracts" subtitle="Awarded contracts and delivery tracking" backButtonHref="/pm/dashboard">
      <div className="space-y-4">
        {contracts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#d2d2d7]/30">
            <FileText className="w-12 h-12 text-[#86868b] mx-auto mb-3" />
            <p className="text-[#1d1d1f] font-medium">No contracts yet</p>
            <p className="text-[#86868b] text-sm mt-1">Award a contract by accepting a quote on an RFQ</p>
          </div>
        ) : (
          contracts.map(c => (
            <Link key={c._id || c.id} href={`/pm/contracts/${c._id || c.id}`}
              className="block bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[#0066cc]">{c.contractNumber}</span>
                    {statusBadge(c.status)}
                    {c.deliveries?.[0]?.status && c.deliveries[0].status !== "pending" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-[#f5f5f7] text-[#86868b] text-[10px] font-bold rounded-full capitalize">
                        <Truck className="w-3 h-3" />{c.deliveries[0].status.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[#1d1d1f] group-hover:text-[#0066cc]">{c.title}</h3>
                  <p className="text-sm text-[#86868b] mt-1">
                    Supplier: {c.supplierInfo?.companyName || c.supplierInfo?.fullName}
                    {c.rfq?.title && ` \u00b7 RFQ: ${c.rfq.title}`}
                  </p>
                  <p className="text-sm font-medium text-[#1d1d1f] mt-2">
                    {c.currency} {Number(c.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#d2d2d7] group-hover:text-[#0066cc]" />
              </div>
            </Link>
          ))
        )}
      </div>
    </PageLayout>
  );
}
