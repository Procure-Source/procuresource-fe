import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Clock3, FileCheck2, Link2, Scale, ShieldCheck, UploadCloud } from "lucide-react";

import { DashboardMetricCard, DashboardShell } from "@/components/product/dashboard-shell";

export const metadata: Metadata = {
  title: "Purchaser Dashboard",
  description: "Raise RFQs, share supplier links, compare quotes, and award from the ProcureSource purchaser dashboard.",
};

const commandMetrics = [
  { icon: UploadCloud, label: "Draft RFQs", value: "0", detail: "No drafts yet" },
  { icon: Link2, label: "Supplier replies", value: "0", detail: "No replies yet" },
  { icon: ShieldCheck, label: "Compliance risks", value: "0", detail: "No risks yet" },
  { icon: FileCheck2, label: "Award-ready", value: "0", detail: "No awards yet" },
];

const workLanes = [
  {
    icon: Link2,
    title: "Invite suppliers",
    href: "/pm/dashboard/rfqs",
    status: "Next",
  },
  {
    icon: Scale,
    title: "Compare quotes",
    href: "/pm/dashboard/review",
    status: "Compare",
  },
  {
    icon: FileCheck2,
    title: "Award package",
    href: "/pm/dashboard/awards",
    status: "Award",
  },
];

const reviewQueue: string[][] = [];

const workbenchSteps = [
  { label: "BOQ", value: "Upload", detail: "Start" },
  { label: "Units", value: "Metric", detail: "Locked" },
  { label: "Link", value: "Send", detail: "Next" },
];

const quoteRows: string[][] = [];

export default function PurchaseManagerDashboardPage() {
  return (
    <DashboardShell
      role="purchaser"
      currentHref="/pm/dashboard"
      eyebrow="Purchaser dashboard"
      title="Start with the RFQ."
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_380px]">
        <div className="ps-glass-blue rounded-[34px] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold text-[#0066cc]">Live procurement workbench</p>
              <h2 className="mt-3 max-w-[720px] text-[30px] font-medium leading-tight text-[#352a24] sm:text-[38px]">
                Upload the BOQ, then send one controlled supplier link.
              </h2>
            </div>
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white/78 px-3 text-[12px] font-semibold text-[#0066cc] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.78)]">
              <Clock3 className="h-4 w-4" />
              Response window
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {workbenchSteps.map((step) => (
              <div key={step.label} className="ps-glass-card rounded-[24px] p-4">
                <p className="text-[11px] font-semibold text-[#766b62]">{step.label}</p>
                <p className="mt-2 text-[22px] font-semibold leading-none text-[#352a24]">{step.value}</p>
                <p className="mt-2 text-[12px] leading-5 text-[#6c6258]">{step.detail}</p>
              </div>
            ))}
          </div>

          {quoteRows.length > 0 ? (
            <div className="mt-5 overflow-x-auto rounded-[26px] border border-white/70 bg-white/56 backdrop-blur-xl">
              <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
                <thead className="bg-white/64 text-[#6c6258]">
                  <tr>
                    {["Supplier", "Total", "Lead time", "Status"].map((header) => (
                      <th key={header} className="px-4 py-3 font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e4dc]">
                  {quoteRows.map((row) => (
                    <tr key={row.join("-")} className="bg-white/42">
                      {row.map((cell, index) => (
                        <td key={`${cell}-${index}`} className={`px-4 py-3 ${index === 0 ? "font-semibold text-[#352a24]" : "text-[#5d5148]"}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ps-glass-card mt-5 rounded-[26px] p-4">
              <p className="text-[13px] font-semibold text-[#352a24]">No supplier replies yet.</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/pm/dashboard/rfqs"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.2)] hover:bg-[#1677e8]"
            >
              Raise RFQ
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pm/dashboard/review"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#b9ddff] bg-white/70 px-4 text-[14px] font-semibold text-[#0066cc] hover:bg-white"
            >
              Review quotes
            </Link>
          </div>
        </div>

        <aside className="ps-glass-panel flex flex-col rounded-[34px] p-5">
          <p className="text-[12px] font-semibold text-[#0066cc]">Next action</p>
          <h2 className="mt-3 text-[30px] font-medium leading-tight text-[#352a24]">Upload BOQ</h2>
          <Link
            href="/pm/dashboard/rfqs"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.2)] hover:bg-[#1677e8]"
          >
            Start RFQ
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-auto pt-6">
            <p className="text-[11px] font-semibold text-[#766b62]">Then</p>
            <div className="mt-3 grid gap-2">
              {["Invite suppliers", "Compare quotes", "Award winner"].map((step) => (
                <div key={step} className="rounded-full bg-white/70 px-3 py-2 text-[12px] font-semibold text-[#5d5148]">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {commandMetrics.map((metric) => (
            <DashboardMetricCard key={metric.label} {...metric} />
          ))}
        </div>
        <aside className="ps-glass-panel rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef7ff]">
              <ShieldCheck className="h-5 w-5 text-[#0066cc]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#352a24]">Review queue</p>
              <p className="text-[12px] text-[#766b62]">After replies arrive</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {reviewQueue.length === 0 ? (
              <div className="ps-glass-card rounded-[20px] p-3">
                <p className="text-[13px] font-semibold text-[#352a24]">No RFQs waiting for review.</p>
              </div>
            ) : (
              reviewQueue.map(([name, suppliers, status]) => (
                <div key={name} className="ps-glass-card rounded-[20px] p-3">
                  <p className="text-[13px] font-semibold text-[#352a24]">{name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] text-[#6c6258]">{suppliers}</span>
                    <span className="rounded-full bg-[#eef7ff] px-2 py-1 text-[11px] font-semibold text-[#0066cc]">{status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="mt-4" id="review">
        <div className="ps-glass-panel rounded-[28px] p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-[#0066cc]">After the RFQ</p>
              <h2 className="mt-2 text-[26px] font-medium text-[#352a24]">Keep the buying loop simple.</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {workLanes.map((lane) => (
              <DashboardCard key={lane.title} {...lane} />
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

function DashboardCard({
  icon: Icon,
  title,
  href,
  status,
}: {
  icon: LucideIcon;
  title: string;
  href?: string;
  status: string;
}) {
  const card = (
    <article className="ps-glass-card rounded-[22px] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0066cc] text-white">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0066cc]">{status}</span>
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
