import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import ProjectSupplier from "@/models/ProjectSupplier";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const projectSuppliers = await ProjectSupplier.find({ projectId: id })
      .sort({ createdAt: -1 })
      .lean();

    // Look up supplier profiles and supplier details
    const supplierIds = projectSuppliers.map((ps) => ps.supplierId);
    const users = await User.find({ _id: { $in: supplierIds } })
      .select("fullName companyName")
      .lean();

    const userMap = new Map(
      users.map((u) => [u._id.toString(), u])
    );

    const data = projectSuppliers.map((ps) => {
      const user = userMap.get(ps.supplierId.toString());
      return {
        ...ps,
        profiles: user
          ? { full_name: user.fullName, company_name: user.companyName }
          : null,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch project suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { supplier_id, source } = body;

    if (!supplier_id) {
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 });
    }

    const data = await ProjectSupplier.create({
      projectId: id,
      supplierId: supplier_id,
      source: source || "manual",
    });

    return NextResponse.json(data.toObject(), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add supplier" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");

    if (!supplierId) {
      return NextResponse.json({ error: "Supplier ID required" }, { status: 400 });
    }

    const deleted = await ProjectSupplier.findOneAndDelete({
      projectId: id,
      supplierId,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Supplier not found in project" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove supplier" },
      { status: 500 }
    );
  }
}
