export type VerificationStatus = "verified" | "mismatch" | "stale" | "pending";

export type RequirementConfidence = {
  requirement: string;
  status: "exact" | "exceeds" | "partial" | "missing" | "needs_review";
  confidence: number;
  evidence: string;
};

export type VerificationTrailItem = {
  date: string;
  method: string;
  outcome: string;
  source: string;
};

export type VerificationSource = {
  label: string;
  evidence: string;
  checkedOn: string;
  status: VerificationStatus;
};

export type CertificateRecord = {
  id: string;
  certificateNumber: string;
  manufacturer: string;
  productLine: string;
  model: string;
  standard: string;
  authority: string;
  status: VerificationStatus;
  verifiedOn?: string;
  nextReviewOn?: string;
  expiresOn?: string;
  mismatchNote?: string;
  corrections?: Array<{
    date: string;
    originalClaim: string;
    correctedTo: string;
    reason: string;
  }>;
  trail: VerificationTrailItem[];
  requirements: RequirementConfidence[];
  regionFlags: string[];
  verifier: {
    name: string;
    role: string;
    organization: string;
    profileUrl?: string;
    creditStatement: string;
  };
  agentAuthorization: {
    agentName: string;
    region: string;
    authorizationStatus: VerificationStatus;
    confirmedOn?: string;
    confirmationMethod: string;
    contactEmail: string;
    contactPhone: string;
    avgResponseHours: number;
    responseSampleSize: number;
  };
  agentLocation: {
    city: string;
    country: string;
    hubDistances: Array<{
      hub: string;
      distanceKm: number;
    }>;
  };
  pricing: {
    currency: string;
    range: string;
    basis: "verified_quote" | "supplier_reported" | "not_recorded";
    estimate?: {
      amount: number;
      currency: string;
      confidence: "quoted" | "budgetary" | "indicative";
    };
    lastUpdatedOn?: string;
    source: string;
  };
  verificationEvidence: {
    documentsOnFile: boolean;
    phoneConfirmed: boolean;
    sources: VerificationSource[];
  };
  leadTime: {
    claimedWeeks: number;
    observedAvgWeeks: number;
    sampleSize: number;
    lastObservedOn: string;
    evidenceBasis: "observed_projects" | "supplier_self_reported" | "mixed";
  };
  projectSignal: {
    shortlistedCount: number;
    region: string;
    period: string;
    selectedCount?: number;
    substitutionRequests?: number;
  };
  whatsapp: {
    phone: string;
    introMessage: string;
    snapshotMessage: string;
  };
  contractClause: string;
  bimResources: Array<{
    name: string;
    format: string;
    status: VerificationStatus;
    updatedOn: string;
  }>;
  spareParts: {
    authorizedSupplier: string;
    commonParts: string[];
    lastConfirmedOn: string;
  };
  sustainability: {
    leedCredits: string[];
    refrigerantNote: string;
    efficiencyNote: string;
  };
  disputeDocumentation: {
    evidencePack: string;
    retentionPolicy: string;
  };
  arabicSummary: {
    title: string;
    status: string;
    agent: string;
    note: string;
  };
};

export const certificateRecords: CertificateRecord[] = [];

export function lookupCertificate(query: string) {
  if (!query.trim()) {
    return null;
  }

  return null;
}

export function statusLabel(status: VerificationStatus) {
  switch (status) {
    case "verified":
      return "Verified";
    case "mismatch":
      return "Mismatch";
    case "stale":
      return "Stale / re-check required";
    default:
      return "Pending";
  }
}

export function buildComplianceSnapshot(record: CertificateRecord) {
  const leadDelta = record.leadTime.observedAvgWeeks - record.leadTime.claimedWeeks;

  return {
    title: `${record.manufacturer} ${record.model} compliance snapshot`,
    generatedOn: new Date().toISOString().slice(0, 10),
    record,
    summary: [
      `Status: ${statusLabel(record.status)}`,
      `Standard: ${record.standard}`,
      `Verified on: ${record.verifiedOn || "Not yet verified"}`,
      `Expires on: ${record.expiresOn || "Not recorded"}`,
      `Next review: ${record.nextReviewOn || "Not scheduled"}`,
      `Last human checked: ${record.verifier.name}`,
      `Authorized agent: ${record.agentAuthorization.agentName} (${statusLabel(record.agentAuthorization.authorizationStatus)})`,
      `Agent location: ${record.agentLocation.city}, ${record.agentLocation.country}`,
      `Price freshness: ${record.pricing.lastUpdatedOn || "No price date"} (${record.pricing.basis.replace("_", " ")})`,
      ...(record.corrections || []).map(
        (correction) =>
          `Manual correction: ${correction.originalClaim}; ${correction.correctedTo} after verification on ${correction.date}.`,
      ),
      record.leadTime.sampleSize > 0
        ? `Lead time reality check: claimed ${record.leadTime.claimedWeeks} weeks, observed average ${record.leadTime.observedAvgWeeks} weeks (${leadDelta >= 0 ? "+" : ""}${leadDelta} weeks).`
        : "Lead time reality check: not enough observed delivery data yet.",
    ],
  };
}
