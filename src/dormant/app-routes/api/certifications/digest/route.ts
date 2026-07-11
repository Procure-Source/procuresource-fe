import { buildWeeklyDigest } from "@/lib/ecosystem-signals";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(buildWeeklyDigest());
}
