import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { createNotification } from "@/lib/notifications";

// GET /api/conversations/[id]/messages — List messages (paginated)
export async function GET(
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 30));

    const [messages, total] = await Promise.all([
      Message.find({ conversationId: id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Message.countDocuments({ conversationId: id }),
    ]);

    const data = messages.reverse().map((m: any) => ({
      id: m._id,
      senderId: m.senderId,
      content: m.content,
      contentType: m.contentType,
      fileUrl: m.fileUrl || null,
      fileName: m.fileName || null,
      readBy: m.readBy?.map((r: any) => String(r)) || [],
      createdAt: m.createdAt,
    }));

    return NextResponse.json({
      messages: data,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/messages — Send a message
export async function POST(
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

    const body = await request.json();
    const { content, contentType, fileUrl, fileName } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const message = await Message.create({
      conversationId: id,
      senderId: auth.userId,
      content,
      contentType: contentType || "text",
      fileUrl: fileUrl || undefined,
      fileName: fileName || undefined,
      readBy: [auth.userId],
    });

    // Update conversation's lastMessageAt and preview
    const preview =
      content.length > 80 ? content.substring(0, 80) + "..." : content;
    await Conversation.findByIdAndUpdate(id, {
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
    });

    // Notify other participants (non-blocking)
    const otherParticipants = (conversation as any).participants
      .map((p: any) => String(p))
      .filter((p: string) => p !== auth.userId);

    for (const recipientId of otherParticipants) {
      createNotification({
        userId: recipientId,
        type: "new_message",
        title: "New Message",
        message: `you have a new message: "${preview}"`,
        link: `/messages/${id}`,
        referenceId: id,
        referenceType: "conversation",
        sendEmail: false,
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        id: message._id,
        senderId: message.senderId,
        content: message.content,
        contentType: message.contentType,
        fileUrl: message.fileUrl || null,
        fileName: message.fileName || null,
        readBy: [auth.userId],
        createdAt: message.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 }
    );
  }
}
