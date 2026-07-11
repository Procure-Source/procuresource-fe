import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RfqInvitation from "@/models/RfqInvitation";
import Rfq from "@/models/Rfq";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure Rfq model is registered for populate
    void Rfq;

    const data = await RfqInvitation.find({ supplierId: user.userId })
      .populate("rfqId")
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

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, declineReason, backupContactName, backupContactEmail, backupContactPhone } = body;

    const updates: Record<string, unknown> = {};
    if (status === "viewed") {
      updates.status = "viewed";
      updates.viewedAt = new Date();
    }
    if (status === "declined") {
      updates.status = "declined";
      updates.declinedAt = new Date();
      updates.declineReason = declineReason || "Supplier declined without a reason";
    }
    if (status === "responded") {
      updates.status = "responded";
      updates.respondedAt = new Date();
    }
    if (status === "no_response") {
      updates.status = "no_response";
      updates.escalationNotifiedAt = new Date();
    }
    if (status === "escalated") {
      updates.status = "escalated";
      updates.escalationNotifiedAt = new Date();
    }
    if (status === "expired") {
      updates.status = "expired";
    }
    if (status === "agent_non_responsive") {
      updates.status = "agent_non_responsive";
      updates.agentNonResponsiveAt = new Date();
      updates.responseScoreImpact = -1;
    }
    if (status === "backup_contacted") {
      updates.status = "backup_contacted";
      updates.backupContactedAt = new Date();
      if (backupContactName) updates.backupContactName = backupContactName;
      if (backupContactEmail) updates.backupContactEmail = backupContactEmail;
      if (backupContactPhone) updates.backupContactPhone = backupContactPhone;
    }

    if (!updates.status && !updates.viewedAt) {
      return NextResponse.json({ error: "Unsupported invitation status" }, { status: 400 });
    }

    const data = await RfqInvitation.findOneAndUpdate(
      { _id: id, supplierId: user.userId },
      { $set: updates },
      { new: true }
    ).lean();

    if (!data) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update invitation" },
      { status: 500 }
    );
  }
}
