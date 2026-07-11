import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import SupplierProduct from "@/models/SupplierProduct";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();

    const product = await SupplierProduct.findById(id).select("certifications").lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return certifications sorted by createdAt descending
    const certifications = (product.certifications || []).sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(certifications);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch certifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const product = await SupplierProduct.findById(id).select("supplierId").lean();
    if (!product || String(product.supplierId) !== user.userId) {
      return NextResponse.json({ error: "Not authorized to modify this product" }, { status: 403 });
    }

    const body = await request.json();
    const { certification_type, certificate_number, file_url, file_name, issued_date, expiry_date } = body;

    if (!certification_type) {
      return NextResponse.json({ error: "certification_type is required" }, { status: 400 });
    }

    const certification = {
      certificationType: certification_type,
      certificateNumber: certificate_number || null,
      fileUrl: file_url || null,
      fileName: file_name || null,
      issuedDate: issued_date || null,
      expiryDate: expiry_date || null,
      createdAt: new Date(),
    };

    const updated = await SupplierProduct.findByIdAndUpdate(
      id,
      { $push: { certifications: certification } },
      { new: true }
    ).lean();

    // Return the last added certification
    const added = updated!.certifications[updated!.certifications.length - 1];

    return NextResponse.json(added, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add certification" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const certId = searchParams.get("cert_id");

    if (!certId) {
      return NextResponse.json({ error: "cert_id is required" }, { status: 400 });
    }

    await SupplierProduct.findByIdAndUpdate(id, {
      $pull: { certifications: { _id: certId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete certification" }, { status: 500 });
  }
}
