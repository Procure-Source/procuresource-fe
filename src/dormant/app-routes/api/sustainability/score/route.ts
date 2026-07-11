import { buildSustainabilityScore } from "@/lib/gcc-workflows";
import { findCertificateRecord } from "@/lib/certification-records";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("certificate") || "";

  if (!query.trim()) {
    return NextResponse.json({ error: "Certificate, manufacturer, or model query is required" }, { status: 400 });
  }

  const record = await findCertificateRecord(query);
  if (!record) {
    return NextResponse.json({ error: "No matching verification record was found" }, { status: 404 });
  }

  return NextResponse.json(buildSustainabilityScore(record));
}
