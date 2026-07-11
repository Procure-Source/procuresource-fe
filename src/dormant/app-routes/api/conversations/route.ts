import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";

// GET /api/conversations — List user's conversations
export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const conversations = await Conversation.find({
      participants: auth.userId,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Get participant details and unread counts
    const participantIds = [
      ...new Set(
        conversations.flatMap((c: any) =>
          c.participants.map((p: any) => String(p))
        )
      ),
    ];

    const users = await User.find({ _id: { $in: participantIds } })
      .select("fullName companyName email")
      .lean();

    const userMap = new Map(
      users.map((u: any) => [String(u._id), u])
    );

    // Get unread counts per conversation
    const convIds = conversations.map((c: any) => c._id);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: convIds },
          readBy: { $ne: auth.userId },
          senderId: { $ne: auth.userId },
        },
      },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } },
    ]);

    const unreadMap = new Map(
      unreadCounts.map((u: any) => [String(u._id), u.count])
    );

    const data = conversations.map((c: any) => {
      const otherParticipants = c.participants
        .map((p: any) => String(p))
        .filter((p: string) => p !== auth.userId)
        .map((p: string) => {
          const u = userMap.get(p);
          return u
            ? {
                id: p,
                fullName: u.fullName,
                companyName: u.companyName || null,
              }
            : { id: p, fullName: "Unknown", companyName: null };
        });

      return {
        id: c._id,
        type: c.type,
        title: c.title || null,
        rfqId: c.rfqId || null,
        contractId: c.contractId || null,
        participants: otherParticipants,
        lastMessageAt: c.lastMessageAt,
        lastMessagePreview: c.lastMessagePreview || null,
        unreadCount: unreadMap.get(String(c._id)) || 0,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch conversations",
      },
      { status: 500 }
    );
  }
}

// POST /api/conversations — Create or find existing conversation
export async function POST(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { recipientId, type, rfqId, contractId, title } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    if (recipientId === auth.userId) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    // Check if conversation already exists between these users
    const query: any = {
      participants: { $all: [auth.userId, recipientId], $size: 2 },
    };

    // For RFQ/contract conversations, match by reference too
    if (type === "rfq" && rfqId) {
      query.rfqId = rfqId;
    } else if (type === "contract" && contractId) {
      query.contractId = contractId;
    }

    let conversation = await Conversation.findOne(query).lean();

    if (!conversation) {
      const newConv = await Conversation.create({
        participants: [auth.userId, recipientId],
        type: type || "direct",
        rfqId: rfqId || undefined,
        contractId: contractId || undefined,
        title: title || undefined,
      });
      conversation = newConv.toObject();
    }

    // Get recipient info
    const recipient = await User.findById(recipientId)
      .select("fullName companyName")
      .lean();

    return NextResponse.json({
      id: (conversation as any)._id,
      type: (conversation as any).type,
      title: (conversation as any).title || null,
      rfqId: (conversation as any).rfqId || null,
      contractId: (conversation as any).contractId || null,
      participants: [
        {
          id: recipientId,
          fullName: (recipient as any)?.fullName || "Unknown",
          companyName: (recipient as any)?.companyName || null,
        },
      ],
      lastMessageAt: (conversation as any).lastMessageAt,
      lastMessagePreview: (conversation as any).lastMessagePreview || null,
      unreadCount: 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create conversation",
      },
      { status: 500 }
    );
  }
}
