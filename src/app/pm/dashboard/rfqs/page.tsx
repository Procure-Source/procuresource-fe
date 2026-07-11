import type { Metadata } from "next";

import { DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardListPanel } from "@/components/product/dashboard-page-kit";
import { PurchaserRfqLauncher } from "@/components/product/purchaser-rfq-launcher";

export const metadata: Metadata = {
  title: "Purchaser RFQs",
  description: "Create, prepare, and share purchaser RFQs in ProcureSource.",
};

const queue: Array<{ title: string; status: string }> = [];

export default function PurchaserRfqsPage() {
  return (
    <DashboardShell
      role="purchaser"
      currentHref="/pm/dashboard/rfqs"
      eyebrow="Purchaser RFQs"
      title="Raise an RFQ, then watch supplier replies."
    >
      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PurchaserRfqLauncher />
        <DashboardListPanel
          eyebrow="RFQ queue"
          title="Active buyer requests"
          items={queue}
          emptyText="No RFQs raised yet."
        />
      </section>
    </DashboardShell>
  );
}
