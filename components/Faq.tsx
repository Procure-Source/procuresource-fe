"use client";

import { useState } from "react";

import { FadeIn, FadeInItem, FadeInStagger } from "@/components/common/FadeIn";
import SectionHeading from "@/components/common/SectionHeading";
import { faqItems } from "@/lib/content";

/*
  Each trigger is a real <button>, so Enter/Space come free. Items open and
  close independently, so the open set is a Set rather than a single id.

  Panels animate open on grid-template-rows 0fr → 1fr, the one way to
  transition to an unknown content height. `invisible` rides along in the same
  transition so a closed panel leaves the accessibility tree — a zero-height
  panel is still readable by a screen reader without it — while staying visible
  for the length of the collapse.
*/
export default function Faq() {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };

  return (
    <section className="py-section" id="faq" aria-labelledby="faq-heading">
      <div className="mx-auto w-full max-w-page px-gutter">
        <FadeIn>
          <SectionHeading id="faq-heading">
            Frequently asked questions
          </SectionHeading>
        </FadeIn>

        <FadeInStagger className="mt-faq-top max-w-faq overflow-hidden rounded-panel border border-rule bg-surface shadow-card">
            {faqItems.map((item) => {
              const isOpen = openIds.has(item.id);
              const triggerId = `${item.id}-trigger`;
              const panelId = `${item.id}-panel`;

              return (
                <FadeInItem
                  className="border-b border-rule last:border-b-0"
                  key={item.id}
                >
                  {/* The h3 inherits size and weight from the trigger, which is
                      why it carries no type classes of its own. */}
                  <h3>
                    <button
                      type="button"
                      className="group flex w-full cursor-pointer items-baseline justify-between gap-4 px-5 py-5 text-left text-h3 font-medium leading-trigger transition-colors duration-200 ease-standard hover:bg-tint hover:text-accent xs:gap-6 xs:py-5.5"
                      id={triggerId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(item.id)}
                    >
                      <span>{item.question}</span>
                      <span
                        className="flex-none text-faq-marker leading-none text-accent transition-[scale] duration-200 ease-standard group-hover:scale-110"
                        aria-hidden="true"
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    className={`grid transition-[grid-template-rows,visibility] duration-300 ease-standard ${
                      isOpen
                        ? "visible grid-rows-[1fr]"
                        : "invisible grid-rows-[0fr]"
                    }`}
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-measure px-5 pb-6 text-small text-ink-muted">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </FadeInItem>
              );
            })}
        </FadeInStagger>
      </div>
    </section>
  );
}
