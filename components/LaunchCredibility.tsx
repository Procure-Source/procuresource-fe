import type { ReactNode } from "react";

import { FadeIn } from "@/components/common/FadeIn";
import SectionHeading from "@/components/common/SectionHeading";
import { buttonClass } from "@/components/ui/button";

export default function LaunchCredibility({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="py-section" aria-labelledby="private-launch-heading">
      <div className="mx-auto w-full max-w-page px-gutter">
        <div className="border-y border-rule">
          {children}

          <FadeIn>
            <div className="grid grid-cols-1 items-center gap-8 border-t border-rule py-strip split:grid-cols-[1fr_auto]">
              <div>
                <SectionHeading id="private-launch-heading">
                  Private launch for selected procurement teams.
                </SectionHeading>
                <p className="mt-lead max-w-measure text-lead leading-body text-ink-muted">
                  ProcureSource is currently being introduced to a limited
                  number of UAE procurement teams. The goal is focused product
                  feedback from real RFQ workflows, not a generic signup list.
                </p>
              </div>
              <div className="split:justify-self-end">
                <a className={buttonClass("primary")} href="#request-access">
                  Request early access
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
