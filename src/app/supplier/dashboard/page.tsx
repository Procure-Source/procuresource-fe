import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, Clock3, FileText, Send, ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/components/product/dashboard-shell";
import { SupplierFeed } from "@/components/product/supplier-feed";

export const metadata: Metadata = {
  title: "Supplier Dashboard",
  description: "Supplier RFQ inbox and quote response workspace for ProcureSource.",
};

const responseSteps = [
  { label: "Open", value: "RFQ alert" },
  { label: "Quote", value: "Line items" },
  { label: "Attach", value: "Proof" },
];

export default function SupplierDashboardPage() {
  return (
    <DashboardShell
      role="supplier"
      currentHref="/supplier/dashboard"
      eyebrow="Supplier dashboard"
      title="Respond from the RFQ inbox."
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="ps-glass-blue rounded-[34px] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold text-[#0066cc]">Supplier response desk</p>
              <h2 className="mt-3 max-w-[720px] text-[30px] font-medium leading-tight text-[#352a24] sm:text-[38px]">
                Buyer RFQs arrive as alerts.
              </h2>
            </div>
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white/78 px-3 text-[12px] font-semibold text-[#0066cc]">
              <Clock3 className="h-4 w-4" />
              Live inbox
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {responseSteps.map((step) => (
              <div key={step.label} className="ps-glass-card rounded-[24px] p-4">
                <p className="text-[11px] font-semibold text-[#766b62]">{step.label}</p>
                <p className="mt-2 text-[20px] font-semibold leading-tight text-[#352a24]">{step.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/supplier/dashboard/alerts"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.2)] hover:bg-[#1677e8]"
            >
              Open inbox
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/supplier/dashboard/readiness"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#b9ddff] bg-white/70 px-4 text-[14px] font-semibold text-[#0066cc] hover:bg-white"
            >
              Check proof
            </Link>
          </div>
        </div>

        <aside className="ps-glass-panel flex flex-col rounded-[34px] p-5">
          <p className="text-[12px] font-semibold text-[#0066cc]">Next action</p>
          <h2 className="mt-3 text-[30px] font-medium leading-tight text-[#352a24]">Check the RFQ inbox.</h2>
          <Link
            href="/supplier/dashboard/alerts"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.2)] hover:bg-[#1677e8]"
          >
            Open alerts
            <Bell className="h-4 w-4" />
          </Link>
          <div className="mt-auto grid gap-2 pt-6">
            {[
              { icon: FileText, label: "Quote exact lines" },
              { icon: ShieldCheck, label: "Attach proof" },
              { icon: Send, label: "Send response" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-full bg-white/70 px-3 py-2 text-[12px] font-semibold text-[#5d5148]">
                <Icon className="h-4 w-4 text-[#0066cc]" />
                {label}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-4">
        <SupplierFeed />
      </section>
    </DashboardShell>
  );
}
