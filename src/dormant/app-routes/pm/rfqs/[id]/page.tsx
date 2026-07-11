"use client";

import React, { useState, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Download,
  Eye,
  BarChart3,
  Filter,
  ShieldCheck,
  TrendingUp,
  Award,
  Coins,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { friendlyError } from "@/lib/friendly-error";

export default function RFQComparisonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [rfq, setRfq] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [awardModal, setAwardModal] = useState<any>(null);
  const [awardForm, setAwardForm] = useState({
    payment_terms: "",
    delivery_deadline: "",
    terms: "",
  });
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch RFQ details via API (bypasses RLS)
      try {
        const rfqRes = await fetch(`/api/rfqs/${id}`, {
          credentials: "same-origin",
        });
        const rfqData = await rfqRes.json();

        if (!rfqRes.ok || !rfqData) {
          toast.error("RFQ not found");
          router.push("/pm/dashboard");
          return;
        }
        setRfq(rfqData);
        setSubmissions(rfqData.submissions || []);
      } catch {
        toast.error("Failed to load RFQ");
        router.push("/pm/dashboard");
        return;
      }

      setIsLoading(false);
    }
    fetchData();
  }, [id, router]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading comparison data...
      </div>
    );

  const lowestPrice = Math.min(
    ...submissions.map((s) => s.quotes?.total_amount || Infinity),
  );

  return (
    <PageLayout
      title="RFQ Technical Comparison"
      subtitle={rfq.title}
      backButtonHref="/pm/dashboard"
    >
      <div className="space-y-8">
        {/* Quick Analytics Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
            <p className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider mb-2">
              Total Bids
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[28px] font-bold text-[#1d1d1f]">
                {submissions.length}
              </span>
              <span className="text-[12px] px-2 py-0.5 bg-blue-50 text-[#0066cc] rounded-full font-bold">
                Active
              </span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
            <p className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider mb-2">
              Lowest Quote
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[28px] font-bold text-green-600">
                {submissions.length > 0
                  ? `${submissions[0].quotes?.currency} ${lowestPrice.toLocaleString()}`
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
            <p className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider mb-2">
              System Standard
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[24px] font-bold text-[#1d1d1f]">
                {rfq.metric_system}
              </span>
              <ShieldCheck className="w-5 h-5 text-[#0066cc]" />
            </div>
          </div>
          <div className="bg-[#0066cc] rounded-3xl p-6 shadow-lg shadow-[#0066cc]/20 text-white">
            <p className="text-[12px] font-bold text-white/70 uppercase tracking-wider mb-2">
              Decision Window
            </p>
            <p className="text-[24px] font-bold">3 Days Left</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-[32px] border border-[#d2d2d7]/30 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-[#f5f5f7] flex items-center justify-between">
            <h3 className="text-[21px] font-bold text-[#1d1d1f] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#0066cc]" /> Technical Matrix
            </h3>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#f5f5f7] rounded-full text-[14px] font-semibold hover:bg-[#e8e8ed] transition-all">
                <Filter className="w-4 h-4" /> Filter Bids
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1d1d1f] text-white rounded-full text-[14px] font-semibold hover:bg-black transition-all">
                <Download className="w-4 h-4" /> Export Matrix
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f5f7]/50">
                  <th className="px-8 py-6 text-[14px] font-bold text-[#1d1d1f] border-b border-[#d2d2d7]/30 min-w-[300px] sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                    Technical Specifications
                  </th>
                  {submissions.map((sub) => (
                    <th
                      key={sub.id}
                      className="px-8 py-6 text-[14px] font-bold text-[#1d1d1f] border-b border-[#d2d2d7]/30 min-w-[250px]"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[#0066cc] text-[12px] uppercase tracking-widest">
                          Supplier
                        </span>
                        <span className="text-[17px]">
                          {sub.profiles?.company_name}
                        </span>
                        {sub.profiles?.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold border border-green-200 w-fit">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold border border-amber-200 w-fit">
                            <Clock className="w-3.5 h-3.5" /> Unverified
                          </span>
                        )}
                        {sub.profiles?.documents?.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {sub.profiles.documents.map((doc: any, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                                {doc.verified_at ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Clock className="w-3 h-3 text-amber-500" />
                                )}
                                <span className="text-[#86868b] capitalize">{(doc.document_type || "").replace(/_/g, " ")}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {sub.quotes?.total_amount === lowestPrice && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full w-fit">
                            <Coins className="w-3 h-3" /> LOWEST PRICE
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {/* RFQ Items Mapping */}
                {rfq.rfq_items?.map((rfqItem: any) => (
                  <tr
                    key={rfqItem.id}
                    className="hover:bg-[#fbfbfd] transition-colors"
                  >
                    <td className="px-8 py-6 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-bold text-[#1d1d1f]">
                          {rfqItem.description}
                        </span>
                        <span className="text-[13px] text-[#86868b]">
                          Qty: {rfqItem.quantity} | Required:{" "}
                          {rfqItem.metric_spec}
                        </span>
                      </div>
                    </td>
                    {submissions.map((sub) => {
                      const quoteItem = sub.quotes?.quote_items?.find(
                        (i: any) => i.description === rfqItem.description,
                      );
                      return (
                        <td key={sub.id} className="px-8 py-6">
                          {quoteItem ? (
                            <div className="space-y-2">
                              <p className="text-[14px] font-medium text-[#1d1d1f]">
                                {quoteItem.metric_spec}
                              </p>
                              <div className="flex justify-between items-center pt-2 border-t border-[#f5f5f7]">
                                <span className="text-[12px] text-[#86868b]">
                                  Unit Price
                                </span>
                                <span className="text-[13px] font-bold">
                                  {sub.quotes.currency}{" "}
                                  {quoteItem.unit_price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[12px] text-red-500 font-medium">
                              Item Missing in Quote
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Commercial Summary Row */}
                <tr className="bg-[#f5f5f7]/30">
                  <td className="px-8 py-8 sticky left-0 bg-[#f5f5f7] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#0066cc]" />
                      <span className="text-[17px] font-bold text-[#1d1d1f]">
                        Commercial Total
                      </span>
                    </div>
                    <p className="text-[13px] text-[#86868b] mt-1">
                      Including 5% VAT and handling
                    </p>
                  </td>
                  {submissions.map((sub) => (
                    <td key={sub.id} className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="text-[22px] font-bold text-[#0066cc]">
                          {sub.quotes?.currency}{" "}
                          {sub.quotes?.total_amount?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-[13px] text-[#86868b] mt-1">
                          Valid until{" "}
                          {new Date(
                            sub.quotes?.valid_until,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Logistics Row */}
                <tr>
                  <td className="px-8 py-8 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className="text-[17px] font-bold text-[#1d1d1f]">
                        Lead Time
                      </span>
                    </div>
                  </td>
                  {submissions.map((sub) => (
                    <td key={sub.id} className="px-8 py-8">
                      <p className="text-[15px] font-semibold text-[#1d1d1f]">
                        {sub.quotes?.lead_time}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Actions Row */}
                <tr className="bg-[#f5f5f7]/10">
                  <td className="px-8 py-8 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                    <span className="text-[14px] font-bold text-[#1d1d1f]">
                      Actions
                    </span>
                  </td>
                  {submissions.map((sub) => (
                    <td key={sub.id} className="px-8 py-8">
                      <div className="flex flex-col gap-2">
                        {rfq.status === "awarded" ? (
                          sub.status === "accepted" ? (
                            <div className="w-full h-11 bg-green-100 text-green-700 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 border-2 border-green-300">
                              <Award className="w-4 h-4" /> Contract Awarded
                            </div>
                          ) : (
                            <div className="w-full h-11 bg-gray-100 text-gray-400 rounded-xl text-[14px] font-medium flex items-center justify-center">
                              Not Selected
                            </div>
                          )
                        ) : (
                          <button
                            onClick={() => setAwardModal(sub)}
                            className="w-full h-11 bg-[#0066cc] text-white rounded-xl text-[14px] font-bold hover:bg-[#0077ed] transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Accept Bid
                          </button>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Award Contract Modal */}
      {awardModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1d1d1f]">
                Award Contract
              </h3>
              <button
                onClick={() => setAwardModal(null)}
                className="p-2 hover:bg-[#f5f5f7] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-6">
              <p className="text-sm text-[#86868b]">Awarding to:</p>
              <p className="text-lg font-bold text-[#1d1d1f]">
                {awardModal.profiles?.company_name}
              </p>
              <p className="text-sm font-medium text-[#0066cc] mt-1">
                {awardModal.quotes?.currency}{" "}
                {awardModal.quotes?.total_amount?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={awardForm.payment_terms}
                  onChange={(e) =>
                    setAwardForm({
                      ...awardForm,
                      payment_terms: e.target.value,
                    })
                  }
                  placeholder="e.g., 30% advance, 70% on delivery"
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-[#0066cc]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                  Delivery Deadline
                </label>
                <input
                  type="date"
                  value={awardForm.delivery_deadline}
                  onChange={(e) =>
                    setAwardForm({
                      ...awardForm,
                      delivery_deadline: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-[#0066cc]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                  Additional Terms
                </label>
                <textarea
                  value={awardForm.terms}
                  onChange={(e) =>
                    setAwardForm({ ...awardForm, terms: e.target.value })
                  }
                  placeholder="Any additional contract terms..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm resize-none focus:outline-none focus:border-[#0066cc]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAwardModal(null)}
                className="flex-1 py-3 text-sm font-medium text-[#86868b] hover:text-[#1d1d1f]"
              >
                Cancel
              </button>
              <button
                disabled={awarding}
                onClick={async () => {
                  setAwarding(true);
                  try {
                    const res = await fetch("/api/contracts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "same-origin",
                      body: JSON.stringify({
                        rfq_id: rfq.id,
                        rfq_submission_id: awardModal.id,
                        quote_id: awardModal.quotes?.id,
                        supplier_id: awardModal.supplier_id,
                        title: rfq.title,
                        total_value: awardModal.quotes?.total_amount,
                        currency: awardModal.quotes?.currency || "AED",
                        payment_terms: awardForm.payment_terms || null,
                        delivery_deadline: awardForm.delivery_deadline || null,
                        terms: awardForm.terms || null,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    toast.success(`Contract ${data.contract_number} awarded!`);
                    setAwardModal(null);
                    router.push(`/pm/contracts/${data.id}`);
                  } catch (err: any) {
                    toast.error(friendlyError(err, "Failed to award contract"));
                  }
                  setAwarding(false);
                }}
                className="flex-1 py-3 bg-[#0066cc] text-white rounded-full text-sm font-bold hover:bg-[#0055b3] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {awarding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Award className="w-4 h-4" />
                )}
                {awarding ? "Awarding..." : "Award Contract"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
