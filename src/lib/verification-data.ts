import { buildModelSearchTokens, normalizeModelSearchText, normalizeStandardAliases } from "@/lib/standard-aliases";

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

export const certificateRecords: CertificateRecord[] = [
  {
    id: "carrier-19xr-ahri-550-590",
    certificateNumber: "AHRI-550590-CARRIER-19XR",
    manufacturer: "Carrier",
    productLine: "AquaEdge 19XR",
    model: "19XR Centrifugal Chiller",
    standard: "AHRI 550/590",
    authority: "Air-Conditioning, Heating, and Refrigeration Institute",
    status: "verified",
    verifiedOn: "2026-07-01",
    nextReviewOn: "2026-10-01",
    expiresOn: "2027-03-01",
    trail: [
      {
        date: "2026-07-01",
        method: "AHRI directory cross-check",
        outcome: "Certificate number and product line matched manual record",
        source: "Manual verification log",
      },
      {
        date: "2026-06-30",
        method: "Regional office contact",
        outcome: "UAE authorized agent confirmed by manufacturer representative",
        source: "Manufacturer confirmation call",
      },
    ],
    verifier: {
      name: "Aswin K.",
      role: "MEP compliance reviewer",
      organization: "Grow Technology Services FZ LLC",
      creditStatement:
        "Credited for direct AHRI cross-check, regional-office confirmation, and UAE agent evidence capture.",
    },
    requirements: [
      { requirement: "Capacity: 500 TR", status: "exact", confidence: 96, evidence: "Product range covers the requested tonnage." },
      { requirement: "IPLV <= 0.450 kW/ton", status: "exceeds", confidence: 91, evidence: "Listed performance data is below the requested maximum." },
      { requirement: "AHRI 550/590", status: "exact", confidence: 98, evidence: "Manual AHRI directory cross-check recorded." },
      { requirement: "Refrigerant R-134a or R-513A", status: "partial", confidence: 72, evidence: "Model family supports listed refrigerants; project selection needs confirmation." },
    ],
    regionFlags: [
      "Confirm project-specific Dubai Municipality and authority requirements before final approval.",
      "If installation is tied to Civil Defense scope, confirm UL/FM requirements with the AHJ.",
    ],
    agentAuthorization: {
      agentName: "Carrier UAE Authorized Channel",
      region: "UAE",
      authorizationStatus: "verified",
      confirmedOn: "2026-06-30",
      confirmationMethod: "Direct regional office confirmation",
      contactEmail: "hello@procuresource.co",
      contactPhone: "+971 4 000 0000",
      avgResponseHours: 4,
      responseSampleSize: 3,
    },
    agentLocation: {
      city: "Dubai",
      country: "UAE",
      hubDistances: [
        { hub: "Dubai", distanceKm: 8 },
        { hub: "Abu Dhabi", distanceKm: 135 },
        { hub: "Sharjah", distanceKm: 32 },
      ],
    },
    pricing: {
      currency: "AED",
      range: "Project quoted",
      basis: "verified_quote",
      estimate: {
        amount: 1250000,
        currency: "AED",
        confidence: "quoted",
      },
      lastUpdatedOn: "2026-06-24",
      source: "ProcureSource RFQ response evidence",
    },
    verificationEvidence: {
      documentsOnFile: true,
      phoneConfirmed: true,
      sources: [
        {
          label: "AHRI directory",
          evidence: "Certificate number and product line matched the manual AHRI directory record.",
          checkedOn: "2026-07-01",
          status: "verified",
        },
        {
          label: "Manufacturer confirmation",
          evidence: "Regional office confirmed the UAE authorized channel by phone.",
          checkedOn: "2026-06-30",
          status: "verified",
        },
        {
          label: "ProcureSource RFQ evidence",
          evidence: "Quoted pricing and lead-time evidence attached from a recorded RFQ response.",
          checkedOn: "2026-06-24",
          status: "verified",
        },
      ],
    },
    leadTime: {
      claimedWeeks: 12,
      observedAvgWeeks: 15,
      sampleSize: 2,
      lastObservedOn: "2026-06-24",
      evidenceBasis: "observed_projects",
    },
    projectSignal: {
      shortlistedCount: 3,
      region: "UAE",
      period: "this quarter",
      selectedCount: 1,
      substitutionRequests: 1,
    },
    whatsapp: {
      phone: "+97140000000",
      introMessage:
        "Please introduce me to the verified UAE agent for Carrier AquaEdge 19XR. I am reviewing a chiller package and need current authorization and lead-time evidence.",
      snapshotMessage:
        "ProcureSource snapshot: Carrier 19XR is manually verified for AHRI 550/590 with UAE agent confirmation recorded on 2026-06-30.",
    },
    contractClause:
      "Vendor compliance, agent authorization, and submitted certification evidence shall be verified through ProcureSource or an equivalent documented verification record before submittal approval.",
    bimResources: [
      {
        name: "AquaEdge 19XR verified Revit family placeholder",
        format: "RVT / IFC metadata",
        status: "pending",
        updatedOn: "2026-07-01",
      },
    ],
    spareParts: {
      authorizedSupplier: "Carrier UAE Authorized Channel",
      commonParts: ["Compressor service kit", "Control board", "Tube cleaning accessories"],
      lastConfirmedOn: "2026-06-30",
    },
    sustainability: {
      leedCredits: ["EA Optimize Energy Performance", "MR Building Product Disclosure"],
      refrigerantNote: "Project selection must confirm refrigerant option and local environmental requirements.",
      efficiencyNote: "High-efficiency water-cooled selection supports energy modeling review when project data is complete.",
    },
    disputeDocumentation: {
      evidencePack: "Certificate record, verification trail, agent confirmation, lead-time notes, and requirement confidence.",
      retentionPolicy: "Snapshot records are intended to be retained with the project submittal evidence pack.",
    },
    arabicSummary: {
      title: "???? ?????? Carrier AquaEdge 19XR",
      status: "?? ?????? ????? ?? ????? AHRI 550/590.",
      agent: "?? ????? ???? ????? ?? ???? ????????.",
      note: "??? ????? ??????? ????? ??????? ??? ???????? ???????.",
    },
  },
  {
    id: "york-ags-ahri-stale",
    certificateNumber: "AHRI-550590-YORK-AGS-STALE",
    manufacturer: "York",
    productLine: "AGS",
    model: "AGS Centrifugal Chiller",
    standard: "AHRI 550/590",
    authority: "Air-Conditioning, Heating, and Refrigeration Institute",
    status: "stale",
    verifiedOn: "2025-11-12",
    nextReviewOn: "2026-02-12",
    expiresOn: "2026-11-12",
    mismatchNote:
      "The last manual verification is outside the ProcureSource review window. Do not use this as current evidence until it is re-checked.",
    trail: [
      {
        date: "2026-02-12",
        method: "Scheduled re-verification",
        outcome: "Re-check due; no fresh authority evidence attached yet",
        source: "ProcureSource review queue",
      },
      {
        date: "2025-11-12",
        method: "AHRI directory cross-check",
        outcome: "Certificate number and product line matched manual record at the time of review",
        source: "Manual verification log",
      },
    ],
    verifier: {
      name: "Noura A.",
      role: "MEP compliance reviewer",
      organization: "Grow Technology Services FZ LLC",
      creditStatement:
        "Credited for making the stale review window visible instead of leaving an old badge on the product.",
    },
    requirements: [
      { requirement: "AHRI 550/590", status: "needs_review", confidence: 46, evidence: "The certificate matched in 2025, but current status has not been re-checked." },
      { requirement: "Current UAE agent authorization", status: "partial", confidence: 54, evidence: "Agent path is recorded, but the authorization evidence needs a fresh confirmation." },
      { requirement: "Lead time evidence", status: "partial", confidence: 61, evidence: "Observed project data exists, but the sample is still small." },
    ],
    regionFlags: [
      "Because the verification is stale, confirm current AHRI evidence before consultant submission.",
      "For Dubai projects, confirm whether the AHJ requires additional UL/FM or Civil Defense evidence for the exact application.",
    ],
    agentAuthorization: {
      agentName: "York UAE Authorized Channel",
      region: "UAE",
      authorizationStatus: "stale",
      confirmedOn: "2025-11-10",
      confirmationMethod: "Regional channel confirmation older than current review window",
      contactEmail: "hello@procuresource.co",
      contactPhone: "+971 4 000 0000",
      avgResponseHours: 36,
      responseSampleSize: 2,
    },
    agentLocation: {
      city: "Dubai",
      country: "UAE",
      hubDistances: [
        { hub: "Dubai", distanceKm: 18 },
        { hub: "Abu Dhabi", distanceKm: 142 },
        { hub: "Sharjah", distanceKm: 28 },
      ],
    },
    pricing: {
      currency: "AED",
      range: "Supplier indicated",
      basis: "supplier_reported",
      estimate: {
        amount: 1180000,
        currency: "AED",
        confidence: "indicative",
      },
      lastUpdatedOn: "2026-01-15",
      source: "Supplier self-report; not re-quoted after stale review date",
    },
    verificationEvidence: {
      documentsOnFile: true,
      phoneConfirmed: false,
      sources: [
        {
          label: "AHRI directory",
          evidence: "Certificate matched during the historical 2025 manual review.",
          checkedOn: "2025-11-12",
          status: "stale",
        },
        {
          label: "Supplier documents",
          evidence: "Supplier-submitted documents remain on file, but need a fresh re-check.",
          checkedOn: "2026-02-12",
          status: "stale",
        },
      ],
    },
    leadTime: {
      claimedWeeks: 12,
      observedAvgWeeks: 17,
      sampleSize: 3,
      lastObservedOn: "2026-01-22",
      evidenceBasis: "mixed",
    },
    projectSignal: {
      shortlistedCount: 2,
      region: "UAE",
      period: "this quarter",
      selectedCount: 0,
      substitutionRequests: 1,
    },
    whatsapp: {
      phone: "+97140000000",
      introMessage:
        "Please re-check the current AHRI and UAE agent evidence for York AGS before this chiller is used in a consultant submission.",
      snapshotMessage:
        "ProcureSource stale record: York AGS had AHRI evidence recorded on 2025-11-12, but the record is now due for re-verification.",
    },
    contractClause:
      "Stale verification records shall be refreshed before award and shall not be treated as current compliance evidence without a dated re-check trail.",
    bimResources: [
      {
        name: "AGS BIM object record",
        format: "RVT / IFC metadata",
        status: "stale",
        updatedOn: "2026-02-12",
      },
    ],
    spareParts: {
      authorizedSupplier: "York UAE Authorized Channel",
      commonParts: ["Controls interface", "Service kit", "Recommended consumables"],
      lastConfirmedOn: "2025-11-10",
    },
    sustainability: {
      leedCredits: ["EA Optimize Energy Performance"],
      refrigerantNote: "Refresh refrigerant and environmental evidence before ESG tagging.",
      efficiencyNote: "Efficiency claims require a current certificate re-check before use in submittal evidence.",
    },
    disputeDocumentation: {
      evidencePack: "Stale certificate trail, re-check due note, agent age, and lead-time delta.",
      retentionPolicy: "Retain as historical evidence only until fresh verification is attached.",
    },
    arabicSummary: {
      title: "???? ??? ????? ??? ????? ??????",
      status: "?????? ?????? ???? ???? ????? ????????.",
      agent: "????? ?????? ????? ??? ?????.",
      note: "??? ????? ?????? ??? ??????? ????? ?? ????????.",
    },
  },
  {
    id: "trane-cvgf-ahri-550-590",
    certificateNumber: "AHRI-550590-TRANE-CVGF",
    manufacturer: "Trane",
    productLine: "CVGF",
    model: "CVGF Centrifugal Chiller",
    standard: "AHRI 550/590",
    authority: "Air-Conditioning, Heating, and Refrigeration Institute",
    status: "verified",
    verifiedOn: "2026-07-02",
    nextReviewOn: "2026-10-02",
    expiresOn: "2027-02-15",
    trail: [
      {
        date: "2026-07-02",
        method: "AHRI directory cross-check",
        outcome: "Certificate number and model family matched manual record",
        source: "Manual verification log",
      },
      {
        date: "2026-07-01",
        method: "Agent letter review",
        outcome: "UAE agent authorization letter recorded for manual follow-up",
        source: "Supplier document upload",
      },
    ],
    verifier: {
      name: "Rakesh M.",
      role: "Agent authorization reviewer",
      organization: "Grow Technology Services FZ LLC",
      creditStatement:
        "Credited for certificate review, agent-letter capture, and pending callback tracking.",
    },
    requirements: [
      { requirement: "Capacity: 500 TR", status: "exact", confidence: 94, evidence: "Model family covers requested load." },
      { requirement: "IPLV <= 0.450 kW/ton", status: "exact", confidence: 90, evidence: "Performance summary aligns with requested threshold." },
      { requirement: "AHRI 550/590", status: "exact", confidence: 97, evidence: "Manual AHRI directory cross-check recorded." },
      { requirement: "UAE agent authorization", status: "partial", confidence: 76, evidence: "Document received; direct manufacturer confirmation pending." },
    ],
    regionFlags: [
      "Agent letter is recorded, but direct manufacturer confirmation should be renewed before award.",
    ],
    agentAuthorization: {
      agentName: "No confirmed UAE agent yet",
      region: "UAE",
      authorizationStatus: "pending",
      confirmedOn: "2026-07-01",
      confirmationMethod: "Agent letter received; manufacturer callback pending",
      contactEmail: "hello@procuresource.co",
      contactPhone: "+971 4 000 0000",
      avgResponseHours: 18,
      responseSampleSize: 2,
    },
    agentLocation: {
      city: "Jebel Ali",
      country: "UAE",
      hubDistances: [
        { hub: "Dubai", distanceKm: 35 },
        { hub: "Abu Dhabi", distanceKm: 105 },
        { hub: "Sharjah", distanceKm: 58 },
      ],
    },
    pricing: {
      currency: "AED",
      range: "Budgetary",
      basis: "supplier_reported",
      estimate: {
        amount: 1195000,
        currency: "AED",
        confidence: "budgetary",
      },
      lastUpdatedOn: "2026-06-18",
      source: "Supplier budgetary indication; quote verification pending",
    },
    verificationEvidence: {
      documentsOnFile: true,
      phoneConfirmed: false,
      sources: [
        {
          label: "AHRI directory",
          evidence: "Certificate number and model family matched the manual AHRI directory record.",
          checkedOn: "2026-07-02",
          status: "verified",
        },
        {
          label: "Agent authorization letter",
          evidence: "A supplier-provided agent letter is on file, but direct manufacturer callback is pending.",
          checkedOn: "2026-07-01",
          status: "pending",
        },
      ],
    },
    leadTime: {
      claimedWeeks: 14,
      observedAvgWeeks: 16,
      sampleSize: 2,
      lastObservedOn: "2026-06-21",
      evidenceBasis: "mixed",
    },
    projectSignal: {
      shortlistedCount: 2,
      region: "UAE",
      period: "this quarter",
      selectedCount: 0,
      substitutionRequests: 2,
    },
    whatsapp: {
      phone: "+97140000000",
      introMessage:
        "Please help me confirm the UAE authorization status for Trane CVGF before a chiller submittal review.",
      snapshotMessage:
        "ProcureSource snapshot: Trane CVGF has AHRI evidence recorded, but direct manufacturer agent confirmation is still pending.",
    },
    contractClause:
      "Substitution acceptance is conditional on ProcureSource verification of certificate status, model equivalency, and current UAE agent authorization before final approval.",
    bimResources: [
      {
        name: "CVGF BIM object record",
        format: "RVT metadata request",
        status: "pending",
        updatedOn: "2026-07-02",
      },
    ],
    spareParts: {
      authorizedSupplier: "Trane UAE Authorized Channel",
      commonParts: ["Starter components", "Controls interface", "Recommended service consumables"],
      lastConfirmedOn: "2026-07-01",
    },
    sustainability: {
      leedCredits: ["EA Optimize Energy Performance"],
      refrigerantNote: "Refrigerant and project environmental criteria require model-specific review.",
      efficiencyNote: "Performance claims should be reconciled against the verified AHRI record before ESG tagging.",
    },
    disputeDocumentation: {
      evidencePack: "Certificate record, agent-letter status, pending callback note, and requirement confidence.",
      retentionPolicy: "Keep snapshot with consultant substitution review until direct agent confirmation is closed.",
    },
    arabicSummary: {
      title: "???? ?????? Trane CVGF",
      status: "?? ????? ???? ????? AHRI.",
      agent: "????? ?????? ??????? ?? ???? ??? ????????.",
      note: "?? ?????? ????? ??????? ????? ??? ?????? ????? ??????.",
    },
  },
  {
    id: "sample-mismatch-ahri",
    certificateNumber: "AHRI-CLAIMED-NOT-FOUND",
    manufacturer: "Example Manufacturer",
    productLine: "Claimed Chiller Line",
    model: "Example Water-Cooled Chiller",
    standard: "AHRI 550/590",
    authority: "Air-Conditioning, Heating, and Refrigeration Institute",
    status: "mismatch",
    verifiedOn: "2026-07-03",
    nextReviewOn: "2026-07-17",
    expiresOn: "2026-09-03",
    mismatchNote:
      "Manufacturer claims AHRI 550/590, but the certificate number was not found in the manual AHRI directory check as of 2026-07-03. Treat as not verified until corrected.",
    corrections: [
      {
        date: "2026-07-03",
        originalClaim: "Originally listed as AHRI 550/590 certified",
        correctedTo: "Corrected to mismatch / not found",
        reason: "Claimed certificate number was not found during manual directory review.",
      },
    ],
    trail: [
      {
        date: "2026-07-03",
        method: "AHRI directory cross-check",
        outcome: "Claimed certificate number not found",
        source: "Manual verification log",
      },
    ],
    verifier: {
      name: "Meera S.",
      role: "Mismatch reviewer",
      organization: "Grow Technology Services FZ LLC",
      creditStatement:
        "Credited for recording the mismatch instead of presenting an unverified supplier claim as compliant.",
    },
    requirements: [
      { requirement: "AHRI 550/590", status: "missing", confidence: 18, evidence: "Claimed certificate was not found during manual check." },
      { requirement: "UAE agent authorization", status: "needs_review", confidence: 35, evidence: "No direct manufacturer confirmation recorded." },
    ],
    regionFlags: [
      "Do not use this record for consultant submission until the certificate mismatch is resolved.",
    ],
    agentAuthorization: {
      agentName: "Unconfirmed Agent",
      region: "UAE",
      authorizationStatus: "pending",
      confirmationMethod: "No direct confirmation recorded",
      contactEmail: "hello@procuresource.co",
      contactPhone: "+971 4 000 0000",
      avgResponseHours: 72,
      responseSampleSize: 1,
    },
    agentLocation: {
      city: "Unconfirmed",
      country: "UAE",
      hubDistances: [
        { hub: "Dubai", distanceKm: 0 },
        { hub: "Abu Dhabi", distanceKm: 0 },
        { hub: "Sharjah", distanceKm: 0 },
      ],
    },
    pricing: {
      currency: "AED",
      range: "Not accepted",
      basis: "not_recorded",
      source: "Price hidden until certificate claim is corrected",
    },
    verificationEvidence: {
      documentsOnFile: true,
      phoneConfirmed: false,
      sources: [
        {
          label: "Claimed supplier certificate",
          evidence: "Supplier claim is on file but was not confirmed by the directory check.",
          checkedOn: "2026-07-03",
          status: "mismatch",
        },
        {
          label: "AHRI directory",
          evidence: "Claimed certificate number was not found during manual review.",
          checkedOn: "2026-07-03",
          status: "mismatch",
        },
      ],
    },
    leadTime: {
      claimedWeeks: 10,
      observedAvgWeeks: 0,
      sampleSize: 0,
      lastObservedOn: "2026-07-03",
      evidenceBasis: "supplier_self_reported",
    },
    projectSignal: {
      shortlistedCount: 0,
      region: "UAE",
      period: "this quarter",
      selectedCount: 0,
      substitutionRequests: 0,
    },
    whatsapp: {
      phone: "+97140000000",
      introMessage:
        "Please open a manual verification case for this claimed AHRI certificate because it was not found in the current ProcureSource record.",
      snapshotMessage:
        "ProcureSource mismatch alert: the claimed AHRI certificate was not found during manual review.",
    },
    contractClause:
      "Any product with unresolved certificate mismatch shall be treated as non-compliant until corrected certificate evidence is verified and attached to the submittal record.",
    bimResources: [
      {
        name: "BIM object access blocked",
        format: "RVT / IFC",
        status: "mismatch",
        updatedOn: "2026-07-03",
      },
    ],
    spareParts: {
      authorizedSupplier: "Not verified",
      commonParts: ["No authorized spare-parts path should be relied on until verification is resolved"],
      lastConfirmedOn: "2026-07-03",
    },
    sustainability: {
      leedCredits: [],
      refrigerantNote: "No sustainability tag should be applied while certificate evidence is unresolved.",
      efficiencyNote: "Efficiency claims are not accepted until the certificate mismatch is corrected.",
    },
    disputeDocumentation: {
      evidencePack: "Mismatch note, failed directory check, and pending agent authorization record.",
      retentionPolicy: "Retain as a non-compliance evidence record until corrected by the manufacturer or agent.",
    },
    arabicSummary: {
      title: "????? ??? ????? ???????",
      status: "?? ??? ?????? ??? ??? ??????? ??????? ????? ????? ??????.",
      agent: "?? ???? ????? ????? ??????.",
      note: "??? ??? ??????? ??? ????? ???????? ??? ?? ???????.",
    },
  },
];

