import { NextResponse } from "next/server";

import { buildSupplierAlertFromRfq, listSupplierAlerts, type SupplierAlertItem } from "@/lib/alerts";
import { getRfqRepository } from "@/lib/db/rfq-persistence";
import type { RfqLineItem, RfqRecord } from "@/lib/rfq-data";
import { isAllowedRequest, jsonHeaders, requestError } from "@/lib/server/rfq-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!isAllowedRequest(request)) {
      throw requestError("Request origin is not allowed.", 403);
    }

    const persisted = await getRfqRepository().listRfqs({ publicOnly: true, limit: 50 });
    const persistedAlerts = persisted.items.map(rfqToSupplierAlert);
    const cachedAlerts = listSupplierAlerts();
    const feed = mergeAlerts([...persistedAlerts, ...cachedAlerts]);

    return NextResponse.json({ ok: true, feed }, { status: 200, headers: jsonHeaders() });
  } catch (error) {
    const status = error && typeof error === "object" && "statusCode" in error ? Number(error.statusCode) : 500;
    return NextResponse.json(
      {
        ok: false,
        message: status >= 500 ? "Internal server error." : error instanceof Error ? error.message : "Request could not be processed.",
      },
      { status, headers: jsonHeaders() },
    );
  }
}

function rfqToSupplierAlert(rfq: RfqRecord): SupplierAlertItem {
  const publicId = rfq.publicId || rfq.id;

  return buildSupplierAlertFromRfq({
    id: publicId,
    title: rfq.title,
    projectName: rfq.projectName,
    metricSystem: rfq.metricSystem,
    createdAt: rfq.createdAt,
    deadline: rfq.deadline,
    responseDeadlineAt: rfq.responseDeadlineAt,
    actionHref: `/rfqs?link=${encodeURIComponent(publicId)}`,
    lineItems: rfq.lineItems.map(toAlertLineItem),
  });
}

function toAlertLineItem(item: RfqLineItem) {
  return {
    category: item.category || "MEP",
    description: item.description,
    specification: item.specification || item.metricSpec || item.description,
  };
}

function mergeAlerts(alerts: SupplierAlertItem[]) {
  const seen = new Set<string>();

  return alerts
    .filter((alert) => {
      const key = alert.actionHref || alert.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 50);
}
