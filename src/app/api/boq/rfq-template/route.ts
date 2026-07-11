import { NextResponse } from "next/server";

import { normalizeBoqParseInput } from "@/lib/boq";
import { parseBoq } from "@/lib/parsing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxBodyBytes = Number(process.env.BOQ_API_MAX_BODY_BYTES || 2 * 1024 * 1024);

export async function POST(request: Request) {
  try {
    const payload = await readBoqPayload(request);
    const result = await parseBoq(normalizeBoqParseInput(payload));

    return NextResponse.json(
      {
        ok: true,
        lineItems: result.lineItems,
        metricSystem: result.metricSystem,
        missingFields: result.missingFields,
        suggestedRfqDraftFields: result.suggestedRfqDraftFields,
        notes: result.notes,
      },
      { status: 200, headers: jsonHeaders() },
    );
  } catch (error) {
    const status = error && typeof error === "object" && "statusCode" in error
      ? Number(error.statusCode)
      : 500;

    return NextResponse.json(
      {
        ok: false,
        message: status >= 500
          ? "Request could not be processed."
          : error instanceof Error
            ? error.message
            : "Request could not be processed.",
      },
      { status, headers: jsonHeaders() },
    );
  }
}

async function readBoqPayload(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";
  const raw = await request.text();

  if (new TextEncoder().encode(raw).length > maxBodyBytes) {
    throw requestError("Request body is too large.", 413);
  }

  if (!raw.trim()) {
    return {};
  }

  if (contentType.includes("application/json") || looksLikeJson(raw)) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? { lineItems: parsed } : parsed;
    } catch {
      throw requestError("Invalid JSON body.", 400);
    }
  }

  if (contentType.includes("text/csv") || contentType.includes("application/csv")) {
    return {
      csv: raw,
      mimeType: "text/csv",
    };
  }

  if (!contentType || contentType.includes("text/plain")) {
    return {
      text: raw,
      mimeType: "text/plain",
    };
  }

  throw requestError("Unsupported content type.", 415);
}

function jsonHeaders() {
  return {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function looksLikeJson(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function requestError(message: string, statusCode: number) {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}
