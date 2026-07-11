"use client";

import {
  buildEmptyRfq,
  type BoqLineItem,
  type RfqRecord,
  type SupplierQuote,
} from "@/lib/rfq-flow";
import { publishRfqAlert } from "@/lib/alerts-client";

const RFQ_STORAGE_KEY = "procuresource.rfqs.v1";
const SESSION_STORAGE_KEY = "procuresource.session.v1";
export const RFQ_UPDATED_EVENT = "procuresource:rfqs-updated";
const validRoles = new Set<ProductSession["role"]>([
  "purchase_manager",
  "purchaser_admin",
  "supplier",
  "supplier_admin",
]);

export type ProductSession = {
  role: "purchase_manager" | "purchaser_admin" | "supplier" | "supplier_admin";
  email: string;
  companyName: string;
  contactName: string;
};

type ParseResponse = {
  lineItems?: BoqLineItem[];
  notes?: string[];
};

type ApiRfq = {
  id?: string;
  publicId?: string;
  public_id?: string;
  uniqueLink?: string;
  title?: string;
  projectName?: string | null;
  project_name?: string | null;
  metricSystem?: string;
  metric_system?: string;
  createdAt?: string;
  created_at?: string;
  status?: string;
  shareUrl?: string;
  lineItems?: Array<Partial<BoqLineItem> & { metricSpec?: string | null; metric_spec?: string | null }>;
  rfq_items?: Array<Partial<BoqLineItem> & { metricSpec?: string | null; metric_spec?: string | null }>;
  quotes?: SupplierQuote[];
};

function parseStoredJson(value: string | null): unknown {
  if (!value || value.length > 300000) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function normalizeStoredRfq(value: unknown): RfqRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<RfqRecord>;
  if (typeof candidate.id !== "string" || typeof candidate.title !== "string") return null;
  if (!Array.isArray(candidate.lineItems) || !Array.isArray(candidate.quotes)) return null;
  return {
    id: candidate.id.slice(0, 120),
    title: candidate.title.slice(0, 180),
    projectName: typeof candidate.projectName === "string" ? candidate.projectName.slice(0, 180) : "",
    metricSystem: candidate.metricSystem === "Imperial" ? "Imperial" : "Metric",
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt.slice(0, 80) : new Date().toISOString(),
    status:
      candidate.status === "draft" ||
      candidate.status === "shared" ||
      candidate.status === "quoted" ||
      candidate.status === "awarded"
        ? candidate.status
        : "draft",
    lineItems: candidate.lineItems.slice(0, 80),
    shareUrl: typeof candidate.shareUrl === "string" ? candidate.shareUrl.slice(0, 240) : `/rfqs?link=${candidate.id}`,
    quotes: candidate.quotes.slice(0, 40),
    awardedQuoteId: typeof candidate.awardedQuoteId === "string" ? candidate.awardedQuoteId.slice(0, 120) : undefined,
  };
}

function normalizeStoredSession(value: unknown): ProductSession | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<ProductSession>;
  if (!candidate.role || !validRoles.has(candidate.role)) return null;
  return {
    role: candidate.role,
    email: typeof candidate.email === "string" ? candidate.email.slice(0, 180) : "",
    companyName: typeof candidate.companyName === "string" ? candidate.companyName.slice(0, 180) : "",
    contactName: typeof candidate.contactName === "string" ? candidate.contactName.slice(0, 180) : "",
  };
}

function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
  if (configured) return configured;

  if (typeof window === "undefined") return "";

  const host = window.location.hostname;
  const staticPreviewPorts = new Set(["4173", "4174", "4175"]);
  if ((host === "localhost" || host === "127.0.0.1") && staticPreviewPorts.has(window.location.port)) {
    return "http://localhost:4180";
  }

  return "";
}

export function getStoredRfqs(): RfqRecord[] {
  if (typeof window === "undefined") return [];

  const raw = parseStoredJson(window.localStorage.getItem(RFQ_STORAGE_KEY));
  if (!raw) return [];

  if (!Array.isArray(raw)) return [];
  const parsed = raw.map(normalizeStoredRfq).filter((item): item is RfqRecord => Boolean(item));
  return parsed;
}

