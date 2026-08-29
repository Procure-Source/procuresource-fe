import { FadeIn } from "@/components/common/FadeIn";
import SectionHeading from "@/components/common/SectionHeading";

const values = [
  {
    label: "Structured procurement",
    title: "Start with the requirement and keep it intact.",
    body: "BOQ line items, quantities, and supplier responses stay tied to one procurement record instead of scattering across documents.",
  },
  {
    label: "Supplier workflow",
    title: "Coordinate suppliers without replacing them.",
    body: "ProcureSource supports your existing supplier network. Buyers remain in control of who participates and how responses are evaluated.",
  },
  {
    label: "Commercial comparison",
    title: "Make differences easier to see before a decision.",
    body: "Responses are organized around price, quantity, lead time, and coverage so procurement teams can compare the commercial picture more clearly.",
  },
] as const;

export default function WhyProcureSource() {
  return (
    <section
      className="py-strip"
      id="why-procuresource"
      aria-labelledby="why-procuresource-heading"
    >
      <div className="mx-auto grid w-full max-w-page grid-cols-1 gap-launch-gap px-gutter split:grid-cols-[0.95fr_1.05fr]">
        <FadeIn>
          <div className="split:sticky split:top-24">
            <SectionHeading id="why-procuresource-heading">
              Why ProcureSource
            </SectionHeading>
            <p className="mt-lead max-w-measure text-lead leading-body text-ink-muted">
              ProcureSource is designed for the operational work between a
              project requirement and a purchasing decision.
            </p>
          </div>
        </FadeIn>

        <div className="border-y border-rule">
          {values.map((value, index) => (
            <FadeIn delay={index * 0.05} key={value.label}>
              <article className="grid grid-cols-1 gap-4 border-b border-rule py-8 last:border-b-0 xs:grid-cols-[10rem_minmax(0,1fr)] xs:gap-8">
                <p className="text-micro tracking-eyebrow text-accent uppercase">
                  {value.label}
                </p>
                <div>
                  <h3 className="font-display text-form-title font-semibold leading-title tracking-heading">
                    {value.title}
                  </h3>
                  <p className="mt-3 max-w-measure text-ink-muted">
                    {value.body}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
