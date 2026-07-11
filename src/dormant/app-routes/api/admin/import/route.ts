import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Brand from "@/models/Brand";
import EquipmentType from "@/models/EquipmentType";
import Product from "@/models/Product";
import * as XLSX from "xlsx";

function checkAuth(request: NextRequest): boolean {
  const adminAuth = request.cookies.get("admin_auth")?.value;
  if (!adminAuth) return false;
  try {
    const [username, password] = Buffer.from(adminAuth, "base64").toString().split(":");
    return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

    if (data.length < 2) {
      return NextResponse.json({ error: "File is empty or has no data rows" }, { status: 400 });
    }

    const headers = data[0].map((h) => h?.toString().trim().toLowerCase() || "");
    const rows = data.slice(1).filter((row) => row.some((cell) => cell));

    const brandIndex = headers.findIndex((h) => h.includes("brand"));
    const categoryIndex = headers.findIndex((h) => h.includes("product category") || h.includes("category"));
    const typeIndex = headers.findIndex((h) => h.includes("product type") || h.includes("type"));
    const productIndex = headers.findIndex((h) => h.includes("individual product") || h.includes("product"));
    const certIndex = headers.findIndex((h) => h.includes("certification"));
    const standardIndex = headers.findIndex((h) => h.includes("standard") || h.includes("code"));
    const authorityIndex = headers.findIndex((h) => h.includes("authority") || h.includes("issuing"));
    const mandatoryIndex = headers.findIndex((h) => h.includes("mandatory"));
    const appliesIndex = headers.findIndex((h) => h.includes("applies"));
    const notesIndex = headers.findIndex((h) => h.includes("notes"));

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      brandsCreated: 0,
      typesCreated: 0,
    };

    const brandCache: Record<string, string> = {};
    const typeCache: Record<string, string> = {};

    const existingBrands = await Brand.find().lean();
    const existingTypes = await EquipmentType.find().lean();

    existingBrands.forEach((b) => {
      brandCache[b.name.toLowerCase()] = b._id.toString();
    });
    existingTypes.forEach((t) => {
      typeCache[t.name.toLowerCase()] = t._id.toString();
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const brandName = brandIndex >= 0 ? row[brandIndex]?.toString().trim() : "";
        const productCategory = categoryIndex >= 0 ? row[categoryIndex]?.toString().trim() : "";
        const productType = typeIndex >= 0 ? row[typeIndex]?.toString().trim() : "";
        const productName = productIndex >= 0 ? row[productIndex]?.toString().trim() : "";
        const certType = certIndex >= 0 ? row[certIndex]?.toString().trim() : "";
        const standardCode = standardIndex >= 0 ? row[standardIndex]?.toString().trim() : "";
        const authority = authorityIndex >= 0 ? row[authorityIndex]?.toString().trim() : "";
        const mandatory = mandatoryIndex >= 0 ? ["yes", "true", "1"].includes(row[mandatoryIndex]?.toString().toLowerCase().trim()) : false;
        const appliesIn = appliesIndex >= 0 ? row[appliesIndex]?.toString().trim() : "";
        const notes = notesIndex >= 0 ? row[notesIndex]?.toString().trim() : "";

        if (!productName) {
          results.errors.push(`Row ${i + 2}: Product name is required`);
          results.failed++;
          continue;
        }

        let brandId: string | null = null;
        if (brandName) {
          const brandKey = brandName.toLowerCase();
          if (brandCache[brandKey]) {
            brandId = brandCache[brandKey];
          } else {
            const slug = generateSlug(brandName);
            try {
              const newBrand = await Brand.create({
                name: brandName,
                slug,
                category: productCategory || "MEP",
                verified: false,
                productCount: 0,
              });
              brandId = newBrand._id.toString();
              brandCache[brandKey] = brandId;
              results.brandsCreated++;
            } catch {
              const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, "i") } });
              if (existingBrand) {
                brandId = existingBrand._id.toString();
                brandCache[brandKey] = brandId;
              } else {
                results.errors.push(`Row ${i + 2}: Failed to create brand`);
              }
            }
          }
        }

        let equipmentTypeId: string | null = null;
        const typeName = productType || productCategory || "General";
        const typeKey = typeName.toLowerCase();
        if (typeCache[typeKey]) {
          equipmentTypeId = typeCache[typeKey];
        } else {
          const slug = generateSlug(typeName);
          try {
            const newType = await EquipmentType.create({
              name: typeName,
              slug,
              description: `${typeName} equipment`,
            });
            equipmentTypeId = newType._id.toString();
            typeCache[typeKey] = equipmentTypeId;
            results.typesCreated++;
          } catch {
            const existingType = await EquipmentType.findOne({ name: { $regex: new RegExp(`^${typeName}$`, "i") } });
            if (existingType) {
              equipmentTypeId = existingType._id.toString();
              typeCache[typeKey] = equipmentTypeId;
            } else {
              results.errors.push(`Row ${i + 2}: Failed to create equipment type`);
            }
          }
        }

        if (!brandId || !equipmentTypeId) {
          results.errors.push(`Row ${i + 2}: Could not resolve brand or equipment type`);
          results.failed++;
          continue;
        }

        const productSlug = generateSlug(productName) + "-" + Date.now() + "-" + i;

        await Product.create({
          name: productName,
          slug: productSlug,
          brandId,
          equipmentTypeId,
          productCategory,
          productType,
          certificationType: certType || null,
          isCertified: !!certType,
          standardCode: standardCode || null,
          issuingAuthority: authority || null,
          isMandatory: mandatory,
          appliesIn: appliesIn || null,
          notes: notes || null,
        });

        results.success++;
      } catch (err) {
        results.errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : "Unknown error"}`);
        results.failed++;
      }
    }

    return NextResponse.json({
      message: `Import completed. ${results.success} products imported successfully.`,
      ...results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
