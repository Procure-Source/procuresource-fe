"use client";

import Link from "next/link";
import PageLayout from "@/components/page-layout";
import { CheckCircle2, FileCheck2, RotateCcw, ShieldCheck } from "lucide-react";

const reviewSteps = [
  {
    title: "Review submittal package",
    body: "Validate datasheets, compliance matrices, certificates, and regional agent evidence before approval.",
    icon: FileCheck2,
  },
  {
    title: "Approve for procurement",
    body: "Mark packages that match verified product records, authority requirements, and project specifications.",
    icon: CheckCircle2,
  },
  {
    title: "Revise and resubmit",
    body: "Return incomplete packages with clear evidence gaps so contractors can correct the submission.",
    icon: RotateCcw,
  },
];

export default function ConsultantDashboardPage() {
  return (
    <PageLayout
      title="Consultant Dashboard"
      subtitle="Review submittals against verified ProcureSource evidence."
      showBackButton={false}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[8px] border border-[#d2d2d7] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#0066cc]/10 text-[#0066cc]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[#1d1d1f]">
                Approval Queue
              </h2>
              <p className="text-[14px] text-[#69707d]">
                Submittal decisions are tied to certificate, agent, and product verification evidence.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {reviewSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-[8px] border border-[#e5e7eb] bg-[#fbfbfd] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-white text-[#0066cc]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-5 text-[#69707d]">
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="rounded-[8px] border border-[#d2d2d7] bg-[#07111f] p-6 text-white">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7ab8ff]">
            Master Flow Status
          </p>
          <h2 className="mt-3 text-[24px] font-semibold">
            Decisions must preserve the verification trail.
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-[#c7d5e8]">
            Use the certification lookup and submittal tools to compare package claims against current ProcureSource evidence before approval.
          </p>
          <div className="mt-6 grid gap-3">
            <Link
              href="/certifications/verify"
              className="flex min-h-[44px] items-center justify-center rounded-full bg-white px-5 text-[14px] font-semibold text-[#07111f] transition-colors hover:bg-[#eaf3ff]"
            >
              Check Certification Evidence
            </Link>
            <Link
              href="/submittals"
              className="flex min-h-[44px] items-center justify-center rounded-full border border-white/30 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Generate Submittal Package
            </Link>
          </div>
        </aside>
      </div>
    </PageLayout>
  );
}
