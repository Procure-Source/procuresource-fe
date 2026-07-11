import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Contract from "@/models/Contract";
import Rfq from "@/models/Rfq";
import Delivery from "@/models/Delivery";
import User from "@/models/User";

function formatDeliveryEvent(ev: any) {
  return {
    id: ev._id,
    event_type: ev.eventType,
    title: ev.title,
    description: ev.description || null,
    old_status: ev.oldStatus || null,
    new_status: ev.newStatus || null,
    created_by: ev.createdBy,
    created_at: ev.createdAt,
  };
}

function formatDelivery(d: any) {
  return {
    id: d._id,
    contract_id: d.contractId,
    status: d.status,
    expected_delivery_date: d.expectedDeliveryDate || null,
    actual_delivery_date: d.actualDeliveryDate || null,
    tracking_number: d.trackingNumber || null,
    shipping_method: d.shippingMethod || null,
    notes: d.notes || null,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
    delivery_events: (d.events || []).map(formatDeliveryEvent),
  };
}

// GET /api/contracts/[id] — Fetch single contract with related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const contract = await Contract.findById(id).lean();
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const c: any = contract;

    // Fetch related data in parallel
    const [rfq, pmUser, supplierUser, deliveries] = await Promise.all([
      Rfq.findById(c.rfqId).select("title description metricSystem").lean(),
      User.findById(c.pmId).select("fullName companyName").lean(),
      User.findById(c.supplierId).select("fullName companyName").lean(),
      Delivery.find({ contractId: c._id }).lean(),
    ]);

    const data: any = {
      id: c._id,
      rfq_id: c.rfqId,
      rfq_submission_id: c.rfqSubmissionId,
      quote_id: c.quoteId,
      pm_id: c.pmId,
      supplier_id: c.supplierId,
      contract_number: c.contractNumber,
      title: c.title,
      total_value: c.totalValue,
      currency: c.currency,
      terms: c.terms || null,
      payment_terms: c.paymentTerms || null,
      delivery_deadline: c.deliveryDeadline || null,
      status: c.status,
      consultant_id: c.consultantId || null,
      consultant_approval_status: c.consultantApprovalStatus || "not_required",
      consultant_approval_requested_at: c.consultantApprovalRequestedAt || null,
      consultant_approved_at: c.consultantApprovedAt || null,
      consultant_rejected_at: c.consultantRejectedAt || null,
      consultant_rejection_reason: c.consultantRejectionReason || null,
      certification_recheck_at: c.certificationRecheckAt || null,
      certification_recheck_reason: c.certificationRecheckReason || null,
      certification_expired_at: c.certificationExpiredAt || null,
      disputed_at: c.disputedAt || null,
      dispute_reason: c.disputeReason || null,
      dispute_status: c.disputeStatus || null,
      awarded_at: c.awardedAt,
      signed_at: c.signedAt || null,
      completed_at: c.completedAt || null,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
      // Populated relations matching Supabase select shape
      rfqs: rfq
        ? {
            title: (rfq as any).title,
            description: (rfq as any).description || null,
            metric_system: (rfq as any).metricSystem,
          }
        : null,
      pm_profile: pmUser
        ? { full_name: (pmUser as any).fullName, company_name: (pmUser as any).companyName || null }
        : null,
      supplier_info: supplierUser
        ? { full_name: (supplierUser as any).fullName, company_name: (supplierUser as any).companyName || null }
        : null,
      deliveries: deliveries.map((d: any) => formatDelivery(d)),
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch contract" },
      { status: 500 }
    );
  }
}

// PUT /api/contracts/[id] — Update contract fields
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Map incoming snake_case fields to camelCase model fields
    const fieldMap: Record<string, string> = {
      status: "status",
      terms: "terms",
      payment_terms: "paymentTerms",
      delivery_deadline: "deliveryDeadline",
      consultant_id: "consultantId",
      consultant_approval_status: "consultantApprovalStatus",
      consultant_approval_requested_at: "consultantApprovalRequestedAt",
      consultant_approved_at: "consultantApprovedAt",
      consultant_rejected_at: "consultantRejectedAt",
      consultant_rejection_reason: "consultantRejectionReason",
      certification_recheck_at: "certificationRecheckAt",
      certification_recheck_reason: "certificationRecheckReason",
      certification_expired_at: "certificationExpiredAt",
      disputed_at: "disputedAt",
      dispute_reason: "disputeReason",
      dispute_status: "disputeStatus",
      signed_at: "signedAt",
      completed_at: "completedAt",
    };

    const updates: Record<string, unknown> = {};
    for (const [snakeKey, camelKey] of Object.entries(fieldMap)) {
      if (body[snakeKey] !== undefined) {
        updates[camelKey] = body[snakeKey];
      }
    }

    const contract = await Contract.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean();

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const c: any = contract;
    const data = {
      id: c._id,
      rfq_id: c.rfqId,
      rfq_submission_id: c.rfqSubmissionId,
      quote_id: c.quoteId,
      pm_id: c.pmId,
      supplier_id: c.supplierId,
      contract_number: c.contractNumber,
      title: c.title,
      total_value: c.totalValue,
      currency: c.currency,
      terms: c.terms || null,
      payment_terms: c.paymentTerms || null,
      delivery_deadline: c.deliveryDeadline || null,
      status: c.status,
      consultant_id: c.consultantId || null,
      consultant_approval_status: c.consultantApprovalStatus || "not_required",
      consultant_approval_requested_at: c.consultantApprovalRequestedAt || null,
      consultant_approved_at: c.consultantApprovedAt || null,
      consultant_rejected_at: c.consultantRejectedAt || null,
      consultant_rejection_reason: c.consultantRejectionReason || null,
      certification_recheck_at: c.certificationRecheckAt || null,
      certification_recheck_reason: c.certificationRecheckReason || null,
      certification_expired_at: c.certificationExpiredAt || null,
      disputed_at: c.disputedAt || null,
      dispute_reason: c.disputeReason || null,
      dispute_status: c.disputeStatus || null,
      awarded_at: c.awardedAt,
      signed_at: c.signedAt || null,
      completed_at: c.completedAt || null,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update contract" },
      { status: 500 }
    );
  }
}
