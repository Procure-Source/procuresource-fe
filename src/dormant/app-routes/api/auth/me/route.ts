import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest, signToken, setAuthCookie } from "@/lib/auth";
import User from "@/models/User";
import { getDefaultTagsForRole, isValidUserRole } from "@/lib/tags";

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(auth.userId).select("-passwordHash").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        role: user.role,
        tags: user.tags || [],
        isVerified: user.isVerified ?? false,
      },
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { role, tags } = await request.json();
    if (!isValidUserRole(role) || role === "admin") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectDB();

    const update: Record<string, unknown> = { role };
    update.tags = Array.from(new Set([
      ...getDefaultTagsForRole(role),
      ...(Array.isArray(tags) ? tags.filter((tag) => typeof tag === "string") : []),
    ]));

    const user = await User.findByIdAndUpdate(auth.userId, update, { new: true }).select("-passwordHash").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Re-sign token with new role and tags
    const token = signToken({ userId: String(user._id), email: user.email, role: user.role, tags: (user as any).tags || [] });
    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        role: user.role,
        tags: (user as any).tags || [],
        isVerified: user.isVerified ?? false,
      },
    });
    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Auth update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
