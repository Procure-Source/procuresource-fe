import type { Metadata } from "next";
import Link from "next/link";
import PageLayout from "@/components/page-layout";
import { marketPages } from "@/lib/footer-pages";
import {
  buildSeoLocationPageUrl,
  seoEquipmentCategories,
} from "@/lib/seo-location-pages";

const baseUrl = "https://procuresource.co";

export const metadata: Metadata = {
  title: "GCC MEP Procurement Directory",
  description:
    "Explore verified GCC MEP procurement pages by market and equipment category, including chillers, AHUs, fire pumps, switchgear, generators, valves, BMS, and heat exchangers.",
  alternates: {
    canonical: "/mep-procurement",
  },
  openGraph: {
    title: "GCC MEP Procurement Directory",
    description:
      "Verified MEP procurement pages for GCC markets and equipment categories, built around certification, agent, RFQ, and submittal evidence.",
    url: `${baseUrl}/mep-procurement`,
    type: "website",
  },
};

export default function MepProcurementDirectoryPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/mep-procurement#webpage`,
        url: `${baseUrl}/mep-procurement`,
        name: "GCC MEP Procurement Directory",
        description:
          "A structured directory of market and equipment pages for verified GCC MEP procurement workflows.",
        isPartOf: { "@id": `${baseUrl}/#website` },
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/mep-procurement#markets`,
        name: "GCC MEP procurement market pages",
        numberOfItems: marketPages.length * seoEquipmentCategories.length,
        itemListElement: marketPages.flatMap((market, marketIndex) =>
          seoEquipmentCategories.map((category, index) => ({
            "@type": "ListItem",
            position: marketIndex * seoEquipmentCategories.length + index + 1,
            name: `${category.name} procurement in ${market.primaryHub}`,
            url: `${baseUrl}${buildSeoLocationPageUrl(market.slug, category.slug)}`,
          }))
        ),
      },
    ],
  };

  return (
    <PageLayout
      title="GCC MEP Procurement Directory"
      subtitle="Market and equipment pages for buyers who need certification evidence, local agent clarity, RFQ fields, and consultant-ready submittal support."
      showCTA
      ctaText="Check certification evidence"
      ctaHref="/certifications/verify"
      showBackButton={false}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mb-10 rounded-[22px] border border-[#d2d2d7] bg-white p-6">
        <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Built For Search With Actual Procurement Utility</h2>
        <p className="mt-3 text-[14px] leading-7 text-[#69707d]">
          Each page focuses on a real buying moment: a specific GCC market, a specific MEP equipment category, the evidence a consultant expects, and the RFQ fields that should be locked before suppliers quote.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            "Certification and manufacturer evidence",
            "Regional agent and delivery context",
            "Spec, RFQ, and submittal readiness",
          ].map((item) => (
            <div key={item} className="rounded-[16px] bg-[#f5f5f7] p-4 text-[13px] font-semibold text-[#1d1d1f]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Browse By GCC Market</h2>
            <p className="mt-2 text-[14px] leading-6 text-[#69707d]">
              Start with the city or country context your project team is buying for.
            </p>
          </div>
          <Link href="/gcc-mep-procurement" className="text-[14px] font-semibold text-[#0066cc] hover:underline">
            View GCC procurement overview
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {marketPages.map((market) => (
            <article key={market.slug} className="rounded-[18px] border border-[#e8e8ed] bg-white p-5">
              <h3 className="text-[18px] font-semibold text-[#1d1d1f]">{market.primaryHub}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#69707d]">{market.subtitle}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {seoEquipmentCategories.slice(0, 4).map((category) => (
                  <Link
                    key={category.slug}
                    href={buildSeoLocationPageUrl(market.slug, category.slug)}
                    className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-[12px] font-semibold text-[#0066cc] hover:bg-white"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[24px] font-semibold text-[#1d1d1f]">All Market And Category Pages</h2>
        <p className="mt-2 text-[14px] leading-6 text-[#69707d]">
          These pages are deliberately narrow so procurement teams can land directly on the market and equipment problem they are researching.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {marketPages.map((market) => (
            <article key={market.slug} className="rounded-[18px] border border-[#e8e8ed] bg-white p-5">
              <h3 className="mb-3 text-[18px] font-semibold text-[#1d1d1f]">{market.primaryHub}</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {seoEquipmentCategories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={buildSeoLocationPageUrl(market.slug, category.slug)}
                      className="text-[13px] leading-5 text-[#0066cc] hover:underline"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
