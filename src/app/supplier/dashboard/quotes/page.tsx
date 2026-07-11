import type { Metadata } from "next";
import { BadgeCheck, Clock3, FileCheck2, Send } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardActionGrid, DashboardListPanel, DashboardTablePanel } from "@/components/product/dashboard-page-kit";

export const metadata: Metadata = {
  title: "Supplier Quotes",
  description: "Manage quote drafts, submitted quotes, and buyer review status.",
};

const metrics = [
  { icon: FileCheck2, label: "Quote drafts", value: "0", detail: "No drafts yet" },
  { icon: Send, label: "Submitted", value: "0", detail: "No submissions yet" },
  { icon: Clock3, label: "Clarifications", value: "0", detail: "No clarifications" },
  { icon: BadgeCheck, label: "Under review", value: "0", detail: "No reviews yet" },
];

const actions = [
  {
    icon: FileCheck2,
    title: "Finish draft",
    status: "Draft",
  },
  {
    icon: Send,
    title: "Submit quote",
    href: "/rfqs",
    status: "Send",
  },
  {
    icon: Clock3,
    title: "Answer clarification",
    status: "Reply",
  },
  {
    icon: BadgeCheck,
    title: "Track award",
    status: "Track",
  },
];

const queue: Array<{ title: string; status: string }> = [];

const rows: string[][] = [];

export default function SupplierQuotesPage() {
  return (
    <DashboardShell
      role="supplier"
      currentHref="/supplier/dashboard/quotes"
      eyebrow="Quotes"
      title="Manage quote drafts and submitted responses."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardActionGrid eyebrow="Quote actions" title="Draft, submit, track." items={actions} />
        <DashboardListPanel eyebrow="Quote queue" title="Supplier responses" items={queue} emptyText="No quote drafts yet." />
      </section>

      <section className="mt-4">
        <DashboardTablePanel
          eyebrow="Quote status"
          title="Active supplier quotes"
          headers={["RFQ", "Quote value", "Lead time", "Status"]}
          rows={rows}
          emptyText="No active supplier quotes yet."
        />
      </section>
    </DashboardShell>
  );
}
