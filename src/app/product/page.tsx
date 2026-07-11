import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductSection, ProductShell } from "@/components/product/product-shell";
import { RfqUtility } from "@/components/product/rfq-utility";
import { ProductMethodSection } from "@/components/product/product-method-section";
import {
  ProductCtaSection,
  ProductHelpfulChecksSection,
  ProductHighlightsSection,
  ProductOutcomeMetricsSection,
} from "@/components/product/product-growth-sections";
import { buyerUseCases, supplierUseCases } from "@/lib/rfq-flow";

export const metadata: Metadata = {
  title: "RFQ Workspace",
  description: "A simple RFQ workspace for BOQ upload, supplier quote links, quote comparison, and award export.",
};

export default function ProductPage() {
  return (
    <ProductShell>
      <ProductSection className="pb-4 pt-12 sm:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold text-[#0066cc]">ProcureSource product</p>
            <h1 className="mt-4 max-w-[820px] text-[38px] font-semibold leading-tight tracking-normal text-[#352a24] sm:text-[52px]">
              A simple RFQ workspace.
            </h1>
            <p className="mt-4 max-w-[540px] text-[14px] leading-6 text-[#5d5148]">
              Upload a BOQ, share a supplier link, compare quotes, choose a supplier, and export the record.
            </p>
          </div>
          <aside className="ps-glass-blue rounded-[30px] p-5">
            <p className="text-[12px] font-semibold text-[#0066cc]">Free utility</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight text-[#352a24]">Spec finder</h2>
            <p className="mt-3 text-[13px] leading-5 text-[#5d5148]">
              Paste a specification and review likely product requirements before creating an RFQ.
            </p>
            <Link
              href="/spec-finder"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-[#0066cc] hover:bg-[#eef7ff]"
            >
              Open spec finder
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </ProductSection>

      <ProductSection className="pt-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <UseCaseBlock title="For purchasers" items={buyerUseCases} />
          <UseCaseBlock title="For suppliers" items={supplierUseCases} />
        </div>
      </ProductSection>

      <ProductMethodSection />

      <ProductHighlightsSection />

      <ProductHelpfulChecksSection />

      <ProductOutcomeMetricsSection />

      <ProductSection className="pt-4">
        <RfqUtility />
      </ProductSection>

      <ProductCtaSection />
    </ProductShell>
  );
}

function UseCaseBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="ps-glass-card rounded-[30px] p-5">
      <h2 className="text-[18px] font-semibold text-[#352a24]">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[13px] leading-5 text-[#5d5148]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0066cc]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
