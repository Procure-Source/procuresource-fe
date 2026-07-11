import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SupplierProduct from "@/models/SupplierProduct";
import { notifyProductReview } from "@/lib/notifications";
import { getAdminFromRequest, requireAdminTag } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "verification_team", "category_manager"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const data = await SupplierProduct.find({ status })
      .populate("supplierId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "verification_team", "category_manager"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { id, action, rejection_reason } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Product ID and action required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      reviewedAt: new Date(),
    };

    if (action === "approve") {
      updates.status = "approved";
    } else if (action === "reject") {
      updates.status = "rejected";
      updates.rejectionReason = rejection_reason || "Does not meet platform standards";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const data = await SupplierProduct.findByIdAndUpdate(id, updates, { new: true });
    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Notify the supplier about the product review decision
    notifyProductReview(
      String(data.supplierId),
      data.name,
      id,
      action === "approve",
      action === "reject" ? (rejection_reason || undefined) : undefined
    ).catch(() => {});

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    );
  }
}
