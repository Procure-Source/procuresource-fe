import connectDB from "@/lib/db";
import User from "@/models/User";
import Supplier from "@/models/Supplier";
import Rfq from "@/models/Rfq";
import SupplierProduct from "@/models/SupplierProduct";
import Contract from "@/models/Contract";
import RfqSubmission from "@/models/RfqSubmission";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest, requireAdminTag } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "sales_team", "finance_team"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Totals
    const [totalUsers, totalSuppliers, verifiedSuppliers, totalRfqs, totalProducts, totalContracts] =
      await Promise.all([
        User.countDocuments(),
        Supplier.countDocuments(),
        Supplier.countDocuments({ isVerified: true }),
        Rfq.countDocuments(),
        SupplierProduct.countDocuments(),
        Contract.countDocuments(),
      ]);

    // User registrations by month (last 12 months)
    const profiles = await User.find()
      .select("createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const userGrowth = aggregateByMonth(profiles || [], "createdAt");

    // RFQ volume by month
    const rfqs = await Rfq.find()
      .select("createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const rfqVolume = aggregateByMonth(rfqs || [], "createdAt");

    // Quote conversion rates
    const submissions = await RfqSubmission.find()
      .select("status")
      .lean();

    const quoteConversion = {
      pending: submissions?.filter((s: any) => s.status === "pending").length || 0,
      accepted: submissions?.filter((s: any) => s.status === "accepted").length || 0,
      rejected: submissions?.filter((s: any) => s.status === "rejected").length || 0,
    };

    // Supplier product status
    const products = await SupplierProduct.find()
      .select("status")
      .lean();

    const productStatus = {
      approved: products?.filter((p: any) => p.status === "approved").length || 0,
      pending: products?.filter((p: any) => p.status === "pending").length || 0,
      rejected: products?.filter((p: any) => p.status === "rejected").length || 0,
    };

    return NextResponse.json({
      totals: {
        users: totalUsers || 0,
        suppliers: totalSuppliers || 0,
        verifiedSuppliers: verifiedSuppliers || 0,
        rfqs: totalRfqs || 0,
        products: totalProducts || 0,
        contracts: totalContracts || 0,
      },
      userGrowth,
      rfqVolume,
      quoteConversion,
      productStatus,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch analytics" }, { status: 500 });
  }
}

function aggregateByMonth(items: any[], dateField: string) {
  const months: Record<string, number> = {};
  items.forEach((item) => {
    if (item[dateField]) {
      const d = new Date(item[dateField]);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + 1;
    }
  });

  // Return last 12 months
  const result = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    result.push({ month: label, count: months[key] || 0 });
  }
  return result;
}
