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

    const brands = await Brand.find({ createdBy: user.userId }).sort({ createdAt: -1 }).lean();
    const products = await SupplierProduct.find({ supplierId: user.userId }).sort({ createdAt: -1 }).lean();

    const wb = XLSX.utils.book_new();

    // Brands sheet
    const brandRows = brands.map((b: any) => ({
      Name: b.name,
      Category: b.category || "",
      Description: b.description || "",
      Website: b.websiteUrl || "",
      "Logo URL": b.logoUrl || "",
      Verified: b.verified ? "Yes" : "No",
      "Created At": b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "",
    }));
    const brandSheet = XLSX.utils.json_to_sheet(brandRows.length > 0 ? brandRows : [{ Name: "", Category: "", Description: "", Website: "", "Logo URL": "", Verified: "", "Created At": "" }]);
    XLSX.utils.book_append_sheet(wb, brandSheet, "Brands");

    // Products sheet
    const brandMap = new Map(brands.map((b: any) => [b._id.toString(), b.name]));
    const productRows = products.map((p: any) => ({
      Name: p.name,
      Brand: p.brandId ? brandMap.get(p.brandId.toString()) || p.brand || "" : p.brand || "",
      Category: p.category || "",
      "Model Number": p.modelNumber || "",
      Description: p.description || "",
      "Min Price": p.priceRangeMin || "",
      "Max Price": p.priceRangeMax || "",
      Currency: p.currency || "AED",
      Availability: p.availability || "",
      "Service Regions": (p.serviceRegions || []).join(", "),
      Status: p.status || "pending",
    }));
    const productSheet = XLSX.utils.json_to_sheet(productRows.length > 0 ? productRows : [{ Name: "", Brand: "", Category: "", "Model Number": "", Description: "", "Min Price": "", "Max Price": "", Currency: "", Availability: "", "Service Regions": "", Status: "" }]);
    XLSX.utils.book_append_sheet(wb, productSheet, "Products");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=my-brands-products.xlsx",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export" },
      { status: 500 }
    );
  }
}
