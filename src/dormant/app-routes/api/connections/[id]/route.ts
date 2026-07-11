import connectDB from "@/lib/db";
import ConnectionRequest from "@/models/ConnectionRequest";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { notifyConnectionResponse } from "@/lib/notifications";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["accepted", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const data = await ConnectionRequest.findByIdAndUpdate(
      id,
      { $set: { status, respondedAt: new Date() } },
      { new: true }
    ).lean();

    if (!data) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Notify the requester about the connection response
    const supplier = await User.findById((data as any).supplierId).select("fullName companyName").lean();
    const supplierName = (supplier as any)?.companyName || (supplier as any)?.fullName || "A supplier";
    notifyConnectionResponse(
      String((data as any).requesterId),
      supplierName,
      status === "accepted",
      id
    ).catch(() => {});

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update connection" },
      { status: 500 }
    );
  }
}
