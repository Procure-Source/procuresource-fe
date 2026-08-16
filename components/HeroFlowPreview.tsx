"use client";

import { motion, useReducedMotion } from "framer-motion";

const previewSteps = [
  { label: "BOQ", detail: "4 line items" },
  { label: "RFQ-0248", detail: "3 suppliers" },
  { label: "Quotes", detail: "line-by-line" },
  { label: "Compare", detail: "AED totals" },
] as const;

export default function HeroFlowPreview() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="relative overflow-hidden rounded-panel border border-rule bg-surface p-5 shadow-card"
      role="img"
      aria-label="A BOQ becomes a structured RFQ, supplier quotations, and a comparison record."
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--color-rule)_1px,transparent_1px),linear-gradient(90deg,var(--color-rule)_1px,transparent_1px)] [background-size:44px_44px]"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4 border-b border-rule pb-4">
          <div>
            <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
              Procurement record
            </p>
            <p className="mt-1 font-display text-form-title font-semibold leading-title tracking-heading">
              BOQ to comparison
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 xs:grid-cols-2">
          {previewSteps.map((step, index) => (
            <motion.div
              className="rounded-inner border border-rule bg-paper/90 p-4"
              key={step.label}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.2, 0, 0, 1],
                delay: index * 0.09,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-h3 font-medium">
                  {step.label}
                </span>
                <span className="text-micro tabular-nums text-ink-muted">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-2 text-small text-ink-muted">{step.detail}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 rounded-inner border border-rule bg-sunken p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-small">
            {[
              ["AHU 20,000 CFM", "4 units"],
              ["Cable Tray 300mm", "120 m"],
              ["Copper Pipe 50mm", "240 m"],
            ].map(([item, qty]) => (
              <div className="contents" key={item}>
                <span className="truncate text-ink">{item}</span>
                <span className="text-right tabular-nums text-ink-muted">
                  {qty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
