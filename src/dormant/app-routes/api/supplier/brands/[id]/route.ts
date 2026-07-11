import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Brand from "@/models/Brand";
import SupplierProduct from "@/models/SupplierProduct";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const brand = await Brand.findOne({ _id: id, createdBy: user.userId });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, category, description, logoUrl, websiteUrl } = body;

    if (name !== undefined) brand.name = name.trim();
    if (category !== undefined) brand.category = category || undefined;
    if (description !== undefined) brand.description = description || undefined;
    if (logoUrl !== undefined) brand.logoUrl = logoUrl || undefined;
    if (websiteUrl !== undefined) brand.websiteUrl = websiteUrl || undefined;

    await brand.save();

    return NextResponse.json(brand);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const brand = await Brand.findOne({ _id: id, createdBy: user.userId });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Unlink products from this brand
    await SupplierProduct.updateMany(
      { brandId: id },
      { $unset: { brandId: "" } }
    );

    await Brand.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete brand" },
      { status: 500 }
    );
  }
}
