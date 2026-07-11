import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Rfq from "@/models/Rfq";
import RfqSubmission from "@/models/RfqSubmission";
import Quote from "@/models/Quote";
import RfqInvitation from "@/models/RfqInvitation";
import User from "@/models/User";
import UserDocument from "@/models/UserDocument";

// Helper: transform an RFQ doc to the snake_case shape the frontend expects
function formatRfq(rfq: any) {
  return {
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
    rfq_items: (rfq.items || []).map((item: any) => ({
      id: item._id,
      rfq_id: rfq._id,
      description: item.description,
      quantity: item.quantity,
      metric_spec: item.metricSpec || null,
    })),
  };
}

// GET /api/rfqs/[id] — Fetch single RFQ with items and submissions (with supplier profiles)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const rfq = await Rfq.findById(id).lean();
    if (!rfq) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    // Fetch submissions
    const submissions = await RfqSubmission.find({ rfqId: id }).lean();

    // Enrich each submission with its quote (+ quote items) and supplier profile
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (sub: any) => {
        const [quote, profile, supplierDocs] = await Promise.all([
          sub.quoteId ? Quote.findById(sub.quoteId).lean() : null,
          User.findById(sub.supplierId, "fullName companyName isVerified").lean(),
          UserDocument.find({ userId: sub.supplierId }).select("documentType verifiedAt").lean(),
        ]);

        // Format quote to snake_case including embedded items
        let formattedQuote = null;
        if (quote) {
          formattedQuote = {
            id: (quote as any)._id,
            rfq_id: (quote as any).rfqId,
            supplier_id: (quote as any).supplierId,
            quote_number: (quote as any).quoteNumber || null,
            total_amount: (quote as any).totalAmount,
            currency: (quote as any).currency,
            lead_time: (quote as any).leadTime || null,
            valid_until: (quote as any).validUntil || null,
            notes: (quote as any).notes || null,
            status: (quote as any).status,
            created_at: (quote as any).createdAt,
            updated_at: (quote as any).updatedAt,
            quote_items: ((quote as any).items || []).map((qi: any) => ({
              id: qi._id,
              quote_id: (quote as any)._id,
              description: qi.description,
              quantity: qi.quantity,
              unit_price: qi.unitPrice,
              total_price: qi.totalPrice,
              metric_spec: qi.metricSpec || null,
            })),
          };
        }

        return {
          id: sub._id,
          rfq_id: sub.rfqId,
          supplier_id: sub.supplierId,
          quote_id: sub.quoteId || null,
          quote_data: sub.quoteData || null,
          status: sub.status,
          created_at: sub.createdAt,
          updated_at: sub.updatedAt,
          quotes: formattedQuote,
          profiles: profile
            ? {
                company_name: (profile as any).companyName || null,
                is_verified: (profile as any).isVerified || false,
                documents: supplierDocs.map((d: any) => ({
                  document_type: d.documentType,
                  verified_at: d.verifiedAt || null,
                })),
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      ...formatRfq(rfq),
      submissions: enrichedSubmissions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch RFQ" },
      { status: 500 }
    );
  }
}

// PUT /api/rfqs/[id] — Update RFQ (only by creator)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, metric_system, deadline, status, visibility } = body;

    // Build update object — only include fields that were provided
    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (metric_system !== undefined) updates.metricSystem = metric_system;
    if (deadline !== undefined) updates.deadline = deadline || null;
    if (status !== undefined) updates.status = status;
    if (visibility !== undefined) updates.visibility = visibility;

    const rfq = await Rfq.findOneAndUpdate(
      { _id: id, creatorId: auth.userId },
      updates,
      { new: true }
    ).lean();

    if (!rfq) {
      return NextResponse.json({ error: "Not authorized to update this RFQ" }, { status: 403 });
    }

    return NextResponse.json(formatRfq(rfq));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update RFQ" },
      { status: 500 }
    );
  }
}

// DELETE /api/rfqs/[id] — Delete RFQ (only by creator)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const rfq = await Rfq.findOneAndDelete({ _id: id, creatorId: auth.userId });
    if (!rfq) {
      return NextResponse.json({ error: "Not authorized to delete this RFQ" }, { status: 403 });
    }

    // Clean up related documents (no CASCADE in MongoDB)
    await Promise.all([
      RfqSubmission.deleteMany({ rfqId: id }),
      Quote.deleteMany({ rfqId: id }),
      RfqInvitation.deleteMany({ rfqId: id }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete RFQ" },
      { status: 500 }
    );
  }
}
