import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

// GET /api/messages/unread-count — Total unread message count for badge
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all conversation IDs where user is a participant
    const conversations = await Conversation.find({
      participants: auth.userId,
    })
      .select("_id")
      .lean();

    const convIds = conversations.map((c: any) => c._id);

    if (convIds.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    const count = await Message.countDocuments({
      conversationId: { $in: convIds },
      senderId: { $ne: auth.userId },
      readBy: { $ne: auth.userId },
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get count",
      },
      { status: 500 }
    );
  }
}
