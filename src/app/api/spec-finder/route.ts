import { NextResponse } from "next/server";

import { analyzeSpec } from "@/lib/ai";
import {
  hasProductClientHeader,
  isAllowedRequest,
  jsonHeaders,
  readBoundedJson,
  requestError,
  takeRateLimit,
} from "@/lib/server/rfq-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxSpecChars = 8000;

export async function POST(request: Request) {
  try {
    if (!isAllowedRequest(request)) {
      throw requestError("Request origin is not allowed.", 403);
    }

    if (!hasProductClientHeader(request)) {
      throw requestError("Request client is not allowed.", 403);
    }

    if (!takeRateLimit(request)) {
      throw requestError("Too many requests. Try again shortly.", 429);
    }

    const body = await readBoundedJson(request, 12000);
    const specText =
      body && typeof body === "object" && !Array.isArray(body) && typeof (body as { specText?: unknown }).specText === "string"
        ? (body as { specText: string }).specText.trim().slice(0, maxSpecChars)
        : "";

    if (specText.length < 20) {
      throw requestError("Paste a longer specification before checking.", 400);
    }

    const result = await analyzeSpec(specText);

    return NextResponse.json(
      {
        ok: true,
        result: {
          category: result.category,
          parameters: result.parameters,
          requirements: result.requirements || [],
          regionFlags: result.regionFlags || [],
          matches: result.matches || [],
        },
      },
      { status: 200, headers: jsonHeaders() },
    );
  } catch (error) {
    const status = error && typeof error === "object" && "statusCode" in error ? Number(error.statusCode) : 500;
    return NextResponse.json(
      {
        ok: false,
        message: status >= 500 ? "Spec check could not run right now." : error instanceof Error ? error.message : "Request could not be processed.",
      },
      { status, headers: jsonHeaders() },
    );
  }
}
