import connectDB from "@/lib/db";
import Brand from "@/models/Brand";
import Product from "@/models/Product";
import SupplierProduct from "@/models/SupplierProduct";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    const brand = await Brand.findOne({ slug }).select("_id").lean();
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const [products, supplierProducts] = await Promise.all([
      Product.find({ brandId: brand._id })
        .populate("brandId")
        .populate("equipmentTypeId")
        .sort({ name: 1 })
        .lean(),
      SupplierProduct.find({ brandId: brand._id, status: "approved" })
        .sort({ name: 1 })
        .lean(),
    ]);

    // Tag supplier products so the frontend can distinguish them
    const taggedSupplierProducts = supplierProducts.map((sp: any) => ({
      ...sp,
      _source: "supplier",
    }));

    return NextResponse.json([
      ...(products || []),
      ...taggedSupplierProducts,
    ]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch products" }, { status: 500 });
  }
}
