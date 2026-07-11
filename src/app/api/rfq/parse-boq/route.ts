import { NextResponse } from "next/server";

import {
  hasProductClientHeader,
  isAllowedRequest,
  jsonHeaders,
  normalizeParseInput,
  parseBoq,
  readBoundedJson,
  requestError,
  takeRateLimit,
} from "@/lib/server/rfq-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isAllowedRequest(request)) {
      throw requestError("Request origin is not allowed.", 403);
    }

    if (!hasProductClientHeader(request)) {
      throw requestError("Request client is not allowed.", 403);
    }

    if (!takeRateLimit(request)) {
      throw requestError("Too many parse requests. Try again shortly.", 429);
    }

    const body = await readBoundedJson(request);
    const parsed = await parseBoq(normalizeParseInput(body));

    return NextResponse.json(
      {
        ok: true,
        lineItems: parsed.lineItems,
        notes: parsed.notes,
      },
      { status: 200, headers: jsonHeaders() },
    );
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
