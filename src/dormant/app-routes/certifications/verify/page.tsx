"use client";

import { useState } from "react";
import PageLayout from "@/components/page-layout";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Box,
  CircleDollarSign,
  ClipboardCopy,
  Contact,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Languages,
  Leaf,
  Loader2,
  MessageCircle,
  Printer,
  Search,
  Shield,
  Timer,
  Truck,
  MapPin,
  PhoneCall,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { statusLabel, type CertificateRecord } from "@/lib/verification-data";
import { buildArabicSummary } from "@/lib/gcc-workflows";
import type {
  ConfidenceFingerprintItem,
  CurrencyDisplay,
  EvidenceBadge,
  InProgressVerification,
  ViewSnapshot,
} from "@/lib/trust-primitives";

const expertSession = {
  nextSessionOn: "2026-07-14",
  topic: "Chiller substitutions, AHRI evidence, UAE agent authorization, and lead-time risk",
};

const tradeCreditPartner = {
  name: "Trade finance referral",
  summary: "Attach verified supplier, certificate, and lead-time evidence to a finance-ready referral packet.",
};

type LookupResult = {
  found: boolean;
  query: string;
  normalizedQuery?: string;
  standardNotes?: string[];
  checkedOn: string;
  message?: string;
  certificate?: CertificateRecord;
  inProgress?: InProgressVerification[];
  snapshot?: {
    title: string;
    generatedOn: string;
    summary: string[];
  };
  trust?: {
    evidenceBadges: EvidenceBadge[];
    fingerprint: ConfidenceFingerprintItem[];
    sourceCrossReferences: CertificateRecord["verificationEvidence"]["sources"];
    lastHumanChecked: string;
    specLine: string;
    expiryCountdown: string;
    currencyDisplay: CurrencyDisplay;
    unitDisplay: string;
    noAgentNote: string | null;
    contactCardUrl: string;
    lastUpdatedFooter: string;
    viewedSnapshot: ViewSnapshot;
  };
};

function statusStyles(status?: CertificateRecord["status"]) {
  switch (status) {
    case "verified":
      return "border-[#86efac] bg-[#f0fdf4] text-[#166534]";
    case "mismatch":
      return "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]";
    case "stale":
      return "border-[#fde68a] bg-[#fffbeb] text-[#92400e]";
    default:
      return "border-[#dbeafe] bg-[#eff6ff] text-[#1d4ed8]";
  }
}

