import type { Metadata } from "next";

import { ProductShell } from "@/components/product/product-shell";
import { SupplierQuotePage } from "@/components/product/supplier-quote-page";

export const metadata: Metadata = {
  title: "Supplier RFQ Link",
  description: "Quote an RFQ through a shared ProcureSource supplier link.",
};

export default function RfqsPage() {
  return (
    <ProductShell>
      <SupplierQuotePage />
    </ProductShell>
  );
}
