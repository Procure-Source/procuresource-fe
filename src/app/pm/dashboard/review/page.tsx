import type { Metadata } from "next";
import { AlertTriangle, Clock3, Scale, ShieldCheck } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardCompletionCard, DashboardTablePanel } from "@/components/product/dashboard-page-kit";

export const metadata: Metadata = {
  title: "Purchaser Quote Review",
  description: "Review supplier quotes, exceptions, compliance, and lead time before award.",
};

const metrics = [
  { icon: Scale, label: "Quotes to compare", value: "0", detail: "No quotes yet" },
  { icon: AlertTriangle, label: "Price outliers", value: "0", detail: "No outliers yet" },
  { icon: ShieldCheck, label: "Proof missing", value: "0", detail: "No proof needed" },
  { icon: Clock3, label: "Fastest lead time", value: "-", detail: "No replies yet" },
];

const rows: string[][] = [];

const exceptionRows: string[][] = [];

export default function PurchaserReviewPage() {
  return (
    <DashboardShell
      role="purchaser"
      currentHref="/pm/dashboard/review"
      eyebrow="Quote review"
      title="Compare supplier replies before the award decision."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <DashboardTablePanel
          eyebrow="Supplier comparison"
          title="Supplier replies"
          headers={["Supplier", "Total", "Lead time", "Compliance", "Next step"]}
          rows={rows}
          emptyText="No supplier replies to compare yet."
        />
        <DashboardTablePanel
          eyebrow="Open questions"
          title="Exceptions to close"
          headers={["Item", "Issue", "Action"]}
          rows={exceptionRows}
          emptyText="No exceptions open yet."
        />
      </section>

      <section className="mt-4">
        <DashboardCompletionCard
          title="Ready for award"
          items={["Price checked", "Lead time checked", "Documents requested", "Exceptions visible"]}
        />
      </section>
    </DashboardShell>
  );
}
