import connectDB from "@/lib/db";
import Supplier from "@/models/Supplier";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const certification = searchParams.get("certification");
    const verified = searchParams.get("verified");

    const filter: Record<string, unknown> = {};

    if (verified === "true") {
      filter.isVerified = true;
    }

    if (certification) {
      filter.certifications = certification;
    }

    const data = await Supplier.find(filter).sort({ name: 1 }).lean();

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    return NextResponse.json({ data: [], error: error instanceof Error ? error.message : "Failed to fetch suppliers" }, { status: 500 });
  }
}
