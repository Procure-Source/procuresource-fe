"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { FadeIn } from "@/components/common/FadeIn";
import SectionHeading from "@/components/common/SectionHeading";

const stages = [
  {
    id: "structure",
    number: "01",
    label: "Structure",
    title: "Turn the BOQ into a structured RFQ.",
    body: "ProcureSource keeps the original requirement visible while line items become a clean RFQ package your team can review.",
  },
  {
    id: "invite",
    number: "02",
    label: "Invite",
    title: "Send the same requirement to the right suppliers.",
    body: "Supplier invitations stay connected to the same RFQ, so every response maps back to the original line items.",
  },
  {
    id: "collect",
    number: "03",
    label: "Collect",
    title: "Bring quotations into one workflow.",
    body: "Supplier responses arrive against the same procurement object instead of becoming disconnected files and message threads.",
  },
  {
    id: "compare",
    number: "04",
    label: "Compare",
    title: "Normalize the commercial picture.",
    body: "The same line items become a buyer-side comparison record for price, lead time, and response coverage.",
  },
] as const;

type StageId = (typeof stages)[number]["id"];

const lineItems = [
  {
    item: "AHU 20,000 CFM",
    qty: "4 units",
    quotes: ["42,000", "40,500", "44,200"],
  },
  {
    item: "Cable Tray 300mm",
    qty: "120 m",
    quotes: ["18,400", "17,900", "19,200"],
  },
  {
    item: "Copper Pipe 50mm",
    qty: "240 m",
    quotes: ["23,100", "22,800", "24,100"],
  },
  {
    item: "Isolation Valve",
    qty: "32 pcs",
    quotes: ["5,800", "5,650", "6,100"],
  },
] as const;

const suppliers = [
  { id: "A", total: "184,200", leadTime: "12 days", coverage: "98%" },
  { id: "B", total: "176,850", leadTime: "15 days", coverage: "94%" },
  { id: "C", total: "191,400", leadTime: "10 days", coverage: "100%" },
] as const;

const stageIndex = (stage: StageId) =>
  stages.findIndex((candidate) => candidate.id === stage);

function StatusPill({ children }: { children: string }) {
  return (
    <span className="rounded-btn bg-accent/10 px-2.5 py-1 text-micro tabular-nums text-accent">
      {children}
    </span>
  );
}

function RequirementRows({ condensed = false }: { condensed?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-small">
      {lineItems.map((line) => (
        <div className="contents" key={line.item}>
          <span className="truncate text-ink">{line.item}</span>
          <span className="text-right tabular-nums text-ink-muted">
            {condensed ? line.qty.split(" ")[0] : line.qty}
          </span>
        </div>
      ))}
    </div>
  );
}

function SupplierNodes({ active }: { active: boolean }) {
  return (
    <div className="relative mt-5 grid grid-cols-3 gap-3">
      <svg
        className="absolute inset-x-8 top-5 h-7 text-rule"
        viewBox="0 0 260 28"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M10 16 C76 2, 184 2, 250 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray={active ? "0" : "7 7"}
        />
      </svg>
      {suppliers.map((supplier) => (
        <div
          className="relative rounded-inner border border-rule bg-paper p-3 text-center"
          key={supplier.id}
        >
          <span className="mx-auto grid size-8 place-items-center rounded-full bg-accent text-micro font-medium text-paper">
            {supplier.id}
          </span>
          <p className="mt-2 text-micro tracking-eyebrow text-ink-muted uppercase">
            Supplier
          </p>
        </div>
      ))}
    </div>
  );
}

