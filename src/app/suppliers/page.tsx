import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Bell, FileText, Truck } from "lucide-react";

import { ProductSection, ProductShell } from "@/components/product/product-shell";

export const metadata: Metadata = {
  title: "For Suppliers",
  description: "ProcureSource supplier page for RFQ alerts, quote links, document readiness, and award tracking.",
};

const steps = [
  {
    icon: Bell,
    title: "Receive RFQ alerts",
    body: "Scope, deadline, quote link.",
  },
  {
    icon: FileText,
    title: "Quote exact lines",
    body: "Price the buyer's line items.",
  },
  {
    icon: BadgeCheck,
    title: "Keep proof ready",
    body: "Keep documents beside the quote.",
  },
  {
    icon: Truck,
    title: "Track award movement",
    body: "Follow review and award status.",
  },
];

export default function SuppliersPage() {
  return (
    <ProductShell>
      <ProductSection className="pb-6 pt-12 sm:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-[#d8d2c8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0066cc]">
              For suppliers
            </p>
            <h1 className="mt-5 max-w-[900px] text-[42px] font-medium leading-[0.98] text-[#352a24] sm:text-[68px]">
              Respond to serious RFQs from one clean page.
            </h1>
            <p className="mt-5 max-w-[540px] text-[14px] leading-6 text-[#5d5148]">Quote faster, show proof, stay aligned to scope.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/supplier/dashboard"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white hover:bg-[#1677e8]"
              >
                Open supplier dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register?role=supplier"
                className="inline-flex h-11 items-center rounded-full border border-[#d8d2c8] bg-white px-5 text-[14px] font-semibold text-[#352a24] hover:bg-[#eef7ff]"
              >
                Create supplier account
              </Link>
            </div>
          </div>

          <aside className="rounded-[30px] border border-[#ded8cf] bg-[#eef7ff] p-5">
            <p className="text-[12px] font-semibold text-[#0066cc]">Supplier outcome</p>
            <p className="mt-5 text-[44px] font-medium leading-none text-[#352a24]">Clean feed</p>
            <p className="mt-3 text-[13px] leading-5 text-[#5d5148]">Raised, basis, submit link.</p>
          </aside>
        </div>
      </ProductSection>

      <section className="bg-[#f7f7f1] px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <article key={step.title} className="ps-glass-card rounded-[30px] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0066cc] text-white">
                  <step.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-6 text-[21px] font-medium leading-tight text-[#352a24]">{step.title}</h2>
                <p className="mt-3 text-[13px] leading-5 text-[#667085]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </ProductShell>
  );
}
