import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowRight, BadgeCheck, FileSearch, ShieldCheck, UsersRound } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";

export const metadata: Metadata = {
  title: "Verification Dashboard",
  description: "Review supplier documents, access, and flagged records.",
};

const reviewMetrics = [
  { icon: UsersRound, label: "Pending suppliers", value: "0", detail: "No pending suppliers" },
  { icon: FileSearch, label: "Expiring proofs", value: "0", detail: "No expiring proof" },
  { icon: AlertTriangle, label: "Flagged RFQs", value: "0", detail: "No flags" },
  { icon: BadgeCheck, label: "Approved today", value: "0", detail: "No approvals yet" },
];

const documentQueue: string[][] = [];

const platformActions = [
  {
    icon: FileSearch,
    title: "Supplier documents",
    href: "/admin/dashboard/documents",
    status: "Now",
  },
  {
    icon: ShieldCheck,
    title: "Access",
    href: "/admin/dashboard/access",
    status: "Roles",
  },
  {
    icon: AlertTriangle,
    title: "Flagged records",
    href: "/admin/dashboard/review",
    status: "Review",
  },
];

const verificationDesk = [
  { label: "Documents", value: "0", detail: "Pending" },
  { label: "Access", value: "0", detail: "Due" },
  { label: "Flags", value: "0", detail: "Open" },
];

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      role="admin"
      currentHref="/admin/dashboard"
      eyebrow="Verification dashboard"
      title="Review supplier documents first."
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_380px]">
        <div className="ps-glass-blue rounded-[34px] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold text-[#0066cc]">Verification desk</p>
              <h2 className="mt-3 max-w-[760px] text-[30px] font-medium leading-tight text-[#352a24] sm:text-[38px]">
                Review supplier proof before buyers see it.
              </h2>
            </div>
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white/78 px-3 text-[12px] font-semibold text-[#0066cc] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.78)]">
              <ShieldCheck className="h-4 w-4" />
              Verified
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {verificationDesk.map((item) => (
              <div key={item.label} className="ps-glass-card rounded-[24px] p-4">
                <p className="text-[11px] font-semibold text-[#766b62]">{item.label}</p>
                <p className="mt-2 text-[22px] font-semibold leading-none text-[#352a24]">{item.value}</p>
                <p className="mt-2 text-[12px] leading-5 text-[#6c6258]">{item.detail}</p>
              </div>
            ))}
          </div>

          {documentQueue.length > 0 ? (
            <div className="mt-5 divide-y divide-[#e8e4dc] overflow-hidden rounded-[26px] border border-white/70 bg-white/56 backdrop-blur-xl">
              {documentQueue.map(([supplier, document]) => (
                <article key={`${supplier}-${document}`} className="grid gap-3 p-4 sm:grid-cols-[42px_minmax(0,1fr)_150px] sm:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0066cc] text-white">
                    <FileSearch className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#352a24]">{supplier}</h3>
                  </div>
                  <span className="rounded-full bg-white/78 px-3 py-1.5 text-center text-[11px] font-semibold text-[#0066cc]">
                    {document}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="ps-glass-card mt-5 rounded-[26px] p-4">
              <p className="text-[13px] font-semibold text-[#352a24]">No supplier documents waiting.</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/dashboard/documents"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.2)] hover:bg-[#1677e8]"
            >
              Review documents
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/dashboard/access"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#b9ddff] bg-white/70 px-4 text-[14px] font-semibold text-[#0066cc] hover:bg-white"
            >
              Check access
            </Link>
          </div>
        </div>

        <aside className="ps-glass-panel flex flex-col rounded-[34px] p-5">
          <p className="text-[12px] font-semibold text-[#0066cc]">Next action</p>
          <h2 className="mt-3 text-[30px] font-medium leading-tight text-[#352a24]">Review new supplier proof.</h2>
          <Link
            href="/admin/dashboard/documents"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.2)] hover:bg-[#1677e8]"
          >
            Review documents
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-auto pt-6">
            <p className="text-[11px] font-semibold text-[#766b62]">Then</p>
            <div className="mt-3 grid gap-2">
              {["Check access", "Escalate flags", "Mark verified"].map((step) => (
                <div key={step} className="rounded-full bg-white/70 px-3 py-2 text-[12px] font-semibold text-[#5d5148]">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reviewMetrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="ps-glass-blue mt-4 rounded-[30px] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-[#0066cc]">Admin queue</p>
            <h2 className="mt-2 text-[24px] font-medium leading-tight text-[#352a24]">Documents, access, and flags.</h2>
          </div>
          <span className="rounded-full bg-white/78 px-3 py-1.5 text-[11px] font-semibold text-[#0066cc]">
            Trust gate
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {platformActions.map((item) => (
            <TrustControl key={item.title} {...item} />
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

function TrustControl({
  icon: Icon,
  title,
  href,
  status,
}: {
  icon: LucideIcon;
  title: string;
  href?: string;
  status?: string;
}) {
  const card = (
    <article className="ps-glass-card rounded-[22px] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef7ff]">
          <Icon className="h-5 w-5 text-[#0066cc]" />
        </div>
        {status && <span className="rounded-full bg-white/78 px-2.5 py-1 text-[11px] font-semibold text-[#0066cc]">{status}</span>}
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-[#352a24]">{title}</h3>
    </article>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href} className="block rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]">
      {card}
    </Link>
  );
}
