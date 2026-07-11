import { certificateRecords, statusLabel, type CertificateRecord } from "@/lib/verification-data";

export type TrustSignalState = "confirmed" | "watch" | "unverified" | "blocked";

export type EvidenceBadge = {
  id: "documents" | "phone";
  label: string;
  value: string;
  detail: string;
  state: TrustSignalState;
};

export type ConfidenceFingerprintItem = {
  id: "certificate" | "agent" | "price" | "lead_time";
  label: string;
  value: string;
  detail: string;
  state: TrustSignalState;
};

export type InProgressVerification = {
  id: string;
  manufacturer: string;
  model: string;
  standard: string;
  stage: string;
  eta: string;
};

export type ViewerMarket = {
  countryCode: string;
  label: string;
  currency: string;
};

export type CurrencyDisplay = {
  primary: string;
  secondary?: string;
  note: string;
  marketLabel: string;
};

export type ViewSnapshot = {
  status: CertificateRecord["status"];
  priceUpdatedOn?: string;
  priceRange: string;
  claimedLeadWeeks: number;
  observedLeadWeeks: number;
  verifiedOn?: string;
  checkedOn: string;
};

export const inProgressVerifications: InProgressVerification[] = [];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const marketByCountry: Record<string, ViewerMarket> = {
  AE: { countryCode: "AE", label: "UAE", currency: "AED" },
  SA: { countryCode: "SA", label: "Saudi Arabia", currency: "SAR" },
  QA: { countryCode: "QA", label: "Qatar", currency: "QAR" },
  KW: { countryCode: "KW", label: "Kuwait", currency: "KWD" },
  OM: { countryCode: "OM", label: "Oman", currency: "OMR" },
  BH: { countryCode: "BH", label: "Bahrain", currency: "BHD" },
};

const aedPerCurrency: Record<string, number> = {
  AED: 1,
  SAR: 0.98,
  QAR: 1.01,
  KWD: 11.95,
  OMR: 9.54,
  BHD: 9.74,
  USD: 3.6725,
};

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(from: Date, to: Date) {
  return Math.ceil((to.getTime() - from.getTime()) / 86400000);
}

function latestDate(values: Array<string | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
}

