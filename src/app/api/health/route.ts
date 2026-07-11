import { NextResponse } from "next/server";

import { jsonHeaders } from "@/lib/server/rfq-api";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "procuresource",
      status: "healthy",
    },
    { status: 200, headers: jsonHeaders() },
  );
}
