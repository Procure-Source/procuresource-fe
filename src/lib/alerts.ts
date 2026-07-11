import type { BoqLineItem, RfqRecord } from "@/lib/rfq-flow";

const alertStoreLimit = 50;
const defaultResponseWindowMs = 48 * 60 * 60 * 1000;

export type SupplierAlertItem = {
  id: string;
  kind: "rfq_raised";
  label: "RFQ raised";
  rfqId: string;
  title: string;
  projectName: string;
  category: string;
  region: string;
  dueDate: string;
  createdAt: string;
  actionHref: string;
  actionLabel: "Open";
  metricSystem: string;
  lineItemCount: number;
};

type AlertSource = Partial<Omit<RfqRecord, "lineItems">> & {
  actionHref?: unknown;
  category?: unknown;
  dueDate?: unknown;
  deadline?: unknown;
  lineItems?: unknown;
  responseDeadlineAt?: unknown;
  region?: unknown;
  rfqId?: unknown;
};

type AlertGlobal = typeof globalThis & {
  __procuresourceSupplierAlerts?: SupplierAlertItem[];
};

export function buildSupplierAlertFromRfq(source: AlertSource): SupplierAlertItem {
  const createdAt = normalizeDate(source.createdAt, new Date().toISOString());
  const rfqId = sanitizeString(source.id, 120) || sanitizeString(source.rfqId, 120) || `rfq-${hashText(createdAt)}`;
  const title = sanitizeString(source.title, 180) || "MEP RFQ";
  const projectName = sanitizeString(source.projectName, 180) || title;
  const lineItems = normalizeLineItems(source.lineItems);
  const actionHref = normalizeActionHref(source.actionHref || source.shareUrl, rfqId);

  return {
    id: `alert-${rfqId}`,
    kind: "rfq_raised",
    label: "RFQ raised",
    rfqId,
    title,
    projectName,
    category: summarizeCategory(source.category, lineItems),
    region: resolveRegion(source.region, [title, projectName, ...lineItems.map((item) => item.specification)].join(" ")),
    dueDate: normalizeDueDate(source.dueDate || source.deadline || source.responseDeadlineAt, createdAt),
    createdAt,
    actionHref,
    actionLabel: "Open",
    metricSystem: sanitizeString(source.metricSystem, 24) || "Metric",
    lineItemCount: lineItems.length,
  };
}

export function normalizeAlertRequest(body: unknown): SupplierAlertItem {
  const value = asRecord(body);
  const rfq = asRecord(value.rfq);
  return buildSupplierAlertFromRfq(Object.keys(rfq).length > 0 ? rfq : value);
}

export function normalizeSupplierAlert(value: unknown): SupplierAlertItem | null {
  const source = asRecord(value);
  if (Object.keys(source).length === 0) return null;

  const rfqId = sanitizeString(source.rfqId, 120) || sanitizeString(source.id, 120);
  if (!rfqId) return null;

  const createdAt = normalizeDate(source.createdAt, new Date().toISOString());
  const title = sanitizeString(source.title, 180) || "MEP RFQ";
  const projectName = sanitizeString(source.projectName, 180) || title;

  return {
    id: sanitizeString(source.id, 160) || `alert-${rfqId}`,
    kind: "rfq_raised",
    label: "RFQ raised",
    rfqId,
    title,
    projectName,
    category: sanitizeString(source.category, 80) || "MEP",
    region: sanitizeString(source.region, 80) || "GCC",
    dueDate: normalizeDueDate(source.dueDate, createdAt),
    createdAt,
    actionHref: normalizeActionHref(source.actionHref, rfqId),
    actionLabel: "Open",
    metricSystem: sanitizeString(source.metricSystem, 24) || "Metric",
    lineItemCount: normalizeCount(source.lineItemCount),
  };
}

export function normalizeSupplierAlerts(value: unknown): SupplierAlertItem[] {
  if (!Array.isArray(value)) return [];
  return sortSupplierAlerts(value.map(normalizeSupplierAlert).filter((item): item is SupplierAlertItem => Boolean(item)));
}

