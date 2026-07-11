import connectDB from "@/lib/db";
import RfqInvitation from "@/models/RfqInvitation";
import User from "@/models/User";
import Supplier from "@/models/Supplier";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rfqId: string }> }
) {
  try {
    await connectDB();

    const { rfqId } = await params;

    // Ensure models are registered for populate
    void User;
    void Supplier;

    const data = await RfqInvitation.find({ rfqId })
      .populate("supplierId", "fullName companyName")
      .sort({ invitedAt: -1 })
      .lean();

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
