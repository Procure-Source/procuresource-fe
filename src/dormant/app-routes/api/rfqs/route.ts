import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Rfq from "@/models/Rfq";
import RfqSubmission from "@/models/RfqSubmission";
import RfqInvitation from "@/models/RfqInvitation";
import { AGENT_NON_RESPONSIVE_TIMEOUT_DAYS, RFQ_SILENCE_TIMEOUT_HOURS } from "@/lib/procurement-flow";

// GET /api/rfqs — List RFQs. PMs see their own; ?status=open returns all open public RFQs.
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "0", 10);

    // If ?status=open, return all open public RFQs (for suppliers & public listing)
    // Otherwise require auth and return the user's own RFQs (for PMs)
    let query: any;
    if (status === "open") {
      query = { status: "open", visibility: { $ne: "targeted" } };
    } else {
      if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      query = { creatorId: auth.userId };
      if (status) query.status = status;
    }

    let q = Rfq.find(query).sort({ createdAt: -1 });
    if (limit > 0) q = q.limit(limit);
    const rfqs = await q.lean();

    // Get submission counts for all fetched RFQs in one query
    const rfqIds = rfqs.map((rfq: any) => rfq._id);
    const submissionCounts = await RfqSubmission.aggregate([
      { $match: { rfqId: { $in: rfqIds } } },
      { $group: { _id: "$rfqId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(submissionCounts.map((s: any) => [s._id.toString(), s.count]));

    // Transform to match frontend's expected snake_case format
    const data = rfqs.map((rfq: any) => ({
      id: rfq._id,
      creator_id: rfq.creatorId,
      title: rfq.title,
      description: rfq.description || null,
      metric_system: rfq.metricSystem,
      unique_link: rfq.uniqueLink,
      status: rfq.status,
      deadline: rfq.deadline || null,
      response_deadline_at: rfq.responseDeadlineAt || null,
      escalated_at: rfq.escalatedAt || null,
      no_response_notified_at: rfq.noResponseNotifiedAt || null,
      project_id: rfq.projectId || null,
      visibility: rfq.visibility,
      consultant_id: rfq.consultantId || null,
      approval_status: rfq.approvalStatus || "not_required",
      approval_requested_at: rfq.approvalRequestedAt || null,
      approved_at: rfq.approvedAt || null,
      rejected_at: rfq.rejectedAt || null,
      approval_notes: rfq.approvalNotes || null,
      verification_refresh_required_at: rfq.verificationRefreshRequiredAt || null,
      verification_refresh_reason: rfq.verificationRefreshReason || null,
      lead_time: rfq.leadTime || null,
      currency: rfq.currency || "AED",
      file_url: rfq.fileUrl || null,
      created_at: rfq.createdAt,
      updated_at: rfq.updatedAt,
      submission_count: countMap.get(rfq._id.toString()) || 0,
      rfq_items: (rfq.items || []).map((item: any) => ({
        id: item._id,
        rfq_id: rfq._id,
        description: item.description,
        quantity: item.quantity,
        metric_spec: item.metricSpec || null,
      })),
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch RFQs" },
      { status: 500 }
    );
  }
}

// POST /api/rfqs — Create RFQ with items and optional invitations
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, metric_system, deadline, lead_time, currency, project_id, visibility, items, targeted_suppliers, file_url } = body;

    if (!title) {
      return NextResponse.json({ error: "RFQ title is required" }, { status: 400 });
    }

    const uniqueLink = Math.random().toString(36).substring(2, 15);
    const responseDeadlineAt = new Date(Date.now() + RFQ_SILENCE_TIMEOUT_HOURS * 60 * 60 * 1000);
    const nonResponsiveDueAt = new Date(Date.now() + AGENT_NON_RESPONSIVE_TIMEOUT_DAYS * 24 * 60 * 60 * 1000);

    // Build embedded items array
    const validItems = (items || [])
      .filter((item: any) => item.description)
      .map((item: any) => ({
        description: item.description,
        quantity: item.quantity || 1,
        metricSpec: item.metric_spec || null,
      }));

    // 1. Create RFQ with embedded items
    const rfq = await new Rfq({
      creatorId: auth.userId,
      title,
      description: description || undefined,
      metricSystem: metric_system || "Metric",
      uniqueLink,
      status: visibility === "targeted" ? "awaiting_response" : "open",
      deadline: deadline || undefined,
      responseDeadlineAt,
      projectId: project_id || undefined,
      visibility: visibility || "public",
      fileUrl: file_url || undefined,
      leadTime: lead_time || undefined,
      currency: currency || "AED",
      items: validItems,
    }).save();

    // 2. Send invitations if targeted
    if (visibility === "targeted" && targeted_suppliers && targeted_suppliers.length > 0) {
      const invitations = targeted_suppliers.map((sid: string) => ({
        rfqId: rfq._id,
        supplierId: sid,
        status: "pending",
        escalationDueAt: responseDeadlineAt,
        nonResponsiveDueAt,
      }));
      try {
        await RfqInvitation.insertMany(invitations, { ordered: false });
      } catch (invError) {
        console.error("Failed to create invitations:", invError);
      }
    }

    // Return in snake_case format matching what the frontend expects
    const response = {
      id: rfq._id,
      creator_id: rfq.creatorId,
      title: rfq.title,
      description: rfq.description || null,
      metric_system: rfq.metricSystem,
      unique_link: rfq.uniqueLink,
      status: rfq.status,
      deadline: rfq.deadline || null,
      response_deadline_at: rfq.responseDeadlineAt || null,
      project_id: rfq.projectId || null,
      visibility: rfq.visibility,
      lead_time: rfq.leadTime || null,
      currency: rfq.currency || "AED",
      file_url: rfq.fileUrl || null,
      created_at: rfq.createdAt,
      updated_at: rfq.updatedAt,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create RFQ" },
      { status: 500 }
    );
  }
}
