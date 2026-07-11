import { certificateRecords } from "@/lib/verification-data";

export type FlowHealth = "operational" | "watch" | "blocked";

export type FailureBranch = {
  id: string;
  step: string;
  missingState: string;
  trigger: string;
  owner: string;
  action: string;
  sla: string;
  health: FlowHealth;
};

export type ParticipantRole = {
  id: string;
  title: string;
  responsibility: string;
  handoff: string;
  fallback: string;
};

export type DataStateControl = {
  id: string;
  state: string;
  appliesTo: string;
  trigger: string;
  resolutionPath: string;
};

export type HandoffRule = {
  id: string;
  from: string;
  to: string;
  conversionMoment: string;
  evidenceVisible: string;
};

export type ReverificationStep = {
  id: string;
  label: string;
  description: string;
  next: string;
};

export type VerificationCoreOutcome = {
  id: string;
  label: string;
  description: string;
  next: string;
  health: FlowHealth;
};

const DAY_MS = 86400000;
export const RFQ_SILENCE_TIMEOUT_HOURS = 48;
export const AGENT_NON_RESPONSIVE_TIMEOUT_DAYS = 5;
export const VERIFICATION_REVIEW_DAYS = 90;
export const CERT_EXPIRY_WATCH_DAYS = 60;

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(value?: string, now = new Date()) {
  const date = parseDate(value);
  if (!date) {
    return null;
  }

  return Math.ceil((date.getTime() - now.getTime()) / DAY_MS);
}

export const failureBranches: FailureBranch[] = [
  {
    id: "document-resubmit",
    step: "Document verification",
    missingState: "Documents insufficient",
    trigger: "Trade license, VAT certificate, or authorization letter fails review.",
    owner: "Admin verification team",
    action: "Set account to resubmission_required, list missing documents, and notify the backup contact.",
    sla: "Resubmission requested same day",
    health: "watch",
  },
  {
    id: "document-suspend",
    step: "Document verification",
    missingState: "Verification failed",
    trigger: "Forgery, expired license, or unresolved agent authorization conflict.",
    owner: "Admin verification lead",
    action: "Suspend public listing, retain evidence, and open reactivation review.",
    sla: "Immediate suspension",
    health: "blocked",
  },
  {
    id: "rfq-no-response",
    step: "RFQ sent to suppliers",
    missingState: "No supplier responds",
    trigger: `${RFQ_SILENCE_TIMEOUT_HOURS} hours pass without a quote, decline, or viewed status.`,
    owner: "Purchase Manager",
    action: "Notify PM, escalate to backup suppliers, and mark invited suppliers no_response.",
    sla: "48 hour escalation",
    health: "watch",
  },
  {
    id: "agent-non-responsive",
    step: "Agent response scoring",
    missingState: "Agent marked non-responsive",
    trigger: `${AGENT_NON_RESPONSIVE_TIMEOUT_DAYS} days pass after escalation without quote, decline, or backup contact response.`,
    owner: "Platform operations",
    action: "Mark invitation agent_non_responsive, decrement response score, and route future requests to backup contact or manufacturer direct.",
    sla: "5 day scoring cutoff",
    health: "blocked",
  },
  {
    id: "supplier-decline",
    step: "Quote submission",
    missingState: "Supplier declined RFQ",
    trigger: "Supplier marks not interested or cannot comply with metric/spec basis.",
    owner: "Supplier or agent",
    action: "Capture decline reason, notify PM, and keep the audit trail separate from silence.",
    sla: "Instant PM notification",
    health: "operational",
  },
  {
    id: "loser-notification",
    step: "Award contract",
    missingState: "Losing suppliers notified",
    trigger: "Contract is awarded to one submission.",
    owner: "Purchase Manager",
    action: "Move non-awarded submissions to awarded_lost and send rejection notification.",
    sla: "On award",
    health: "operational",
  },
  {
    id: "cert-expiry-project",
    step: "Certification expiry mid-project",
    missingState: "Selected certificate becomes stale or expires",
    trigger: `Expiry is within ${CERT_EXPIRY_WATCH_DAYS} days or verified evidence is older than ${VERIFICATION_REVIEW_DAYS} days.`,
    owner: "Verification team and consultant",
    action: "Pause award/submittal evidence, trigger re-verification, and notify PM plus consultant.",
    sla: "Before submittal approval",
    health: "blocked",
  },
  {
    id: "delivery-dispute",
    step: "Delivery / submittal mismatch",
    missingState: "Delivered product does not match verified record",
    trigger: "Model number, certificate, product version, or submitted performance data differs from the awarded snapshot.",
    owner: "Consultant and verification team",
    action: "Open dispute, freeze the compliance snapshot, and route the claim back into Verification Core.",
    sla: "Before acceptance or payment milestone",
    health: "blocked",
  },
];