function latestTrailDate(record: CertificateRecord) {
  return record.trail
    .map((item) => item.date)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function responseTimeLabel(hours: number) {
  if (!hours) return "No response data yet";
  if (hours <= 8) return "Same-day responder";
  if (hours <= 24) return "Next-day responder";
  if (hours <= 72) return "Slow responder";
  return "At-risk responder";
}

function reviewState(record: CertificateRecord) {
  if (!record.nextReviewOn) return "No re-check scheduled";

  const today = new Date();
  const nextReview = new Date(`${record.nextReviewOn}T00:00:00`);
  const days = Math.ceil((nextReview.getTime() - today.getTime()) / 86400000);

  if (days < 0) return `${Math.abs(days)} day(s) overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days} day(s)`;
}

function leadTimeReality(record: CertificateRecord) {
  if (record.leadTime.sampleSize <= 0) {
    return "Not enough observed delivery data yet";
  }

  const delta = record.leadTime.observedAvgWeeks - record.leadTime.claimedWeeks;
  return `${record.leadTime.observedAvgWeeks} weeks observed (${delta >= 0 ? "+" : ""}${delta} weeks vs claim)`;
}

function trustSignalClass(state: ConfidenceFingerprintItem["state"]) {
  switch (state) {
    case "confirmed":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "blocked":
      return "border-red-200 bg-red-50 text-red-800";
    case "watch":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function trustIcon(id: ConfidenceFingerprintItem["id"]) {
  switch (id) {
    case "certificate":
      return BadgeCheck;
    case "agent":
      return PhoneCall;
    case "price":
      return CircleDollarSign;
    default:
      return Truck;
  }
}

function evidenceIcon(id: EvidenceBadge["id"]) {
  return id === "documents" ? FileCheck2 : PhoneCall;
}

function sourceStatusClass(status: CertificateRecord["status"]) {
  switch (status) {
    case "verified":
      return "bg-emerald-50 text-emerald-800";
    case "mismatch":
      return "bg-red-50 text-red-800";
    case "stale":
      return "bg-amber-50 text-amber-900";
    default:
      return "bg-blue-50 text-blue-800";
  }
}

function viewedStorageKey(record: CertificateRecord) {
  return `procuresource:viewed:${record.certificateNumber}`;
}

function buildViewDiffs(previous: ViewSnapshot | null, current: ViewSnapshot) {
  if (!previous) {
    return [];
  }

  const diffs: string[] = [];
  if (previous.status !== current.status) {
    diffs.push(`Status was ${statusLabel(previous.status)}, now ${statusLabel(current.status)}.`);
  }
  if (previous.priceUpdatedOn !== current.priceUpdatedOn || previous.priceRange !== current.priceRange) {
    diffs.push(`Price evidence was ${previous.priceRange} (${previous.priceUpdatedOn || "undated"}), now ${current.priceRange} (${current.priceUpdatedOn || "undated"}).`);
  }
  if (previous.claimedLeadWeeks !== current.claimedLeadWeeks) {
    diffs.push(`Claimed lead time was ${previous.claimedLeadWeeks} weeks, now ${current.claimedLeadWeeks} weeks.`);
  }
  if (previous.observedLeadWeeks !== current.observedLeadWeeks) {
    diffs.push(`Observed lead time was ${previous.observedLeadWeeks} weeks, now ${current.observedLeadWeeks} weeks.`);
  }
  if (previous.verifiedOn !== current.verifiedOn) {
    diffs.push(`Verification date was ${previous.verifiedOn || "not recorded"}, now ${current.verifiedOn || "not recorded"}.`);
  }

  return diffs;
}

function whatsappHref(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
}

function arabicSummary(record: CertificateRecord) {
  return buildArabicSummary(record);
}

export default function CertificationVerifyPage() {
  const [query, setQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [copiedSpecLine, setCopiedSpecLine] = useState(false);
  const [viewDiffs, setViewDiffs] = useState<string[]>([]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsVerifying(true);
    setResult(null);
    setCopiedSpecLine(false);
    setViewDiffs([]);

    try {
      const response = await fetch(`/api/certifications/lookup?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      if (data.found && data.certificate && data.trust?.viewedSnapshot) {
        const key = viewedStorageKey(data.certificate);
        const previous = localStorage.getItem(key);
        let previousSnapshot: ViewSnapshot | null = null;
        try {
          previousSnapshot = previous ? (JSON.parse(previous) as ViewSnapshot) : null;
        } catch {
          previousSnapshot = null;
        }
        setViewDiffs(buildViewDiffs(previousSnapshot, data.trust.viewedSnapshot));
        localStorage.setItem(key, JSON.stringify(data.trust.viewedSnapshot));
      }
      setResult(data);
    } catch {
      setResult({
        found: false,
        query,
        checkedOn: new Date().toISOString().slice(0, 10),
        message: "Lookup failed. Please retry or contact ProcureSource for manual verification.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copySpecLine = async (line: string) => {
    try {
      await navigator.clipboard.writeText(line);
      setCopiedSpecLine(true);
    } catch {
      setCopiedSpecLine(false);
    }
  };

  return (
    <PageLayout
      title="Certification Lookup"
      subtitle="Free forever: paste a certificate, model, or manufacturer name and see verified, stale, mismatch, or not-found evidence in seconds."
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 rounded-[24px] border border-[#e8e8ed] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0066cc] to-[#22d3c5]">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-[24px] font-bold text-[#1d1d1f]">Public verification check</h2>
            <p className="text-[15px] leading-6 text-[#69707d]">
              This is not a random badge or a signup wall. Results show manual verification method, timestamp, mismatch status, agent authorization, response speed, lead-time reality, and next re-check date.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#86868b]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: Carrier, 19XR, AHRI-550590-CARRIER-19XR, or AHRI-CLAIMED-NOT-FOUND"
                className="w-full rounded-[14px] border border-[#d2d2d7] py-4 pl-12 pr-4 text-[16px] focus:border-[#0066cc] focus:outline-none focus:ring-4 focus:ring-[#0066cc]/10"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying || !query.trim()}
              className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#0055b3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking evidence...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Verify now
                </>
              )}
            </button>
          </form>
        </div>

        {result && (
          <div className={`print-profile rounded-[24px] border p-5 sm:p-8 ${statusStyles(result.certificate?.status)}`}>
            {result.standardNotes && result.standardNotes.length > 0 && (
              <div className="mb-6 rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] p-4 text-[#1e40af]">
                <p className="mb-1 text-[13px] font-bold">Standard wording note</p>
                <ul className="list-disc space-y-1 pl-5 text-[13px] leading-5">
                  {result.standardNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.found && result.certificate ? (
              <>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    {result.certificate.status === "verified" ? (
                      <CheckCircle2 className="mt-1 h-8 w-8 flex-shrink-0" />
                    ) : result.certificate.status === "mismatch" ? (
                      <XCircle className="mt-1 h-8 w-8 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="mt-1 h-8 w-8 flex-shrink-0" />
                    )}
                  <div>
                      <h3 className="text-[24px] font-bold text-[#1d1d1f]">
                        {statusLabel(result.certificate.status)}
                      </h3>
                      <p className="text-[14px] text-[#69707d]">Checked on {result.checkedOn}</p>
                      {result.trust?.expiryCountdown && (
                        <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-[#424245]">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {result.trust.expiryCountdown}
                        </p>
                      )}
                      <p className="mt-1 text-[13px] leading-5 text-[#424245]">
                        {result.certificate.status === "verified"
                          ? `${result.certificate.standard} confirmed on ${result.certificate.verifiedOn || "an unknown date"}; re-check trail last updated ${latestTrailDate(result.certificate) || "not recorded"}.`
                          : `This record is intentionally not presented as a clean badge. Review state: ${reviewState(result.certificate)}.`}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-1.5 text-[12px] font-bold uppercase text-[#1d1d1f]">
                    {result.certificate.standard}
                  </span>
                </div>

                {result.trust?.evidenceBadges && result.trust.evidenceBadges.length > 0 && (
                  <div className="mb-6 grid gap-2 sm:grid-cols-2">
                    {result.trust.evidenceBadges.map((badge) => {
                      const Icon = evidenceIcon(badge.id);
                      return (
                        <div
                          key={badge.id}
                          title={badge.detail}
                          className={`rounded-[12px] border p-4 ${trustSignalClass(badge.state)}`}
                        >
                          <div className="mb-1.5 flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-[11px] font-bold uppercase">{badge.label}</span>
                          </div>
                          <p className="text-[14px] font-semibold">{badge.value}</p>
                          <p className="mt-1 text-[12px] leading-5 opacity-80">{badge.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {result.trust?.fingerprint && result.trust.fingerprint.length > 0 && (
                  <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {result.trust.fingerprint.map((signal) => {
                      const Icon = trustIcon(signal.id);
                      return (
                        <div
                          key={signal.id}
                          title={signal.detail}
                          className={`min-h-[72px] rounded-[12px] border p-3 ${trustSignalClass(signal.state)}`}
                        >
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Icon className="h-4 w-4" />
                            <span className="text-[11px] font-bold uppercase">{signal.label}</span>
                          </div>
                          <p className="text-[12px] font-semibold leading-4">{signal.value}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {result.trust?.specLine && (
                  <div className="mb-6 rounded-[16px] border border-[#d2d2d7] bg-white/80 p-4 text-[#1d1d1f]">
                    <p className="text-[13px] font-semibold">{result.trust.lastHumanChecked}</p>
                    {result.trust.unitDisplay && (
                      <p className="mt-1 text-[13px] text-[#424245]">Silent unit conversion: {result.trust.unitDisplay}</p>
                    )}
                    {result.trust.currencyDisplay && (
                      <p className="mt-1 text-[13px] text-[#424245]">
                        Region-aware estimate: <strong>{result.trust.currencyDisplay.primary}</strong>
                        {result.trust.currencyDisplay.secondary ? ` (${result.trust.currencyDisplay.secondary})` : ""}. {result.trust.currencyDisplay.note}
                      </p>
                    )}
                    <p className="mt-2 text-[13px] leading-5 text-[#424245]">{result.trust.specLine}</p>
                    <button
                      type="button"
                      onClick={() => copySpecLine(result.trust?.specLine || "")}
                      className="mt-3 inline-flex min-h-[36px] items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-4 text-[12px] font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
                    >
                      <ClipboardCopy className="h-3.5 w-3.5" />
                      {copiedSpecLine ? "Copied spec line" : "Copy as spec line"}
                    </button>
                  </div>
                )}

                {viewDiffs.length > 0 && (
                  <div className="mb-6 rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] p-4 text-[#1e3a8a]">
                    <p className="mb-2 text-[13px] font-bold">Changed since your last view</p>
                    <ul className="list-disc space-y-1 pl-5 text-[13px] leading-5">
                      {viewDiffs.map((diff) => (
                        <li key={diff}>{diff}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.trust?.sourceCrossReferences && result.trust.sourceCrossReferences.length > 0 && (
                  <div className="mb-6 rounded-[16px] border border-[#d2d2d7] bg-white/80 p-4 text-[#1d1d1f]">
                    <p className="mb-3 text-[14px] font-bold">Also verified by</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {result.trust.sourceCrossReferences.map((source) => (
                        <div key={`${source.label}-${source.checkedOn}`} className="rounded-[12px] border border-[#e8e8ed] bg-white p-3">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[13px] font-semibold">{source.label}</p>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${sourceStatusClass(source.status)}`}>
                              {statusLabel(source.status)}
                            </span>
                          </div>
                          <p className="text-[12px] leading-5 text-[#69707d]">{source.evidence}</p>
                          <p className="mt-2 text-[11px] font-semibold text-[#424245]">Checked {source.checkedOn}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.certificate.mismatchNote && (
                  <div className="mb-6 rounded-[16px] border border-[#fecaca] bg-white/70 p-4 text-[#991b1b]">
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Certificate mismatch alert
                    </div>
                    <p className="text-[14px] leading-6">{result.certificate.mismatchNote}</p>
                  </div>
                )}

                {result.certificate.corrections && result.certificate.corrections.length > 0 && (
                  <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 p-4 text-red-950">
                    <p className="mb-2 text-[14px] font-bold">Manual override visible</p>
                    <div className="space-y-2">
                      {result.certificate.corrections.map((correction) => (
                        <p key={`${correction.date}-${correction.correctedTo}`} className="text-[13px] leading-5">
                          {correction.originalClaim}; {correction.correctedTo} after verification on {correction.date}. {correction.reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 rounded-[18px] bg-white/80 p-5 text-[#1d1d1f] sm:grid-cols-2">
                  {[
                    ["Manufacturer", result.certificate.manufacturer],
                    ["Model", result.certificate.model],
                    ["Certificate", result.certificate.certificateNumber],
                    ["Authority", result.certificate.authority],
                    ["Verified on", result.certificate.verifiedOn || "Not verified"],
                    ["Last re-check", latestTrailDate(result.certificate) || "Not recorded"],
                    ["Next review", result.certificate.nextReviewOn || "Not scheduled"],
                    ["Review state", reviewState(result.certificate)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="mb-1 text-[12px] font-semibold uppercase text-[#69707d]">{label}</p>
                      <p className="text-[15px] font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
                      <Shield className="h-5 w-5 text-[#0066cc]" />
                      Verified by
                    </h4>
                    <p className="text-[15px] font-semibold">{result.certificate.verifier.name}</p>
                    <p className="text-[13px] text-[#69707d]">
                      {result.certificate.verifier.role} at {result.certificate.verifier.organization}
                    </p>
                    <p className="mt-3 text-[13px] leading-6 text-[#424245]">
                      {result.certificate.verifier.creditStatement}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
                      <FileText className="h-5 w-5 text-[#0066cc]" />
                      Contract language
                    </h4>
                    <p className="text-[13px] leading-6 text-[#424245]">{result.certificate.contractClause}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-4 flex items-center gap-2 text-[17px] font-bold">
                      <Clock3 className="h-5 w-5 text-[#0066cc]" />
                      Verification trail
                    </h4>
                    <div className="space-y-4">
                      {result.certificate.trail.map((item) => (
                        <div key={`${item.date}-${item.method}`} className="border-l-2 border-[#0066cc] pl-4">
                          <p className="text-[13px] font-bold text-[#0066cc]">{item.date}</p>
                          <p className="text-[14px] font-semibold">{item.method}</p>
                          <p className="text-[13px] leading-5 text-[#69707d]">{item.outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-4 flex items-center gap-2 text-[17px] font-bold">
                      <Timer className="h-5 w-5 text-[#0066cc]" />
                      Agent and lead-time reality
                    </h4>
                    <div className="space-y-3 text-[14px] leading-6 text-[#424245]">
                      <p>
                        <strong>{result.certificate.agentAuthorization.agentName}</strong> - {statusLabel(result.certificate.agentAuthorization.authorizationStatus)} for {result.certificate.agentAuthorization.region}.
                      </p>
                      {result.trust?.noAgentNote && (
                        <p className="rounded-[12px] border border-amber-200 bg-amber-50 p-3 text-[13px] font-semibold text-amber-950">
                          {result.trust.noAgentNote}
                        </p>
                      )}
                      <p className="flex flex-wrap items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-[#0066cc]" />
                        Agent pin: <strong>{result.certificate.agentLocation.city}, {result.certificate.agentLocation.country}</strong>
                        <span>
                          ({result.certificate.agentLocation.hubDistances
                            .filter((hub) => hub.distanceKm > 0)
                            .slice(0, 3)
                            .map((hub) => `${hub.hub} ${hub.distanceKm}km`)
                            .join(" / ") || "hub distance pending"})
                        </span>
                      </p>
                      <p>
                        Average response time: <strong>{result.certificate.agentAuthorization.avgResponseHours} hours</strong>
                        {" "}(<strong>{responseTimeLabel(result.certificate.agentAuthorization.avgResponseHours)}</strong>) from {result.certificate.agentAuthorization.responseSampleSize} recorded introduction request(s).
                      </p>
                      <p>
                        Claimed lead time: <strong>{result.certificate.leadTime.claimedWeeks} weeks</strong>.
                        {result.certificate.leadTime.sampleSize > 0 ? (
                          <> Reality check: <strong>{leadTimeReality(result.certificate)}</strong>.</>
                        ) : (
                          <> Observed average: <strong>not enough project data yet</strong>.</>
                        )}
                      </p>
                      <p>
                        Similar-project signal: shortlisted for <strong>{result.certificate.projectSignal.shortlistedCount}</strong> {result.certificate.projectSignal.region} project(s) {result.certificate.projectSignal.period}; selected <strong>{result.certificate.projectSignal.selectedCount || 0}</strong> time(s).
                      </p>
                    </div>
                  </div>
                </div>

                {result.certificate.regionFlags.length > 0 && (
                  <div className="mt-6 rounded-[18px] border border-amber-200 bg-amber-50 p-5 text-amber-950">
                    <h4 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
                      <AlertTriangle className="h-5 w-5" />
                      Region-aware code flags
                    </h4>
                    <ul className="list-disc space-y-2 pl-5 text-[14px] leading-6">
                      {result.certificate.regionFlags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                  <h4 className="mb-4 text-[17px] font-bold">Requirement confidence</h4>
                  <div className="space-y-3">
                    {result.certificate.requirements.map((item) => (
                      <div key={item.requirement} className="rounded-[14px] border border-[#e8e8ed] bg-white p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[14px] font-semibold">{item.requirement}</p>
                          <span className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] font-bold text-[#0066cc]">
                            {item.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-[13px] leading-5 text-[#69707d]">{item.evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                  <h4 className="mb-3 text-[17px] font-bold">Dispute documentation packet</h4>
                  <p className="text-[13px] leading-6 text-[#424245]">
                    {result.certificate.disputeDocumentation.evidencePack}
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-[#69707d]">
                    {result.certificate.disputeDocumentation.retentionPolicy}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`/api/certifications/snapshot?certificate=${encodeURIComponent(result.certificate.certificateNumber)}&format=pdf`}
                    className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#0055b3]"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF snapshot
                  </a>
                  <a
                    href={`/api/certifications/snapshot?certificate=${encodeURIComponent(result.certificate.certificateNumber)}`}
                    className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-5 text-[15px] font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
                  >
                    <Languages className="h-4 w-4" />
                    Arabic/English print view
                  </a>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="print-hidden flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-5 text-[15px] font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
                  >
                    <Printer className="h-4 w-4" />
                    Print this page
                  </button>
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={whatsappHref(result.certificate.whatsapp.phone, result.certificate.whatsapp.snapshotMessage)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full bg-[#1fa855] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#178a45]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send snapshot on WhatsApp
                  </a>
                  <a
                    href={whatsappHref(result.certificate.whatsapp.phone, result.certificate.whatsapp.introMessage)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-5 text-[15px] font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
                  >
                    <FileText className="h-4 w-4" />
                    Request introduction
                  </a>
                  {result.trust?.contactCardUrl && (
                    <a
                      href={result.trust.contactCardUrl}
                      className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-5 text-[15px] font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
                    >
                      <Contact className="h-4 w-4" />
                      Download contact .vcf
                    </a>
                  )}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
                      <Languages className="h-5 w-5 text-[#0066cc]" />
                      Arabic-first compliance summary
                    </h4>
                    <div dir="rtl" className="space-y-2 text-right text-[14px] leading-7 text-[#424245]">
                      <p className="font-semibold">{arabicSummary(result.certificate).title}</p>
                      <p>{arabicSummary(result.certificate).status}</p>
                      <p>{arabicSummary(result.certificate).agent}</p>
                      <p>{arabicSummary(result.certificate).note}</p>
                    </div>
                  </div>

                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
                      <Box className="h-5 w-5 text-[#0066cc]" />
                      Manufacturer BIM objects
                    </h4>
                    <div className="space-y-3">
                      {result.certificate.bimResources.map((resource) => (
                        <div key={resource.name} className="rounded-[12px] border border-[#e8e8ed] bg-white p-3">
                          <p className="text-[13px] font-semibold">{resource.name}</p>
                          <p className="text-[12px] text-[#69707d]">
                            {resource.format} - {statusLabel(resource.status)} - updated {resource.updatedOn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
                      <Wrench className="h-5 w-5 text-[#0066cc]" />
                      Spare parts and post-install sourcing
                    </h4>
                    <p className="text-[14px] leading-6 text-[#424245]">
                      Authorized supplier: <strong>{result.certificate.spareParts.authorizedSupplier}</strong>, last confirmed {result.certificate.spareParts.lastConfirmedOn}.
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[#69707d]">
                      Common parts: {result.certificate.spareParts.commonParts.join(", ")}.
                    </p>
                  </div>

                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
                      <Leaf className="h-5 w-5 text-[#0066cc]" />
                      Sustainability / ESG scoring
                    </h4>
                    <p className="text-[14px] leading-6 text-[#424245]">{result.certificate.sustainability.efficiencyNote}</p>
                    <p className="mt-2 text-[13px] leading-6 text-[#69707d]">
                      LEED candidates: {result.certificate.sustainability.leedCredits.length > 0 ? result.certificate.sustainability.leedCredits.join(", ") : "No claim until evidence is attached"}.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
                      <Users className="h-5 w-5 text-[#0066cc]" />
                      Standing expert slot
                    </h4>
                    <p className="text-[14px] leading-6 text-[#424245]">
                      Next session: <strong>{expertSession.nextSessionOn}</strong>. Topic: {expertSession.topic}.
                    </p>
                    <a
                      href={whatsappHref(result.certificate.whatsapp.phone, `I want to ask an expert about ${result.certificate.manufacturer} ${result.certificate.model}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-[13px] font-semibold text-[#0066cc] hover:underline"
                    >
                      Ask via WhatsApp
                    </a>
                  </div>

                  <div className="rounded-[18px] bg-white/80 p-5 text-[#1d1d1f]">
                    <h4 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
                      <CreditCard className="h-5 w-5 text-[#0066cc]" />
                      Financing / trade credit referral
                    </h4>
                    <p className="text-[14px] font-semibold">{tradeCreditPartner.name}</p>
                    <p className="mt-2 text-[13px] leading-6 text-[#69707d]">{tradeCreditPartner.summary}</p>
                  </div>
                </div>
                {result.trust?.lastUpdatedFooter && (
                  <p className="mt-6 border-t border-[#d2d2d7] pt-4 text-center text-[12px] font-semibold text-[#69707d]">
                    {result.trust.lastUpdatedFooter}
                  </p>
                )}
              </>
            ) : (
              <div className="text-center text-[#1d1d1f]">
                <XCircle className="mx-auto mb-4 h-16 w-16 text-[#ef4444]" />
                <h3 className="mb-2 text-[21px] font-bold">No verified record found</h3>
                <p className="mx-auto mb-6 max-w-lg text-[15px] leading-6 text-[#69707d]">
                  {result.message || "Treat this as not verified until ProcureSource records manual evidence."}
                </p>
                {result.inProgress && result.inProgress.length > 0 && (
                  <div className="mx-auto mb-6 max-w-xl rounded-[16px] border border-[#d2d2d7] bg-white/80 p-4 text-left">
                    <p className="mb-3 text-[13px] font-bold uppercase text-[#0066cc]">Currently being verified</p>
                    <div className="space-y-3">
                      {result.inProgress.map((item) => (
                        <div key={item.id} className="rounded-[12px] bg-[#f5f5f7] p-3">
                          <p className="text-[13px] font-semibold text-[#1d1d1f]">
                            {item.manufacturer} {item.model}
                          </p>
                          <p className="mt-1 text-[12px] leading-5 text-[#69707d]">
                            {item.standard} - {item.stage}. ETA: {item.eta}.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setResult(null);
                    setQuery("");
                  }}
                  className="text-[15px] font-semibold text-[#0066cc] hover:underline"
                >
                  Try another lookup
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
