import type { Metadata } from "next";
import { AlertTriangle, FileSearch, ListChecks, ShieldCheck } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardActionGrid, DashboardListPanel, DashboardTablePanel } from "@/components/product/dashboard-page-kit";

export const metadata: Metadata = {
  title: "Admin Review Queue",
  description: "Review flagged suppliers, RFQs, documents, and unusual quote behavior.",
};

const metrics = [
  { icon: ListChecks, label: "Open reviews", value: "0", detail: "No open reviews" },
  { icon: AlertTriangle, label: "High priority", value: "0", detail: "No high priority" },
  { icon: FileSearch, label: "Proof checks", value: "0", detail: "No proof checks" },
  { icon: ShieldCheck, label: "Closed today", value: "0", detail: "No closures yet" },
];

const actions = [
  {
    icon: AlertTriangle,
    title: "Flag supplier claim",
    status: "Flag",
  },
  {
    icon: FileSearch,
    title: "Check evidence",
    href: "/admin/dashboard/documents",
    status: "Check",
  },
  {
    icon: ShieldCheck,
    title: "Close review",
    status: "Close",
  },
  {
    icon: ListChecks,
    title: "Save note",
    status: "Record",
  },
];

const queue: Array<{ title: string; status: string }> = [];

const rows: string[][] = [];

export default function AdminReviewPage() {
  return (
    <DashboardShell
      role="admin"
      currentHref="/admin/dashboard/review"
      eyebrow="Review queue"
      title="Resolve flagged records."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardActionGrid eyebrow="Review actions" title="Flag, check, close." items={actions} />
        <DashboardListPanel eyebrow="Priority queue" title="Needs admin attention" items={queue} emptyText="No admin reviews open." />
      </section>

      <section className="mt-4">
        <DashboardTablePanel
          eyebrow="Flagged records"
          title="Current admin review items"
          headers={["Supplier", "Record", "Issue", "Next step"]}
          rows={rows}
          emptyText="No flagged records yet."
        />
      </section>
    </DashboardShell>
  );
}
