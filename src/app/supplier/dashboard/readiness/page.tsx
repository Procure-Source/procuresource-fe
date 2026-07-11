import type { Metadata } from "next";
import { BadgeCheck, Building2, FileText, ShieldCheck } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardActionGrid, DashboardCompletionCard, DashboardTablePanel } from "@/components/product/dashboard-page-kit";

export const metadata: Metadata = {
  title: "Supplier Documents",
  description: "Maintain supplier documents, verification readiness, and award proof.",
};

const metrics = [
  { icon: Building2, label: "Company profile", value: "-", detail: "Not reviewed" },
  { icon: FileText, label: "Documents", value: "0", detail: "No documents yet" },
  { icon: ShieldCheck, label: "Needs refresh", value: "0", detail: "No refreshes yet" },
  { icon: BadgeCheck, label: "Ready categories", value: "0", detail: "No categories yet" },
];

const actions = [
  {
    icon: Building2,
    title: "Company details",
    status: "Profile",
  },
  {
    icon: FileText,
    title: "Trade and VAT proof",
    status: "Required",
  },
  {
    icon: ShieldCheck,
    title: "Certificates",
    status: "Proof",
  },
  {
    icon: BadgeCheck,
    title: "Agency letters",
    status: "Proof",
  },
];

const rows: string[][] = [];

export default function SupplierReadinessPage() {
  return (
    <DashboardShell
      role="supplier"
      currentHref="/supplier/dashboard/readiness"
      eyebrow="Supplier documents"
      title="Keep buyer-ready documents beside every quote."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4">
        <DashboardActionGrid eyebrow="Readiness checklist" title="Documents for quotes." items={actions} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <DashboardTablePanel
          eyebrow="Document status"
          title="Supplier proof list"
          headers={["Document", "Owner", "Status", "Next step"]}
          rows={rows}
          emptyText="No supplier documents uploaded yet."
        />
        <DashboardCompletionCard
          title="Document status"
          items={["Company profile", "Trade proof", "Tax proof", "Certificates"]}
        />
      </section>
    </DashboardShell>
  );
}
