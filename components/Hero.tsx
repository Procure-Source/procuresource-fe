import RfqFlow from "@/components/common/RfqFlow";
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
              One link to all your suppliers.
            </h1>
            <p className="mt-lead max-w-[52ch] animate-rise text-lead leading-lead text-ink-muted [animation-delay:60ms]">
              Convert your BOQ into a shareable link. Your suppliers submit
              line-by-line quotes directly into a single comparison table.
            </p>
            <div className="mt-actions flex flex-wrap items-center gap-4 animate-rise [animation-delay:120ms] xs:gap-actions-gap">
              <a className={buttonClass("primary")} href="#request-access">
                Request access
              </a>
            </div>
          </div>

          <div className="animate-rise [animation-delay:180ms]">
            <RfqFlow />
          </div>
        </div>
      </div>
    </section>
  );
}
