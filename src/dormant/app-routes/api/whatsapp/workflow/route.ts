import { buildWhatsAppWorkflow, type WhatsAppWorkflowAction } from "@/lib/gcc-workflows";
import { findCertificateRecord } from "@/lib/certification-records";
import { NextRequest, NextResponse } from "next/server";

const actions = new Set(["introduction", "snapshot", "spares", "expert"]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("certificate") || "";
  const action = searchParams.get("action") || "snapshot";

  if (!query.trim()) {
    return NextResponse.json({ error: "Certificate, manufacturer, or model query is required" }, { status: 400 });
  }

  if (!actions.has(action)) {
    return NextResponse.json({ error: "Unsupported WhatsApp workflow action" }, { status: 400 });
  }

  const record = await findCertificateRecord(query);
  if (!record) {
    return NextResponse.json({ error: "No matching verification record was found" }, { status: 404 });
  }

  return NextResponse.json(buildWhatsAppWorkflow(record, action as WhatsAppWorkflowAction));
}
