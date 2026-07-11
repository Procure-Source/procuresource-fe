import OpenAI from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import {
  lookupCertificate,
  statusLabel,
  type CertificateRecord,
  type RequirementConfidence,
} from "@/lib/verification-data";
import { normalizeStandardAliases } from "@/lib/standard-aliases";
import {
  buildAgentGapNote,
  buildConfidenceFingerprint,
  buildCurrencyDisplay,
  buildEvidenceBadges,
  buildLastHumanCheckedLine,
  buildLastUpdatedFooter,
  buildSourceCrossReferences,
  buildSpecLine,
  buildUnitDisplay,
  getExpiryCountdown,
  type ConfidenceFingerprintItem,
  type CurrencyDisplay,
  type EvidenceBadge,
  type ViewerMarket,
} from "@/lib/trust-primitives";

type SpecMatch = {
  model: string;
  brand: string;
  score: number;
  capacity: string;
  iplv: string;
  certified: boolean;
  verificationStatus?: CertificateRecord["status"] | "not_found";
  certificationLabel?: string;
  verifiedOn?: string;
  nextReviewOn?: string;
  agentName?: string;
  agentResponseHours?: number;
  agentResponseSampleSize?: number;
  leadTime?: CertificateRecord["leadTime"];
  projectSignal?: CertificateRecord["projectSignal"];
  agentLocation?: CertificateRecord["agentLocation"];
  pricing?: CertificateRecord["pricing"];
  currencyDisplay?: CurrencyDisplay;
  unitDisplay?: string;
  evidenceBadges?: EvidenceBadge[];
  sourceCrossReferences?: CertificateRecord["verificationEvidence"]["sources"];
  trustFingerprint?: ConfidenceFingerprintItem[];
  lastHumanChecked?: string;
  specLine?: string;
  expiryCountdown?: string;
  noAgentNote?: string | null;
  contactCardUrl?: string;
  lastUpdatedFooter?: string;
  corrections?: CertificateRecord["corrections"];
  confidenceBreakdown?: RequirementConfidence[];
  warnings?: string[];
  snapshotUrl?: string;
};

type SpecAnalysis = {
  category: string;
  parameters: Record<string, string>;
  requirements?: Array<{
    requirement: string;
    status: "exact" | "exceeds" | "partial" | "missing" | "needs_review";
    confidence: number;
    evidence: string;
  }>;
  regionFlags?: string[];
  standardNotes?: string[];
  matches: SpecMatch[];
};

type SubmittalSummary = {
  overview: string;
  documents: string[];
  highlights: string[];
  complianceStatement: string;
};

const AZURE_OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";

let cachedOpenAI: OpenAI | null | undefined;

const specLibraries: Record<string, SpecAnalysis> = {
  chiller: {
    category: "Centrifugal Chiller",
    parameters: {
      "Cooling Capacity": "500 TR",
      "Cooling Type": "Water Cooled",
      Certification: "AHRI 550/590",
      "Max IPLV": "0.450 kW/ton",
      Refrigerant: "R-134a or R-513A",
    },
    requirements: [
      {
        requirement: "Cooling capacity around 500 TR",
        status: "exact",
        confidence: 94,
        evidence: "The request explicitly states 500 TR and the shortlisted models cover that capacity range.",
      },
      {
        requirement: "AHRI 550/590 certification",
        status: "exact",
        confidence: 92,
        evidence: "AHRI 550/590 was explicitly requested and is treated as a mandatory verification point.",
      },
      {
        requirement: "IPLV not exceeding 0.450 kW/ton",
        status: "exceeds",
        confidence: 88,
        evidence: "Shortlisted options are filtered toward IPLV values at or below the stated threshold.",
      },
      {
        requirement: "UAE/GCC authority requirements",
        status: "needs_review",
        confidence: 62,
        evidence: "Local AHJ requirements may add UL/FM or Civil Defense checks not fully stated in the spec.",
      },
    ],
    regionFlags: [
      "Confirm local AHJ requirements before final selection.",
      "Ask the authorized UAE agent for current lead time and project-specific submittal package.",
    ],
    standardNotes: [],
    matches: [],
  },
  pump: {
    category: "Pumping System",
    parameters: {
      Flow: "Project specified",
      Head: "Project specified",
      Certification: "UL/FM or equivalent where required",
      Application: "MEP / industrial service",
    },
    requirements: [
      {
        requirement: "Flow and head duty",
        status: "needs_review",
        confidence: 58,
        evidence: "Pump selection needs exact flow, head, fluid, and duty point information.",
      },
      {
        requirement: "UL/FM or equivalent certification",
        status: "partial",
        confidence: 64,
        evidence: "Certification depends on fire, hydronic, transfer, or process application.",
      },
    ],
    regionFlags: ["Confirm project duty point and authority requirements before procurement award."],
    standardNotes: [],
    matches: [],
  },
  electrical: {
    category: "Electrical Distribution Equipment",
    parameters: {
      Voltage: "Project specified",
      Protection: "IEC / UL aligned",
      Enclosure: "IP rated as specified",
      Application: "Industrial electrical distribution",
    },
    requirements: [
      {
        requirement: "Voltage and protection scheme",
        status: "needs_review",
        confidence: 55,
        evidence: "Electrical equipment matching requires exact voltage, fault level, IP rating, and protection schedule.",
      },
      {
        requirement: "IEC / UL alignment",
        status: "partial",
        confidence: 66,
        evidence: "The spec indicates compliance alignment, but final authority requirements need confirmation.",
      },
    ],
    regionFlags: ["Confirm local utility, authority, and consultant requirements before final selection."],
    standardNotes: [],
    matches: [],
  },
};

