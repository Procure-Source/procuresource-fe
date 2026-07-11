import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification link. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark email as verified and clear token
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Auto-login the user after verification
    const jwtToken = signToken({ userId: user._id.toString(), email: user.email, role: user.role, tags: user.tags || [] });
    const response = NextResponse.json({
      message: "Email verified successfully!",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        role: user.role,
      },
    });

    setAuthCookie(response, jwtToken);
    return response;
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
