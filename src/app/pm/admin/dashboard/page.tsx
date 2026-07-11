import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck2, KeyRound, ShieldCheck, UploadCloud, UsersRound } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";
import { DashboardActionGrid, DashboardCompletionCard, DashboardListPanel, DashboardTablePanel } from "@/components/product/dashboard-page-kit";

export const metadata: Metadata = {
  title: "Purchaser Organization Admin",
  description: "Manage purchaser users, RFQ templates, and award approvals.",
};

const metrics = [
  { icon: UsersRound, label: "Buyer users", value: "0", detail: "No users loaded" },
  { icon: UploadCloud, label: "RFQ rules", value: "0", detail: "No rules yet" },
  { icon: FileCheck2, label: "Award gates", value: "0", detail: "No gates waiting" },
  { icon: ShieldCheck, label: "Access reviews", value: "0", detail: "No reviews due" },
];

const actions = [
  {
    icon: UsersRound,
    title: "Manage buyer seats",
    status: "Users",
  },
  {
    icon: KeyRound,
    title: "Set award gates",
    status: "Approval",
  },
  {
    icon: UploadCloud,
    title: "Lock RFQ templates",
    href: "/pm/dashboard/rfqs",
    status: "RFQ",
  },
];

const accessRows = [
  ["Procurement manager", "Create RFQs", "RFQs"],
  ["Project reviewer", "Request proof", "Review"],
  ["Finance approver", "Approve awards", "Awards"],
  ["Organization admin", "Manage users", "Admin"],
];

const queue: Array<{ title: string; status: string }> = [];

export default function PurchaserOrgAdminDashboardPage() {
  return (
    <DashboardShell
      role="purchaser"
      currentHref="/pm/admin/dashboard"
      eyebrow="Purchaser organization admin"
      title="Approve buyer access."
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="ps-glass-blue rounded-[30px] p-5">
          <p className="text-[12px] font-semibold text-[#0066cc]">Next action</p>
          <h2 className="mt-3 text-[30px] font-medium leading-tight text-[#352a24]">Set buyer access rules.</h2>
          <Link
            href="/pm/dashboard/awards"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.2)] hover:bg-[#1677e8]"
          >
            Review gate
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <DashboardListPanel eyebrow="Review queue" title="Buyer admin tasks" items={queue} emptyText="No buyer admin tasks yet." />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4">
        <DashboardActionGrid eyebrow="Buyer team" title="Seats, templates, and approvals." items={actions} />
      </section>

      <section className="mt-4">
        <DashboardTablePanel
          eyebrow="Team access"
          title="Purchaser organization access"
          headers={["Role", "Access", "Area"]}
          rows={accessRows}
        />
      </section>

      <section className="mt-4">
        <DashboardCompletionCard
          title="Buyer admin access"
          items={["Buyer users", "RFQ templates", "Award gates", "Buyer only"]}
        />
      </section>
    </DashboardShell>
  );
}
