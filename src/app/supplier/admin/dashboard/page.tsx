import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Bell, FileText, UsersRound } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardActionGrid, DashboardCompletionCard, DashboardListPanel, DashboardTablePanel } from "@/components/product/dashboard-page-kit";

export const metadata: Metadata = {
  title: "Supplier Organization Admin",
  description: "Manage supplier users, quote approval, and document readiness.",
};

const metrics = [
  { icon: UsersRound, label: "Supplier users", value: "0", detail: "No users loaded" },
  { icon: Bell, label: "Alert routes", value: "0", detail: "No routes yet" },
  { icon: FileText, label: "Quote gates", value: "0", detail: "No gates waiting" },
  { icon: BadgeCheck, label: "Proof ready", value: "0", detail: "No proof loaded" },
];

const actions = [
  {
    icon: UsersRound,
    title: "Manage supplier seats",
    status: "Users",
  },
  {
    icon: Bell,
    title: "Route RFQ alerts",
    href: "/supplier/dashboard/alerts",
    status: "Alerts",
  },
  {
    icon: FileText,
    title: "Approve quote gates",
    href: "/supplier/dashboard/quotes",
    status: "Quote",
  },
];

const accessRows = [
  ["Estimator", "Draft pricing", "Draft"],
  ["Sales lead", "Submit approved quotes", "Quote"],
  ["Document owner", "Renew proof", "Documents"],
  ["Supplier admin", "Manage users", "Admin"],
];

const queue: Array<{ title: string; status: string }> = [];

export default function SupplierOrgAdminDashboardPage() {
  return (
    <DashboardShell
      role="supplier"
      currentHref="/supplier/admin/dashboard"
      eyebrow="Supplier organization admin"
      title="Approve supplier quotes."
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="ps-glass-blue rounded-[30px] p-5">
          <p className="text-[12px] font-semibold text-[#0066cc]">Next action</p>
          <h2 className="mt-3 text-[30px] font-medium leading-tight text-[#352a24]">Set supplier quote controls.</h2>
          <Link
            href="/supplier/dashboard/quotes"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.2)] hover:bg-[#1677e8]"
          >
            Review quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <DashboardListPanel eyebrow="Review queue" title="Supplier admin tasks" items={queue} emptyText="No supplier admin tasks yet." />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4">
        <DashboardActionGrid eyebrow="Supplier team" title="Seats, alerts, and quote gates." items={actions} />
      </section>

      <section className="mt-4">
        <DashboardTablePanel
          eyebrow="Team access"
          title="Supplier organization access"
          headers={["Role", "Access", "Area"]}
          rows={accessRows}
        />
      </section>

      <section className="mt-4">
        <DashboardCompletionCard
          title="Supplier admin access"
          items={["Supplier users", "Alert routing", "Quote gates", "Supplier only"]}
        />
      </section>
    </DashboardShell>
  );
}
