import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Notification from "@/models/Notification";

// GET /api/notifications/count — Get unread notification count
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const count = await Notification.countDocuments({
      userId: auth.userId,
      isRead: false,
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get count" },
      { status: 500 }
    );
  }
}
