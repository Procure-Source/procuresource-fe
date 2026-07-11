import { buildManufacturerSignals } from "@/lib/ecosystem-signals";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    generatedOn: new Date().toISOString().slice(0, 10),
    description:
      "Anonymized shortlist, selection, substitution, response-time, and lead-time signals derived from ProcureSource verification records.",
    manufacturers: buildManufacturerSignals(),
  });
}
