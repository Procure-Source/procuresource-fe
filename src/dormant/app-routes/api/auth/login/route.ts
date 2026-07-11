import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import User from "@/models/User";

function authServiceError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|querySrv|Mongo/i.test(message)) {
    return NextResponse.json(
      { error: "Authentication service is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  return NextResponse.json({ error: "Login failed" }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    // Block unverified users
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in.", code: "EMAIL_NOT_VERIFIED" },
        { status: 403 }
      );
    }

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role, tags: user.tags || [] });
    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        role: user.role,
        tags: user.tags || [],
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return authServiceError(error);
  }
}
