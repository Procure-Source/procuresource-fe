"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";

import { ProductSection } from "@/components/product/product-shell";
import { formatMoney, type RfqRecord, type SupplierQuote } from "@/lib/rfq-flow";
import { fetchRfqByShareLink, getSession, submitQuote } from "@/lib/rfq-client";

export function SupplierQuotePage() {
  return (
    <Suspense>
      <SupplierQuotePageContent />
    </Suspense>
  );
}

function SupplierQuotePageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const shareLink = params.get("link");
  const session = getSession();
  const supplierSession = session?.role === "supplier" || session?.role === "supplier_admin" ? session : null;
  const [rfq, setRfq] = useState<RfqRecord | null>(null);
  const [loadError, setLoadError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [supplierName, setSupplierName] = useState(supplierSession?.companyName || "");
  const [contactName, setContactName] = useState(supplierSession?.contactName || "");
  const [email, setEmail] = useState(supplierSession?.email || "");
  const [leadTimeDays, setLeadTimeDays] = useState(45);
  const [linePrices, setLinePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    setLoadError("");
    setSubmitted(false);
    fetchRfqByShareLink(shareLink)
      .then((nextRfq) => {
        if (cancelled) return;
        setRfq(nextRfq);
        setLinePrices({});
      })
      .catch((error) => {
        if (cancelled) return;
        setRfq(null);
        setLoadError(error instanceof Error ? error.message : "This RFQ link could not be loaded.");
      });

    return () => {
      cancelled = true;
    };
  }, [shareLink]);

  const total = rfq ? rfq.lineItems.reduce((sum, item) => sum + (linePrices[item.id] || 0) * item.quantity, 0) : 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!rfq || submitting) return;
    const cleanSupplierName = supplierName.trim();
    const cleanContactName = contactName.trim();
    const cleanEmail = email.trim();

    if (!cleanSupplierName || !cleanContactName || !cleanEmail) {
      setSubmitError("Add supplier company, contact, and email before submitting.");
      return;
    }

    const missingPrice = rfq.lineItems.some((item) => !linePrices[item.id] || linePrices[item.id] <= 0);
    if (missingPrice) {
      setSubmitError("Add a unit price for every line item.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    const quote: SupplierQuote = {
      id: `quote-${Date.now().toString(36)}`,
      supplierName: cleanSupplierName,
      contactName: cleanContactName,
      email: cleanEmail,
      currency: "AED",
      total,
      leadTimeDays,
      complianceScore: 89,
      notes: "Submitted through the shared RFQ link. Final proof stays subject to buyer review.",
      lineItems: rfq.lineItems.map((item) => ({
        boqItemId: item.id,
        unitPrice: linePrices[item.id] || 0,
        total: (linePrices[item.id] || 0) * item.quantity,
        compliant: true,
        remarks: "Quoted as requested.",
      })),
    };

    try {
      await submitQuote(rfq.id, quote);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Quote could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <ProductSection className="py-14">
        <div className="ps-glass-panel mx-auto max-w-[680px] rounded-[34px] p-8 text-center">
          <h1 className="text-[30px] font-semibold text-[#352a24]">RFQ link unavailable</h1>
          <p className="mt-3 text-[15px] leading-6 text-[#6c6258]">{loadError}</p>
          <button
            type="button"
            onClick={() => router.push("/supplier/dashboard/alerts")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white"
          >
            Open supplier inbox
          </button>
        </div>
      </ProductSection>
    );
  }

  if (!rfq) {
    return (
      <ProductSection className="py-14">
        <div className="ps-glass-panel mx-auto max-w-[680px] rounded-[34px] p-8">
          <p className="text-[12px] font-semibold text-[#0066cc]">Supplier quote link</p>
          <div className="mt-5 h-9 w-3/4 rounded-full bg-white/72" />
          <div className="mt-4 h-4 w-1/2 rounded-full bg-white/72" />
          <div className="mt-8 grid gap-3">
            <div className="h-12 rounded-full bg-white/72" />
            <div className="h-12 rounded-full bg-white/72" />
            <div className="h-12 rounded-full bg-white/72" />
          </div>
        </div>
      </ProductSection>
    );
  }

  if (submitted) {
    return (
      <ProductSection className="py-14">
        <div className="ps-glass-panel mx-auto max-w-[720px] rounded-[34px] border-[#23c55e]/30 bg-[#ecfdf3]/82 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#16a34a]" />
          <h1 className="mt-4 text-[32px] font-semibold text-[#352a24]">Quote submitted</h1>
          <button
            type="button"
            onClick={() => router.push("/supplier/dashboard")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white"
          >
            Return to supplier dashboard
          </button>
        </div>
      </ProductSection>
    );
  }

  return (
    <ProductSection className="py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={handleSubmit} className="ps-glass-panel rounded-[34px] p-5">
          <p className="text-[12px] font-semibold text-[#0066cc]">Supplier quote link</p>
          <h1 className="mt-2 text-[32px] font-semibold text-[#352a24]">{rfq.title}</h1>
          <span className="mt-3 inline-flex h-8 items-center rounded-full bg-[#eef7ff] px-3 text-[12px] font-semibold text-[#0066cc]">
            {rfq.metricSystem} basis
          </span>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Input label="Supplier company" value={supplierName} onChange={setSupplierName} placeholder="Company name" />
            <Input label="Contact" value={contactName} onChange={setContactName} placeholder="Contact name" />
            <Input label="Email" value={email} onChange={setEmail} placeholder="name@company.com" />
          </div>

          <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/70 bg-white/52 backdrop-blur-xl">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead className="bg-white/64 text-[#6c6258]">
                <tr>
                  <th className="px-4 py-3">Line item</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Unit price</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e4dc]">
                {rfq.lineItems.map((item) => (
                  <tr key={item.id} className="bg-white/46">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#352a24]">{item.description}</p>
                      <p className="mt-1 text-[12px] text-[#766b62]">{item.specification}</p>
                    </td>
                    <td className="px-4 py-3 text-[#5d5148]">{item.quantity}</td>
                    <td className="px-4 py-3 text-[#5d5148]">{item.unit}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={linePrices[item.id] ?? ""}
                        onChange={(event) =>
                          setLinePrices((value) => ({ ...value, [item.id]: Number(event.target.value) || 0 }))
                        }
                        placeholder="0"
                        className="h-10 w-32 rounded-full border border-[#d8d2c8] bg-[#fbfbf7] px-3 text-[#352a24] outline-none focus:border-[#2997ff]"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#352a24]">
                      {formatMoney((linePrices[item.id] || 0) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-3 text-[13px] text-[#6c6258]">
              Lead time
              <input
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={(event) => setLeadTimeDays(Number(event.target.value) || 1)}
                className="h-10 w-24 rounded-full border border-[#d8d2c8] bg-[#fbfbf7] px-3 text-[#352a24] outline-none focus:border-[#2997ff]"
              />
              days
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white hover:bg-[#1677e8]"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Submitting quote" : "Submit quote"}
            </button>
          </div>
          {submitError && (
            <p className="mt-3 rounded-full bg-white/78 px-4 py-3 text-[13px] font-semibold text-[#a34116]">
              {submitError}
            </p>
          )}
        </form>

        <aside className="ps-glass-panel rounded-[34px] p-5 lg:self-start">
          <p className="text-[12px] font-semibold text-[#0066cc]">Quote summary</p>
          <p className="mt-3 text-[34px] font-semibold text-[#352a24]">{formatMoney(total)}</p>
          <div className="mt-5 grid gap-2">
            <SummaryStat label="Lines" value={String(rfq.lineItems.length)} />
            <SummaryStat label="Lead time" value={`${leadTimeDays} days`} />
          </div>
        </aside>
      </div>
    </ProductSection>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ps-glass-card rounded-[18px] p-3">
      <p className="text-[11px] font-semibold text-[#766b62]">{label}</p>
      <p className="mt-1 text-[17px] font-semibold text-[#352a24]">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-[#766b62]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-[#d8d2c8] bg-[#fbfbf7] px-3 text-[14px] text-[#352a24] outline-none focus:border-[#2997ff]"
      />
    </label>
  );
}