export function lookupCertificate(query: string) {
  const normalized = normalizeStandardAliases(query).normalizedText.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const fuzzyTokens = buildModelSearchTokens(normalized);
  const compactQuery = normalizeModelSearchText(normalized);

  return (
    certificateRecords.find((record) => {
      const capacityNumbers = record.requirements
        .map((item) => item.requirement.match(/capacity:\s*(\d+(?:\.\d+)?)/i)?.[1])
        .filter((value): value is string => Boolean(value));
      const modelAliases = capacityNumbers.flatMap((capacity) => [
        `${record.model} ${capacity}`,
        `${record.productLine} ${capacity}`,
      ]);
      const haystack = [
        record.certificateNumber,
        record.manufacturer,
        record.model,
        record.productLine,
        record.standard,
        ...modelAliases,
        ...record.requirements.map((item) => item.requirement),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const compactHaystack = normalizeModelSearchText(haystack);

      return (
        haystack.includes(normalized) ||
        compactHaystack.includes(compactQuery) ||
        tokens.every((token) => haystack.includes(token)) ||
        fuzzyTokens.every((token) => compactHaystack.includes(normalizeModelSearchText(token)))
      );
    }) || null
  );
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
    title: `${record.manufacturer} ${record.model} Compliance Snapshot`,
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
          `Manual correction: ${correction.originalClaim}; ${correction.correctedTo} after verification on ${correction.date}.`
      ),
      record.leadTime.sampleSize > 0
        ? `Lead time reality check: claimed ${record.leadTime.claimedWeeks} weeks, observed average ${record.leadTime.observedAvgWeeks} weeks (${leadDelta >= 0 ? "+" : ""}${leadDelta} weeks).`
        : "Lead time reality check: not enough observed delivery data yet.",
    ],
  };
}