const defaultSpecAnalysis: SpecAnalysis = {
  category: "MEP Equipment",
  parameters: {
    Application: "MEP / industrial procurement",
    Certification: "Project dependent",
    Region: "GCC availability preferred",
    "Engineering Review": "Required before final selection",
  },
  requirements: [
    {
      requirement: "Project-specific technical fit",
      status: "needs_review",
      confidence: 50,
      evidence: "The specification does not include enough category-specific engineering parameters for a high-confidence match.",
    },
  ],
  regionFlags: ["Add capacity, duty conditions, certification requirements, and project region for a stronger match."],
  standardNotes: [],
  matches: [],
};

const defaultSubmittalDocuments = [
  "Product Datasheet",
  "Applicable Certificates",
  "Shop Drawings",
  "Installation Manual",
  "O&M Manual",
  "Compliance Matrix",
];

function normalizeAzureOpenAIBaseURL(endpoint: string) {
  const trimmed = endpoint.replace(/\/+$/, "");
  if (/\/openai\/v1$/i.test(trimmed)) {
    return trimmed;
  }
  if (/\/openai$/i.test(trimmed)) {
    return `${trimmed}/v1`;
  }
  return `${trimmed}/openai/v1`;
}

function shouldUseAzureIdentity() {
  return (
    process.env.AZURE_OPENAI_USE_AAD === "true" ||
    Boolean(process.env.AZURE_CLIENT_ID) ||
    Boolean(process.env.IDENTITY_ENDPOINT) ||
    Boolean(process.env.MSI_ENDPOINT)
  );
}

function getImageGenerationDeploymentName() {
  return (
    process.env.AZURE_OPENAI_IMAGE_GENERATION_DEPLOYMENT?.trim() ||
    process.env.AZURE_OPENAI_IMAGEGEN_DEPLOYMENT?.trim() ||
    ""
  );
}

function buildAzureOpenAIDefaultHeaders(apiKey?: string) {
  const headers: Record<string, string> = {};
  const imageGenerationDeployment = getImageGenerationDeploymentName();

  if (apiKey) {
    headers["api-key"] = apiKey;
  }

  if (imageGenerationDeployment) {
    headers["x-ms-oai-image-generation-deployment"] = imageGenerationDeployment;
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
}

function getAzureOpenAIClient(): OpenAI | null {
  if (cachedOpenAI !== undefined) {
    return cachedOpenAI;
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim();
  if (!endpoint) {
    cachedOpenAI = null;
    return cachedOpenAI;
  }

  const baseURL = normalizeAzureOpenAIBaseURL(endpoint);
  const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_AI_API_KEY;

  if (apiKey) {
    cachedOpenAI = new OpenAI({
      baseURL,
      apiKey,
      defaultHeaders: buildAzureOpenAIDefaultHeaders(apiKey),
      maxRetries: 1,
      timeout: 30000,
    });
    return cachedOpenAI;
  }

  if (!shouldUseAzureIdentity()) {
    cachedOpenAI = null;
    return cachedOpenAI;
  }

  const tokenProvider = getBearerTokenProvider(
    new DefaultAzureCredential(),
    AZURE_OPENAI_SCOPE
  );

  cachedOpenAI = new OpenAI({
    baseURL,
    apiKey: tokenProvider,
    defaultHeaders: buildAzureOpenAIDefaultHeaders(),
    maxRetries: 1,
    timeout: 30000,
  });

  return cachedOpenAI;
}

function getDeploymentName() {
  return process.env.AZURE_OPENAI_DEPLOYMENT?.trim() || "";
}

function parseJsonObject<T>(rawText?: string): T | null {
  if (!rawText) {
    return null;
  }

  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || rawText;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as T;
  } catch {
    return null;
  }
}

async function runAzureJsonPrompt<T>(prompt: string): Promise<T | null> {
  const client = getAzureOpenAIClient();
  const deploymentName = getDeploymentName();
  if (!client || !deploymentName) {
    return null;
  }

  try {
    const response = await client.responses.create({
      model: deploymentName,
      input: prompt,
      temperature: 0.2,
    });

    return parseJsonObject<T>((response as { output_text?: string }).output_text);
  } catch (error) {
    console.error("AI enrichment request failed:", error);
    return null;
  }
}

function detectSpecLibrary(specText: string): SpecAnalysis {
  const normalized = specText.toLowerCase();
  if (normalized.includes("chiller") || normalized.includes("cooling") || normalized.includes("refrigerant")) {
    return specLibraries.chiller;
  }
  if (normalized.includes("pump") || normalized.includes("flow") || normalized.includes("head")) {
    return specLibraries.pump;
  }
  if (normalized.includes("switchgear") || normalized.includes("panel") || normalized.includes("voltage")) {
    return specLibraries.electrical;
  }
  return defaultSpecAnalysis;
}

function cleanText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const cleaned = value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());

  return cleaned.length > 0 ? cleaned : fallback;
}

