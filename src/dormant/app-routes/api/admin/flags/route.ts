import connectDB from "@/lib/db";
import FlaggedContent from "@/models/FlaggedContent";
import SupplierProduct from "@/models/SupplierProduct";
import Supplier from "@/models/Supplier";
import Rfq from "@/models/Rfq";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest, requireAdminTag } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "support_team"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    // Ensure models are registered for populate
    void User;

    const data = await FlaggedContent.find({ status })
      .populate("flaggedBy", "fullName companyName")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with content details
    const enriched = await Promise.all(
      (data || []).map(async (flag: any) => {
        let contentPreview = null;
        if (flag.contentType === "supplier_product") {
          const product = await SupplierProduct.findById(flag.contentId)
            .select("name brand category")
            .lean();
          contentPreview = product ? `${product.name} (${product.brand || "No brand"})` : "Deleted product";
        } else if (flag.contentType === "supplier_profile") {
          const supplier = await Supplier.findById(flag.contentId)
            .select("name country")
            .lean();
          contentPreview = supplier ? `${supplier.name} - ${supplier.country}` : "Deleted supplier";
        } else if (flag.contentType === "rfq") {
          const rfq = await Rfq.findById(flag.contentId)
            .select("title")
            .lean();
          contentPreview = rfq ? rfq.title : "Deleted RFQ";
        }
        return { ...flag, contentPreview };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch flags" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "support_team"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await request.json();
    const { id, action, review_note } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    const newStatus = action === "dismiss" ? "dismissed" : "action_taken";

    const flag = await FlaggedContent.findByIdAndUpdate(
      id,
      {
        $set: {
          status: newStatus,
          reviewedBy: "admin",
          reviewNote: review_note || null,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!flag) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    }

    // If taking action on a supplier product, reject it
    if (action === "take_action" && flag.contentType === "supplier_product") {
      await SupplierProduct.findByIdAndUpdate(flag.contentId, {
        $set: {
          status: "rejected",
          rejectionReason: review_note || "Flagged by users",
          reviewedAt: new Date(),
        },
      });
    }

    return NextResponse.json(flag);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update flag" }, { status: 500 });
  }
}
