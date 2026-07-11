import { certificateRecords, statusLabel, type CertificateRecord } from "@/lib/verification-data";

export type DigestItem = {
  id: string;
  type: "verified" | "mismatch" | "stale" | "pending" | "agent" | "lead_time";
  title: string;
  summary: string;
  recordId: string;
  manufacturer: string;
  model: string;
  happenedOn: string;
  severity: "positive" | "warning" | "critical" | "neutral";
};

export type ManufacturerSignal = {
  manufacturer: string;
  shortlistedCount: number;
  selectedCount: number;
  substitutionRequests: number;
  avgAgentResponseHours: number;
  claimedLeadWeeks: number;
  observedLeadWeeks: number;
  recordCount: number;
};

export const riskTransferClauses = [
  {
    title: "Spec Boilerplate",
    text:
      "Vendor compliance, agent authorization, and submitted certification evidence shall be verified through ProcureSource or an equivalent documented verification record prior to submittal approval.",
  },
  {
    title: "Substitution Approval",
    text:
      "Any proposed substitution shall include a dated certificate verification trail, current regional agent authorization, and a requirement-by-requirement equivalency matrix before consultant review.",
  },
  {
    title: "Stale Evidence",
    text:
      "Certification records outside the accepted review window shall be refreshed before award and shall not be treated as current compliance evidence without a dated re-check trail.",
  },
  {
    title: "Mismatch Handling",
    text:
      "Products with unresolved certificate mismatch shall be treated as non-compliant until corrected authority evidence is verified and attached to the submittal record.",
  },
];

export const secondaryEquipmentChecks = [
  "Confirm the original certificate and whether the rating still applies to the exact model and serial range.",
  "Request service history, commissioning records, refrigerant status, and any major component replacement evidence.",
  "Confirm the current authorized service path in the installation region before resale or redeployment.",
  "Flag any missing maintenance, stale certificate, or unsupported spare-parts path as a procurement risk.",
];

export const talentReferralSignals = [
  {
    title: "Verifier Career Credit",
    summary:
      "Manual reviewers can build a visible record of GCC MEP compliance work through public Verified by credit and evidence-pack ownership.",
  },
  {
    title: "Technical Sales Referral",
    summary:
      "Manufacturers with repeated shortlist activity can quietly post regional technical-sales or agent roles to verified users.",
  },
  {
    title: "Consultant Specialist Signal",
    summary:
      "Consultants repeatedly reviewing a category can opt into specialist opportunities without turning ProcureSource into a job board.",
  },
];

export function getVerifierCredits(records: CertificateRecord[] = certificateRecords) {
  const credits = new Map<string, {
    name: string;
    role: string;
    organization: string;
    creditStatement: string;
    verifiedCount: number;
    mismatchCount: number;
    staleCount: number;
  }>();

  for (const record of records) {
    const key = `${record.verifier.name}-${record.verifier.organization}`;
    const existing =
      credits.get(key) ||
      {
        name: record.verifier.name,
        role: record.verifier.role,
        organization: record.verifier.organization,
        creditStatement: record.verifier.creditStatement,
        verifiedCount: 0,
        mismatchCount: 0,
        staleCount: 0,
      };

    if (record.status === "verified") existing.verifiedCount += 1;
    if (record.status === "mismatch") existing.mismatchCount += 1;
    if (record.status === "stale") existing.staleCount += 1;
    credits.set(key, existing);
  }

  return Array.from(credits.values());
}

