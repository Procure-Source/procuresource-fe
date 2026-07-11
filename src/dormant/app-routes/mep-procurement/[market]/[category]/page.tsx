import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ClipboardList, FileSearch, MapPin, ShieldCheck, TimerReset } from "lucide-react";
import PageLayout from "@/components/page-layout";
import {
  buildSeoLocationPageUrl,
  getSeoEquipmentCategory,
  getSeoLocationPageParams,
  getSeoMarket,
} from "@/lib/seo-location-pages";

const baseUrl = "https://procuresource.co";

type SeoLocationPageProps = {
  params: Promise<{ market: string; category: string }>;
};

export function generateStaticParams() {
  return getSeoLocationPageParams();
}

export async function generateMetadata({ params }: SeoLocationPageProps): Promise<Metadata> {
  const { market: marketSlug, category: categorySlug } = await params;
  const market = getSeoMarket(marketSlug);
  const category = getSeoEquipmentCategory(categorySlug);

  if (!market || !category) {
    return {};
  }

  const title = `${category.name} Procurement In ${market.primaryHub}`;
  const description = `Verified ${category.shortName} procurement in ${market.primaryHub}: supplier discovery, ${category.primaryStandard}, local agent evidence, RFQs, and consultant-ready submittals.`;

  return {
    title,
    description,
    keywords: [
      `${category.shortName} suppliers ${market.primaryHub}`,
      `${category.name} procurement ${market.primaryHub}`,
      `verified ${category.shortName} GCC`,
      `${category.primaryStandard} ${market.primaryHub}`,
      `MEP RFQ ${market.primaryHub}`,
    ],
    alternates: {
      canonical: buildSeoLocationPageUrl(market.slug, category.slug),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${buildSeoLocationPageUrl(market.slug, category.slug)}`,
      type: "website",
    },
  };
}

export default async function SeoLocationPage({ params }: SeoLocationPageProps) {
  const { market: marketSlug, category: categorySlug } = await params;
  const market = getSeoMarket(marketSlug);
  const category = getSeoEquipmentCategory(categorySlug);

  if (!market || !category) {
    notFound();
  }

  const canonicalPath = buildSeoLocationPageUrl(market.slug, category.slug);
  const title = `${category.name} Procurement In ${market.primaryHub}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}${canonicalPath}#webpage`,
        url: `${baseUrl}${canonicalPath}`,
        name: title,
        description: `Verified ${category.shortName} procurement for ${market.primaryHub} projects.`,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: [
          category.name,
          category.primaryStandard,
          `${market.primaryHub} MEP procurement`,
          "verified supplier evidence",
        ],
      },
      {
        "@type": "Service",
        "@id": `${baseUrl}${canonicalPath}#service`,
        name: `${category.name} procurement support in ${market.primaryHub}`,
        provider: { "@id": `${baseUrl}/#organization` },
        serviceType: "MEP equipment procurement verification and RFQ support",
        areaServed: {
          "@type": "Place",
          name: market.primaryHub,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}${canonicalPath}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `What should buyers verify before sourcing ${category.shortName} in ${market.primaryHub}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Buyers should verify ${category.verificationFocus.join(", ")}, then attach the evidence to the RFQ and consultant submittal trail.`,
            },
          },
          {
            "@type": "Question",
            name: `What should a ${category.shortName} RFQ include?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `A strong RFQ should include ${category.rfqChecklist.join(", ")} plus project location, delivery requirement, currency, and required certification evidence.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <PageLayout
      title={title}
      subtitle={`Supplier discovery, verification evidence, RFQs, and consultant-ready submittal support for ${category.shortName} in ${market.primaryHub}.`}
      showCTA
      ctaText="Start with certification lookup"
      ctaHref="/certifications/verify"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mb-10 rounded-[22px] border border-[#d2d2d7] bg-white p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#0066cc]">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">{market.primaryHub} Buying Context</h2>
            <p className="mt-2 text-[14px] leading-7 text-[#69707d]">
              {market.summary} For {category.shortName}, the practical procurement question is not only who can quote. It is whether the manufacturer claim, regional agent, technical specification, and evidence trail can survive consultant review.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[16px] bg-[#f5f5f7] p-5">
            <BadgeCheck className="mb-3 h-5 w-5 text-[#0066cc]" />
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">Primary Evidence</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#69707d]">{category.primaryStandard}</p>
          </article>
          <article className="rounded-[16px] bg-[#f5f5f7] p-5">
            <FileSearch className="mb-3 h-5 w-5 text-[#0066cc]" />
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">Buyer Intent</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#69707d]">{category.buyerIntent}</p>
          </article>
          <article className="rounded-[16px] bg-[#f5f5f7] p-5">
            <TimerReset className="mb-3 h-5 w-5 text-[#0066cc]" />
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">Living Review</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#69707d]">Refresh evidence on expiry, project selection, dispute, delivery mismatch, or 90-day age.</p>
          </article>
        </div>
      </section>

      <section className="mb-10 grid gap-5 lg:grid-cols-2">
        <article className="rounded-[22px] border border-[#e8e8ed] bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-[22px] font-semibold text-[#1d1d1f]">
            <ShieldCheck className="h-5 w-5 text-[#0066cc]" />
            Verification Checklist
          </h2>
          <ul className="space-y-3 text-[14px] leading-6 text-[#424245]">
            {category.verificationFocus.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0066cc]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[22px] border border-[#e8e8ed] bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-[22px] font-semibold text-[#1d1d1f]">
            <ClipboardList className="h-5 w-5 text-[#0066cc]" />
            RFQ Fields To Lock
          </h2>
          <ul className="space-y-3 text-[14px] leading-6 text-[#424245]">
            {category.rfqChecklist.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0066cc]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-[22px] border border-[#1d4ed8] bg-[#eff6ff] p-6">
        <h2 className="text-[22px] font-semibold text-[#1d1d1f]">Next Step For {market.primaryHub} Teams</h2>
        <p className="mt-3 text-[14px] leading-7 text-[#1e3a8a]">
          Use the public lookup to check current evidence, then move into RFQ and consultant approval only when the certification, manufacturer, agent, and technical requirement trail is clear.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/certifications/verify" className="inline-flex min-h-[42px] items-center rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white">
            Check certification evidence
          </Link>
          <Link href="/rfqs" className="inline-flex min-h-[42px] items-center rounded-full border border-[#bfdbfe] bg-white px-5 text-[14px] font-semibold text-[#0066cc]">
            View RFQ market
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
