"use client";

import PageLayout from "@/components/page-layout";
import {
  Box,
  Briefcase,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  Languages,
  Leaf,
  Mail,
  MessageCircle,
  Recycle,
  Scale,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import {
  buildDisputeDocumentationOffer,
  buildManufacturerSignals,
  buildSecondOpinionFraming,
  buildWeeklyDigest,
  getVerifierCredits,
  riskTransferClauses,
  secondaryEquipmentChecks,
  talentReferralSignals,
} from "@/lib/ecosystem-signals";
import { buildVerificationTicker } from "@/lib/trust-primitives";

const certifications = [
  {
    name: "AHRI Certification",
    code: "AHRI 550/590",
    authority: "Air-Conditioning, Heating, and Refrigeration Institute",
    description: "Performance certification for water-chilling and heat pump equipment.",
    region: "North America / Global",
    mandatory: true,
  },
  {
    name: "Eurovent Certification",
    code: "Eurovent",
    authority: "Eurovent Certita Certification",
    description: "European certification for HVAC-R products ensuring energy efficiency and performance.",
    region: "Europe / Middle East",
    mandatory: true,
  },
  {
    name: "UL Listing",
    code: "UL 1995",
    authority: "Underwriters Laboratories",
    description: "Safety certification for heating and cooling equipment.",
    region: "North America",
    mandatory: false,
  },
  {
    name: "CE Marking",
    code: "CE",
    authority: "European Commission",
    description: "Indicates conformity with health, safety, and environmental standards for products sold in the EEA.",
    region: "Europe",
    mandatory: true,
  },
  {
    name: "ESMA Certification",
    code: "ECAS",
    authority: "Emirates Authority for Standardization & Metrology",
    description: "UAE conformity assessment scheme for regulated products.",
    region: "UAE",
    mandatory: true,
  },
  {
    name: "SASO Certification",
    code: "SASO",
    authority: "Saudi Standards, Metrology and Quality Organization",
    description: "Product certification required for import into Saudi Arabia.",
    region: "Saudi Arabia",
    mandatory: true,
  },
  {
    name: "FM Approval",
    code: "FM",
    authority: "FM Global",
    description: "Product testing and certification for property loss prevention.",
    region: "Global",
    mandatory: false,
  },
  {
    name: "ASHRAE Compliance",
    code: "ASHRAE 90.1",
    authority: "American Society of Heating, Refrigerating and Air-Conditioning Engineers",
    description: "Energy standard for buildings (except low-rise residential).",
    region: "Global",
    mandatory: false,
  },
];

const digest = buildWeeklyDigest();
const verifierCredits = getVerifierCredits();
const manufacturerSignals = buildManufacturerSignals();
const secondOpinion = buildSecondOpinionFraming();
const disputeOffer = buildDisputeDocumentationOffer();
const verificationTicker = buildVerificationTicker();

const gccWorkflowCards = [
  {
    title: "WhatsApp-native workflow",
    summary: "Introduction requests, expert questions, spares checks, and snapshots can move through WhatsApp links and API-ready payloads.",
    icon: MessageCircle,
    href: "/api/whatsapp/workflow?certificate=AHRI-550590-CARRIER-19XR&action=snapshot",
  },
  {
    title: "Arabic-first documents",
    summary: "The print snapshot gives English and Arabic evidence side by side for site, government, and local contractor review.",
    icon: Languages,
    href: "/api/certifications/snapshot?certificate=AHRI-550590-CARRIER-19XR",
  },
  {
    title: "Verified BIM library",
    summary: "BIM/Revit object records are tied back to certificate freshness instead of floating as marketing downloads.",
    icon: Box,
    href: "/api/bim/library",
  },
  {
    title: "Spare parts sourcing",
    summary: "Post-install sourcing points back to authorized parts suppliers for the exact verified model record.",
    icon: Wrench,
    href: "/api/spare-parts/lookup?q=Carrier%2019XR",
  },
  {
    title: "Ask an expert slot",
    summary: "A real weekly expert session builds trust and turns early support questions into a searchable knowledge archive.",
    icon: Users,
    href: "/api/expert-sessions/next",
  },
  {
    title: "Trade credit referrals",
    summary: "Finance-ready evidence packets help contractors and suppliers route large orders through existing trade-credit partners.",
    icon: CreditCard,
    href: "/api/trade-credit/options",
  },
  {
    title: "Sustainability / ESG layer",
    summary: "LEED, Estidama, refrigerant, and efficiency notes reuse the compliance record for green-building reporting.",
    icon: Leaf,
    href: "/api/sustainability/score?q=Carrier%2019XR",
  },
];

export default function CertificationsPage() {
  return (
    <PageLayout
      title="Industry Certifications"
      subtitle="Understanding HVAC compliance standards across the GCC region"
    >
      <div className="mb-10 bg-[#f0f9ff] rounded-[20px] p-6 border border-[#bfdbfe]">
        <h2 className="text-[19px] font-semibold text-[#1d1d1f] mb-3">Free Public Certification Lookup</h2>
        <p className="text-[15px] text-[#424245] leading-relaxed">
          No login, no static badge, no hidden uncertainty. Paste a manufacturer, model, or certificate number and see whether ProcureSource has a verified, stale, mismatch, or not-found record with dated evidence.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0066cc]">
          {verificationTicker.label}; {verificationTicker.mismatchCorrections} correction note(s) visible.
        </p>
        <Link
          href="/certifications/verify"
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0066cc] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#0077ed]"
        >
          Open certification lookup
        </Link>
      </div>

      <section className="mb-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">What Changed This Week</h2>
            <p className="mt-1 max-w-2xl text-[14px] leading-6 text-[#69707d]">
              A digest turns one-time lookup behavior into a habit: stale records, mismatch alerts, agent response changes, and lead-time reality checks.
            </p>
          </div>
          <a
            href="/api/certifications/digest"
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-[#d2d2d7] px-4 text-[13px] font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            <Mail className="h-4 w-4" />
            JSON digest
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {digest.items.slice(0, 3).map((item) => (
            <article key={item.id} className="rounded-[16px] border border-[#e8e8ed] bg-white p-5">
              <span className="mb-3 inline-flex rounded-full bg-[#f5f5f7] px-3 py-1 text-[11px] font-bold uppercase text-[#0066cc]">
                {item.type.replace("_", " ")}
              </span>
              <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-5 text-[#69707d]">{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[20px] border border-[#e8e8ed] bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-[22px] font-semibold text-[#1d1d1f]">
            <UserCheck className="h-5 w-5 text-[#0066cc]" />
            Career Credit For Verifiers
          </h2>
          <p className="mb-5 text-[14px] leading-6 text-[#69707d]">
            Verification work becomes public domain credibility, not invisible back-office labor.
          </p>
          <div className="space-y-3">
            {verifierCredits.map((credit) => (
              <div key={`${credit.name}-${credit.organization}`} className="rounded-[14px] bg-[#f5f5f7] p-4">
                <p className="text-[15px] font-semibold text-[#1d1d1f]">{credit.name}</p>
                <p className="text-[12px] text-[#69707d]">{credit.role} at {credit.organization}</p>
                <p className="mt-2 text-[12px] leading-5 text-[#424245]">
                  {credit.verifiedCount} verified, {credit.mismatchCount} mismatch, {credit.staleCount} stale record(s).
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-[#e8e8ed] bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-[22px] font-semibold text-[#1d1d1f]">
            <FileText className="h-5 w-5 text-[#0066cc]" />
            Risk Transfer Language
          </h2>
          <p className="mb-5 text-[14px] leading-6 text-[#69707d]">
            Useful boilerplate is a distribution channel when consultants copy it into specs.
          </p>
          <div className="space-y-3">
            {riskTransferClauses.slice(0, 2).map((clause) => (
              <div key={clause.title} className="rounded-[14px] border border-[#e8e8ed] bg-[#fbfbfd] p-4">
                <p className="mb-2 text-[13px] font-bold uppercase text-[#0066cc]">{clause.title}</p>
                <p className="text-[13px] leading-6 text-[#1d1d1f]">{clause.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-12 grid gap-5 lg:grid-cols-3">
        <div className="rounded-[20px] border border-[#e8e8ed] bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-[18px] font-semibold text-[#1d1d1f]">
            <Scale className="h-5 w-5 text-[#0066cc]" />
            {secondOpinion.title}
          </h2>
          <p className="text-[13px] leading-6 text-[#69707d]">{secondOpinion.summary}</p>
          <Link href="/spec-matcher" className="mt-4 inline-flex text-[13px] font-semibold text-[#0066cc] hover:underline">
            Open spec matcher
          </Link>
        </div>
        <div className="rounded-[20px] border border-[#e8e8ed] bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-[18px] font-semibold text-[#1d1d1f]">
            <TrendingUp className="h-5 w-5 text-[#0066cc]" />
            Manufacturer Market Signal
          </h2>
          <p className="text-[13px] leading-6 text-[#69707d]">
            {manufacturerSignals[0]?.manufacturer || "Manufacturers"}: {manufacturerSignals[0]?.shortlistedCount || 0} shortlist(s), {manufacturerSignals[0]?.selectedCount || 0} selection(s), {manufacturerSignals[0]?.substitutionRequests || 0} substitution request(s).
          </p>
          <a href="/api/manufacturers/market-intelligence" className="mt-4 inline-flex text-[13px] font-semibold text-[#0066cc] hover:underline">
            View anonymized API
          </a>
        </div>
        <div className="rounded-[20px] border border-[#e8e8ed] bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-[18px] font-semibold text-[#1d1d1f]">
            <Scale className="h-5 w-5 text-[#0066cc]" />
            {disputeOffer.title}
          </h2>
          <p className="text-[13px] leading-6 text-[#69707d]">{disputeOffer.summary}</p>
          <p className="mt-4 text-[12px] font-semibold text-[#424245]">
            Packet: {disputeOffer.packetIncludes.slice(0, 3).join(", ")}.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-5">
          <h2 className="text-[24px] font-semibold text-[#1d1d1f]">GCC-Native Workflow Layer</h2>
          <p className="mt-1 max-w-2xl text-[14px] leading-6 text-[#69707d]">
            These are adoption levers that ride on the same verified record: WhatsApp, Arabic documentation, BIM, spares, expert support, finance referrals, and ESG.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gccWorkflowCards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.title}
                href={card.href}
                className="rounded-[18px] border border-[#e8e8ed] bg-white p-5 transition-colors hover:border-[#0066cc]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#0066cc]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{card.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#69707d]">{card.summary}</p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mb-12 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[20px] border border-[#e8e8ed] bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-[22px] font-semibold text-[#1d1d1f]">
            <Recycle className="h-5 w-5 text-[#0066cc]" />
            Secondary Equipment Trust Layer
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-[13px] leading-6 text-[#69707d]">
            {secondaryEquipmentChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[20px] border border-[#e8e8ed] bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-[22px] font-semibold text-[#1d1d1f]">
            <Briefcase className="h-5 w-5 text-[#0066cc]" />
            Talent And Referral Bridge
          </h2>
          <div className="space-y-3">
            {talentReferralSignals.map((signal) => (
              <div key={signal.title} className="rounded-[14px] bg-[#f5f5f7] p-4">
                <p className="text-[13px] font-semibold text-[#1d1d1f]">{signal.title}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#69707d]">{signal.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        {certifications.map((cert) => (
          <div
            key={cert.code}
            className="bg-white rounded-[18px] p-6 border border-[#e8e8ed] hover:border-[#0066cc] transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-[#0066cc] to-[#5ac8fa] flex items-center justify-center flex-shrink-0">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-[19px] font-semibold text-[#1d1d1f]">{cert.name}</h3>
                  <span className="text-[12px] font-mono bg-[#f5f5f7] text-[#424245] px-2 py-1 rounded">
                    {cert.code}
                  </span>
                  {cert.mandatory && (
                    <span className="text-[11px] bg-[#ff453a] text-white px-2 py-0.5 rounded-full">
                      Required in GCC
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-[#86868b] mb-2">{cert.authority}</p>
                <p className="text-[15px] text-[#424245] mb-3">{cert.description}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1 text-[13px] text-[#86868b]">
                    <Check className="w-4 h-4 text-[#30d158]" />
                    Region: {cert.region}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-[#1d1d1f] rounded-[24px] p-8 text-center text-white">
        <h2 className="text-[28px] font-bold mb-3">Need Help with Certification?</h2>
        <p className="text-[17px] text-white/80 mb-6 max-w-lg mx-auto">
          Our team can help you navigate certification requirements for your specific products and markets.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/contact"
            className="inline-flex h-[48px] items-center justify-center rounded-full bg-white px-8 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
          >
            Contact Our Experts
          </Link>
          <Link
            href="/products"
            className="inline-flex h-[48px] items-center justify-center rounded-full border border-white/30 px-8 text-[15px] font-medium text-white hover:bg-white/10 transition-colors gap-2"
          >
            Browse Certified Products <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
