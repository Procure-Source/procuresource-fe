import { certificateRecords, statusLabel, type CertificateRecord } from "@/lib/verification-data";

export type WhatsAppWorkflowAction = "introduction" | "snapshot" | "spares" | "expert";

export const expertSession = {
  title: "Ask an MEP Compliance Expert",
  cadence: "Weekly, 30 minutes",
  nextSessionOn: "2026-07-14",
  timeZone: "Asia/Dubai",
  topic: "Chiller substitutions, AHRI evidence, UAE agent authorization, and lead-time risk",
  host: "ProcureSource Verification Desk",
  archiveNote:
    "Questions and answers become searchable reference notes after each session so the trust layer compounds over time.",
};

export const tradeCreditPartners = [
  {
    name: "Trade finance referral",
    region: "UAE / GCC",
    status: "Partner-ready placeholder",
    summary:
      "Suppliers can indicate whether financed POs are accepted through an approved trade-credit partner.",
  },
  {
    name: "Milestone-payment review",
    region: "Project dependent",
    status: "Manual referral",
    summary:
      "ProcureSource can attach verified supplier, certificate, and lead-time evidence to a financing referral packet.",
  },
];

const arabicStatus: Record<CertificateRecord["status"], string> = {
  verified: "تم التحقق",
  mismatch: "عدم تطابق",
  stale: "بحاجة إلى إعادة تحقق",
  pending: "قيد المراجعة",
};

function whatsappUrl(phone: string, message: string) {
  const normalizedPhone = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function buildArabicSummary(record: CertificateRecord) {
  return {
    title: `ملخص امتثال ${record.manufacturer} ${record.model}`,
    status: `${arabicStatus[record.status]}: ${record.standard} - ${record.verifiedOn || "لم يتم تسجيل تاريخ تحقق"}.`,
    agent: `الوكيل المحلي: ${record.agentAuthorization.agentName} (${arabicStatus[record.agentAuthorization.authorizationStatus]}).`,
    leadTime:
      record.leadTime.sampleSize > 0
        ? `المدة المعلنة ${record.leadTime.claimedWeeks} أسبوع، والمتوسط المرصود ${record.leadTime.observedAvgWeeks} أسبوع.`
        : "لا توجد بيانات كافية عن مدة التسليم الفعلية بعد.",
    note: "يجب تأكيد متطلبات الجهة المحلية المختصة قبل الاعتماد النهائي.",
  };
}

export function buildWhatsAppWorkflow(record: CertificateRecord, action: WhatsAppWorkflowAction) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const snapshotUrl = `${baseUrl}/api/certifications/snapshot?certificate=${encodeURIComponent(record.certificateNumber)}`;
  const messageByAction: Record<WhatsAppWorkflowAction, string> = {
    introduction: record.whatsapp.introMessage,
    snapshot: `${record.whatsapp.snapshotMessage}\n\nSnapshot: ${snapshotUrl}`,
    spares: `Please confirm authorized spare-parts sourcing for ${record.manufacturer} ${record.model}. Current ProcureSource record lists ${record.spareParts.authorizedSupplier}.`,
    expert: `I would like to raise a question for the next ProcureSource expert slot about ${record.manufacturer} ${record.model}.`,
  };

  const message = messageByAction[action];
  const templateName = `procuresource_${action}`;

  return {
    action,
    message,
    deepLink: whatsappUrl(record.whatsapp.phone, message),
    businessApiReady: Boolean(
      process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN
    ),
    businessApiPayload: {
      messaging_product: "whatsapp",
      to: record.whatsapp.phone.replace(/[^\d]/g, ""),
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: record.manufacturer },
              { type: "text", text: record.model },
              { type: "text", text: statusLabel(record.status) },
              { type: "text", text: snapshotUrl },
            ],
          },
        ],
      },
    },
  };
}

export function buildBimLibrary(records: CertificateRecord[] = certificateRecords) {
  return records.flatMap((record) =>
    record.bimResources.map((resource) => ({
      recordId: record.id,
      manufacturer: record.manufacturer,
      model: record.model,
      certificateNumber: record.certificateNumber,
      verificationStatus: record.status,
      name: resource.name,
      format: resource.format,
      status: resource.status,
      updatedOn: resource.updatedOn,
      trustNote:
        record.status === "verified"
          ? "BIM object can be tied to current ProcureSource certificate evidence."
          : "BIM object should not be treated as compliance-current until verification is refreshed.",
    }))
  );
}

export function buildSparePartsSourcing(record: CertificateRecord) {
  const match = {
    manufacturer: record.manufacturer,
    model: record.model,
    authorizedSupplier: record.spareParts.authorizedSupplier,
    commonParts: record.spareParts.commonParts,
    lastConfirmedOn: record.spareParts.lastConfirmedOn,
    verificationStatus: record.status,
  };

  return {
    ...match,
    resultCount: 1,
    matches: [match],
    whatsapp: buildWhatsAppWorkflow(record, "spares"),
    note:
      record.spareParts.authorizedSupplier === "Not verified"
        ? "Do not rely on this spare-parts path until the certificate and agent record are corrected."
        : "Use the authorized supplier path when planning post-installation service and replacement sourcing.",
  };
}

export function buildSustainabilityScore(record: CertificateRecord) {
  const score =
    record.status === "verified"
      ? Math.min(95, 62 + record.sustainability.leedCredits.length * 10 + (record.leadTime.sampleSize > 0 ? 8 : 0))
      : record.status === "stale"
        ? 48
        : record.status === "mismatch"
          ? 15
          : 35;

  const scorecard = {
    score,
    leedCredits: record.sustainability.leedCredits,
    refrigerantNote: record.sustainability.refrigerantNote,
    efficiencyNote: record.sustainability.efficiencyNote,
    reportingUse:
      "Use this as a pre-screening sustainability signal, not final LEED/Estidama evidence, until project-specific documentation is attached.",
  };

  return {
    manufacturer: record.manufacturer,
    model: record.model,
    ...scorecard,
    scorecard,
  };
}

export function buildGccWorkflowSummary(record: CertificateRecord) {
  return {
    whatsapp: {
      introduction: buildWhatsAppWorkflow(record, "introduction"),
      snapshot: buildWhatsAppWorkflow(record, "snapshot"),
    },
    arabicSummary: buildArabicSummary(record),
    bimResources: buildBimLibrary([record]),
    spareParts: buildSparePartsSourcing(record),
    expertSession,
    tradeCreditPartners,
    sustainability: buildSustainabilityScore(record),
  };
}
