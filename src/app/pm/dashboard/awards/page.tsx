import type { Metadata } from "next";
import { Award, Download, FileCheck2, ShieldCheck } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardActionGrid, DashboardListPanel, DashboardTablePanel } from "@/components/product/dashboard-page-kit";

export const metadata: Metadata = {
  title: "Purchaser Awards",
  description: "Track award-ready RFQs and export clean procurement award summaries.",
};

const metrics = [
  { icon: Award, label: "Award-ready", value: "0", detail: "No awards yet" },
  { icon: FileCheck2, label: "Exports made", value: "0", detail: "No exports yet" },
  { icon: ShieldCheck, label: "Proof attached", value: "0", detail: "No proof yet" },
  { icon: Download, label: "Pending exports", value: "0", detail: "No exports waiting" },
];

const actions = [
  {
    icon: Award,
    title: "Choose supplier",
    status: "Decision",
  },
  {
    icon: FileCheck2,
    title: "Write award note",
    status: "Record",
  },
  {
    icon: Download,
    title: "Export summary",
    status: "Export",
  },
  {
    icon: ShieldCheck,
    title: "Keep proof attached",
    href: "/pm/dashboard/review",
    status: "Check",
  },
];

const awards: Array<{ title: string; status: string }> = [];

const rows: string[][] = [];

export default function PurchaserAwardsPage() {
  return (
    <DashboardShell
      role="purchaser"
      currentHref="/pm/dashboard/awards"
      eyebrow="Awards"
      title="Turn the chosen quote into a clean award record."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardActionGrid eyebrow="Award steps" title="Choose, note, export." items={actions} />
        <DashboardListPanel eyebrow="Award queue" title="Buyer decisions" items={awards} emptyText="No award decisions yet." />
      </section>

      <section className="mt-4">
        <DashboardTablePanel
          eyebrow="Recent awards"
          title="Selected supplier records"
          headers={["RFQ", "Supplier", "Award value", "Lead time"]}
          rows={rows}
          emptyText="No selected supplier records yet."
        />
      </section>
    </DashboardShell>
  );
}
