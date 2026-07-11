import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Notification from "@/models/Notification";

// GET /api/notifications — List user's notifications (paginated)
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const unreadOnly = searchParams.get("unread") === "true";

    const query: any = { userId: auth.userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    const data = notifications.map((n: any) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link || null,
      referenceId: n.referenceId || null,
      referenceType: n.referenceType || null,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    return NextResponse.json({
      notifications: data,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications — Mark all as read
export async function PUT(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    await Notification.updateMany(
      { userId: auth.userId, isRead: false },
      { isRead: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update notifications" },
      { status: 500 }
    );
  }
}
