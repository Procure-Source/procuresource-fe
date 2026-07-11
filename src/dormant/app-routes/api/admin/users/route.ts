import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import UserDocument from "@/models/UserDocument";
import { notifyUserVerified } from "@/lib/notifications";
import { getAdminFromRequest, requireAdminTag } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "verification_team", "support_team"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "";

  // Build query
  const query: any = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }
  if (roleFilter) {
    query.role = roleFilter;
  }

  const users = await User.find(query)
    .select("-passwordHash -emailVerificationToken -passwordResetToken")
    .sort({ createdAt: -1 })
    .lean();

  // Fetch all documents for these users
  const userIds = users.map((u: any) => u._id);
  const docs = await UserDocument.find({ userId: { $in: userIds } }).sort({ createdAt: -1 }).lean();

  // Group docs by userId
  const docsByUser: Record<string, any[]> = {};
  for (const doc of docs) {
    const uid = (doc as any).userId.toString();
    if (!docsByUser[uid]) docsByUser[uid] = [];
    docsByUser[uid].push({
      id: (doc as any)._id,
      documentType: (doc as any).documentType,
      fileName: (doc as any).fileName,
      fileUrl: (doc as any).fileUrl,
      verifiedAt: (doc as any).verifiedAt || null,
      createdAt: (doc as any).createdAt,
    });
  }

  const result = users.map((u: any) => ({
    id: u._id,
    email: u.email,
    fullName: u.fullName,
    companyName: u.companyName,
    role: u.role,
    tags: u.tags || [],
    phone: u.phone,
    accountStatus: u.accountStatus || (u.isVerified ? "active" : "document_review"),
    verificationDueAt: u.verificationDueAt || null,
    suspendedAt: u.suspendedAt || null,
    suspensionReason: u.suspensionReason || null,
    reactivationRequestedAt: u.reactivationRequestedAt || null,
    backupContacts: u.backupContacts || [],
    isVerified: u.isVerified || false,
    emailVerified: u.emailVerified || false,
    createdAt: u.createdAt,
    documents: docsByUser[u._id.toString()] || [],
  }));

  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "verification_team", "support_team"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const { userId, action, documentId, tags, reason } = body;

  // Update user tags
  if (action === "update_tags" && userId && Array.isArray(tags)) {
    const user = await User.findByIdAndUpdate(userId, { tags }, { new: true }).select("tags").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, tags: (user as any).tags });
  }

  // Individual document verification
  if (action === "verify_document" && documentId) {
    const doc = await UserDocument.findByIdAndUpdate(
      documentId,
      { verifiedAt: new Date() },
      { new: true }
    );
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, documentId, verifiedAt: doc.verifiedAt });
  }

  if (action === "unverify_document" && documentId) {
    const doc = await UserDocument.findByIdAndUpdate(
      documentId,
      { $unset: { verifiedAt: "" } },
      { new: true }
    );
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, documentId, verifiedAt: null });
  }

  // User-level verification
  if (!userId || !["verify", "unverify", "request_resubmission", "suspend", "request_reactivation"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (action === "verify") {
    const verificationDueAt = new Date();
    verificationDueAt.setDate(verificationDueAt.getDate() + 90);
    await User.findByIdAndUpdate(userId, {
      isVerified: true,
      accountStatus: "active",
      verificationDueAt,
      $unset: {
        suspendedAt: "",
        suspensionReason: "",
        reactivationRequestedAt: "",
      },
    });
    await UserDocument.updateMany(
      { userId, verifiedAt: null },
      { verifiedAt: new Date() }
    );
    // Notify user they've been verified
    notifyUserVerified(userId).catch(() => {});
    return NextResponse.json({ success: true, isVerified: true });
  }

  if (action === "unverify") {
    await User.findByIdAndUpdate(userId, {
      isVerified: false,
      accountStatus: "document_review",
      $unset: { verificationDueAt: "" },
    });
    await UserDocument.updateMany(
      { userId },
      { $unset: { verifiedAt: "" } }
    );
    return NextResponse.json({ success: true, isVerified: false });
  }

  if (action === "request_resubmission") {
    await User.findByIdAndUpdate(userId, {
      isVerified: false,
      accountStatus: "resubmission_required",
      suspensionReason: reason || "Documents insufficient; updated evidence required",
      $unset: { verificationDueAt: "" },
    });
    return NextResponse.json({ success: true, accountStatus: "resubmission_required" });
  }

  if (action === "suspend") {
    await User.findByIdAndUpdate(userId, {
      isVerified: false,
      accountStatus: "suspended",
      suspendedAt: new Date(),
      suspensionReason: reason || "Verification failed or authorization evidence is no longer acceptable",
      $unset: { verificationDueAt: "" },
    });
    return NextResponse.json({ success: true, accountStatus: "suspended" });
  }

  if (action === "request_reactivation") {
    await User.findByIdAndUpdate(userId, {
      isVerified: false,
      accountStatus: "reactivation_pending",
      reactivationRequestedAt: new Date(),
    });
    return NextResponse.json({ success: true, accountStatus: "reactivation_pending" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
