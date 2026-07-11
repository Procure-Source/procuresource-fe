import Link from "next/link";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BadgeCheck, Building2, ClipboardCheck, KeyRound, ShieldCheck, Truck } from "lucide-react";

import { ProductSection, ProductShell } from "@/components/product/product-shell";
import { crossProductStates, userFlowGroups, type UserFlowGroup } from "@/lib/user-flows";

export const metadata: Metadata = {
  title: "User Paths",
  description: "Clear ProcureSource paths for purchasers, suppliers, organization admins, and verification teams.",
};

const flowIcons: Record<UserFlowGroup["id"], LucideIcon> = {
  purchaser: Building2,
  "purchaser-admin": KeyRound,
  supplier: Truck,
  "supplier-admin": KeyRound,
  verification: ShieldCheck,
};

export default function FlowMapPage() {
  return (
    <ProductShell>
      <ProductSection className="pb-4 pt-12 sm:pt-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold text-[#0066cc]">User paths</p>
            <h1 className="mt-4 max-w-[860px] text-[40px] font-semibold leading-tight text-[#352a24] sm:text-[58px]">
              Know where to go next.
            </h1>
            <p className="mt-4 max-w-[560px] text-[14px] leading-6 text-[#5d5148]">
              Buyers raise RFQs. Suppliers respond. Admins keep access and proof clean.
            </p>
          </div>
          <aside className="ps-glass-blue rounded-[30px] p-5">
            <p className="text-[12px] font-semibold text-[#0066cc]">Main loop</p>
            <div className="mt-4 grid gap-2">
              {["Raise RFQ", "Supplier alert", "Quote reply", "Award record"].map((step) => (
                <div key={step} className="rounded-full bg-white/76 px-4 py-3 text-[13px] font-semibold text-[#352a24]">
                  {step}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </ProductSection>

      <ProductSection className="pt-4">
        <div className="grid gap-5">
          {userFlowGroups.map((group) => (
            <FlowLane key={group.id} group={group} />
          ))}
        </div>
      </ProductSection>

      <ProductSection className="pt-2">
        <section className="ps-glass-panel rounded-[34px] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <p className="text-[12px] font-semibold text-[#0066cc]">Screen support</p>
              <h2 className="mt-3 text-[28px] font-semibold leading-tight text-[#352a24]">
                No blank screens.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {crossProductStates.map((state) => (
                <article key={state.title} className="rounded-[22px] border border-white/70 bg-white/62 p-4">
                  <BadgeCheck className="h-5 w-5 text-[#0066cc]" />
                  <h3 className="mt-3 text-[15px] font-semibold text-[#352a24]">{state.title}</h3>
                  <p className="mt-1 text-[12px] leading-5 text-[#5d5148]">{state.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </ProductSection>
    </ProductShell>
  );
}

function FlowLane({ group }: { group: UserFlowGroup }) {
  const Icon = flowIcons[group.id];
  const steps = group.steps.slice(0, 5);

  return (
    <section className="overflow-hidden rounded-[34px] border border-[#e1ddd5] bg-white/80 shadow-[0_22px_70px_rgba(61,48,40,0.08)] backdrop-blur-xl">
      <div className="grid gap-5 border-b border-[#e8e4dc] bg-[#fbfbf7] p-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0066cc] text-white">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#0066cc]">{group.audience}</p>
            <h2 className="mt-2 text-[28px] font-semibold leading-tight text-[#352a24]">{group.title}</h2>
            <p className="mt-2 max-w-[560px] text-[13px] leading-5 text-[#5d5148]">{group.summary}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href={group.entryRoute} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[13px] font-semibold text-white hover:bg-[#1677e8]">
            Start
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={group.dashboardRoute} className="inline-flex h-10 items-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[13px] font-semibold text-[#352a24] hover:bg-[#eef7ff]">
            Open dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-3 p-5 lg:grid-cols-5">
        {steps.map((step, index) => (
          <article key={`${group.id}-${step.screen}`} className="relative rounded-[24px] border border-[#e8e4dc] bg-[#fbfbf7] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef7ff] text-[13px] font-semibold text-[#0066cc]">
                {index + 1}
              </span>
              <ClipboardCheck className="h-4 w-4 text-[#0066cc]" />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold leading-tight text-[#352a24]">{step.screen}</h3>
            <p className="mt-2 text-[12px] leading-5 text-[#5d5148]">{step.primaryAction}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
