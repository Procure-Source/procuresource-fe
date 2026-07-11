import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Brand from "@/models/Brand";
import SupplierProduct from "@/models/SupplierProduct";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const products = await SupplierProduct.find({ supplierId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get brand names for brandId references
    const brandIds = products.map((p: any) => p.brandId).filter(Boolean);
    const brands = brandIds.length > 0
      ? await Brand.find({ _id: { $in: brandIds } }).select("_id name").lean()
      : [];
    const brandMap = new Map(brands.map((b: any) => [b._id.toString(), b.name]));

    const wb = XLSX.utils.book_new();

    // Build rows: one row per product-certification pair
    const rows: any[] = [];
    for (const p of products as any[]) {
      const brandName = p.brandId ? brandMap.get(p.brandId.toString()) || p.brand || "" : p.brand || "";
      const certs = p.certifications || [];

      if (certs.length > 0) {
        for (const cert of certs) {
          rows.push({
            Brand: brandName,
            "Product Category": p.category || "",
            "Product Type": p.productType || "",
            "Individual Product": p.name || "",
            "Certification Type": cert.certificationType || "",
            "Standard / Code": cert.standard || cert.certificateNumber || "",
            "Issuing Authority": cert.issuingAuthority || "",
            Mandatory: cert.mandatory || "",
            "Applies In": cert.appliesIn || "",
            Notes: cert.notes || "",
          });
        }
      } else {
        // Product with no certifications — still export one row
        rows.push({
          Brand: brandName,
          "Product Category": p.category || "",
          "Product Type": p.productType || "",
          "Individual Product": p.name || "",
          "Certification Type": "",
          "Standard / Code": "",
          "Issuing Authority": "",
          Mandatory: "",
          "Applies In": "",
          Notes: "",
        });
      }
    }

    const emptyRow = {
      Brand: "", "Product Category": "", "Product Type": "", "Individual Product": "",
      "Certification Type": "", "Standard / Code": "", "Issuing Authority": "",
      Mandatory: "", "Applies In": "", Notes: "",
    };

    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [emptyRow]);

    ws["!cols"] = [
      { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 35 },
      { wch: 30 }, { wch: 35 }, { wch: 30 },
      { wch: 12 }, { wch: 15 }, { wch: 35 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Products");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=my-products.xlsx",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export" },
      { status: 500 }
    );
  }
}
