"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Bell, CheckCircle2, Loader2, UploadCloud } from "lucide-react";

import { buildSupplierAlertFromRfq } from "@/lib/alerts";
import { upsertSupplierAlert } from "@/lib/alerts-client";
import { getSession, upsertRfq } from "@/lib/rfq-client";
import type { BoqLineItem, RfqRecord } from "@/lib/rfq-flow";

type ApiRfq = {
  id: string;
  publicId?: string;
  public_id?: string;
  title: string;
  projectName?: string | null;
  project_name?: string | null;
  metricSystem?: string;
  metric_system?: string;
  createdAt?: string;
  created_at?: string;
  deadline?: string | null;
  responseDeadlineAt?: string | null;
  shareUrl?: string;
  lineItems?: Array<Partial<BoqLineItem>>;
};

const defaultDueWindowMs = 48 * 60 * 60 * 1000;

export function PurchaserRfqLauncher() {
  const session = getSession();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [createdRfq, setCreatedRfq] = useState<ApiRfq | null>(null);
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("lot");
  const dueDate = useMemo(() => new Date(Date.now() + defaultDueWindowMs).toISOString(), []);

  async function handleRaiseRfq(event: React.FormEvent) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription) {
      setState("error");
      setMessage("Add an RFQ title and at least one line item.");
      return;
    }

    if (!session?.email || !session.companyName) {
      setState("error");
      setMessage("Sign in with your company details before raising an RFQ.");
      return;
    }

    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/rfqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ProcureSource-Actor-Role": "purchase_manager",
          "X-ProcureSource-Actor-Id": session.email,
          "X-ProcureSource-Company": session.companyName,
          "X-ProcureSource-Contact": session?.contactName || "",
          "X-ProcureSource-Actor-Email": session.email,
        },
        body: JSON.stringify({
          title: cleanTitle,
          projectName: projectName.trim(),
          purchaserCompanyName: session.companyName,
          currency: "AED",
          metricSystem: "Metric",
          deadline: dueDate,
          lineItems: [
            {
              description: cleanDescription,
              quantity: Number(quantity) > 0 ? Number(quantity) : 1,
              unit: unit.trim() || "lot",
              specification: cleanDescription,
              category: "MEP",
            },
          ],
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.data) {
        throw new Error(payload?.message || "Could not raise RFQ.");
      }

      const apiRfq = payload.data as ApiRfq;
      const localRfq = toLocalRfq(apiRfq);
      upsertRfq(localRfq);
      upsertSupplierAlert(
        buildSupplierAlertFromRfq({
          id: apiRfq.publicId || apiRfq.public_id || apiRfq.id,
          title: apiRfq.title,
          projectName: apiRfq.projectName || apiRfq.project_name || projectName,
          metricSystem: normalizeMetricSystem(apiRfq.metricSystem || apiRfq.metric_system),
          createdAt: apiRfq.createdAt || apiRfq.created_at,
          dueDate: apiRfq.deadline || apiRfq.responseDeadlineAt || dueDate,
          shareUrl: apiRfq.shareUrl || localRfq.shareUrl,
          lineItems: localRfq.lineItems,
        }),
      );

      setCreatedRfq(apiRfq);
      setState("sent");
      setMessage("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "RFQ was not sent. Try again.");
    }
  }

  const quoteHref = createdRfq?.shareUrl || "/rfqs";

  return (
    <section className="ps-glass-blue rounded-[30px] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-[#0066cc]">Raise RFQ</p>
          <h2 className="mt-2 max-w-[520px] text-[30px] font-medium leading-tight text-[#352a24]">
            Send one clean request to suppliers.
          </h2>
        </div>
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white/78 px-3 text-[12px] font-semibold text-[#0066cc]">
          <Bell className="h-4 w-4" />
          Supplier alert
        </span>
      </div>

      <form onSubmit={handleRaiseRfq} className="mt-5 grid gap-3">
        <Input label="RFQ title" value={title} onChange={setTitle} placeholder="Package or scope name" />
        <Input label="Project" value={projectName} onChange={setProjectName} placeholder="Project name" />
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold text-[#766b62]">Line item</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the item suppliers should quote"
            className="min-h-[94px] w-full resize-y rounded-[22px] border border-white/70 bg-white/72 px-4 py-3 text-[14px] text-[#352a24] outline-none focus:border-[#2997ff]"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Quantity" value={quantity} onChange={setQuantity} placeholder="1" type="number" />
          <Input label="Unit" value={unit} onChange={setUnit} placeholder="lot" />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={state === "sending"}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.2)] hover:bg-[#1677e8] disabled:cursor-wait disabled:opacity-70"
          >
            {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            Raise RFQ
          </button>
          {state === "sent" && (
            <>
              <span className="inline-flex h-10 items-center gap-2 rounded-full bg-[#ecfdf3] px-3 text-[12px] font-semibold text-[#16803b]">
                <CheckCircle2 className="h-4 w-4" />
                Supplier alert sent
              </span>
              <Link
                href={quoteHref}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d8d2c8] bg-white/70 px-3 text-[12px] font-semibold text-[#352a24] hover:bg-white"
              >
                Quote link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
          {state === "error" && message && (
            <span className="inline-flex min-h-10 items-center rounded-full bg-white/78 px-3 py-2 text-[12px] font-semibold text-[#a34116]">
              {message}
            </span>
          )}
        </div>
      </form>

      {state === "sent" && createdRfq && (
        <div className="mt-5 rounded-[24px] border border-white/70 bg-white/72 p-4">
          <p className="text-[12px] font-semibold text-[#16803b]">RFQ raised</p>
          <h3 className="mt-2 text-[18px] font-semibold leading-tight text-[#352a24]">
            {createdRfq.title}
          </h3>
          <p className="mt-2 text-[13px] leading-5 text-[#5d5148]">
            Supplier alerts are live and the quote link is ready.
          </p>
        </div>
      )}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-[#766b62]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-white/70 bg-white/72 px-4 text-[14px] text-[#352a24] outline-none focus:border-[#2997ff]"
      />
    </label>
  );
}

function toLocalRfq(apiRfq: ApiRfq): RfqRecord {
  const publicId = apiRfq.publicId || apiRfq.public_id || apiRfq.id;

  return {
    id: apiRfq.id,
    title: apiRfq.title || "New RFQ",
    projectName: apiRfq.projectName || apiRfq.project_name || "",
    metricSystem: normalizeMetricSystem(apiRfq.metricSystem || apiRfq.metric_system),
    createdAt: apiRfq.createdAt || apiRfq.created_at || new Date().toISOString(),
    status: "shared",
    lineItems: normalizeLineItems(apiRfq.lineItems),
    shareUrl: apiRfq.shareUrl || `/rfqs?link=${encodeURIComponent(publicId)}`,
    quotes: [],
  };
}

function normalizeMetricSystem(value: string | undefined): "Metric" | "Imperial" {
  return value === "Imperial" ? "Imperial" : "Metric";
}

function normalizeLineItems(items: ApiRfq["lineItems"]): BoqLineItem[] {
  if (!Array.isArray(items)) return [];

  return items.slice(0, 80).map((item, index) => ({
    id: item.id || `boq-${String(index + 1).padStart(3, "0")}`,
    description: item.description || "RFQ line item",
    quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
    unit: item.unit || "lot",
    specification: item.specification || item.description || "Quote as specified.",
    category: item.category || "MEP",
    confidence: typeof item.confidence === "number" ? item.confidence : 90,
  }));
}