function QuotesTable({ compare = false }: { compare?: boolean }) {
  return (
    <div className="overflow-hidden rounded-inner border border-rule bg-paper">
      <div className="grid grid-cols-[minmax(8rem,1fr)_repeat(3,minmax(3.4rem,0.44fr))] border-b border-rule bg-sunken px-3 py-2 text-micro tracking-eyebrow text-ink-muted uppercase">
        <span>Line item</span>
        {suppliers.map((supplier) => (
          <span className="text-right" key={supplier.id}>
            {supplier.id}
          </span>
        ))}
      </div>
      {lineItems.map((line) => (
        <div
          className="grid grid-cols-[minmax(8rem,1fr)_repeat(3,minmax(3.4rem,0.44fr))] border-b border-rule px-3 py-2 text-small last:border-b-0"
          key={line.item}
        >
          <span className="truncate text-ink">{line.item}</span>
          {line.quotes.map((quote, index) => (
            <span
              className={`text-right tabular-nums ${
                compare && index === 1 ? "font-medium text-accent" : "text-ink-muted"
              }`}
              key={`${line.item}-${quote}`}
            >
              {quote}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function ComparisonSummary() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-3">
      {suppliers.map((supplier, index) => (
        <div
          className={`rounded-inner border p-3 ${
            index === 1
              ? "border-accent/35 bg-accent/[0.08]"
              : "border-rule bg-paper"
          }`}
          key={supplier.id}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-micro tracking-eyebrow text-ink-muted uppercase">
              Supplier {supplier.id}
            </span>
            {index === 1 && (
              <span className="text-micro text-accent">lowest</span>
            )}
          </div>
          <p className="mt-2 font-display text-form-title font-semibold leading-none tabular-nums">
            AED {supplier.total}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-micro tabular-nums text-ink-muted">
            <span>{supplier.leadTime}</span>
            <span className="text-right">{supplier.coverage}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkflowVisual({ stage }: { stage: StageId }) {
  const prefersReducedMotion = useReducedMotion();
  const index = stageIndex(stage);
  const showInvite = index >= 1;
  const showQuotes = index >= 2;
  const showCompare = index >= 3;

  return (
    <div className="overflow-hidden rounded-panel border border-rule bg-surface p-4 shadow-card xs:p-5">
      <div className="flex flex-col gap-3 border-b border-rule pb-4 xs:flex-row xs:items-start xs:justify-between">
        <div>
          <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
            {stages[index].number} · {stages[index].label}
          </p>
          <h3 className="mt-1 font-display text-form-title font-semibold leading-title tracking-heading">
            RFQ-0248
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill>{showInvite ? "3 suppliers" : "BOQ input"}</StatusPill>
          <StatusPill>{showQuotes ? "quotes received" : "draft"}</StatusPill>
        </div>
      </div>

      <motion.div
        key={stage}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.2, 0, 0, 1] }}
        className="mt-5"
      >
        {!showQuotes && (
          <div className="rounded-inner border border-rule bg-sunken p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
                {showInvite ? "Structured requirement" : "BOQ"}
              </p>
              <p className="text-micro tabular-nums text-ink-muted">
                4 line items
              </p>
            </div>
            <RequirementRows />
          </div>
        )}

        {showInvite && !showQuotes && <SupplierNodes active={showInvite} />}

        {showQuotes && (
          <>
            <QuotesTable compare={showCompare} />
            {showCompare ? (
              <ComparisonSummary />
            ) : (
              <div className="mt-4 rounded-inner border border-rule bg-sunken p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
                    Responses mapped
                  </p>
                  <p className="text-micro tabular-nums text-accent">
                    12 line quotes
                  </p>
                </div>
                <p className="mt-2 text-small text-ink-muted">
                  Supplier prices remain tied to the same BOQ items introduced
                  at the start of the RFQ.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function HowItWorks() {
  const [activeStage, setActiveStage] = useState<StageId>("structure");
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActiveStage(visible.target.id.replace("step-", "") as StageId);
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.25, 0.55, 0.8] },
    );

    for (const element of stepRefs.current) {
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="border-y border-rule bg-sunken py-section"
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto w-full max-w-page px-gutter">
        <FadeIn>
          <div className="grid grid-cols-1 gap-6 split:grid-cols-[0.82fr_1fr] split:items-end">
            <div>
              <SectionHeading id="how-it-works-heading">
                Watch one procurement workflow become comparable.
              </SectionHeading>
              <p className="mt-lead max-w-measure text-lead leading-body text-ink-muted">
                The same line items persist through the full sequence, from BOQ
                structure to supplier quotations and buyer-side comparison.
              </p>
            </div>
            
          </div>
        </FadeIn>

        <div className="mt-steps hidden split:grid split:grid-cols-[minmax(0,1fr)_minmax(22rem,0.86fr)] split:gap-launch-gap">
          <div className="sticky top-24 self-start">
            <WorkflowVisual stage={activeStage} />
          </div>

          <div>
            {stages.map((stage, index) => {
              const isActive = activeStage === stage.id;
              return (
                <article
                  className="flex min-h-[58svh] items-center border-b border-rule py-10 last:border-b-0"
                  id={`step-${stage.id}`}
                  key={stage.id}
                  ref={(element) => {
                    stepRefs.current[index] = element;
                  }}
                >
                  <div
                    className={`transition-opacity duration-300 ease-standard ${
                      isActive ? "opacity-100" : "opacity-55"
                    }`}
                  >
                    <p className="text-micro tracking-eyebrow text-accent uppercase">
                      {stage.number} · {stage.label}
                    </p>
                    <h3 className="mt-3 max-w-[22ch] font-display text-h2 font-semibold leading-heading tracking-heading text-balance">
                      {stage.title}
                    </h3>
                    <p className="mt-4 max-w-measure text-ink-muted">
                      {stage.body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-steps grid grid-cols-1 gap-8 split:hidden">
          {stages.map((stage) => (
            <FadeIn key={stage.id}>
              <article>
                <p className="text-micro tracking-eyebrow text-accent uppercase">
                  {stage.number} · {stage.label}
                </p>
                <h3 className="mt-3 font-display text-form-title font-semibold leading-title tracking-heading">
                  {stage.title}
                </h3>
                <p className="mt-3 text-small text-ink-muted">{stage.body}</p>
                <div className="mt-5">
                  <WorkflowVisual stage={stage.id} />
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
