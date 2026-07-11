import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import SupplierProduct from "@/models/SupplierProduct";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine");
    const supplierId = searchParams.get("supplier_id");

    if (mine === "true") {
      // Supplier viewing their own products
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const data = await SupplierProduct.find({ supplierId: user.userId })
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json(data || []);
    }

    if (supplierId) {
      // Public view of a specific supplier's approved products
      const data = await SupplierProduct.find({
        supplierId,
        status: "approved",
      })
        .sort({ name: 1 })
        .lean();

      return NextResponse.json(data || []);
    }

    // Public view of all approved products
    const data = await SupplierProduct.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, brand, brand_id, category, model_number, description, technical_specs,
            price_range_min, price_range_max, currency, availability, service_regions } = body;

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const product = await SupplierProduct.create({
      supplierId: user.userId,
      name,
      slug,
      brand: brand || null,
      brandId: brand_id || null,
      category: category || null,
      modelNumber: model_number || null,
      description: description || null,
      technicalSpecs: technical_specs || null,
      priceRangeMin: price_range_min || null,
      priceRangeMax: price_range_max || null,
      currency: currency || "AED",
      availability: availability || "in_stock",
      serviceRegions: service_regions || [],
      status: "pending",
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
