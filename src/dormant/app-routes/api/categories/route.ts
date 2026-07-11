import connectDB from "@/lib/db";
import ProductCategory from "@/models/ProductCategory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const data = await ProductCategory.find().sort({ name: 1 }).lean();

    const categories = (data || []).map((c: any) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      description: c.description || null,
    }));

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch categories" }, { status: 500 });
  }
}
