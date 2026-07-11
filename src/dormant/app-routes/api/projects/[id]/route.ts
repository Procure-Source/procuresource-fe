import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import Project from "@/models/Project";
import ProjectDocument from "@/models/ProjectDocument";
import ProjectSupplier from "@/models/ProjectSupplier";
import ProjectSpecMatch from "@/models/ProjectSpecMatch";
import Rfq from "@/models/Rfq";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const data = await Project.findById(id).lean();
    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch all related data in parallel
    const [project_documents, project_spec_matches, projectSuppliers, rfqs] =
      await Promise.all([
        ProjectDocument.find({ projectId: id }).lean(),
        ProjectSpecMatch.find({ projectId: id }).lean(),
        ProjectSupplier.find({ projectId: id }).lean(),
        Rfq.find({ projectId: id })
          .select("_id title status createdAt uniqueLink")
          .lean(),
      ]);

    // Look up supplier profiles for each project supplier
    const supplierIds = projectSuppliers.map((ps) => ps.supplierId);
    const supplierProfiles = await User.find({ _id: { $in: supplierIds } })
      .select("fullName companyName")
      .lean();

    const profileMap = new Map(
      supplierProfiles.map((p) => [p._id.toString(), p])
    );

    const project_suppliers = projectSuppliers.map((ps) => {
      const profile = profileMap.get(ps.supplierId.toString());
      return {
        ...ps,
        profiles: profile
          ? { full_name: profile.fullName, company_name: profile.companyName }
          : null,
      };
    });

    return NextResponse.json({
      ...data,
      id: data._id,
      project_documents,
      project_spec_matches,
      project_suppliers,
      rfqs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name, location, project_type, description, status } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (project_type !== undefined) updates.projectType = project_type;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    const data = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update project" },
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

    // Cascade delete related records
    await Promise.all([
      ProjectDocument.deleteMany({ projectId: id }),
      ProjectSupplier.deleteMany({ projectId: id }),
      ProjectSpecMatch.deleteMany({ projectId: id }),
    ]);

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete project" },
      { status: 500 }
    );
  }
}
