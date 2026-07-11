"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

const footerSections = [
  {
    title: "Discover",
    links: [
      { labelKey: "nav.manufacturers", href: "/manufacturers" },
      { labelKey: "nav.products", href: "/products" },
      { labelKey: "nav.agents", href: "/agents" },
      { labelKey: "nav.certifications", href: "/certifications" },
      { label: "GCC MEP Procurement", href: "/mep-procurement" },
      { label: "Project Gallery", href: "/projects" },
      { label: "Technical Specs", href: "/spec-matcher" },
    ],
  },
  {
    title: "GCC Markets",
    links: [
      { label: "UAE - Dubai & Abu Dhabi", href: "/markets/uae" },
      { label: "Saudi Arabia - Riyadh & Jeddah", href: "/markets/saudi-arabia" },
      { label: "Qatar - Doha", href: "/markets/qatar" },
      { label: "Kuwait - Kuwait City", href: "/markets/kuwait" },
      { label: "Oman - Muscat", href: "/markets/oman" },
      { label: "Bahrain - Manama", href: "/markets/bahrain" },
    ],
  },
  {
    title: "International Roots",
    links: [
      { label: "European Union Operations", href: "/global/european-union" },
      { label: "North American Partners", href: "/global/north-america" },
      { label: "Asia-Pacific Distribution", href: "/global/asia-pacific" },
      { label: "Global Logistics Network", href: "/global/logistics-network" },
      { label: "International Compliance", href: "/global/international-compliance" },
      { label: "Global Sustainability", href: "/global/sustainability" },
    ],
  },
  {
    title: "Legal & Compliance",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy & Data Protection", href: "/privacy" },
      { label: "Copyright Protection", href: "/legal" },
      { label: "Anti-Scraping Policy", href: "/legal" },
      { label: "Compliance Auditing", href: "/certifications" },
      { label: "Manufacturer Verification", href: "/manufacturers" },
    ],
  },
  {
    title: "Corporate",
    links: [
      { labelKey: "footer.about", href: "/about" },
      { labelKey: "footer.contact", href: "/contact" },
      { label: "Global Careers", href: "/careers" },
      { label: "Industry News", href: "/blog" },
      { label: "Global Advertising", href: "/advertise" },
      { label: "24/7 Support", href: "/support" },
    ],
  },
];

export default function Footer() {
  const { t, dir } = useLanguage();

  return (
    <footer className="bg-[#0a0a0b] py-12 text-[#f5f5f7]" dir={dir}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-[22px]">
        <section className="mb-12 border-b border-white/10 pb-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <div>
              <h2 className="mb-4 text-[24px] font-bold text-white">ProcureSource Global</h2>
              <p className="text-[14px] leading-7 text-[#a1a1a6]">
                The global industrial procurement intelligence platform for verified MEP equipment,
                supplier discovery, product specifications, certifications, RFQs, quotes and
                submittals across GCC and international supply chains.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-[#2997ff]" />
                Intellectual Property Notice
              </h3>
              <p className="text-[12px] leading-6 text-[#a1a1a6]">
                Copyright (c) 2026 ProcureSource. All rights reserved. The platform, technical
                database, AI-assisted matching workflows, and verified manufacturer datasets are
                protected assets. Unauthorized duplication, automated data extraction, or reverse
                engineering is prohibited.
              </p>
            </div>
          </div>
        </section>

        <nav className="grid grid-cols-2 gap-7 pb-12 sm:grid-cols-3 md:grid-cols-5 md:gap-8" aria-label="Footer navigation">
          {footerSections.map((section) => (
            <div key={section.title} className="min-w-0">
              <h3 className="mb-3 text-[12px] font-semibold leading-5 text-white">{section.title}</h3>
              <ul className="m-0 list-none space-y-2 p-0">
                {section.links.map((link) => {
                  const label = "labelKey" in link ? t(link.labelKey) : link.label;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[12px] leading-5 text-[#a1a1a6] transition-colors hover:text-white hover:underline"
                        aria-label={`Go to ${label}`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <section className="border-t border-white/10 pt-5 text-[#a1a1a6]">
          <div className="mb-3 text-[12px]">
            Need help?{" "}
            <Link href="/support" className="text-[#2997ff] hover:underline">
              Visit our Help Center
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="text-[#2997ff] hover:underline">
              {t("footer.contact")}
            </Link>
            .
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-[12px]">{t("footer.copyright")}</span>
              <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-2 p-0">
                {[
                  { label: t("footer.privacy"), href: "/privacy" },
                  { label: t("footer.terms"), href: "/terms" },
                  { label: "Legal", href: "/legal" },
                  { label: "Site Map", href: "/sitemap" },
                ].map((link) => (
                  <li key={link.href} className="text-[12px]">
                    <Link href={link.href} className="text-[#a1a1a6] hover:text-white hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6e6e73]">
              <span>GCC Region</span>
              <span>Built from Dubai to the world.</span>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}