export function saveRfqs(rfqs: RfqRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RFQ_STORAGE_KEY, JSON.stringify(rfqs));
  window.dispatchEvent(new CustomEvent(RFQ_UPDATED_EVENT));
}

export function upsertRfq(rfq: RfqRecord) {
  const rfqs = getStoredRfqs();
  const index = rfqs.findIndex((item) => item.id === rfq.id);
  const next = index >= 0 ? rfqs.map((item) => (item.id === rfq.id ? rfq : item)) : [rfq, ...rfqs];
  saveRfqs(next);
  return next;
}

export function getRfqById(id?: string | null) {
  if (!id) return null;
  const rfqs = getStoredRfqs();
  return rfqs.find((rfq) => rfq.id === id || shareUrlMatches(rfq.shareUrl, id)) || null;
}

export function findStoredRfq(id?: string | null) {
  if (!id) return null;
  const rfqs = getStoredRfqs();
  return rfqs.find((rfq) => rfq.id === id || shareUrlMatches(rfq.shareUrl, id)) || null;
}

export async function fetchRfqByShareLink(link?: string | null) {
  if (!link) throw new Error("Open a valid RFQ link to quote.");

  const localMatch = findStoredRfq(link);
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/rfqs/by-link/${encodeURIComponent(link)}`, {
    cache: "no-store",
    headers: {
      "X-ProcureSource-Client": "web-product",
    },
  });

  if (!response.ok) {
    if (localMatch) return localMatch;
    throw new Error("This RFQ link is not available.");
  }

  const payload = (await response.json()) as { data?: ApiRfq; items?: ApiRfq["lineItems"] };
  if (!payload?.data) {
    if (localMatch) return localMatch;
    throw new Error("This RFQ link could not be loaded.");
  }

  const rfq = toLocalRfq(payload.data, link, payload.items);
  upsertRfq(rfq);
  return rfq;
}

export function getSession(): ProductSession | null {
  if (typeof window === "undefined") return null;
  return normalizeStoredSession(parseStoredJson(window.sessionStorage.getItem(SESSION_STORAGE_KEY)));
}

export function saveSession(session: ProductSession) {
  if (typeof window === "undefined") return;
  const normalized = normalizeStoredSession(session);
  if (!normalized) return;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalized));
}

export function createRfqFromLineItems(lineItems: BoqLineItem[], draft?: Partial<RfqRecord>) {
  const rfq = {
    ...buildEmptyRfq(lineItems),
    ...draft,
    lineItems,
  };

  upsertRfq(rfq);
  if (rfq.status !== "draft") {
    publishRfqAlert(rfq);
  }
  return rfq;
}

export async function parseBoq(input: {
  text?: string;
  fileName?: string;
  mimeType?: string;
  dataUrl?: string;
}): Promise<ParseResponse> {
  const baseUrl = getApiBaseUrl();
  const apiUrl = `${baseUrl}/api/rfq/parse-boq`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ProcureSource-Client": "web-product",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`BOQ parsing failed with HTTP ${response.status}`);
  }

  return response.json() as Promise<ParseResponse>;
}

export async function submitQuote(rfqId: string, quote: SupplierQuote) {
  const rfq = getRfqById(rfqId);
  if (!rfq) {
    throw new Error("This RFQ is no longer available in this browser.");
  }
  const nextQuote = {
    ...quote,
    id: quote.id || `quote-${Date.now().toString(36)}`,
  };
  const updated: RfqRecord = {
    ...rfq,
    status: "quoted",
    quotes: [...rfq.quotes.filter((item) => item.id !== nextQuote.id), nextQuote],
  };

  const baseUrl = getApiBaseUrl();
  const canonicalApiUrl = `${baseUrl}/api/rfqs/${encodeURIComponent(rfq.id)}/quotes`;
  const legacyApiUrl = `${baseUrl}/api/rfq/quotes`;
  const canonicalBody = JSON.stringify({
    supplierName: nextQuote.supplierName,
    contactName: nextQuote.contactName,
    email: nextQuote.email,
    totalAmount: nextQuote.total,
    currency: nextQuote.currency,
    leadTimeDays: nextQuote.leadTimeDays,
    complianceScore: nextQuote.complianceScore,
    notes: nextQuote.notes,
    lineItems: nextQuote.lineItems.map((item) => ({
      rfqItemId: item.boqItemId,
      quantity: resolveQuoteLineQuantity(rfq, item.boqItemId),
      unitPrice: item.unitPrice,
      totalPrice: item.total,
      compliant: item.compliant,
      remarks: item.remarks,
    })),
  });

  const canonicalResponse = await fetch(canonicalApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ProcureSource-Actor-Role": "supplier",
      "X-ProcureSource-Actor-Id": nextQuote.email || nextQuote.supplierName,
      "X-ProcureSource-Company": nextQuote.supplierName,
      "X-ProcureSource-Contact": nextQuote.contactName,
      "X-ProcureSource-Actor-Email": nextQuote.email,
    },
    body: canonicalBody,
  });

  if (!canonicalResponse.ok) {
    const payload = await canonicalResponse.json().catch(() => null);
    const message =
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "Quote could not be submitted.";
    throw new Error(message);
  }

  upsertRfq(updated);

  fetch(legacyApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ProcureSource-Client": "web-product",
    },
    body: JSON.stringify({ rfqId, quote: nextQuote }),
  }).catch(() => undefined);

  return updated;
}

function toLocalRfq(apiRfq: ApiRfq, requestedLink: string, payloadItems?: ApiRfq["lineItems"]): RfqRecord {
  const id = sanitizeString(apiRfq.id, 120) || requestedLink;
  const publicId =
    sanitizeString(apiRfq.publicId, 120) ||
    sanitizeString(apiRfq.public_id, 120) ||
    sanitizeString(apiRfq.uniqueLink, 120) ||
    requestedLink;
  const lineItems = normalizeApiLineItems(apiRfq.lineItems || apiRfq.rfq_items || payloadItems);

  return {
    id,
    title: sanitizeString(apiRfq.title, 180) || "Untitled RFQ",
    projectName: sanitizeString(apiRfq.projectName || apiRfq.project_name, 180),
    metricSystem: apiRfq.metricSystem === "Imperial" || apiRfq.metric_system === "Imperial" ? "Imperial" : "Metric",
    createdAt: sanitizeString(apiRfq.createdAt || apiRfq.created_at, 80) || new Date().toISOString(),
    status: normalizeLocalStatus(apiRfq.status),
    lineItems,
    shareUrl: sanitizeString(apiRfq.shareUrl, 240) || `/rfqs?link=${encodeURIComponent(publicId)}`,
    quotes: Array.isArray(apiRfq.quotes) ? apiRfq.quotes.slice(0, 40) : [],
  };
}

function normalizeApiLineItems(items: ApiRfq["lineItems"]): BoqLineItem[] {
  const source = Array.isArray(items) && items.length > 0 ? items : [];

  return source.slice(0, 80).map((item, index) => ({
    id: sanitizeString(item.id, 120) || `boq-${String(index + 1).padStart(3, "0")}`,
    description: sanitizeString(item.description, 300) || "RFQ line item",
    quantity: typeof item.quantity === "number" && Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
    unit: sanitizeString(item.unit, 40) || "lot",
    specification:
      sanitizeString(item.specification || item.metricSpec || item.metric_spec, 1000) ||
      "Quote as specified.",
    category: sanitizeString(item.category, 80) || "MEP",
    confidence: typeof item.confidence === "number" && Number.isFinite(item.confidence) ? item.confidence : 90,
  }));
}

function normalizeLocalStatus(status: ApiRfq["status"]): RfqRecord["status"] {
  if (status === "draft" || status === "quoted" || status === "awarded") return status;
  return "shared";
}

function resolveQuoteLineQuantity(rfq: RfqRecord, boqItemId: string) {
  return rfq.lineItems.find((item) => item.id === boqItemId)?.quantity || 1;
}

function sanitizeString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function shareUrlMatches(shareUrl: string | undefined, id?: string | null) {
  if (!shareUrl || !id) return false;

  try {
    const url = new URL(shareUrl, "http://local.procuresource");
    return url.searchParams.get("link") === id;
  } catch {
    return shareUrl.includes(`link=${encodeURIComponent(id)}`) || shareUrl.endsWith(id);
  }
}