export const verificationCoreOutcomes: VerificationCoreOutcome[] = [
  {
    id: "confirmed",
    label: "Confirmed",
    description: "Documents, certificate source, product version, and phone/contact evidence agree.",
    next: "Publish verified state and start the 90-day review clock.",
    health: "operational",
  },
  {
    id: "mismatch-flagged",
    label: "Mismatch Flagged",
    description: "Manufacturer, agent, directory, project, or delivery evidence conflicts with the claim.",
    next: "Show public warning, open dispute or correction, and trigger re-verification.",
    health: "watch",
  },
  {
    id: "rejected",
    label: "Rejected",
    description: "Evidence is insufficient, expired, forged, or legally unusable for the project.",
    next: "Suspend listing or require resubmission before any public trust state returns.",
    health: "blocked",
  },
];

export const participantRoles: ParticipantRole[] = [
  {
    id: "manufacturer",
    title: "Manufacturer",
    responsibility: "Owns product specs, certificates, model versions, and region-level authorized-agent policy.",
    handoff: "Publishes manufacturer record and assigns authorized agents by GCC market.",
    fallback: "If an agent relationship ends, manufacturer direct contact becomes the temporary escalation path.",
  },
  {
    id: "agent",
    title: "Local Agent / Supplier",
    responsibility: "Responds to RFQs, confirms lead time, carries local authorization evidence, and maintains contacts.",
    handoff: "Receives RFQs from public listing, PM invites, or manufacturer routing.",
    fallback: "Every listing needs a backup contact and stale-contact escalation.",
  },
  {
    id: "consultant",
    title: "Approver / Consultant",
    responsibility: "Approves submittal equivalency, disputed substitutions, and certification refreshes before award.",
    handoff: "Receives compliance snapshot after PM shortlist and before contract award.",
    fallback: "If consultant rejects, RFQ returns to clarification or second-opinion state.",
  },
  {
    id: "purchase-manager",
    title: "Purchase Manager",
    responsibility: "Creates RFQs, monitors supplier response, awards contracts, and keeps losing bidders informed.",
    handoff: "Converts public discovery into project-specific RFQ and consultant review.",
    fallback: "If no suppliers respond, escalation recommends backup agents or manufacturer direct contact.",
  },
  {
    id: "admin-verifier",
    title: "Admin Verification Team",
    responsibility: "Runs document review, certificate checks, phone confirmation, disputes, suspensions, and reactivation.",
    handoff: "Turns raw evidence into dated verification records and visible public trust states.",
    fallback: "If evidence conflicts, public status changes to mismatch, stale, disputed, or suspended.",
  },
];

export const dataStateControls: DataStateControl[] = [
  {
    id: "disputed",
    state: "disputed",
    appliesTo: "Certificate, product, quote, or contract evidence",
    trigger: "Contractor, consultant, supplier, admin, or delivery evidence challenges a claim after selection.",
    resolutionPath: "Freeze trust badge, attach dispute packet, assign verifier, then route back into Verification Core as confirmed, mismatch flagged, or rejected.",
  },
  {
    id: "versioned-specs",
    state: "versioned",
    appliesTo: "Manufacturer product specs and BIM objects",
    trigger: "IPLV, refrigerant, capacity range, certification number, or BIM object changes.",
    resolutionPath: "Create immutable product version, keep old project selections pinned, and notify affected projects.",
  },
  {
    id: "suspended-reactivation",
    state: "suspended / reactivation_pending",
    appliesTo: "Supplier, agent, manufacturer, or listing",
    trigger: "Rejected documents, expired authorization, fraud signal, or abandoned contact path.",
    resolutionPath: "Hide or flag public listing, request evidence, then reactivate only after fresh verification trail.",
  },
  {
    id: "approval-rejected",
    state: "approval_rejected",
    appliesTo: "RFQ shortlist, submittal, or contract award",
    trigger: "Consultant rejects equivalency or cert evidence.",
    resolutionPath: "Notify PM and supplier, reopen clarification, and preserve the consultant reason.",
  },
];

