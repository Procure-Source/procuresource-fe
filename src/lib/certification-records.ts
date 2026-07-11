import { lookupCertificate, type CertificateRecord } from "@/lib/verification-data";
import { normalizeStandardAliases } from "@/lib/standard-aliases";
import connectDB from "@/lib/db";
import VerificationRecord from "@/models/VerificationRecord";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapDatabaseRecord(dbRecord: any): CertificateRecord {
  const status = dbRecord.status || "pending";
  const agentStatus = dbRecord.agentAuthorizationStatus || "pending";
  const manufacturer = dbRecord.manufacturerName || "Manual manufacturer";
  const model = dbRecord.modelNumber || dbRecord.productLine || "Manual product record";
  const certificateNumber = dbRecord.certificateNumber || "Manual record";
  const agentName = dbRecord.agentName || "Agent not recorded";
  const verifierName = dbRecord.verifierName || "ProcureSource Verification Desk";

  return {
    id: String(dbRecord._id),
    certificateNumber,
    manufacturer,
    productLine: dbRecord.productLine || model,
    model,
    standard: dbRecord.standard,
    authority: dbRecord.issuingAuthority,
    status,
    verifiedOn: dbRecord.verifiedOn?.toISOString().slice(0, 10),
    nextReviewOn: dbRecord.nextReviewOn?.toISOString().slice(0, 10),
    expiresOn: dbRecord.expiresOn?.toISOString().slice(0, 10),
    mismatchNote: dbRecord.mismatchNote,
    trail: (dbRecord.trail || []).map((item: any) => ({
      date: item.date?.toISOString?.().slice(0, 10) || String(item.date).slice(0, 10),
      method: item.method,
      outcome: item.outcome,
      source: item.source,
    })),
    verifier: {
      name: verifierName,
      role: dbRecord.verifierRole || "MEP compliance reviewer",
      organization: dbRecord.verifierOrganization || "Grow Technology Services FZ LLC",
      profileUrl: dbRecord.verifierProfileUrl,
      creditStatement:
        dbRecord.verifierCreditStatement ||
        "Credited for maintaining the manual verification evidence attached to this record.",
    },
    requirements: [
      {
        requirement: dbRecord.standard,
        status: status === "verified" ? "exact" : status === "mismatch" ? "missing" : "needs_review",
        confidence: status === "verified" ? 95 : status === "mismatch" ? 20 : 55,
        evidence: dbRecord.mismatchNote || "Manual verification record stored in ProcureSource.",
      },
    ],
    regionFlags: status === "verified" ? [] : ["Manual review is required before consultant submission."],
    agentAuthorization: {
      agentName,
      region: dbRecord.agentRegion || "UAE",
      authorizationStatus: agentStatus,
      confirmedOn: dbRecord.agentConfirmedOn?.toISOString().slice(0, 10),
      confirmationMethod: dbRecord.confirmationMethod || "Manual verification pending",
      contactEmail: "hello@procuresource.co",
      contactPhone: "+971 4 000 0000",
      avgResponseHours: dbRecord.avgResponseHours || 0,
      responseSampleSize: dbRecord.responseSampleSize || 0,
    },
    agentLocation: {
      city: dbRecord.agentCity || dbRecord.agentRegion || "UAE",
      country: dbRecord.agentCountry || "UAE",
      hubDistances: [
        { hub: "Dubai", distanceKm: dbRecord.distanceToDubaiKm || 0 },
        { hub: "Abu Dhabi", distanceKm: dbRecord.distanceToAbuDhabiKm || 0 },
        { hub: "Sharjah", distanceKm: dbRecord.distanceToSharjahKm || 0 },
      ],
    },
    pricing: {
      currency: dbRecord.pricingCurrency || "AED",
      range: dbRecord.pricingRange || "Not recorded",
      basis: dbRecord.pricingBasis || "not_recorded",
      estimate: dbRecord.pricingEstimateAmount
        ? {
            amount: dbRecord.pricingEstimateAmount,
            currency: dbRecord.pricingEstimateCurrency || dbRecord.pricingCurrency || "AED",
            confidence: dbRecord.pricingEstimateConfidence || "indicative",
          }
        : undefined,
      lastUpdatedOn: dbRecord.pricingUpdatedOn?.toISOString().slice(0, 10),
      source: dbRecord.pricingSource || "No price evidence attached",
    },
    verificationEvidence: {
      documentsOnFile:
        typeof dbRecord.documentsOnFile === "boolean" ? dbRecord.documentsOnFile : (dbRecord.trail || []).length > 0,
      phoneConfirmed:
        typeof dbRecord.phoneConfirmed === "boolean"
          ? dbRecord.phoneConfirmed
          : /phone|call|direct/i.test(dbRecord.confirmationMethod || ""),
      sources:
        dbRecord.verificationSources && dbRecord.verificationSources.length > 0
          ? dbRecord.verificationSources.map((source: any) => ({
              label: source.label,
              evidence: source.evidence,
              checkedOn: source.checkedOn?.toISOString?.().slice(0, 10) || String(source.checkedOn).slice(0, 10),
              status: source.status || "pending",
            }))
          : (dbRecord.trail || []).slice(0, 3).map((item: any) => ({
              label: item.source || item.method,
              evidence: item.outcome,
              checkedOn: item.date?.toISOString?.().slice(0, 10) || String(item.date).slice(0, 10),
              status,
            })),
    },
    leadTime: {
      claimedWeeks: dbRecord.claimedLeadWeeks || 0,
      observedAvgWeeks: dbRecord.observedLeadWeeks || 0,
      sampleSize: dbRecord.observedLeadSampleSize || 0,
      lastObservedOn: dbRecord.updatedAt?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10),
      evidenceBasis: dbRecord.observedLeadSampleSize > 0 ? "observed_projects" : "supplier_self_reported",
    },
    projectSignal: {
      shortlistedCount: dbRecord.projectShortlistCount || 0,
      selectedCount: dbRecord.projectSelectedCount || 0,
      substitutionRequests: dbRecord.substitutionRequestCount || 0,
      region: dbRecord.agentRegion || "UAE",
      period: "this quarter",
    },
    whatsapp: {
      phone: "+97140000000",
      introMessage: `Please help me verify ${manufacturer} ${model} before procurement approval.`,
      snapshotMessage: `ProcureSource snapshot: ${manufacturer} ${model} is currently marked ${status} for ${dbRecord.standard}.`,
    },
    contractClause:
      dbRecord.contractClause ||
      "Vendor compliance, agent authorization, and submitted certification evidence shall be verified through ProcureSource or an equivalent documented verification record before submittal approval.",
    bimResources: [
      {
        name: `${model} BIM object record`,
        format: "RVT / IFC metadata",
        status: agentStatus,
        updatedOn: dbRecord.updatedAt?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10),
      },
    ],
    spareParts: {
      authorizedSupplier: agentName,
      commonParts: ["Service kit", "Controls interface", "Recommended consumables"],
      lastConfirmedOn: dbRecord.agentConfirmedOn?.toISOString().slice(0, 10) || "Not confirmed",
    },
    sustainability: {
      leedCredits: ["EA Optimize Energy Performance"],
      refrigerantNote: "Confirm refrigerant and local environmental requirements before ESG tagging.",
      efficiencyNote: "Performance claims should be reconciled against verified certificate evidence.",
    },
    disputeDocumentation: {
      evidencePack: "Certificate status, verification trail, agent authorization, and requirement confidence.",
      retentionPolicy: "Retain with the project submittal record and any substitution review.",
    },
    arabicSummary: {
      title: `???? ?????? ${manufacturer}`,
      status: status === "verified" ? "?? ?????? ?? ?????." : "????? ????? ?????? ?????.",
      agent: agentStatus === "verified" ? "?? ????? ?????? ???????." : "????? ?????? ??? ?????.",
      note: "??? ????? ??????? ????? ??????? ??? ???????? ???????.",
    },
  };
}

export async function findCertificateRecord(query: string): Promise<CertificateRecord | null> {
  if (!query.trim()) {
    return null;
  }

  const normalizedQuery = normalizeStandardAliases(query).normalizedText;

  try {
    await connectDB();
    const normalized = escapeRegExp(normalizedQuery.trim());
    const dbRecord = await VerificationRecord.findOne({
      $or: [
        { certificateNumber: new RegExp(normalized, "i") },
        { manufacturerName: new RegExp(normalized, "i") },
        { modelNumber: new RegExp(normalized, "i") },
        { productLine: new RegExp(normalized, "i") },
      ],
    }).lean();

    if (dbRecord) {
      return mapDatabaseRecord(dbRecord);
    }
  } catch (error) {
    if (!(error instanceof Error && /COSMOS_MONGODB_URI|MONGODB_URI/.test(error.message))) {
      console.warn("Verification database lookup unavailable:", error);
    }
  }

  return lookupCertificate(normalizedQuery);
}
