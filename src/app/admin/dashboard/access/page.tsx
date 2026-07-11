import type { Metadata } from "next";
import { KeyRound, ShieldCheck, UserCheck, UsersRound } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardCompletionCard, DashboardTablePanel } from "@/components/product/dashboard-page-kit";

export const metadata: Metadata = {
  title: "Admin Access Control",
  description: "Review purchaser, supplier, and admin access.",
};

const metrics = [
  { icon: UsersRound, label: "Active users", value: "0", detail: "No users loaded" },
  { icon: UserCheck, label: "Verified roles", value: "0", detail: "No roles verified" },
  { icon: KeyRound, label: "Org admins", value: "0", detail: "No org admins" },
  { icon: ShieldCheck, label: "Role checks", value: "0", detail: "No checks due" },
];

const rows = [
  ["Purchaser", "Create RFQs and award", "Buyer"],
  ["Purchaser admin", "Manage buyer users", "Buyer admin"],
  ["Supplier", "View alerts and quote", "Supplier"],
  ["Supplier admin", "Manage supplier users", "Supplier admin"],
  ["Verification admin", "Review documents", "Admin"],
  ["Quote link user", "Submit invited response", "RFQ link"],
];

export default function AdminAccessPage() {
  return (
    <DashboardShell
      role="admin"
      currentHref="/admin/dashboard/access"
      eyebrow="Access control"
      title="Check role access."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <DashboardTablePanel
          eyebrow="Role map"
          title="Who can do what"
          headers={["Role", "Access", "Area"]}
          rows={rows}
        />
        <DashboardCompletionCard
          title="Role checks"
          items={["Purchaser access", "Supplier access", "Admin access", "RFQ link access"]}
        />
      </section>
    </DashboardShell>
  );
}