function cleanParameters(value: unknown, fallback: Record<string, string>) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => typeof item === "string" && item.trim().length > 0)
    .map(([key, item]) => [key, (item as string).trim()]);

  return entries.length > 0 ? Object.fromEntries(entries) : fallback;
}

function getRecordForMatch(match: SpecMatch) {
  return (
    lookupCertificate(`${match.brand} ${match.model}`) ||
    lookupCertificate(match.model) ||
    lookupCertificate(match.brand)
  );
}

function buildDefaultConfidence(match: SpecMatch): RequirementConfidence[] {
  return [
    {
      requirement: "Product category and capacity fit",
      status: match.capacity === "Project specified" ? "needs_review" : "partial",
      confidence: Math.max(45, Math.min(92, match.score - 6)),
      evidence: `${match.model} is a ranked match, but final duty-point confirmation is still required.`,
    },
    {
      requirement: "Current certificate evidence",
      status: match.certified ? "needs_review" : "missing",
      confidence: match.certified ? 58 : 25,
      evidence: match.certified
        ? "The match is marked certified by the analysis, but no ProcureSource manual verification record is attached yet."
        : "No certification evidence is attached to this match.",
    },
    {
      requirement: "Local agent and lead-time evidence",
      status: "needs_review",
      confidence: 42,
      evidence: "Agent response speed and observed lead-time data are unavailable until a verification record is attached.",
    },
  ];
}

function buildMatchWarnings(match: SpecMatch, record: CertificateRecord | null) {
  const warnings: string[] = [];

  if (!record) {
    warnings.push(
      "No ProcureSource manual verification record is attached yet; treat any certificate claim as unverified until evidence is logged."
    );
    return warnings;
  }

  if (record.status === "mismatch" && record.mismatchNote) {
    warnings.push(record.mismatchNote);
  }

  if (record.status === "stale") {
    warnings.push("Verification is stale; refresh the certificate and agent evidence before consultant submission.");
  }

  if (record.agentAuthorization.avgResponseHours > 48) {
    warnings.push("Agent response time is slow enough to create procurement schedule risk.");
  }

  if (
    record.leadTime.sampleSize > 0 &&
    record.leadTime.observedAvgWeeks > record.leadTime.claimedWeeks
  ) {
    warnings.push(
      `Lead-time reality check: observed average is ${record.leadTime.observedAvgWeeks - record.leadTime.claimedWeeks} week(s) longer than the claimed lead time.`
    );
  }

  return warnings;
}

