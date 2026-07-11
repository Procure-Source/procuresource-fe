import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProductCategory from "@/models/ProductCategory";
import { getAdminFromRequest, requireAdminTag } from "@/lib/admin-auth";

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "category_manager"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const data = await ProductCategory.find()
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "category_manager"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const slug = generateSlug(body.name);

    const data = await ProductCategory.create({
      name: body.name,
      slug,
      description: body.description || null,
      parentId: body.parentId || body.parent_id || null,
      displayOrder: body.displayOrder || body.display_order || 0,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "category_manager"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updates } = body;

    if (updates.name) {
      updates.slug = generateSlug(updates.name);
    }

    const data = await ProductCategory.findByIdAndUpdate(id, updates, { new: true });
    if (!data) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin || !requireAdminTag(admin, ["super_admin", "category_manager"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    await connectDB();
    const data = await ProductCategory.findByIdAndDelete(id);
    if (!data) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete category" }, { status: 500 });
  }
}
