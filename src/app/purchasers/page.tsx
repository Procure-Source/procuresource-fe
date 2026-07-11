import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileCheck2, Link2, Scale, UploadCloud } from "lucide-react";

import { ProductSection, ProductShell } from "@/components/product/product-shell";

export const metadata: Metadata = {
  title: "For Purchasers",
  description: "ProcureSource purchaser flow for RFQ creation, supplier quote links, quote comparison, and award export.",
};

const steps = [
  {
    icon: UploadCloud,
    title: "Raise the RFQ",
    body: "Upload BOQ and confirm the basis.",
  },
  {
    icon: Link2,
    title: "Invite suppliers",
    body: "Send one controlled quote link.",
  },
  {
    icon: Scale,
    title: "Compare cleanly",
    body: "Review price, lead time, and proof.",
  },
  {
    icon: FileCheck2,
    title: "Award with evidence",
    body: "Export the award record.",
  },
];

export default function PurchasersPage() {
  return (
    <ProductShell>
      <ProductSection className="pb-6 pt-12 sm:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-[#d8d2c8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0066cc]">
              For purchasers
            </p>
            <h1 className="mt-5 max-w-[900px] text-[42px] font-medium leading-[0.98] text-[#352a24] sm:text-[68px]">
              Raise RFQs without losing control of the details.
            </h1>
            <p className="mt-5 max-w-[540px] text-[14px] leading-6 text-[#5d5148]">BOQ upload, supplier link, comparison, award export.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/pm/dashboard"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white hover:bg-[#1677e8]"
              >
                Open purchaser dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register?role=purchase_manager"
                className="inline-flex h-11 items-center rounded-full border border-[#d8d2c8] bg-white px-5 text-[14px] font-semibold text-[#352a24] hover:bg-[#eef7ff]"
              >
                Create purchaser account
              </Link>
            </div>
          </div>

          <aside className="rounded-[30px] border border-[#ded8cf] bg-[#eef7ff] p-5">
            <p className="text-[12px] font-semibold text-[#0066cc]">Purchaser outcome</p>
            <p className="mt-5 text-[44px] font-medium leading-none text-[#352a24]">One link</p>
            <p className="mt-3 text-[13px] leading-5 text-[#5d5148]">Same line items. Same basis.</p>
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
