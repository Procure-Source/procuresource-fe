import HeroFlowPreview from "@/components/HeroFlowPreview";
import { buttonClass } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="pt-hero-top pb-hero-bottom" id="top">
      <div className="mx-auto w-full max-w-page px-gutter">
        <div className="grid grid-cols-1 items-center gap-launch-gap split:grid-cols-2">
          <div>
            {/* The load-in is staggered by animation-delay, which Tailwind has
                no utility for — hence the arbitrary property. */}
            <h1 className="max-w-none animate-rise font-display text-display font-semibold leading-display tracking-display text-balance xs:max-w-[18ch]">
              Structure RFQs without losing the procurement record.
            </h1>
            <p className="mt-lead max-w-[52ch] animate-rise text-lead leading-lead text-ink-muted [animation-delay:60ms]">
              ProcureSource turns BOQs, supplier RFQs, and quotations into one
              traceable workflow for UAE MEP procurement teams.
            </p>
            <div className="mt-actions flex flex-wrap items-center gap-4 animate-rise [animation-delay:120ms] xs:gap-actions-gap">
              <a className={buttonClass("primary")} href="#request-access">
                Request early access
              </a>
              <a className={buttonClass("quiet")} href="#how-it-works">
                See how it works
              </a>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 text-micro tracking-eyebrow text-ink-muted uppercase animate-rise [animation-delay:160ms]">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Private launch · UAE MEP procurement
            </p>
          </div>

          <div className="animate-rise [animation-delay:180ms]">
            <HeroFlowPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
