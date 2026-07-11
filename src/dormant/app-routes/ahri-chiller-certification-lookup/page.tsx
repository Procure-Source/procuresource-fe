import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, CalendarClock, FileCheck2, Search, ShieldCheck } from "lucide-react";
import PageLayout from "@/components/page-layout";
import { certificateRecords, statusLabel } from "@/lib/verification-data";

const baseUrl = "https://procuresource.co";
const ahriRecords = certificateRecords.filter((record) => record.standard.includes("AHRI"));

export const metadata: Metadata = {
  title: "AHRI Chiller Certification Lookup For GCC Projects",
  description:
    "Lookup AHRI chiller certification claims for GCC projects with verification dates, source trails, mismatch flags, expiry checks, and local agent status.",
  keywords: [
    "AHRI chiller certification lookup",
    "AHRI 550/590 chiller GCC",
    "verify AHRI certificate number",
    "chiller compliance UAE",
    "district cooling chiller procurement",
  ],
  alternates: {
    canonical: "/ahri-chiller-certification-lookup",
  },
  openGraph: {
    title: "AHRI Chiller Certification Lookup For GCC Projects",
    description:
      "Check AHRI chiller evidence, mismatch flags, expiry dates, and regional agent authorization before RFQ or consultant submittal.",
    url: `${baseUrl}/ahri-chiller-certification-lookup`,
    type: "website",
  },
};

export default function AhriChillerCertificationLookupPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/ahri-chiller-certification-lookup#webpage`,
        url: `${baseUrl}/ahri-chiller-certification-lookup`,
        name: "AHRI Chiller Certification Lookup For GCC Projects",
        description: metadata.description,
        isPartOf: { "@id": `${baseUrl}/#website` },
      },
      {
        "@type": "Dataset",
        "@id": `${baseUrl}/ahri-chiller-certification-lookup#dataset`,
        name: "ProcureSource AHRI verification evidence examples",
        description:
          "Public sample of AHRI chiller records with certification status, verification date, expiry date, mismatch state, and agent authorization status.",
        creator: { "@id": `${baseUrl}/#organization` },
        variableMeasured: ["certificateNumber", "standard", "status", "verifiedOn", "expiresOn", "agentAuthorization"],
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/ahri-chiller-certification-lookup#records`,
        itemListElement: ahriRecords.map((record, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${record.manufacturer} ${record.model} ${record.certificateNumber}`,
          url: `${baseUrl}/certifications/verify`,
        })),
      },
    ],
  };

  return (
    <PageLayout
      title="AHRI Chiller Certification Lookup"
      subtitle="Check AHRI 550/590 chiller claims with dated evidence, mismatch flags, expiry dates, and GCC agent status."
      showCTA
      ctaText="Open live lookup"
      ctaHref="/certifications/verify"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mb-10 rounded-[22px] border border-[#d2d2d7] bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#0066cc]">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">What The Lookup Shows</h2>
            <p className="mt-1 text-[14px] leading-6 text-[#69707d]">
              A static “certified” badge is not enough for chiller procurement. ProcureSource shows the certificate claim, source trail, expiry, human verifier, and local agent evidence side by side.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Confirmed", text: "Certificate and supporting evidence agree.", icon: BadgeCheck },
            { title: "Mismatch flagged", text: "Claim conflicts with directory or source evidence.", icon: AlertTriangle },
            { title: "Re-check required", text: "Evidence is stale, expiring, or selected for project review.", icon: CalendarClock },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[16px] bg-[#f5f5f7] p-5">
                <Icon className="mb-3 h-5 w-5 text-[#0066cc]" />
                <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#69707d]">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-[22px] font-semibold text-[#1d1d1f]">
          <FileCheck2 className="h-5 w-5 text-[#0066cc]" />
          Public AHRI Evidence Examples
        </h2>
        <div className="grid gap-4">
          {ahriRecords.map((record) => (
            <article key={record.id} className="rounded-[18px] border border-[#e8e8ed] bg-white p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{record.manufacturer} {record.model}</h3>
                  <p className="mt-1 text-[13px] text-[#69707d]">{record.certificateNumber} · {record.standard}</p>
                </div>
                <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[12px] font-bold text-[#0066cc]">
                  {statusLabel(record.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-[12px] leading-5 text-[#424245] sm:grid-cols-3">
                <p><strong>Verified:</strong> {record.verifiedOn || "Pending"}</p>
                <p><strong>Expires:</strong> {record.expiresOn || "Not recorded"}</p>
                <p><strong>Agent:</strong> {statusLabel(record.agentAuthorization.authorizationStatus)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[22px] border border-[#1d4ed8] bg-[#eff6ff] p-6">
        <h2 className="flex items-center gap-2 text-[22px] font-semibold text-[#1d1d1f]">
          <ShieldCheck className="h-5 w-5 text-[#0066cc]" />
          Use It Before RFQ, Submittal, Or Award
        </h2>
        <p className="mt-3 text-[14px] leading-7 text-[#1e3a8a]">
          The useful moment is before a consultant rejects a submittal, before a contractor awards a substituted chiller, and before a local agent claim goes stale. Start with the public lookup, then generate a compliance snapshot or RFQ workflow when the evidence matters.
        </p>
        <Link href="/certifications/verify" className="mt-5 inline-flex min-h-[42px] items-center rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white">
          Check a certificate
        </Link>
      </section>
    </PageLayout>
  );
}
