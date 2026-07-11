import connectDB from "@/lib/db";
import Brand from "@/models/Brand";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const brands = await Brand.find().sort({ name: 1 }).lean();

    return NextResponse.json(brands || []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch brands" }, { status: 500 });
  }
}
