import type { Metadata } from "next";

import { DashboardShell } from "@/components/product/dashboard-shell";
import { SupplierFeed } from "@/components/product/supplier-feed";

export const metadata: Metadata = {
  title: "Supplier RFQ Alerts",
  description: "View new RFQ alerts and open quote links from the supplier dashboard.",
};

export default function SupplierAlertsPage() {
  return (
    <DashboardShell
      role="supplier"
      currentHref="/supplier/dashboard/alerts"
      eyebrow="Supplier inbox"
      title="New RFQs arrive here."
    >
      <section>
        <SupplierFeed />
      </section>
    </DashboardShell>
  );
}
