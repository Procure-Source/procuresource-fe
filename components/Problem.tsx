import { FadeIn } from "@/components/common/FadeIn";
import SectionHeading from "@/components/common/SectionHeading";

const fragments = [
  { label: "BOQ.xlsx", detail: "line items", className: "steps:translate-y-2" },
  { label: "Email", detail: "RFQ thread", className: "steps:-translate-y-3" },
  { label: "Supplier PDF", detail: "quotation", className: "steps:translate-y-8" },
  { label: "WhatsApp", detail: "revision", className: "steps:-translate-y-1" },
  { label: "Excel", detail: "comparison", className: "steps:translate-y-5" },
] as const;

export default function Problem() {
  return (
    <section className="py-section" aria-labelledby="problem-heading">
      <div className="mx-auto grid w-full max-w-page grid-cols-1 items-center gap-launch-gap px-gutter split:grid-cols-[0.88fr_1.12fr]">
        <FadeIn>
          <div>
            <SectionHeading id="problem-heading">
              Procurement gets fragmented before the decision gets difficult.
            </SectionHeading>
            <p className="mt-lead max-w-measure text-lead leading-body text-ink-muted">
              BOQs, supplier messages, revised quotations, and manual comparison
              sheets drift apart. ProcureSource brings the request, response,
              and commercial record back into one structured workflow.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div
            className="relative min-h-[28rem] overflow-hidden border-y border-rule px-4 py-10 xs:px-6"
            aria-hidden="true"
          >
            <div className="absolute inset-0 opacity-[0.45] [background-image:linear-gradient(var(--color-rule)_1px,transparent_1px),linear-gradient(90deg,var(--color-rule)_1px,transparent_1px)] [background-size:54px_54px]" />
            <div className="relative grid grid-cols-1 gap-4 xs:grid-cols-2 steps:grid-cols-3 steps:items-start">
              {fragments.map((fragment, index) => (
                <div
                  className={`min-w-0 rounded-inner border border-rule bg-surface/90 p-4 shadow-card ${fragment.className}`}
                  key={fragment.label}
                >
                  <p className="break-words font-display text-h3 font-medium leading-title">
                    {fragment.label}
                  </p>
                  <p className="mt-1 break-words text-micro tracking-eyebrow text-ink-muted uppercase">
                    {fragment.detail}
                  </p>
                  <div className="mt-4 h-px bg-rule" />
                  <p className="mt-3 break-words text-small leading-title tabular-nums text-ink-muted">
                    {index === 0
                      ? "AHU · 4 units"
                      : index === 1
                        ? "sent 09:42"
                        : index === 2
                          ? "AED 184,200"
                          : index === 3
                            ? "lead time?"
                            : "manual v7"}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative mt-8 rounded-inner border border-accent/25 bg-accent/[0.08] p-4 xs:p-5">
              <div className="flex flex-col gap-3 steps:flex-row steps:items-center steps:justify-between">
                <div className="min-w-0">
                  <p className="text-micro tracking-eyebrow text-accent uppercase">
                    Reconnected record
                  </p>
                  <p className="mt-1 break-words font-display text-form-title font-semibold leading-title tracking-heading">
                    RFQ-0248
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-micro leading-title tabular-nums text-ink-muted">
                  <span>4 items</span>
                  <span>3 suppliers</span>
                  <span>1 table</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
