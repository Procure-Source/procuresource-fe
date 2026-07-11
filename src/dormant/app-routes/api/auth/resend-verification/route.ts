import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateToken, tokenExpiry, sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase(), emailVerified: false });

    // Always return success to avoid leaking whether an email exists
    if (!user) {
      return NextResponse.json({
        message: "If an unverified account with that email exists, we've sent a new verification link.",
      });
    }

    // Generate new verification token
    const verificationToken = generateToken();
    const verificationExpires = tokenExpiry(24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.fullName, verificationToken);
    } catch (emailError) {
      console.error("Failed to resend verification email:", emailError);
    }

    return NextResponse.json({
      message: "If an unverified account with that email exists, we've sent a new verification link.",
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
