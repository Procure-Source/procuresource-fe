import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import UserDocument from "@/models/UserDocument";

// GET /api/user-documents — List documents for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const docs = await UserDocument.find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .lean();

    const result = docs.map((doc: any) => ({
      _id: doc._id,
      id: doc._id,
      userId: doc.userId,
      documentType: doc.documentType,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      verifiedAt: doc.verifiedAt || null,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
