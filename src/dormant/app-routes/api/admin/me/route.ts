import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAdminFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Legacy admin acts as super_admin
    if (admin.type === "legacy") {
      return NextResponse.json({
        type: "legacy",
        username: admin.username,
        tags: ["super_admin"],
      });
    }

    // JWT admin - look up full user from DB
    await connectDB();

    const user = await User.findById(admin.payload.userId)
      .select("email fullName tags")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      type: "jwt",
      id: (user as any)._id,
      email: (user as any).email,
      fullName: (user as any).fullName,
      tags: (user as any).tags || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get admin profile" },
      { status: 500 }
    );
  }
}
