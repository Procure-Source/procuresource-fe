import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Brand from "@/models/Brand";
import SupplierProduct from "@/models/SupplierProduct";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const brands = await Brand.find({ createdBy: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get product counts for each brand
    const brandIds = brands.map((b: any) => b._id);
    const counts = await SupplierProduct.aggregate([
      { $match: { brandId: { $in: brandIds }, supplierId: user.userId } },
      { $group: { _id: "$brandId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c: any) => [c._id.toString(), c.count]));

    const result = brands.map((b: any) => ({
      ...b,
      id: b._id,
      productCount: countMap.get(b._id.toString()) || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, category, description, logoUrl, websiteUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await Brand.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const brand = await Brand.create({
      name: name.trim(),
      slug,
      category: category || null,
      description: description || null,
      logoUrl: logoUrl || null,
      websiteUrl: websiteUrl || null,
      verified: false,
      createdBy: user.userId,
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create brand" },
      { status: 500 }
    );
  }
}
