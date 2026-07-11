import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import ConnectionRequest from "@/models/ConnectionRequest";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { notifyConnectionRequest } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure User model is registered for populate
    void User;

    // Get connections where user is requester or supplier
    const data = await ConnectionRequest.find({
      $or: [
        { requesterId: user.userId },
        { supplierId: user.userId },
      ],
    })
      .populate("requesterId", "fullName companyName")
      .populate("supplierId", "fullName companyName")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { supplier_id, intent, message } = body;

    if (!supplier_id || !intent) {
      return NextResponse.json({ error: "Supplier ID and intent required" }, { status: 400 });
    }

    // Check for existing connection request (unique index will also catch this)
    const existing = await ConnectionRequest.findOne({
      requesterId: user.userId,
      supplierId: supplier_id,
    });

    if (existing) {
      return NextResponse.json({ error: "Connection request already sent" }, { status: 409 });
    }

    const data = await ConnectionRequest.create({
      requesterId: user.userId,
      supplierId: supplier_id,
      intent,
      message: message || null,
    });

    // Notify the supplier about the connection request
    const requester = await User.findById(user.userId).select("fullName companyName").lean();
    const requesterName = (requester as any)?.companyName || (requester as any)?.fullName || "Someone";
    notifyConnectionRequest(
      supplier_id,
      requesterName,
      data._id.toString()
    ).catch(() => {});

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    // Handle duplicate key error from unique index
    if (error?.code === 11000) {
      return NextResponse.json({ error: "Connection request already sent" }, { status: 409 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send connection request" },
      { status: 500 }
    );
  }
}
