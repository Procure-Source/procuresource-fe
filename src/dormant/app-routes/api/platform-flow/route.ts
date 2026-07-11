import { buildProcureSourceFlowSnapshot } from "@/lib/procurement-flow";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(buildProcureSourceFlowSnapshot());
}
