import connectDB from "@/lib/db";
import SupplierProduct from "@/models/SupplierProduct";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    const filter: Record<string, unknown> = { status: "approved" };

    if (ids) {
      const idList = ids.split(",").map((id) => id.trim()).filter(Boolean);
      filter._id = { $in: idList };
    }

    const data = await SupplierProduct.find(filter).sort({ name: 1 }).lean();

    // Transform to match the Product interface expected by the frontend
    const products = (data || []).map((p: any) => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      specifications: p.technicalSpecs,
      brand: p.brand ? { id: p.brandId || p.brand, name: p.brand, slug: String(p.brand).toLowerCase().replace(/\s+/g, "-") } : null,
      category: p.category ? { id: String(p.category), name: p.category, slug: String(p.category).toLowerCase().replace(/\s+/g, "-") } : null,
      equipment_type: null,
      certifications: Array.isArray(p.certifications) ? p.certifications.map((c: any) => ({
        id: c._id,
        certification_name: c.certificationType,
      })) : [],
      model_number: p.modelNumber,
      price_range_min: p.priceRangeMin,
      price_range_max: p.priceRangeMax,
      currency: p.currency,
      availability: p.availability,
    }));

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch products" }, { status: 500 });
  }
}
