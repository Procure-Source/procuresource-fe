import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import FlaggedContent from "@/models/FlaggedContent";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await FlaggedContent.find({ flaggedBy: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch flags" }, { status: 500 });
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
    const { content_type, content_id, reason, description } = body;

    if (!content_type || !content_id || !reason) {
      return NextResponse.json({ error: "content_type, content_id, and reason are required" }, { status: 400 });
    }

    // Check for existing flag (unique index will also catch this)
    const existing = await FlaggedContent.findOne({
      contentType: content_type,
      contentId: content_id,
      flaggedBy: user.userId,
    });

    if (existing) {
      return NextResponse.json({ error: "You have already flagged this content" }, { status: 409 });
    }

    const data = await FlaggedContent.create({
      contentType: content_type,
      contentId: content_id,
      flaggedBy: user.userId,
      reason,
      description: description || null,
      status: "pending",
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    // Handle duplicate key error from unique index
    if (error?.code === 11000) {
      return NextResponse.json({ error: "You have already flagged this content" }, { status: 409 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create flag" }, { status: 500 });
  }
}
