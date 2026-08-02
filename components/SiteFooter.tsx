import Logo from "@/components/common/Logo";

export default function SiteFooter() {
  return (
    <footer className="border-t border-rule py-footer">
      <div className="mx-auto flex w-full max-w-page flex-col flex-wrap items-start justify-between gap-8 px-gutter steps:flex-row steps:items-end">
        <div>
          <span className="font-display text-body font-semibold tracking-wordmark whitespace-nowrap xs:text-wordmark">
            <Logo />
          </span>
          <p className="mt-2 text-small text-ink-muted">
            RFQ software for UAE MEP procurement managers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-inline-gap text-small text-ink-muted">
          <a
            className="no-underline underline-offset-4 hover:text-ink hover:underline"
            href="mailto:hello@procuresource.co"
          >
            hello@procuresource.co
          </a>
          <span>© 2026 ProcureSource</span>
        </div>
      </div>
    </footer>
  );
}