export function normalizeAlertPayload(payload: unknown): SupplierAlertItem[] {
  if (Array.isArray(payload)) return normalizeSupplierAlerts(payload);

  const value = asRecord(payload);
  if (Array.isArray(value.feed)) return normalizeSupplierAlerts(value.feed);
  if (Array.isArray(value.alerts)) return normalizeSupplierAlerts(value.alerts);
  if (value.alert) return normalizeSupplierAlerts([value.alert]);
  return [];
}

export function getFallbackSupplierAlerts(): SupplierAlertItem[] {
  return [];
}

export function listSupplierAlerts(): SupplierAlertItem[] {
  const alerts = getAlertStore();
  return sortSupplierAlerts(alerts);
}

export function publishSupplierAlert(body: unknown): SupplierAlertItem {
  const alert = normalizeAlertRequest(body);
  const store = getAlertStore();
  const next = [alert, ...store.filter((item) => item.id !== alert.id)].slice(0, alertStoreLimit);
  getAlertGlobal().__procuresourceSupplierAlerts = next;
  return alert;
}

function getAlertGlobal() {
  return globalThis as AlertGlobal;
}

function getAlertStore() {
  const alertGlobal = getAlertGlobal();
  if (!alertGlobal.__procuresourceSupplierAlerts) {
    alertGlobal.__procuresourceSupplierAlerts = [];
  }

  return alertGlobal.__procuresourceSupplierAlerts;
}

function sortSupplierAlerts(alerts: SupplierAlertItem[]) {
  return [...alerts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, alertStoreLimit);
}

function normalizeLineItems(value: unknown): Array<Pick<BoqLineItem, "category" | "description" | "specification">> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const source = asRecord(item);
      const description = sanitizeString(source.description, 160);
      const category = sanitizeString(source.category, 80);
      const specification = sanitizeString(source.specification, 220) || description;

      if (!description && !category && !specification) return null;
      return { category, description, specification };
    })
    .filter((item): item is Pick<BoqLineItem, "category" | "description" | "specification"> => Boolean(item))
    .slice(0, 80);
}

function summarizeCategory(category: unknown, lineItems: Array<Pick<BoqLineItem, "category">>) {
  const explicit = sanitizeString(category, 80);
  if (explicit) return explicit;

  const categories = Array.from(new Set(lineItems.map((item) => sanitizeString(item.category, 80)).filter(Boolean)));
  if (categories.length === 0) return "MEP";
  if (categories.length === 1) return categories[0];
  return `${categories[0]} +${categories.length - 1}`;
}

function resolveRegion(region: unknown, text: string) {
  const explicit = sanitizeString(region, 80);
  if (explicit) return explicit;

  const normalized = text.toLowerCase();
  const regions: Array<[RegExp, string]> = [
    [/\b(dubai|dxb)\b/, "Dubai"],
    [/\babu dhabi\b/, "Abu Dhabi"],
    [/\briyadh\b/, "Riyadh"],
    [/\b(jeddah|ksa|saudi)\b/, "Saudi Arabia"],
    [/\b(doha|qatar)\b/, "Qatar"],
    [/\bkuwait\b/, "Kuwait"],
    [/\b(muscat|oman)\b/, "Oman"],
    [/\b(manama|bahrain)\b/, "Bahrain"],
    [/\buae\b/, "UAE"],
  ];

  return regions.find(([pattern]) => pattern.test(normalized))?.[1] || "GCC";
}

function normalizeDueDate(value: unknown, createdAt: string) {
  const explicit = normalizeDate(value, "");
  if (explicit) return explicit;

  const createdTime = Date.parse(createdAt);
  const base = Number.isFinite(createdTime) ? createdTime : Date.now();
  return new Date(base + defaultResponseWindowMs).toISOString();
}

function normalizeDate(value: unknown, fallback: string) {
  const text = sanitizeString(value, 80);
  if (!text) return fallback;

  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : fallback;
}

function normalizeActionHref(value: unknown, rfqId: string) {
  const href = sanitizeString(value, 240);
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  return `/rfqs?link=${encodeURIComponent(rfqId)}`;
}

function normalizeCount(value: unknown) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) return 0;
  return Math.min(999, Math.round(count));
}

function sanitizeString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
