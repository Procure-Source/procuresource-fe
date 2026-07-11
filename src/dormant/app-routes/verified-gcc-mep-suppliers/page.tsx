import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Clock3, FileCheck2, PhoneCall, ShieldCheck, UserCheck } from "lucide-react";
import PageLayout from "@/components/page-layout";
import { buildProcureSourceFlowSnapshot } from "@/lib/procurement-flow";

const baseUrl = "https://procuresource.co";
const flow = buildProcureSourceFlowSnapshot();

export const metadata: Metadata = {
  title: "Verified GCC MEP Suppliers And Local Agents",
  description:
    "Find verified GCC MEP suppliers and local agents with document evidence, phone confirmation, backup contacts, RFQ response scoring, and manufacturer separation.",
  keywords: [
    "verified GCC MEP suppliers",
    "UAE HVAC agents",
    "Saudi HVAC suppliers",
    "MEP local agent verification",
    "GCC manufacturer agent directory",
  ],
  alternates: {
    canonical: "/verified-gcc-mep-suppliers",
  },
  openGraph: {
    title: "Verified GCC MEP Suppliers And Local Agents",
    description:
      "Supplier and agent verification for GCC procurement teams: documents, phone confirmation, backup contacts, and RFQ response scoring.",
    url: `${baseUrl}/verified-gcc-mep-suppliers`,
    type: "website",
  },
};

const checks = [
  {
    title: "Manufacturer separated from agent",
    text: "A global OEM and a regional UAE or Saudi agent are not treated as the same legal party.",
    icon: Building2,
  },
  {
    title: "Documents on file",
    text: "Trade license, VAT, authorization letter, and certificate evidence are tracked separately.",
    icon: FileCheck2,
  },
  {
    title: "Phone confirmed",
    text: "Direct call confirmation is a higher trust tier than document-only review.",
    icon: PhoneCall,
  },
  {
    title: "Backup contact required",
    text: "If a single agent contact disappears, the workflow can escalate instead of going silent.",
    icon: UserCheck,
  },
  {
    title: "Response scoring",
    text: `RFQs escalate after 48 hours and can mark an agent non-responsive after ${flow.policy.agentNonResponsiveTimeoutDays} days.`,
    icon: Clock3,
  },
  {
    title: "Verification loop",
    text: "Agent and certification evidence returns to review on expiry, dispute, delivery mismatch, or 90-day age.",
    icon: ShieldCheck,
  },
];

export default function VerifiedGccMepSuppliersPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/verified-gcc-mep-suppliers#webpage`,
        url: `${baseUrl}/verified-gcc-mep-suppliers`,
        name: "Verified GCC MEP Suppliers And Local Agents",
        description: metadata.description,
        isPartOf: { "@id": `${baseUrl}/#website` },
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/verified-gcc-mep-suppliers#checks`,
        itemListElement: checks.map((check, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: check.title,
          description: check.text,
        })),
      },
    ],
  };

  return (
    <PageLayout
      title="Verified GCC MEP Suppliers"
      subtitle="Document-backed, phone-confirmed, response-scored supplier and local agent evidence for GCC procurement teams."
      showCTA
      ctaText="Browse agents"
      ctaHref="/agents"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <article key={check.title} className="rounded-[18px] border border-[#e8e8ed] bg-white p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#0066cc]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-[16px] font-semibold text-[#1d1d1f]">{check.title}</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#69707d]">{check.text}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-[22px] border border-[#d2d2d7] bg-white p-6">
        <h2 className="text-[22px] font-semibold text-[#1d1d1f]">Supplier Verification States</h2>
        <p className="mt-3 text-[14px] leading-7 text-[#69707d]">
          A supplier can be active, in document review, resubmission required, suspended, or reactivation pending. That is intentional: verified status should be earned, reviewed, and sometimes removed when evidence fails.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/agents" className="inline-flex min-h-[42px] items-center rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white">
            View supplier directory
          </Link>
          <Link href="/status" className="inline-flex min-h-[42px] items-center rounded-full border border-[#d2d2d7] px-5 text-[14px] font-semibold text-[#1d1d1f]">
            View flow reliability
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
