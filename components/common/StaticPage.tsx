import type { StaticPageContent } from "@/lib/content";

export default function StaticPage({ page }: { page: StaticPageContent }) {
  return (
    <article>
      <section className="border-b border-rule bg-sunken py-section">
        <div className="mx-auto w-full max-w-page px-gutter">
          <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
            {page.eyebrow}
          </p>
          <h1 className="mt-5 max-w-[16ch] font-display text-display font-semibold leading-display tracking-display text-balance">
            {page.title}
          </h1>
          <p className="mt-lead max-w-measure text-lead leading-lead text-ink-muted">
            {page.intro}
          </p>
          <p className="mt-actions text-micro tracking-eyebrow text-accent uppercase">
            {page.location}
          </p>
        </div>
      </section>

      <section
        className="py-section"
        aria-label={`${page.eyebrow} notes`}
      >
        <div className="mx-auto w-full max-w-page px-gutter">
          <div className="grid grid-cols-1 gap-6">
            {page.rows.map((row) => (
              <section
                className="rounded-panel border border-rule bg-surface p-6 shadow-card"
                key={`${page.href}-${row.label}-${row.title}`}
              >
                <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
                  {row.label}
                </p>
                <h2 className="mt-4 max-w-[30ch] font-display text-h2 font-semibold leading-heading tracking-heading text-balance">
                  {row.title}
                </h2>
                <p className="mt-4 max-w-measure text-small text-ink-muted">
                  {row.body}
                </p>
              </section>
            ))}
          </div>

          <p className="mt-8 max-w-measure text-small text-ink-muted">
            {page.closing}
          </p>
        </div>
      </section>
    </article>
  );
}
