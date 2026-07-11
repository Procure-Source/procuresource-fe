import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

// PUT /api/conversations/[id]/read — Mark all messages in conversation as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: id,
      participants: auth.userId,
    }).lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Add userId to readBy for all unread messages in this conversation
    await Message.updateMany(
      {
        conversationId: id,
        readBy: { $ne: auth.userId },
      },
      { $addToSet: { readBy: auth.userId } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark as read",
      },
      { status: 500 }
    );
  }
}
