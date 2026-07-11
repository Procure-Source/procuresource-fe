import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RfqSubmission from "@/models/RfqSubmission";
import Contract from "@/models/Contract";
import SupplierProduct from "@/models/SupplierProduct";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Quote submissions over time
    const submissions = await RfqSubmission.find({ supplierId: user.userId })
      .select("status createdAt")
      .sort({ createdAt: 1 })
      .lean();

    // Aggregate by month
    const monthlyQuotes: Record<string, { total: number; accepted: number }> = {};
    (submissions || []).forEach((s: any) => {
      if (s.createdAt) {
        const d = new Date(s.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyQuotes[key]) monthlyQuotes[key] = { total: 0, accepted: 0 };
        monthlyQuotes[key].total++;
        if (s.status === "accepted") monthlyQuotes[key].accepted++;
      }
    });

    const now = new Date();
    const quoteHistory = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const data = monthlyQuotes[key] || { total: 0, accepted: 0 };
      quoteHistory.push({
        month: label,
        total: data.total,
        accepted: data.accepted,
        winRate: data.total > 0 ? Math.round((data.accepted / data.total) * 100) : 0,
      });
    }

    // Contract revenue by month
    const contracts = await Contract.find({ supplierId: user.userId })
      .select("totalValue currency createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const monthlyRevenue: Record<string, number> = {};
    (contracts || []).forEach((c: any) => {
      if (c.createdAt && c.totalValue) {
        const d = new Date(c.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(c.totalValue);
      }
    });

    const revenueHistory = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      revenueHistory.push({ month: label, revenue: monthlyRevenue[key] || 0 });
    }

    // Product status
    const products = await SupplierProduct.find({ supplierId: user.userId })
      .select("status")
      .lean();

    const productStatus = {
      approved: products?.filter((p: any) => p.status === "approved").length || 0,
      pending: products?.filter((p: any) => p.status === "pending").length || 0,
      rejected: products?.filter((p: any) => p.status === "rejected").length || 0,
    };

    // Summary
    const totalSubmissions = submissions?.length || 0;
    const acceptedSubmissions = submissions?.filter((s: any) => s.status === "accepted").length || 0;
    const totalRevenue = (contracts || []).reduce((sum: number, c: any) => sum + (Number(c.totalValue) || 0), 0);

    return NextResponse.json({
      summary: {
        totalQuotes: totalSubmissions,
        winRate: totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0,
        totalRevenue,
        totalContracts: contracts?.length || 0,
        totalProducts: products?.length || 0,
      },
      quoteHistory,
      revenueHistory,
      productStatus,
      quoteBreakdown: {
        pending: submissions?.filter((s: any) => s.status === "pending").length || 0,
        accepted: acceptedSubmissions,
        rejected: submissions?.filter((s: any) => s.status === "rejected").length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch analytics" }, { status: 500 });
  }
}
