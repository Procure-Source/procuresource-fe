import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import Project from "@/models/Project";
import ProjectDocument from "@/models/ProjectDocument";
import ProjectSupplier from "@/models/ProjectSupplier";
import Rfq from "@/models/Rfq";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await Project.find({ creatorId: auth.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch related counts for each project in parallel
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const [project_documents, project_suppliers, rfqs] = await Promise.all([
          ProjectDocument.find({ projectId: project._id }).select("_id").lean(),
          ProjectSupplier.find({ projectId: project._id }).select("_id").lean(),
          Rfq.find({ projectId: project._id })
            .select("_id title status")
            .lean(),
        ]);
        return {
          ...project,
          id: project._id,
          project_documents,
          project_suppliers,
          rfqs,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, location, project_type, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await Project.create({
      creatorId: auth.userId,
      name,
      location: location || null,
      projectType: project_type || null,
      description: description || null,
    });

    return NextResponse.json(project.toObject(), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create project" },
      { status: 500 }
    );
  }
}
