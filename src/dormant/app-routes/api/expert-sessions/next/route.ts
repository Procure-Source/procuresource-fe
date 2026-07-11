import { expertSession } from "@/lib/gcc-workflows";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    generatedOn: new Date().toISOString().slice(0, 10),
    nextSession: expertSession,
    ...expertSession,
  });
}