function formatDate(value?: string) {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "date not recorded";
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function convertCurrency(amount: number, fromCurrency: string, toCurrency: string) {
  const fromRate = aedPerCurrency[fromCurrency] || 1;
  const toRate = aedPerCurrency[toCurrency] || 1;
  return (amount * fromRate) / toRate;
}

function formatAge(value?: string, now = new Date()) {
  const date = parseDate(value);
  if (!date) {
    return "not dated";
  }

  const days = Math.max(0, daysBetween(date, now));
  if (days < 7) {
    return days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const weeks = Math.round(days / 7);
  if (weeks < 9) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function inferCapacity(record: CertificateRecord) {
  const capacityRequirement = record.requirements.find((item) => /capacity/i.test(item.requirement));
  const match = capacityRequirement?.requirement.match(/capacity:\s*([^,]+)/i);
  return match?.[1]?.trim() || "project capacity";
}

function parseTrCapacity(value: string) {
  const match = value.match(/(\d+(?:\.\d+)?)\s*TR\b/i);
  return match ? Number(match[1]) : null;
}

function safeVCardValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function inferViewerMarketFromHeaders(headers?: Headers | { get(name: string): string | null }) {
  const getHeader = (name: string) => headers?.get(name) || headers?.get(name.toLowerCase()) || "";
  const countryCode =
    getHeader("x-vercel-ip-country") ||
    getHeader("cf-ipcountry") ||
    getHeader("x-country-code") ||
    (getHeader("accept-language").toLowerCase().includes("ar-sa") ? "SA" : "");

  return marketByCountry[countryCode.toUpperCase()] || marketByCountry.AE;
}

export function buildEvidenceBadges(record: CertificateRecord): EvidenceBadge[] {
  const documentsOnFile = Boolean(record.verificationEvidence?.documentsOnFile);
  const phoneConfirmed = Boolean(record.verificationEvidence?.phoneConfirmed);

  return [
    {
      id: "documents",
      label: "Documents",
      value: documentsOnFile ? "Documents on file" : "No documents on file",
      detail: documentsOnFile
        ? "Supplier, directory, or manufacturer evidence is attached to this verification record."
        : "This record should not be treated as document-backed yet.",
      state: documentsOnFile ? "confirmed" : "unverified",
    },
    {
      id: "phone",
      label: "Phone",
      value: phoneConfirmed ? "Confirmed by phone" : "Phone not confirmed",
      detail: phoneConfirmed
        ? "A human confirmation call is recorded separately from document review."
        : "Document evidence may exist, but phone confirmation has not been closed.",
      state: phoneConfirmed ? "confirmed" : "watch",
    },
  ];
}

export function buildSourceCrossReferences(record: CertificateRecord) {
  if (record.verificationEvidence?.sources?.length) {
    return record.verificationEvidence.sources;
  }

  return record.trail.slice(0, 3).map((item) => ({
    label: item.source,
    evidence: item.outcome,
    checkedOn: item.date,
    status: record.status,
  }));
}

export function buildCurrencyDisplay(record: CertificateRecord, viewerMarket: ViewerMarket = marketByCountry.AE): CurrencyDisplay {
  const estimate = record.pricing.estimate;

  if (!estimate) {
    return {
      primary: `${record.pricing.range} (${record.pricing.currency})`,
      note: `${record.pricing.source}; no numeric estimate is shown until evidence is attached.`,
      marketLabel: viewerMarket.label,
    };
  }

  const localAmount = convertCurrency(estimate.amount, estimate.currency, viewerMarket.currency);
  const primary = formatMoney(localAmount, viewerMarket.currency);
  const secondary =
    viewerMarket.currency === estimate.currency ? undefined : `${formatMoney(estimate.amount, estimate.currency)} source`;

  return {
    primary,
    secondary,
    note: `${estimate.confidence} estimate shown for ${viewerMarket.label}; conversion is indicative, not live FX.`,
    marketLabel: viewerMarket.label,
  };
}

export function buildUnitDisplay(record: CertificateRecord) {
  const capacity = inferCapacity(record);
  const tr = parseTrCapacity(capacity);

  if (!tr) {
    return capacity;
  }

  const kw = Math.round(tr * 3.5168525);
  return `${tr.toLocaleString("en-US")} TR (${kw.toLocaleString("en-US")} kW)`;
}

export function buildAgentGapNote(record: CertificateRecord) {
  if (record.agentAuthorization.authorizationStatus === "verified") {
    return null;
  }

  const region = record.agentAuthorization.region || record.agentLocation.country || "this region";
  return `No confirmed ${region} agent yet - contact manufacturer directly.`;
}

export function buildLastUpdatedFooter(record: CertificateRecord) {
  const updatedOn = latestDate([
    record.verifiedOn,
    record.pricing.lastUpdatedOn,
    record.leadTime.lastObservedOn,
    record.agentAuthorization.confirmedOn,
    ...record.trail.map((item) => item.date),
    ...(record.verificationEvidence?.sources || []).map((source) => source.checkedOn),
  ]);

  return `Page data last verified: ${updatedOn || "not recorded"}`;
}

export function buildContactVCard(record: CertificateRecord) {
  const hasConfirmedAgent = record.agentAuthorization.authorizationStatus === "verified";
  const displayName = hasConfirmedAgent
    ? record.agentAuthorization.agentName
    : `${record.manufacturer} direct manufacturer contact`;
  const organization = hasConfirmedAgent ? record.agentAuthorization.agentName : record.manufacturer;
  const note = hasConfirmedAgent
    ? `ProcureSource verified agent for ${record.manufacturer} ${record.model}.`
    : `No confirmed local agent yet for ${record.manufacturer} ${record.model}; contact manufacturer directly.`;
  const filename = `${record.manufacturer}-${record.model}-contact`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    filename: `${filename}.vcf`,
    body: [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${safeVCardValue(displayName)}`,
      `ORG:${safeVCardValue(organization)}`,
      `TEL;TYPE=work,voice:${safeVCardValue(record.agentAuthorization.contactPhone)}`,
      `EMAIL;TYPE=work:${safeVCardValue(record.agentAuthorization.contactEmail)}`,
      `NOTE:${safeVCardValue(note)}`,
      "END:VCARD",
      "",
    ].join("\r\n"),
  };
}

export function buildViewedSnapshot(record: CertificateRecord): ViewSnapshot {
  return {
    status: record.status,
    priceUpdatedOn: record.pricing.lastUpdatedOn,
    priceRange: record.pricing.range,
    claimedLeadWeeks: record.leadTime.claimedWeeks,
    observedLeadWeeks: record.leadTime.observedAvgWeeks,
    verifiedOn: record.verifiedOn,
    checkedOn: new Date().toISOString().slice(0, 10),
  };
}

export function buildLastHumanCheckedLine(record: CertificateRecord) {
  const checkedOn = latestDate([
    record.verifiedOn,
    record.agentAuthorization.confirmedOn,
    ...record.trail.map((item) => item.date),
  ]);

  return `Verified by ${record.verifier.name}, ${formatDate(checkedOn)}.`;
}

export function buildSpecLine(record: CertificateRecord) {
  const capacity = inferCapacity(record);
  const status = statusLabel(record.status).toLowerCase();
  const verifiedText = record.verifiedOn ? `verified ${record.verifiedOn}` : status;

  return `${record.model}, ${capacity}, ${record.standard} certified (cert #${record.certificateNumber}, ${verifiedText}).`;
}

export function getExpiryCountdown(record: CertificateRecord, now = new Date()) {
  const expiresOn = parseDate(record.expiresOn);
  if (!expiresOn) {
    return "Certificate expiry date not recorded";
  }

  const days = daysBetween(now, expiresOn);
  if (days < 0) {
    const overdueDays = Math.abs(days);
    return `Certificate expired ${overdueDays} day${overdueDays === 1 ? "" : "s"} ago`;
  }

  if (days < 45) {
    return `Cert valid for ${days} more day${days === 1 ? "" : "s"}`;
  }

  const months = Math.max(1, Math.round(days / 30));
  return `Cert valid for ${months} more month${months === 1 ? "" : "s"}`;
}

export function buildConfidenceFingerprint(record: CertificateRecord): ConfidenceFingerprintItem[] {
  const certificateConfirmed = record.status === "verified";
  const agentConfirmed = record.agentAuthorization.authorizationStatus === "verified";
  const priceState: TrustSignalState =
    record.pricing.basis === "verified_quote"
      ? "confirmed"
      : record.pricing.basis === "supplier_reported"
        ? "watch"
        : "unverified";
  const leadTimeState: TrustSignalState =
    record.leadTime.sampleSize > 0
      ? "confirmed"
      : record.leadTime.evidenceBasis === "supplier_self_reported"
        ? "watch"
        : "unverified";

  return [
    {
      id: "certificate",
      label: "Cert",
      value: certificateConfirmed ? "Confirmed" : statusLabel(record.status),
      detail: certificateConfirmed
        ? `Direct evidence on ${formatDate(record.verifiedOn)}`
        : record.mismatchNote || "Direct evidence is not current.",
      state: certificateConfirmed ? "confirmed" : record.status === "mismatch" ? "blocked" : "watch",
    },
    {
      id: "agent",
      label: "Agent",
      value: agentConfirmed ? "Phone confirmed" : statusLabel(record.agentAuthorization.authorizationStatus),
      detail: `${record.agentAuthorization.confirmationMethod}; ${formatDate(record.agentAuthorization.confirmedOn)}`,
      state: agentConfirmed ? "confirmed" : "watch",
    },
    {
      id: "price",
      label: "Price",
      value: record.pricing.lastUpdatedOn ? `Updated ${formatAge(record.pricing.lastUpdatedOn)}` : "No price date",
      detail: `${record.pricing.range} ${record.pricing.currency}; ${record.pricing.source}`,
      state: priceState,
    },
    {
      id: "lead_time",
      label: "Lead",
      value: record.leadTime.sampleSize > 0 ? "Observed" : "Self-reported",
      detail:
        record.leadTime.sampleSize > 0
          ? `${record.leadTime.observedAvgWeeks}w observed from ${record.leadTime.sampleSize} project report(s)`
          : `${record.leadTime.claimedWeeks}w supplier claim; no observed average yet`,
      state: leadTimeState,
    },
  ];
}

export function findInProgressVerifications(query: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return [];
  }

  const matches = inProgressVerifications.filter((item) => {
    const haystack = `${item.manufacturer} ${item.model} ${item.standard}`.toLowerCase();
    return tokens.some((token) => haystack.includes(token));
  });

  return matches.slice(0, 3);
}

export function buildVerificationTicker(records: CertificateRecord[] = certificateRecords, now = new Date()) {
  const reviewedThisWeek = records.filter((record) =>
    record.trail.some((item) => {
      const date = parseDate(item.date);
      return date ? daysBetween(date, now) >= 0 && daysBetween(date, now) <= 7 : false;
    })
  ).length;

  return {
    reviewedThisWeek,
    mismatchCorrections: records.reduce((sum, record) => sum + (record.corrections?.length || 0), 0),
    label: `${reviewedThisWeek} manufacturer${reviewedThisWeek === 1 ? "" : "s"} re-verified this week`,
  };
}
