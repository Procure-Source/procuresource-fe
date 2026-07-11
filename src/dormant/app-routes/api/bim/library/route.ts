import { buildBimLibrary } from "@/lib/gcc-workflows";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    generatedOn: new Date().toISOString().slice(0, 10),
    description:
      "Verified BIM object index tied to ProcureSource certificate evidence, agent status, and review freshness.",
    resources: buildBimLibrary(),
  });
}
