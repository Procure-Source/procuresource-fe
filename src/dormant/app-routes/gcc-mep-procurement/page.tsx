import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, FileSearch, GitBranch, Globe2, MessageCircle, ShieldCheck } from "lucide-react";
import PageLayout from "@/components/page-layout";
import { buildProcureSourceFlowSnapshot } from "@/lib/procurement-flow";
import { marketPages } from "@/lib/footer-pages";

const baseUrl = "https://procuresource.co";
const flow = buildProcureSourceFlowSnapshot();

export const metadata: Metadata = {
  title: "GCC MEP Procurement Intelligence",
  description:
    "Verified GCC MEP procurement intelligence for HVAC, chillers, manufacturers, local agents, RFQs, consultant approval, certification checks, and submittal evidence.",
  keywords: [
    "GCC MEP procurement",
    "UAE HVAC suppliers",
    "Saudi MEP procurement",
    "verified MEP manufacturers GCC",
    "AHRI chiller verification GCC",
    "MEP RFQ platform Dubai",
  ],
  alternates: {
    canonical: "/gcc-mep-procurement",
  },
  openGraph: {
    title: "GCC MEP Procurement Intelligence",
    description:
      "Find verified MEP manufacturers, local agents, certification evidence, RFQ workflows, and consultant-ready submittal records across the GCC.",
    url: `${baseUrl}/gcc-mep-procurement`,
    type: "website",
  },
};

const workflowCards = [
  {
    title: "Verified manufacturer evidence",
    text: "Separate global manufacturer claims from regional agent evidence, product versions, and certificate status.",
    icon: BadgeCheck,
  },
  {
    title: "RFQ response accountability",
    text: `Track quote, decline, 48-hour escalation, and ${flow.policy.agentNonResponsiveTimeoutDays}-day non-responsive agent scoring.`,
    icon: MessageCircle,
  },
  {
    title: "Consultant approval loop",
    text: "Shortlisted products move into consultant approve/reject decisions with revise-and-resubmit paths.",
    icon: FileSearch,
  },
  {
    title: "Living verification loop",
    text: "Certification, agent, and product evidence returns to Verification Core every 90 days or on dispute.",
    icon: GitBranch,
  },
];

export default function GccMepProcurementPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/gcc-mep-procurement#webpage`,
        url: `${baseUrl}/gcc-mep-procurement`,
        name: "GCC MEP Procurement Intelligence",
        description: metadata.description,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: [
          "GCC MEP procurement",
          "HVAC supplier verification",
          "regional agent authorization",
          "consultant submittal approval",
        ],
      },
      {
        "@type": "Service",
        "@id": `${baseUrl}/gcc-mep-procurement#service`,
        name: "GCC MEP Procurement Intelligence",
        provider: { "@id": `${baseUrl}/#organization` },
        serviceType: "MEP procurement verification, RFQ routing, supplier discovery, and certification evidence review",
        areaServed: marketPages.map((page) => ({
          "@type": "Place",
          name: page.primaryHub,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/gcc-mep-procurement#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What should GCC teams verify before awarding MEP equipment?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Teams should verify manufacturer identity, local agent authorization, product version, certification status, expiry date, lead-time evidence, consultant approval, and dispute history.",
            },
          },
          {
            "@type": "Question",
            name: "How does ProcureSource handle verification after a product is selected?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Selected products remain in a 90-day re-verification loop and can be routed back into Verification Core if a certificate expires, an agent becomes non-responsive, or delivery evidence differs from the approved record.",
            },
          },
        ],
      },
    ],
  };

  return (
    <PageLayout
      title="GCC MEP Procurement Intelligence"
      subtitle="Verified manufacturer, agent, certification, RFQ, and consultant approval evidence for GCC project teams."
      showCTA
      ctaText="Run a certification lookup"
      ctaHref="/certifications/verify"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mb-10 rounded-[22px] border border-[#d2d2d7] bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#0066cc]">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Built For The GCC Buying Motion</h2>
            <p className="mt-1 text-[14px] leading-6 text-[#69707d]">
              Procurement in Dubai, Abu Dhabi, Riyadh, Doha, Kuwait City, Muscat, and Manama depends on local agent evidence as much as manufacturer product data.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {marketPages.map((market) => (
            <Link
              key={market.slug}
              href={`/markets/${market.slug}`}
              className="rounded-[14px] border border-[#e8e8ed] bg-[#fbfbfd] p-4 transition-colors hover:border-[#0066cc]"
            >
              <p className="text-[14px] font-semibold text-[#1d1d1f]">{market.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-[#69707d]">{market.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-4 md:grid-cols-2">
        {workflowCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-[18px] border border-[#e8e8ed] bg-white p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#0066cc]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{card.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#69707d]">{card.text}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-[22px] border border-[#1d4ed8] bg-[#eff6ff] p-6">
        <h2 className="flex items-center gap-2 text-[22px] font-semibold text-[#1d1d1f]">
          <ShieldCheck className="h-5 w-5 text-[#0066cc]" />
          Verification Is The Procurement Moat
        </h2>
        <p className="mt-3 text-[14px] leading-7 text-[#1e3a8a]">
          ProcureSource does not treat public listings as static directory pages. A record can be confirmed, mismatch flagged, rejected, stale, disputed, suspended, or sent back for re-verification. That feedback loop is the difference between a searchable supplier list and a procurement trust layer.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/status" className="inline-flex min-h-[42px] items-center rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white">
            View flow reliability
          </Link>
          <Link href="/verified-gcc-mep-suppliers" className="inline-flex min-h-[42px] items-center rounded-full border border-[#bfdbfe] bg-white px-5 text-[14px] font-semibold text-[#0066cc]">
            See supplier trust model
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
