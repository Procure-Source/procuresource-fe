"use client";

import {
  buildSupplierAlertFromRfq,
  normalizeAlertPayload,
  normalizeSupplierAlerts,
  type SupplierAlertItem,
} from "@/lib/alerts";
import type { RfqRecord } from "@/lib/rfq-flow";

const ALERT_STORAGE_KEY = "procuresource.supplier-alerts.v1";
export const ALERT_UPDATED_EVENT = "procuresource:supplier-alerts-updated";

function parseStoredJson(value: string | null): unknown {
  if (!value || value.length > 300000) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
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

export function getStoredSupplierAlerts(): SupplierAlertItem[] {
  if (typeof window === "undefined") return [];

  const raw = parseStoredJson(window.localStorage.getItem(ALERT_STORAGE_KEY));
  const parsed = normalizeSupplierAlerts(raw);
  return parsed.length > 0 ? parsed : [];
}

export function saveSupplierAlerts(alerts: SupplierAlertItem[], options: { emit?: boolean } = {}) {
  if (typeof window === "undefined") return;
  const normalized = normalizeSupplierAlerts(alerts);
  window.localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(normalized));
  if (options.emit !== false) {
    window.dispatchEvent(new CustomEvent(ALERT_UPDATED_EVENT));
  }
}

export function upsertSupplierAlert(alert: SupplierAlertItem) {
  const current = getStoredSupplierAlerts();
  const next = [alert, ...current.filter((item) => item.id !== alert.id)];
  saveSupplierAlerts(next);
  return next;
}

export async function fetchSupplierFeed() {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/feed`, {
    cache: "no-store",
    headers: {
      "X-ProcureSource-Client": "web-product",
    },
  });

  if (!response.ok) {
    throw new Error("Feed unavailable.");
  }

  const payload = await response.json();
  const feed = normalizeAlertPayload(payload);
  if (feed.length > 0) {
    saveSupplierAlerts(feed, { emit: false });
    return feed;
  }

  return getStoredSupplierAlerts();
}

export function publishRfqAlert(rfq: RfqRecord) {
  const localAlert = buildSupplierAlertFromRfq(rfq);
  upsertSupplierAlert(localAlert);

  const baseUrl = getApiBaseUrl();
  fetch(`${baseUrl}/api/alerts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ProcureSource-Client": "web-product",
    },
    body: JSON.stringify({ rfq }),
  })
    .then(async (response) => {
      if (!response.ok) return;
      const payload = await response.json();
      const [remoteAlert] = normalizeAlertPayload(payload);
      if (remoteAlert) upsertSupplierAlert(remoteAlert);
    })
    .catch(() => undefined);

  return localAlert;
}
