import connectDB from "@/lib/db";
import SupplierProduct from "@/models/SupplierProduct";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    const allowed: Record<string, string> = {
      name: "name",
      brand: "brand",
      brand_id: "brandId",
      category: "category",
      model_number: "modelNumber",
      description: "description",
      technical_specs: "technicalSpecs",
      price_range_min: "priceRangeMin",
      price_range_max: "priceRangeMax",
      currency: "currency",
      availability: "availability",
      service_regions: "serviceRegions",
    };

    for (const [bodyKey, modelKey] of Object.entries(allowed)) {
      if (body[bodyKey] !== undefined) updates[modelKey] = body[bodyKey];
    }

    // If resubmitting after rejection, reset status to pending
    if (body.resubmit) {
      updates.status = "pending";
      updates.rejectionReason = null;
      updates.reviewedAt = null;
    }

    const data = await SupplierProduct.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean();

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    await SupplierProduct.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 }
    );
  }
}
