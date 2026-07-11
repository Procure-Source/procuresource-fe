import connectDB from "@/lib/db";
import EquipmentType from "@/models/EquipmentType";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const data = await EquipmentType.find().sort({ name: 1 }).lean();

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch equipment types" }, { status: 500 });
  }
}
