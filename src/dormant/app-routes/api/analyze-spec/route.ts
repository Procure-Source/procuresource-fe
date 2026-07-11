import { NextRequest, NextResponse } from "next/server";
import { analyzeSpec } from "@/lib/ai";
import { inferViewerMarketFromHeaders } from "@/lib/trust-primitives";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const specText = body.specText || body.spec || body.input || "";

    if (!specText) {
      return NextResponse.json({ error: "Specification text is required" }, { status: 400, headers: jsonHeaders });
    }

    const analysis = await analyzeSpec(specText, inferViewerMarketFromHeaders(req.headers));

    if (!analysis) {
      return NextResponse.json({ error: "Failed to analyze specification" }, { status: 500, headers: jsonHeaders });
    }

    return NextResponse.json(analysis, { headers: jsonHeaders });
  } catch (error: any) {
    console.error("Spec analysis error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500, headers: jsonHeaders });
  }
}
