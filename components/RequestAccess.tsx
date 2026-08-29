import AccessForm from "./AccessForm";
import { FadeIn } from "@/components/common/FadeIn";
import SectionHeading from "@/components/common/SectionHeading";

export default function RequestAccess() {
  return (
    /* scroll-mt keeps the heading clear of the sticky header when the CTA
       jumps here — it tracks the header's own min-height. */
    <section
      className="pt-strip pb-section scroll-mt-[72px] split:scroll-mt-[88px]"
      id="request-access"
      aria-labelledby="launch-heading"
    >
      <div className="mx-auto w-full max-w-page px-gutter">
        <FadeIn>
          <div className="grid grid-cols-1 items-start gap-launch-gap split:grid-cols-2">
            <div>
              <SectionHeading id="launch-heading">
                Request early access
              </SectionHeading>
              <p className="mt-lead max-w-measure text-lead leading-body text-ink-muted">
                We are onboarding a limited number of UAE procurement teams to
                test the platform. Share your details and we will reach out to
                set up a walk-through with your team.
              </p>
            </div>

            <AccessForm />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
