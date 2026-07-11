import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { analyzeSpec } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import ProjectSpecMatch from "@/models/ProjectSpecMatch";

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
    const { spec_text } = body;

    if (!spec_text) {
      return NextResponse.json({ error: "Specification text is required" }, { status: 400 });
    }

    // Run AI analysis
    const matchResults = await analyzeSpec(spec_text);

    // Store results in MongoDB
    const data = await ProjectSpecMatch.create({
      projectId: id,
      specText: spec_text,
      matchResults,
    });

    return NextResponse.json(data.toObject(), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze specifications" },
      { status: 500 }
    );
  }
}
