import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAdminFromRequest, requireAdminTag } from "@/lib/admin-auth";
import { PLATFORM_TAGS } from "@/lib/tags";

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!requireAdminTag(admin, ["super_admin"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const admins = await User.find({ role: "admin" })
      .select("email fullName tags createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const result = admins.map((u: any) => ({
      id: u._id,
      email: u.email,
      fullName: u.fullName,
      tags: u.tags || [],
      createdAt: u.createdAt,
    }));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list admin team" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!requireAdminTag(admin, ["super_admin"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { userId, tags } = await request.json();

    if (!userId || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "userId and tags array are required" },
        { status: 400 }
      );
    }

    // Validate that all tags are valid PLATFORM_TAGS
    const validTags: readonly string[] = PLATFORM_TAGS;
    const invalidTags = tags.filter((t: string) => !validTags.includes(t));
    if (invalidTags.length > 0) {
      return NextResponse.json(
        { error: `Invalid tags: ${invalidTags.join(", ")}` },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, role: "admin" },
      { tags },
      { new: true }
    )
      .select("email fullName tags createdAt")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: (user as any)._id,
      email: (user as any).email,
      fullName: (user as any).fullName,
      tags: (user as any).tags || [],
      createdAt: (user as any).createdAt,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update admin team member" },
      { status: 500 }
    );
  }
}
