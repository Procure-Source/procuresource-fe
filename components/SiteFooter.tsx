import Link from "next/link";

import Logo from "@/components/common/Logo";
import { siteConfig } from "@/lib/site";

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Connect",
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-sunken py-footer">
      <div className="mx-auto grid w-full max-w-page grid-cols-1 gap-10 px-gutter steps:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]">
        <div className="max-w-measure">
          <span className="font-display text-body font-semibold tracking-wordmark whitespace-nowrap xs:text-wordmark">
            <Logo />
          </span>
          <p className="mt-2 text-small text-ink-muted">
            A UAE-first MEP RFQ platform is being built for procurement teams
            who need cleaner BOQs, supplier quotes, and commercial comparisons.
          </p>
          <p className="mt-5 text-small text-ink-muted">
            Built from Dubai to the world.
          </p>
          <p className="mt-2 text-small text-ink-muted">
            {siteConfig.legalName}
          </p>
          <div className="mt-5 flex flex-col gap-2 text-small text-ink-muted xs:flex-row xs:flex-wrap xs:gap-inline-gap">
            <a
              className="no-underline underline-offset-4 hover:text-ink hover:underline"
              href={`mailto:${siteConfig.email.general}`}
            >
              {siteConfig.email.general}
            </a>
            <a
              className="no-underline underline-offset-4 hover:text-ink hover:underline"
              href={`mailto:${siteConfig.email.support}`}
            >
              {siteConfig.email.support}
            </a>
          </div>
          <p className="mt-5 text-small text-ink-muted">© 2026 ProcureSource</p>
        </div>

        <nav
          className="grid grid-cols-2 gap-8 text-small text-ink-muted xs:grid-cols-3"
          aria-label="Footer"
        >
          {footerColumns.map((column) => (
            <section key={column.title}>
              <h2 className="text-micro tracking-eyebrow text-ink uppercase">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      className="no-underline underline-offset-4 hover:text-ink hover:underline"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>
    </footer>
  );
}