export const publicPrivateHandoffs: HandoffRule[] = [
  {
    id: "lookup-to-rfq",
    from: "Public certification lookup",
    to: "Registered Purchase Manager RFQ",
    conversionMoment: "Visitor saves a compliance snapshot, requests introduction, or needs quote evidence.",
    evidenceVisible: "Public users see status, dates, mismatch/stale state, source count, and no-agent notes; private users unlock RFQ and project records.",
  },
  {
    id: "listing-to-agent",
    from: "Public manufacturer listing",
    to: "Agent / manufacturer contact workflow",
    conversionMoment: "Visitor selects Request introduction or downloads a contact card.",
    evidenceVisible: "Public page shows whether the local agent is phone-confirmed, document-only, pending, or absent.",
  },
  {
    id: "snapshot-to-consultant",
    from: "Compliance snapshot",
    to: "Consultant approval",
    conversionMoment: "PM shortlists a product and needs submittal-ready evidence.",
    evidenceVisible: "Consultant sees the frozen snapshot, product version, cert status, source trail, and open disputes.",
  },
];

export const reverificationLoop: ReverificationStep[] = [
  {
    id: "verified",
    label: "Verified",
    description: "Record has current document evidence, direct source checks, and contact status.",
    next: "Timer starts",
  },
  {
    id: "timer",
    label: `${VERIFICATION_REVIEW_DAYS} day review window`,
    description: "The record carries a nextReviewOn date and expiry watch.",
    next: "Re-verification triggered",
  },
  {
    id: "triggered",
    label: "Re-verification triggered",
    description: "Triggers include 90-day age, certificate expiry, agent contact staleness, project selection, or dispute.",
    next: "Confirmed or flagged",
  },
  {
    id: "confirmed",
    label: "Confirmed",
    description: "Fresh evidence extends the review window and appends a new verification trail event.",
    next: "Back to verified",
  },
  {
    id: "flagged",
    label: "Flagged",
    description: "Mismatch, stale, disputed, suspended, or no-agent state becomes visible until resolved.",
    next: "Correction or reactivation",
  },
];

export function buildProcureSourceFlowSnapshot(now = new Date()) {
  const dueForReview = certificateRecords.filter((record) => {
    const days = daysUntil(record.nextReviewOn, now);
    return days !== null && days <= 0;
  });
  const expiringSoon = certificateRecords.filter((record) => {
    const days = daysUntil(record.expiresOn, now);
    return days !== null && days >= 0 && days <= CERT_EXPIRY_WATCH_DAYS;
  });
  const agentGaps = certificateRecords.filter(
    (record) => record.agentAuthorization.authorizationStatus !== "verified"
  );
  const mismatchOrStale = certificateRecords.filter(
    (record) => record.status === "mismatch" || record.status === "stale"
  );

  return {
    policy: {
      rfqSilenceTimeoutHours: RFQ_SILENCE_TIMEOUT_HOURS,
      agentNonResponsiveTimeoutDays: AGENT_NON_RESPONSIVE_TIMEOUT_DAYS,
      verificationReviewDays: VERIFICATION_REVIEW_DAYS,
      certExpiryWatchDays: CERT_EXPIRY_WATCH_DAYS,
    },
    counters: {
      recordsTracked: certificateRecords.length,
      dueForReview: dueForReview.length,
      expiringSoon: expiringSoon.length,
      agentGaps: agentGaps.length,
      mismatchOrStale: mismatchOrStale.length,
    },
    failureBranches,
    verificationCoreOutcomes,
    participantRoles,
    dataStateControls,
    publicPrivateHandoffs,
    reverificationLoop,
  };
}
