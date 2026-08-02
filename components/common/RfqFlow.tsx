"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import { LogoMark } from "@/components/common/Logo";

/*
  The hero illustration: procurer → ProcureSource ← suppliers.

  ProcureSource is the hub. The buyer sends a BOQ in, and every invited
  supplier quotes back against the same package — which is why the arrows on
  the right point inward and why all three quotes are for one scope, close
  enough together to be worth comparing.

  Everything here is illustrative: numbered suppliers rather than company
  names, and example figures.

  It responds to its container, not the viewport (style skill §5.3): the same
  component sits in a half-width hero column on a wide screen and full width
  on a phone, so the three stages run in a row only when there is room.
*/

const SUPPLIERS = [
  { id: "S1", label: "Supplier 1", amount: "AED 412,000" },
  { id: "S2", label: "Supplier 2", amount: "AED 398,500" },
  { id: "S3", label: "Supplier 3", amount: "AED 425,000" },
];

const STEP_MS = 900;
/* One extra beat past the last supplier, so the finished table holds for a
   moment before the sequence restarts. */
const STEP_COUNT = SUPPLIERS.length + 2;

/* Each stage swells as the pointer nears it. The panel is the target rather
   than whatever sits inside it, so the reaction starts before a direct hit,
   and the spring gives it weight instead of a step. Transform only — a scaled
   panel never moves its neighbours. */
function Stage({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}

/* Points along the flow when the stages sit in a row, and down the flow when
   they stack. `back` is the return leg from the suppliers. */
function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 8"
      className={`h-2 w-6 flex-none self-center text-rule ${
        back ? "-rotate-90 @lg:rotate-180" : "rotate-90 @lg:rotate-0"
      }`}
      aria-hidden="true"
    >
      <path
        d="M1 4h20m-4-3 4 3-4 3"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RfqFlow() {
  const prefersReducedMotion = useReducedMotion();

  /* Starts settled — every quote in. That is what renders on the server and
     what stays on screen if the sequence never runs, so reduced motion and a
     JavaScript failure both land on the finished table rather than an empty
     one. The interval cycles away from this state, not towards it. */
  const [step, setStep] = useState(SUPPLIERS.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(
      () => setStep((current) => (current + 1) % STEP_COUNT),
      STEP_MS,
    );
    return () => clearInterval(id);
  }, []);

  const arrived = Math.min(step, SUPPLIERS.length);

  return (
    /* One label for the whole illustration: a screen reader should get the
       point, not a counter that changes every 900ms. */
    <div
      role="img"
      aria-label="You send one link through ProcureSource, and every invited supplier quotes back against the same package."
      className="@container"
    >
      <div
        aria-hidden="true"
        className="flex flex-col gap-3 rounded-panel border border-rule bg-surface p-5 shadow-card @lg:flex-row @lg:items-stretch"
      >
        <Stage className="flex flex-col items-center justify-center gap-2.5 rounded-inner border border-rule bg-sunken px-5 py-4">
          <span className="grid size-10 flex-none place-items-center rounded-full bg-accent text-paper">
            <svg viewBox="0 0 24 24" className="size-6 fill-current">
              <circle cx="12" cy="9" r="3.4" />
              <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0Z" />
            </svg>
          </span>
          <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
            Procurer
          </p>
        </Stage>

        <Arrow />

        {/* `group` so the mark can swell a little further than its panel. */}
        <Stage className="group flex flex-col items-center justify-center gap-2.5 rounded-inner border border-rule bg-sunken px-5 py-4">
          <span className="relative inline-flex">
            {/* Two rings, offset by half the cycle, so the signal is leaving
                continuously rather than in bursts. They sit outside the mark
                and cannot swallow the pointer. */}
            {!prefersReducedMotion && (
              <>
                <span className="pointer-events-none absolute -inset-1 animate-ripple rounded-[16px] border border-accent" />
                <span className="pointer-events-none absolute -inset-1 animate-ripple rounded-[16px] border border-accent [animation-delay:1.3s]" />
              </>
            )}
            <LogoMark className="size-10 transition-[scale] duration-300 ease-standard group-hover:scale-110" />
          </span>
          <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
            ProcureSource
          </p>
          <p className="inline-flex items-center gap-2 rounded-btn bg-accent/10 px-2.5 py-1 text-micro text-accent">
            <span className="size-1.5 flex-none rounded-full bg-accent" />
            One link
          </p>
        </Stage>

        <Arrow back />

        <Stage className="flex-1 rounded-inner border border-rule bg-sunken p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
              Quotes in
            </p>
            <p className="font-display text-form-title font-semibold leading-none tabular-nums text-accent">
              {arrived}
            </p>
          </div>

          <ul className="mt-3 space-y-1">
            {SUPPLIERS.map((supplier, index) => {
              const hasArrived = index < arrived;
              return (
                <li
                  key={supplier.id}
                  className={`flex items-center gap-2.5 rounded-inner px-1.5 py-1.5 transition-[opacity,translate,background-color] duration-300 ease-standard hover:bg-tint ${
                    hasArrived
                      ? "translate-y-0 opacity-100"
                      : "translate-y-1 opacity-0"
                  }`}
                >
                  <span className="grid size-7 flex-none place-items-center rounded-full bg-accent text-micro font-medium text-paper">
                    {supplier.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-small">
                    {supplier.label}
                  </span>
                  <span className="flex-none text-micro tabular-nums text-ink-muted">
                    {supplier.amount}
                  </span>
                </li>
              );
            })}
          </ul>
        </Stage>
      </div>
    </div>
  );
}
