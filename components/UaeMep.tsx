import { FadeIn } from "@/components/common/FadeIn";
import SectionHeading from "@/components/common/SectionHeading";

const procurementRealities = [
  {
    label: "Specification-sensitive materials",
    detail: "approved make · substitutions · compliance",
  },
  {
    label: "Multiple supplier responses",
    detail: "coverage · terms · validity",
  },
  {
    label: "Frequent revisions",
    detail: "drawings · quantities · scope updates",
  },
  {
    label: "Project deadlines",
    detail: "lead time · comparison · decision record",
  },
] as const;

export default function UaeMep() {
  return (
    <section
      className="border-y border-rule bg-sunken py-strip"
      id="uae-mep"
      aria-labelledby="uae-mep-heading"
    >
      <div className="mx-auto grid w-full max-w-page grid-cols-1 items-center gap-launch-gap px-gutter split:grid-cols-[1.05fr_0.95fr]">
        <FadeIn>
          <div className="py-2">
            <div className="border-y border-rule">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-rule py-4">
                <div>
                  <p className="text-micro tracking-eyebrow text-accent uppercase">
                    UAE MEP context
                  </p>
                  <p className="mt-2 font-display text-form-title font-semibold leading-title tracking-heading">
                    Procurement realities
                  </p>
                </div>
                
              </div>

              <div>
                {procurementRealities.map((item, index) => (
                  <div
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-4 last:border-b-0"
                    key={item.label}
                  >
                    <p className="text-micro tabular-nums text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <div>
                      <p className="font-medium leading-title text-ink">
                        {item.label}
                      </p>
                      <p className="mt-1 text-small text-ink-muted">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div>
            <SectionHeading id="uae-mep-heading">
              Built for UAE MEP procurement.
            </SectionHeading>
            <p className="mt-lead max-w-measure text-lead leading-body text-ink-muted">
              ProcureSource starts with regional procurement realities:
              specification-sensitive materials, multiple supplier responses,
              frequent revisions, and project deadlines that make clean
              comparison essential.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
