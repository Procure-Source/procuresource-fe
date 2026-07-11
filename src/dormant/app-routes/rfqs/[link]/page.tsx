"use client";

import React, { useState, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  LogIn,
} from "lucide-react";

import QuoteBuilder from "@/components/supplier/quote-builder";
import { friendlyError } from "@/lib/friendly-error";

export default function RFQSubmissionPage() {
  const { link } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [rfq, setRfq] = useState<any>(null);
  const [rfqItems, setRfqItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    async function fetchData() {
      // Fetch RFQ by unique link via API (bypasses RLS)
      try {
        const res = await fetch(`/api/rfqs/by-link/${link}`, {
          credentials: "same-origin",
        });
        const data = await res.json();

        if (!res.ok || !data.rfq) {
          toast.error("RFQ not found or expired");
          router.push("/");
          return;
        }

        setRfq(data.rfq);
        if (data.items) {
          setRfqItems(data.items);
        }
      } catch {
        toast.error("Failed to load RFQ");
        router.push("/");
        return;
      }

      setIsLoading(false);
    }
    fetchData();
  }, [link, router, authLoading]);

  const handleQuoteSave = async (quoteData: any) => {
    if (!user) {
      toast.error("Please login as a supplier to submit a quote");
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }

    if (user.role !== "supplier") {
      toast.error("Only registered suppliers can submit quotes");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rfqs/${rfq.id}/submit-quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          quote_number: quoteData.quote_number,
          total_amount: quoteData.total_amount,
          currency: quoteData.currency,
          lead_time: quoteData.lead_time,
          valid_until: quoteData.valid_until,
          notes: quoteData.notes,
          items: quoteData.items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      toast.success("Professional quote submitted successfully!");
      router.push("/supplier/dashboard");
    } catch (error: any) {
      toast.error(friendlyError(error, "Submission failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading RFQ details...
      </div>
    );

  return (
    <PageLayout
      title={rfq.title}
      subtitle={`Metric System: ${rfq.metric_system}`}
      backButtonHref="/rfqs"
    >
      <div className="flex flex-col gap-12">
        {/* RFQ Header & Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#d2d2d7]/30">
              <div className="flex items-center gap-3 mb-6">
                <span className="p-2 bg-[#0066cc]/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-[#0066cc]" />
                </span>
                <h2 className="text-[21px] font-semibold text-[#1d1d1f]">
                  Project Overview
                </h2>
              </div>
              <p className="text-[17px] text-[#424245] leading-relaxed whitespace-pre-wrap">
                {rfq.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[#f5f5f7] rounded-[32px] p-8 border border-[#d2d2d7]/30">
              <p className="text-[12px] text-[#86868b] uppercase font-bold tracking-wider mb-4">
                RFQ Context
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#86868b]">Purchaser</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#1d1d1f]">
                      {rfq.profiles?.company_name}
                    </span>
                    {rfq.profiles?.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold border border-green-200">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#86868b]">
                    Required System
                  </span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-[12px] font-bold rounded-full border border-green-100">
                    {rfq.metric_system}
                  </span>
                </div>
                {rfq.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#86868b]">Deadline</span>
                    <span className="text-[14px] font-bold text-[#1d1d1f] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      {new Date(rfq.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#86868b]">Status</span>
                  <span className="px-3 py-1 bg-blue-50 text-[#0066cc] text-[12px] font-bold rounded-full border border-blue-100 uppercase">
                    {rfq.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-[24px] p-6 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
              <p className="text-[13px] text-orange-700 leading-tight">
                <strong>Metric Warning:</strong> Submissions must strictly
                follow the {rfq.metric_system} system or face immediate
                rejection.
              </p>
            </div>
          </div>
        </div>

        {/* RFQ Items Summary (read-only PM data) */}
        {rfqItems.length > 0 && (
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#d2d2d7]/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2 bg-amber-50 rounded-lg">
                <FileText className="w-5 h-5 text-amber-600" />
              </span>
              <div>
                <h2 className="text-[21px] font-semibold text-[#1d1d1f]">
                  Requested Items
                </h2>
                <p className="text-[13px] text-[#86868b]">
                  Items specified by the Purchase Manager — enter your unit price for each in the quote builder below
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#d2d2d7]/30">
                    <th className="px-4 py-3 text-[11px] font-bold text-[#86868b] uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#86868b] uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#86868b] uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-[#86868b] uppercase tracking-wider">Metric Spec</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f7]">
                  {rfqItems.map((item: any, idx: number) => (
                    <tr key={item.id} className="text-[14px]">
                      <td className="px-4 py-3 text-[#86868b] font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 text-[#1d1d1f] font-medium">{item.description}</td>
                      <td className="px-4 py-3 text-[#1d1d1f] font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-[#424245]">{item.metric_spec || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Professional Quote Builder — only for authenticated suppliers */}
        <div className="max-w-5xl mx-auto w-full">
          {user && user.role === "supplier" ? (
            <QuoteBuilder
              rfqId={rfq.id}
              metricSystem={rfq.metric_system}
              initialData={{ items: rfqItems, lead_time: rfq.lead_time, deadline: rfq.deadline, currency: rfq.currency }}
              onSave={handleQuoteSave}
            />
          ) : (
            <div className="bg-white rounded-[32px] p-12 shadow-sm border border-[#d2d2d7]/30 text-center space-y-6">
              <div className="w-16 h-16 bg-[#0066cc]/10 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-[#0066cc]" />
              </div>
              <div>
                <h3 className="text-[21px] font-bold text-[#1d1d1f]">
                  Supplier Login Required
                </h3>
                <p className="text-[15px] text-[#86868b] mt-2 max-w-md mx-auto">
                  {!user
                    ? "You need to sign in with a registered supplier account to submit a quote for this RFQ."
                    : "Only registered suppliers can submit quotes. Your account role does not have supplier access."}
                </p>
              </div>
              {!user && (
                <button
                  onClick={() =>
                    router.push("/login?redirect=" + window.location.pathname)
                  }
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#0066cc] text-white rounded-full text-[15px] font-semibold hover:bg-[#0077ed] transition-all shadow-lg shadow-[#0066cc]/20"
                >
                  <LogIn className="w-5 h-5" /> Sign In to Submit Quote
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