export function buildWeeklyDigest(records: CertificateRecord[] = certificateRecords) {
  const items: DigestItem[] = records.flatMap((record) => {
    const happenedOn = record.verifiedOn || record.nextReviewOn || record.trail[0]?.date || new Date().toISOString().slice(0, 10);
    const base = {
      recordId: record.id,
      manufacturer: record.manufacturer,
      model: record.model,
      happenedOn,
    };
    const digestItems: DigestItem[] = [
      {
        ...base,
        id: `${record.id}-status`,
        type: record.status === "verified" ? "verified" : record.status,
        title: `${record.manufacturer} ${record.model}: ${statusLabel(record.status)}`,
        summary:
          record.status === "verified"
            ? `${record.standard} evidence was confirmed on ${record.verifiedOn}.`
            : record.mismatchNote || `${record.standard} requires attention before use in a submittal.`,
        severity: record.status === "verified" ? "positive" : record.status === "mismatch" ? "critical" : "warning",
      },
    ];

    if (record.agentAuthorization.responseSampleSize > 0) {
      digestItems.push({
        ...base,
        id: `${record.id}-agent`,
        type: "agent",
        title: `${record.agentAuthorization.agentName}: ${record.agentAuthorization.avgResponseHours}h average response`,
        summary: `Response score is based on ${record.agentAuthorization.responseSampleSize} recorded introduction request(s).`,
        severity: record.agentAuthorization.avgResponseHours > 48 ? "warning" : "neutral",
      });
    }

    if (record.leadTime.sampleSize > 0) {
      const delta = record.leadTime.observedAvgWeeks - record.leadTime.claimedWeeks;
      digestItems.push({
        ...base,
        id: `${record.id}-lead-time`,
        type: "lead_time",
        title: `${record.manufacturer} lead time reality check`,
        summary: `Claimed ${record.leadTime.claimedWeeks} weeks, observed ${record.leadTime.observedAvgWeeks} weeks (${delta >= 0 ? "+" : ""}${delta} weeks).`,
        severity: delta > 2 ? "warning" : "neutral",
      });
    }

    return digestItems;
  });

  return {
    generatedOn: new Date().toISOString().slice(0, 10),
    title: "ProcureSource What Changed Digest",
    summary:
      "A weekly view of certification status, stale records, mismatch alerts, agent response behavior, and lead-time reality from ProcureSource verification evidence.",
    items,
  };
}

export function buildManufacturerSignals(records: CertificateRecord[] = certificateRecords): ManufacturerSignal[] {
  const grouped = new Map<string, CertificateRecord[]>();

  for (const record of records) {
    grouped.set(record.manufacturer, [...(grouped.get(record.manufacturer) || []), record]);
  }

  return Array.from(grouped.entries()).map(([manufacturer, rows]) => {
    const total = rows.length || 1;
    const shortlistTotal = rows.reduce((sum, row) => sum + row.projectSignal.shortlistedCount, 0);
    const selectedTotal = rows.reduce((sum, row) => sum + (row.projectSignal.selectedCount || 0), 0);
    const substitutionTotal = rows.reduce((sum, row) => sum + (row.projectSignal.substitutionRequests || 0), 0);
    const responseTotal = rows.reduce((sum, row) => sum + row.agentAuthorization.avgResponseHours, 0);
    const claimedTotal = rows.reduce((sum, row) => sum + row.leadTime.claimedWeeks, 0);
    const observedRows = rows.filter((row) => row.leadTime.sampleSize > 0);
    const observedTotal = observedRows.reduce((sum, row) => sum + row.leadTime.observedAvgWeeks, 0);

    return {
      manufacturer,
      shortlistedCount: shortlistTotal,
      selectedCount: selectedTotal,
      substitutionRequests: substitutionTotal,
      avgAgentResponseHours: Math.round(responseTotal / total),
      claimedLeadWeeks: Math.round(claimedTotal / total),
      observedLeadWeeks: observedRows.length > 0 ? Math.round(observedTotal / observedRows.length) : 0,
      recordCount: rows.length,
    };
  });
}

export function buildSecondOpinionFraming() {
  return {
    title: "Second Opinion For Contested Specs",
    summary:
      "Use ProcureSource as a neutral evidence layer when a contractor proposes a substitution and a consultant needs to know whether it is actually equivalent.",
    requiredInputs: [
      "Original specification requirement",
      "Proposed substitute model and manufacturer",
      "Claimed certification evidence",
      "Regional project location and AHJ context",
      "Lead-time and agent authorization evidence",
    ],
    output:
      "A requirement-by-requirement confidence matrix, mismatch warnings, region flags, and a PDF evidence snapshot that can be attached to the submittal conversation.",
  };
}

export function buildDisputeDocumentationOffer() {
  return {
    title: "Dispute Documentation Service",
    summary:
      "When contractor and consultant disagree, the compliance snapshot becomes the dated evidence pack both sides can reference.",
    packetIncludes: [
      "Certificate status and verification trail",
      "Mismatch or stale-record alerts",
      "Agent authorization and response-time record",
      "Requirement confidence matrix",
      "Lead-time reality check",
      "Risk-transfer clause language",
    ],
  };
}
