import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductSection, ProductShell } from "@/components/product/product-shell";
import { SpecFinder } from "@/components/product/spec-finder";

export const metadata: Metadata = {
  title: "Spec Finder",
  description: "Free ProcureSource utility for checking equipment specification requirements before raising an RFQ.",
};

export default function SpecFinderPage() {
  return (
    <ProductShell>
      <ProductSection className="pb-4 pt-12 sm:pt-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold text-[#0066cc]">Spec finder</p>
            <h1 className="mt-4 max-w-[860px] text-[40px] font-semibold leading-tight text-[#352a24] sm:text-[58px]">
              Check the spec before the RFQ.
            </h1>
            <p className="mt-4 max-w-[560px] text-[14px] leading-6 text-[#5d5148]">
              Paste a specification, see the key requirements, then turn the clean scope into an RFQ.
            </p>
          </div>
          <Link
            href="/pm/dashboard/rfqs"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.18)] hover:bg-[#1677e8]"
          >
            Raise RFQ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ProductSection>

      <ProductSection className="pt-4">
        <SpecFinder />
      </ProductSection>
    </ProductShell>
  );
}
