import { NextResponse } from "next/server";

import {
  hasProductClientHeader,
  isAllowedRequest,
  jsonHeaders,
  readBoundedJson,
  requestError,
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

    await readBoundedJson(request, 512 * 1024);

    return NextResponse.json(
      {
        ok: false,
        message: "Use the RFQ quote endpoint for the selected RFQ.",
      },
      { status: 410, headers: jsonHeaders() },
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
