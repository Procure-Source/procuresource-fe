import { NextResponse } from "next/server";

import { listSupplierAlerts, publishSupplierAlert } from "@/lib/alerts";
import {
  hasProductClientHeader,
  isAllowedRequest,
  jsonHeaders,
  readBoundedJson,
  requestError,
} from "@/lib/server/rfq-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!isAllowedRequest(request)) {
      throw requestError("Request origin is not allowed.", 403);
    }

    return NextResponse.json({ ok: true, alerts: listSupplierAlerts() }, { status: 200, headers: jsonHeaders() });
  } catch (error) {
    const status = getErrorStatus(error);
    return NextResponse.json(
      {
        ok: false,
        message: status >= 500 ? "Internal server error." : error instanceof Error ? error.message : "Request could not be processed.",
      },
      { status, headers: jsonHeaders() },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isAllowedRequest(request)) {
      throw requestError("Request origin is not allowed.", 403);
    }

    if (!hasProductClientHeader(request)) {
      throw requestError("Request client is not allowed.", 403);
    }

    const body = await readBoundedJson(request, 256 * 1024);
    const alert = publishSupplierAlert(body);

    return NextResponse.json({ ok: true, alert }, { status: 201, headers: jsonHeaders() });
  } catch (error) {
    const status = getErrorStatus(error);
    return NextResponse.json(
      {
        ok: false,
        message: status >= 500 ? "Internal server error." : error instanceof Error ? error.message : "Request could not be processed.",
      },
      { status, headers: jsonHeaders() },
    );
  }
}

function getErrorStatus(error: unknown) {
  return error && typeof error === "object" && "statusCode" in error ? Number(error.statusCode) : 500;
}
