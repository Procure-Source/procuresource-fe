import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import UserDocument from "@/models/UserDocument";

export async function POST(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documents } = await request.json();
    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json({ error: "No documents provided" }, { status: 400 });
    }

    await connectDB();

    const created = [];
    for (const doc of documents) {
      if (doc.fileUrl && doc.documentType) {
        const userDoc = await UserDocument.create({
          userId: auth.userId,
          documentType: doc.documentType,
          fileName: doc.fileName || "document",
          fileUrl: doc.fileUrl,
        });
        created.push(userDoc);
      }
    }

    return NextResponse.json({ documents: created }, { status: 201 });
  } catch (error: any) {
    console.error("Document save error:", error);
    return NextResponse.json({ error: error.message || "Failed to save documents" }, { status: 500 });
  }
}