function enrichMatch(match: SpecMatch, viewerMarket?: ViewerMarket): SpecMatch {
  const record = getRecordForMatch(match);
  const warnings = buildMatchWarnings(match, record);

  if (!record) {
    return {
      ...match,
      verificationStatus: "not_found",
      certificationLabel: "Not found in ProcureSource evidence",
      confidenceBreakdown: buildDefaultConfidence(match),
      warnings,
    };
  }

  return {
    ...match,
    certified: record.status === "verified",
    verificationStatus: record.status,
    certificationLabel: statusLabel(record.status),
    verifiedOn: record.verifiedOn,
    nextReviewOn: record.nextReviewOn,
    agentName: record.agentAuthorization.agentName,
    agentResponseHours: record.agentAuthorization.avgResponseHours,
    agentResponseSampleSize: record.agentAuthorization.responseSampleSize,
    leadTime: record.leadTime,
    projectSignal: record.projectSignal,
    agentLocation: record.agentLocation,
    pricing: record.pricing,
    currencyDisplay: buildCurrencyDisplay(record, viewerMarket),
    unitDisplay: buildUnitDisplay(record),
    evidenceBadges: buildEvidenceBadges(record),
    sourceCrossReferences: buildSourceCrossReferences(record),
    trustFingerprint: buildConfidenceFingerprint(record),
    lastHumanChecked: buildLastHumanCheckedLine(record),
    specLine: buildSpecLine(record),
    expiryCountdown: getExpiryCountdown(record),
    noAgentNote: buildAgentGapNote(record),
    contactCardUrl: `/api/agents/contact-card?certificate=${encodeURIComponent(record.certificateNumber)}`,
    lastUpdatedFooter: buildLastUpdatedFooter(record),
    corrections: record.corrections,
    confidenceBreakdown: record.requirements,
    warnings,
    snapshotUrl: `/api/certifications/snapshot?certificate=${encodeURIComponent(record.certificateNumber)}&format=pdf`,
  };
}

function cleanMatches(value: unknown, fallback: SpecAnalysis["matches"], viewerMarket?: ViewerMarket) {
  const source = Array.isArray(value) ? value : fallback;
  const matches = source
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Partial<SpecAnalysis["matches"][number]>;
      return {
        model: cleanText(row.model, "Engineering Review Option"),
        brand: cleanText(row.brand, "Verified Manufacturer"),
        score: typeof row.score === "number" ? Math.max(0, Math.min(100, row.score)) : 80,
        capacity: cleanText(row.capacity, "Project specified"),
        iplv: cleanText(row.iplv, "N/A"),
        certified: typeof row.certified === "boolean" ? row.certified : true,
      };
    })
    .filter((item): item is SpecAnalysis["matches"][number] => Boolean(item));

  return matches
    .map((match) => enrichMatch(match, viewerMarket))
    .filter((match) => match.verificationStatus && match.verificationStatus !== "not_found");
}

function buildRegionFlags(specText: string) {
  const normalized = specText.toLowerCase();
  const flags: string[] = [];
  const mentionsUae = /\buae\b|dubai|abu dhabi|sharjah/.test(normalized);
  const mentionsKsa = /\bksa\b|saudi|riyadh|jeddah/.test(normalized);
  const mentionsQatar = /qatar|doha/.test(normalized);
  const mentionsFireScope = /fire|sprinkler|smoke|civil defense|dcd|pump/.test(normalized);
  const mentionsAhj = /ahj|authority|civil defense|dcd|municipality/.test(normalized);
  const mentionsUlFm = /\bul\b|\bfm\b|ul\/fm/.test(normalized);
  const mentionsSaso = /saso|saber/.test(normalized);
  const mentionsUnits = /metric|imperial|\btr\b|kw|gpm|l\/s|m3\/h/.test(normalized);

  if ((mentionsUae || mentionsKsa || mentionsQatar) && !mentionsAhj) {
    flags.push(
      "GCC project language detected, but the spec does not name the local AHJ; confirm authority requirements before award."
    );
  }

  if (mentionsUae && mentionsFireScope && !mentionsUlFm) {
    flags.push(
      "This UAE/Dubai-facing spec does not mention UL/FM; confirm Civil Defense or AHJ expectations for this application."
    );
  }

  if (mentionsKsa && !mentionsSaso) {
    flags.push(
      "KSA project language detected without SASO/SABER evidence; confirm whether import/compliance registration is required."
    );
  }

  if (!mentionsUnits) {
    flags.push(
      "Metric/imperial basis is not explicit; lock the unit system before issuing RFQs to avoid incomparable supplier responses."
    );
  }

  return flags;
}

