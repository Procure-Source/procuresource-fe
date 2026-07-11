import type { Metadata } from "next";
import { AlertTriangle, BadgeCheck, FileSearch, FileText } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardActionGrid, DashboardTablePanel } from "@/components/product/dashboard-page-kit";

export const metadata: Metadata = {
  title: "Admin Documents",
  description: "Review supplier documents, expiry dates, and proof records.",
};

const metrics = [
  { icon: FileSearch, label: "Pending review", value: "0", detail: "No pending review" },
  { icon: AlertTriangle, label: "Expiry alerts", value: "0", detail: "No expiry alerts" },
  { icon: BadgeCheck, label: "Approved today", value: "0", detail: "No approvals yet" },
  { icon: FileText, label: "Needs supplier", value: "0", detail: "No missing files" },
];

const actions = [
  {
    icon: FileSearch,
    title: "Check identity",
    status: "Review",
  },
  {
    icon: AlertTriangle,
    title: "Flag mismatch",
    href: "/admin/dashboard/review",
    status: "Escalate",
  },
  {
    icon: BadgeCheck,
    title: "Approve proof",
    status: "Approve",
  },
  {
    icon: FileText,
    title: "Request update",
    status: "Request",
  },
];

const rows: string[][] = [];

export default function AdminDocumentsPage() {
  return (
    <DashboardShell
      role="admin"
      currentHref="/admin/dashboard/documents"
      eyebrow="Admin documents"
      title="Review supplier proof."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4">
        <DashboardActionGrid eyebrow="Document review" title="Check, approve, or request." items={actions} />
      </section>

      <section className="mt-4">
        <DashboardTablePanel
          eyebrow="Review table"
          title="Supplier document queue"
          headers={["Supplier", "Document", "Note", "Next step"]}
          rows={rows}
          emptyText="No supplier documents waiting for review."
        />
      </section>
    </DashboardShell>
  );
}
