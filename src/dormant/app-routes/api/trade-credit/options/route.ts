import { tradeCreditPartners } from "@/lib/gcc-workflows";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    generatedOn: new Date().toISOString().slice(0, 10),
    note:
      "ProcureSource is not a lender. These are referral hooks for suppliers and contractors who need finance-ready evidence packets.",
    partners: tradeCreditPartners,
  });
}
