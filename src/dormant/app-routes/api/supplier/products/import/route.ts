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

    const sheetName = wb.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ error: "Empty spreadsheet" }, { status: 400 });
    }

    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "No data rows found" }, { status: 400 });
    }

    // Detect format: new format has "Individual Product" column, old format has "Name"
    const firstRow = rows[0];
    const isNewFormat = "Individual Product" in firstRow || "individual product" in firstRow;

    // Get supplier's brands for auto-linking
    let supplierBrands = await Brand.find({ createdBy: user.userId }).lean();
    const brandNameMap = new Map(
      supplierBrands.map((b: any) => [b.name.toLowerCase(), b._id])
    );

    let productsCreated = 0;
    let brandsCreated = 0;
    let skipped = 0;

    if (isNewFormat) {
      // New format: rows grouped by Brand + Individual Product, each row = one certification
      // Group rows by unique product key (Brand + Individual Product)
      const productMap = new Map<string, { brand: string; category: string; productType: string; name: string; certifications: any[] }>();

      for (const row of rows) {
        const productName = (row["Individual Product"] || "").toString().trim();
        const brandName = (row.Brand || row.brand || "").toString().trim();
        if (!productName) { skipped++; continue; }

        const key = `${brandName}|||${productName}`.toLowerCase();

        if (!productMap.has(key)) {
          productMap.set(key, {
            brand: brandName,
            category: (row["Product Category"] || "").toString().trim(),
            productType: (row["Product Type"] || "").toString().trim(),
            name: productName,
            certifications: [],
          });
        }

        const certType = (row["Certification Type"] || "").toString().trim();
        if (certType) {
          productMap.get(key)!.certifications.push({
            certificationType: certType,
            standard: (row["Standard / Code"] || "").toString().trim() || null,
            issuingAuthority: (row["Issuing Authority"] || "").toString().trim() || null,
            mandatory: (row.Mandatory || "").toString().trim() || null,
            appliesIn: (row["Applies In"] || "").toString().trim() || null,
            notes: (row.Notes || "").toString().trim() || null,
          });
        }
      }

      // Create products
      for (const [, product] of productMap) {
        // Auto-create brand if it doesn't exist
        let brandId = product.brand ? brandNameMap.get(product.brand.toLowerCase()) || null : null;
        if (product.brand && !brandId) {
          const baseSlug = product.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          let slug = baseSlug;
          let counter = 1;
          while (await Brand.findOne({ slug })) {
            slug = `${baseSlug}-${counter++}`;
          }
          const newBrand = await Brand.create({
            name: product.brand,
            slug,
            category: product.category || null,
            verified: false,
            createdBy: user.userId,
          });
          brandId = newBrand._id;
          brandNameMap.set(product.brand.toLowerCase(), brandId);
          brandsCreated++;
        }

        const slug = product.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now() + "-" + productsCreated;

        await SupplierProduct.create({
          supplierId: user.userId,
          name: product.name,
          slug,
          brand: product.brand || null,
          brandId: brandId || null,
          category: product.category || null,
          productType: product.productType || null,
          certifications: product.certifications,
          status: "pending",
        });
        productsCreated++;
      }
    } else {
      // Old format: one row per product (Name, Brand, Category, etc.)
      for (const row of rows) {
        const name = (row.Name || row.name || "").toString().trim();
        if (!name) { skipped++; continue; }

        const brandName = (row.Brand || row.brand || "").toString().trim();
        const brandId = brandName ? brandNameMap.get(brandName.toLowerCase()) || null : null;

        const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now() + "-" + productsCreated;

        const regions = (row["Service Regions"] || row.service_regions || "").toString();
        const serviceRegions = regions
          ? regions.split(",").map((r: string) => r.trim()).filter(Boolean)
          : [];

        await SupplierProduct.create({
          supplierId: user.userId,
          name,
          slug,
          brand: brandName || null,
          brandId: brandId || null,
          category: (row.Category || row.category || "").toString() || null,
          productType: (row["Product Type"] || row.product_type || "").toString() || null,
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
      created: productsCreated,
      brandsCreated,
      skipped,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import" },
      { status: 500 }
    );
  }
}
