import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Truck,
} from "lucide-react";

import { ProductMethodSection } from "@/components/product/product-method-section";
import { ProductSection, ProductShell } from "@/components/product/product-shell";

const roleCards = [
  {
    title: "Purchaser",
    label: "Buy side",
    href: "/register?role=purchase_manager",
    icon: Building2,
    gradient: "from-[#eaf5ff] via-white to-[#d7eeff]",
    summary: "Raise RFQs, invite suppliers, compare replies, and keep the award record.",
    action: "Start buying",
    steps: ["Upload BOQ", "Send RFQ link", "Choose supplier"],
  },
  {
    title: "Supplier",
    label: "Supply side",
    href: "/register?role=supplier",
    icon: Truck,
    gradient: "from-white via-[#edf8ff] to-[#cceaff]",
    summary: "Receive RFQ alerts, price line items, attach proof, and track decisions.",
    action: "Start quoting",
    steps: ["Open alert", "Submit quote", "Track award"],
  },
];

export default function Home() {
  return (
    <ProductShell>
      <section className="relative overflow-hidden bg-[#fbfbf7]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.22)_0,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_24px),radial-gradient(ellipse_at_50%_100%,rgba(0,102,204,0.98)_0%,rgba(41,151,255,0.74)_32%,rgba(185,221,255,0.34)_62%,rgba(255,255,255,0)_86%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,102,204,0.025)_0,transparent_18%,rgba(0,102,204,0.018)_82%,transparent_100%)]" />
        <div
          className="pointer-events-none absolute right-8 top-24 hidden h-28 w-44 opacity-75 md:block"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(circle, #0066cc 2px, transparent 2.4px)",
            backgroundSize: "16px 16px",
          }}
        />
        <ProductSection className="relative grid min-h-[calc(100svh-88px)] place-items-center pb-24 pt-16 sm:pt-20 lg:min-h-[calc(100vh-88px)] lg:pb-28">
          <div className="mx-auto flex max-w-[1220px] flex-col items-center text-center">
            <h1 className="max-w-full text-[clamp(2.25rem,12vw,10.25rem)] font-medium leading-none tracking-normal text-[#3d3028]">
              ProcureSource
            </h1>
            <p className="mt-6 max-w-[780px] text-[20px] font-semibold leading-tight text-[#0066cc] sm:text-[24px]">
              Industrial RFQs, supplier quotes, and award records in one workspace.
            </p>

            <div className="mt-9 flex justify-center">
              <Link
                href="/access"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white shadow-[0_14px_34px_rgba(0,102,204,0.22)] hover:bg-[#1677e8]"
              >
                Get access
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </ProductSection>
      </section>

      <ProductSection className="pt-12">
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,0.88fr)_minmax(280px,0.42fr)] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold text-[#0066cc]">Choose a role</p>
            <h2 className="mt-2 max-w-[760px] text-[31px] font-semibold leading-tight text-[#352a24] sm:text-[42px]">
              Start where your team works.
            </h2>
          </div>
          <p className="max-w-[320px] text-[13px] leading-5 text-[#6c6258] lg:justify-self-end">
            Two simple paths. Purchasers raise RFQs. Suppliers respond from alerts.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {roleCards.map((card) => (
            <RoleCard key={card.title} {...card} />
          ))}
        </div>
      </ProductSection>

      <ProductMethodSection />

    </ProductShell>
  );
}

function RoleCard({
  title,
  label,
  href,
  icon: Icon,
  gradient,
  summary,
  action,
  steps,
}: {
  title: string;
  label: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  summary: string;
  action: string;
  steps: string[];
}) {
  return (
    <article className={`overflow-hidden rounded-[34px] border border-[#b9ddff] bg-gradient-to-br ${gradient} p-[1px] shadow-[0_22px_70px_rgba(0,102,204,0.12)]`}>
      <div className="ps-glass-card min-h-full rounded-[33px] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0066cc] text-white shadow-[0_14px_30px_rgba(0,102,204,0.20)]">
            <Icon className="h-6 w-6" />
          </div>
          <span className="rounded-full bg-[#e2f2ff] px-3 py-1 text-[11px] font-semibold text-[#0066cc]">
            {label}
          </span>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,0.92fr)_minmax(210px,0.62fr)] md:items-end">
          <div>
            <p className="text-[13px] font-semibold text-[#0066cc]">Are you a {title.toLowerCase()}?</p>
            <h2 className="mt-2 text-[30px] font-semibold leading-tight text-[#352a24]">{title}</h2>
            <p className="mt-3 max-w-[440px] text-[14px] leading-6 text-[#5d5148]">{summary}</p>
          </div>

          <div className="grid gap-2">
            {steps.map((step) => (
              <div key={step} className="flex items-center gap-3 rounded-full border border-white/70 bg-white/68 px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-[#0066cc]">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span className="text-[12px] font-semibold text-[#5d5148]">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={href}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.18)] hover:bg-[#1677e8]"
          >
            {action}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/flows"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8d2c8] bg-white/66 px-4 text-[14px] font-semibold text-[#352a24] hover:bg-white"
          >
            <FileText className="h-4 w-4 text-[#0066cc]" />
            See the path
          </Link>
        </div>
      </div>
    </article>
  );
}
