import { FadeIn, FadeInItem, FadeInStagger } from "@/components/common/FadeIn";
import SectionHeading from "@/components/common/SectionHeading";
import { steps } from "@/lib/content";

export default function HowItWorks() {
  return (
    /* The one banded section: a step down from paper, hairlined top and
       bottom, so the page reads as three surfaces rather than one. */
    <section
      className="border-y border-rule bg-sunken py-section"
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto w-full max-w-page px-gutter">
        <FadeIn>
          <SectionHeading id="how-it-works-heading">
            Three simple steps
          </SectionHeading>
        </FadeIn>

        <FadeInStagger
          as="ol"
          className="mt-steps grid grid-cols-1 gap-6 steps:grid-cols-3 steps:gap-steps-gap"
        >
          {steps.map((step) => (
            <FadeInItem
              as="li"
              className="rounded-panel border border-rule bg-surface p-6 shadow-card transition-[box-shadow,translate] duration-200 ease-standard hover:-translate-y-1 hover:shadow-card-hover"
              key={step.number}
            >
              <span
                className="block font-display text-form-title leading-none tabular-nums text-accent"
                aria-hidden="true"
              >
                {step.number}
              </span>
              <h3 className="mt-4 text-h3 font-medium">{step.label}</h3>
              <p className="mt-2 max-w-measure text-small text-ink-muted steps:max-w-[38ch]">
                {step.line}
              </p>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}
