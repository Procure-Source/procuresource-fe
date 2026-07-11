import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UserDocument from "@/models/UserDocument";
import User from "@/models/User";
import Supplier from "@/models/Supplier";
import { isSupplySideRole } from "@/lib/tags";

function isAdmin(request: NextRequest): boolean {
  const adminAuth = request.cookies.get("admin_auth")?.value;
  if (!adminAuth) return false;
  try {
    const [username, password] = Buffer.from(adminAuth, "base64").toString().split(":");
    return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const docs = await UserDocument.find({ verifiedAt: null })
    .sort({ createdAt: -1 })
    .lean();

  const userIds = [...new Set(docs.map((d: any) => d.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = Object.fromEntries(users.map((u: any) => [u._id.toString(), u]));

  const result = docs.map((doc: any) => {
    const u = userMap[doc.userId.toString()];
    return {
      ...doc,
      id: doc._id,
      user_id: doc.userId,
      document_type: doc.documentType,
      file_name: doc.fileName,
      file_url: doc.fileUrl,
      created_at: doc.createdAt,
      profiles: u
        ? { full_name: u.fullName, company_name: u.companyName, role: u.role }
        : null,
    };
  });

  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id, userId, role, action } = await request.json();

  if (action === "verify") {
    await UserDocument.findByIdAndUpdate(id, { verifiedAt: new Date() });

    // Check if all docs for this user are now verified
    const allDocs = await UserDocument.find({ userId }).lean();
    const allVerified = allDocs.every((d: any) => d.verifiedAt);
    if (allVerified) {
      await User.findByIdAndUpdate(userId, { isVerified: true });
      if (isSupplySideRole(role)) {
        await Supplier.findOneAndUpdate({ userId }, { isVerified: true });
      }
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
