import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Brand from "@/models/Brand";
import SupplierProduct from "@/models/SupplierProduct";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });

    let brandsCreated = 0;
    let productsCreated = 0;

    // Process Brands sheet
    const brandSheet = wb.Sheets["Brands"];
    if (brandSheet) {
      const brandRows: any[] = XLSX.utils.sheet_to_json(brandSheet);
      for (const row of brandRows) {
        const name = (row.Name || row.name || "").toString().trim();
        if (!name) continue;

        // Check if brand already exists for this supplier
        const existing = await Brand.findOne({ name: { $regex: `^${name}$`, $options: "i" }, createdBy: user.userId });
        if (existing) continue;

        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        let slug = baseSlug;
        let counter = 1;
        while (await Brand.findOne({ slug })) {
          slug = `${baseSlug}-${counter++}`;
        }

        await Brand.create({
          name,
          slug,
          category: (row.Category || row.category || "").toString() || null,
          description: (row.Description || row.description || "").toString() || null,
          websiteUrl: (row.Website || row.websiteUrl || row.website || "").toString() || null,
          logoUrl: (row["Logo URL"] || row.logoUrl || "").toString() || null,
          verified: false,
          createdBy: user.userId,
        });
        brandsCreated++;
      }
    }

    // Process Products sheet
    const productSheet = wb.Sheets["Products"];
    if (productSheet) {
      const productRows: any[] = XLSX.utils.sheet_to_json(productSheet);

      // Get supplier's brands for linking
      const supplierBrands = await Brand.find({ createdBy: user.userId }).lean();
      const brandNameMap = new Map(supplierBrands.map((b: any) => [b.name.toLowerCase(), b._id]));

      for (const row of productRows) {
        const name = (row.Name || row.name || "").toString().trim();
        if (!name) continue;

        const brandName = (row.Brand || row.brand || "").toString().trim();
        const brandId = brandName ? brandNameMap.get(brandName.toLowerCase()) || null : null;

        const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

        const regions = (row["Service Regions"] || row.service_regions || "").toString();
        const serviceRegions = regions ? regions.split(",").map((r: string) => r.trim()).filter(Boolean) : [];

        await SupplierProduct.create({
          supplierId: user.userId,
          name,
          slug,
          brand: brandName || null,
          brandId: brandId || null,
          category: (row.Category || row.category || "").toString() || null,
          modelNumber: (row["Model Number"] || row.model_number || "").toString() || null,
          description: (row.Description || row.description || "").toString() || null,
          priceRangeMin: parseFloat(row["Min Price"] || row.price_range_min) || null,
          priceRangeMax: parseFloat(row["Max Price"] || row.price_range_max) || null,
          currency: (row.Currency || row.currency || "AED").toString(),
          availability: (row.Availability || row.availability || "in_stock").toString(),
          serviceRegions,
          status: "pending",
        });
        productsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      brandsCreated,
      productsCreated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import" },
      { status: 500 }
    );
  }
}