function normalizeSpecAnalysis(
  value: Partial<SpecAnalysis> | null,
  fallback: SpecAnalysis,
  specText: string,
  standardNotes: string[] = [],
  viewerMarket?: ViewerMarket
): SpecAnalysis {
  const regionFlags = [
    ...cleanStringArray(value?.regionFlags, fallback.regionFlags || []),
    ...buildRegionFlags(specText),
  ];

  return {
    category: cleanText(value?.category, fallback.category),
    parameters: {
      ...cleanParameters(value?.parameters, fallback.parameters),
    },
    requirements: Array.isArray(value?.requirements)
      ? value.requirements
          .filter((item) => item && typeof item === "object")
          .map((item) => {
            const row = item as NonNullable<SpecAnalysis["requirements"]>[number];
            const allowed = ["exact", "exceeds", "partial", "missing", "needs_review"];
            return {
              requirement: cleanText(row.requirement, "Engineering requirement"),
              status: allowed.includes(row.status) ? row.status : "needs_review",
              confidence: typeof row.confidence === "number" ? Math.max(0, Math.min(100, row.confidence)) : 50,
              evidence: cleanText(row.evidence, "Manual engineering review required."),
            };
          })
      : fallback.requirements,
    regionFlags: Array.from(new Set(regionFlags)),
    standardNotes: Array.from(new Set([...standardNotes, ...cleanStringArray(value?.standardNotes, [])])),
    matches: cleanMatches(value?.matches, fallback.matches, viewerMarket),
  };
}

function buildLocalSubmittal(productName: string, brand: string): SubmittalSummary {
  return {
    overview: `${brand} ${productName} is prepared as a professional MEP procurement submittal summary with emphasis on technical compliance, certification review, installation readiness, and regional supplier validation.`,
    documents: defaultSubmittalDocuments,
    highlights: [
      "Structured around project specification compliance",
      "Supports certification review for AHRI, UL, FM, SASO, ISO, or project-specific standards",
      "Includes documentation expected by consultants and purchase managers",
      "Prepared for GCC procurement workflows and supplier review cycles",
      "Ready for server-side enrichment while preserving the API response shape",
    ],
    complianceStatement:
      "Final compliance must be validated against the submitted project specification, manufacturer certificate, and authority requirements before procurement award.",
  };
}

function normalizeSubmittal(
  value: Partial<SubmittalSummary> | null,
  fallback: SubmittalSummary
): SubmittalSummary {
  return {
    overview: cleanText(value?.overview, fallback.overview),
    documents: cleanStringArray(value?.documents, fallback.documents),
    highlights: cleanStringArray(value?.highlights, fallback.highlights),
    complianceStatement: cleanText(value?.complianceStatement, fallback.complianceStatement),
  };
}

export async function analyzeSpec(specText: string, viewerMarket?: ViewerMarket): Promise<SpecAnalysis> {
  const aliasResult = normalizeStandardAliases(specText);
  const normalizedSpecText = aliasResult.normalizedText;
  const fallback = detectSpecLibrary(normalizedSpecText);
  const aiAnalysis = await runAzureJsonPrompt<Partial<SpecAnalysis>>(`You are ProcureSource's engineering procurement analyst for MEP and industrial equipment across the GCC.

Analyze the specification text and return only valid JSON with this exact shape:
{
  "category": "string",
  "parameters": {
    "Parameter Name": "Parameter Value"
  },
  "requirements": [
    {
      "requirement": "string",
      "status": "exact | exceeds | partial | missing | needs_review",
      "confidence": 0,
      "evidence": "string"
    }
  ],
  "regionFlags": ["string"],
  "matches": []
}

Rules:
- Focus on verified engineering truth, technical fit, certifications, region readiness, and metric/imperial requirements.
- Return matches only when a configured verification record supports the exact product and manufacturer.
- Return an empty matches array when no verified product evidence is available.
- Do not include markdown or commentary outside the JSON.

Specification text:
${normalizedSpecText}`);

  return normalizeSpecAnalysis(
    aiAnalysis,
    fallback,
    normalizedSpecText,
    aliasResult.notes,
    viewerMarket
  );
}

export async function generateSubmittal(
  productName: string,
  brand: string
): Promise<SubmittalSummary> {
  const fallback = buildLocalSubmittal(productName, brand);
  const submittal = await runAzureJsonPrompt<Partial<SubmittalSummary>>(`You are ProcureSource's technical submittal assistant for MEP and industrial procurement.

Create a concise professional submittal summary and return only valid JSON with this exact shape:
{
  "overview": "string",
  "documents": ["string"],
  "highlights": ["string"],
  "complianceStatement": "string"
}

Rules:
- Product name: ${productName}
- Brand: ${brand}
- Include consultant-ready documents, certification checks, installation readiness, and GCC procurement considerations.
- Mention applicable standards generically unless exact certifications are provided.
- Do not include markdown or commentary outside the JSON.
`);

  return normalizeSubmittal(submittal, fallback);
}
