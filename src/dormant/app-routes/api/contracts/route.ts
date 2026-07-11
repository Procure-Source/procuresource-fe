import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Contract from "@/models/Contract";
import RfqSubmission from "@/models/RfqSubmission";
import Rfq from "@/models/Rfq";
import Delivery from "@/models/Delivery";
import User from "@/models/User";
import { notifyContractAwarded, notifyQuoteNotSelected } from "@/lib/notifications";

// Helper to transform a contract doc (lean) into the snake_case response format
function formatContract(c: any) {
  return {
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
    // Populated relations
    rfqs: c._rfq ? { title: c._rfq.title } : undefined,
    pm_profile: c._pm
      ? { full_name: c._pm.fullName, company_name: c._pm.companyName || null }
      : undefined,
    supplier_info: c._supplier
      ? { full_name: c._supplier.fullName, company_name: c._supplier.companyName || null }
      : undefined,
  };
}

// GET /api/contracts — List contracts where user is PM or supplier
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contracts = await Contract.find({
      $or: [{ pmId: auth.userId }, { supplierId: auth.userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Collect unique IDs for batch population
    const rfqIds = [...new Set(contracts.map((c: any) => String(c.rfqId)))];
    const userIds = [
      ...new Set(
        contracts.flatMap((c: any) => [String(c.pmId), String(c.supplierId)])
      ),
    ];

    const [rfqs, users] = await Promise.all([
      Rfq.find({ _id: { $in: rfqIds } })
        .select("title")
        .lean(),
      User.find({ _id: { $in: userIds } })
        .select("fullName companyName")
        .lean(),
    ]);

    const rfqMap = new Map(rfqs.map((r: any) => [String(r._id), r]));
    const userMap = new Map(users.map((u: any) => [String(u._id), u]));

    const data = contracts.map((c: any) => {
      c._rfq = rfqMap.get(String(c.rfqId)) || null;
      c._pm = userMap.get(String(c.pmId)) || null;
      c._supplier = userMap.get(String(c.supplierId)) || null;
      return formatContract(c);
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

// POST /api/contracts — Create contract from an accepted submission
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      rfq_id,
      rfq_submission_id,
      quote_id,
      supplier_id,
      title,
      total_value,
      currency,
      terms,
      payment_terms,
      delivery_deadline,
      consultant_id,
      consultant_approval_required,
      certification_recheck_at,
      certification_recheck_reason,
    } = body;

    if (!rfq_id || !rfq_submission_id || !quote_id || !supplier_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const contractNumber = `CT-${Date.now().toString(36).toUpperCase()}`;

    // 1. Create contract
    const contract = await new Contract({
      rfqId: rfq_id,
      rfqSubmissionId: rfq_submission_id,
      quoteId: quote_id,
      pmId: auth.userId,
      supplierId: supplier_id,
      contractNumber,
      title: title || "Procurement Contract",
      totalValue: total_value,
      currency: currency || "AED",
      terms: terms || undefined,
      paymentTerms: payment_terms || undefined,
      deliveryDeadline: delivery_deadline || undefined,
      consultantId: consultant_id || undefined,
      consultantApprovalStatus: consultant_approval_required ? "pending" : "not_required",
      consultantApprovalRequestedAt: consultant_approval_required ? new Date() : undefined,
      status: consultant_approval_required ? "consultant_review" : "awarded",
      certificationRecheckAt: certification_recheck_at || undefined,
      certificationRecheckReason: certification_recheck_reason || undefined,
    }).save();

    // 2. Accept the winning submission, reject others
    await RfqSubmission.updateOne(
      { _id: rfq_submission_id },
      { $set: { status: "accepted" } }
    );

    const losingSubmissions = await RfqSubmission.find(
      { rfqId: rfq_id, _id: { $ne: rfq_submission_id } },
      "supplierId"
    ).lean();

    await RfqSubmission.updateMany(
      { rfqId: rfq_id, _id: { $ne: rfq_submission_id } },
      {
        $set: {
          status: "awarded_lost",
          rejectedAt: new Date(),
          rejectionReason: "Another quote was selected for award",
          awardNotifiedAt: new Date(),
        },
      }
    );

    // 3. Update RFQ status to awarded
    const rfq = await Rfq.findById(rfq_id, "title").lean();
    await Rfq.updateOne(
      { _id: rfq_id },
      {
        $set: {
          status: consultant_approval_required ? "approval_pending" : "awarded",
          approvalStatus: consultant_approval_required ? "pending" : "not_required",
          consultantId: consultant_id || undefined,
          approvalRequestedAt: consultant_approval_required ? new Date() : undefined,
        },
      }
    );

    // 4. Auto-create delivery record with initial event
    const delivery = await new Delivery({
      contractId: contract._id,
      status: "pending",
      expectedDeliveryDate: delivery_deadline || undefined,
      events: [
        {
          eventType: "milestone",
          title: "Contract Awarded",
          description: `Contract ${contractNumber} has been awarded.`,
          newStatus: "pending",
          createdBy: auth.userId,
        },
      ],
    }).save();

    // 5. Notify the supplier about the awarded contract
    notifyContractAwarded(
      supplier_id,
      contractNumber,
      contract._id.toString(),
      title || "Procurement Contract"
    ).catch(() => {});

    await Promise.all(
      losingSubmissions.map((submission: any) =>
        notifyQuoteNotSelected(
          String(submission.supplierId),
          (rfq as any)?.title || title || "RFQ",
          rfq_id
        ).catch(() => {})
      )
    );

    // Return contract in snake_case format
    const contractObj = contract.toObject();
    const response = {
      id: contractObj._id,
      rfq_id: contractObj.rfqId,
      rfq_submission_id: contractObj.rfqSubmissionId,
      quote_id: contractObj.quoteId,
      pm_id: contractObj.pmId,
      supplier_id: contractObj.supplierId,
      contract_number: contractObj.contractNumber,
      title: contractObj.title,
      total_value: contractObj.totalValue,
      currency: contractObj.currency,
      terms: contractObj.terms || null,
      payment_terms: contractObj.paymentTerms || null,
      delivery_deadline: contractObj.deliveryDeadline || null,
      status: contractObj.status,
      consultant_id: contractObj.consultantId || null,
      consultant_approval_status: contractObj.consultantApprovalStatus || "not_required",
      consultant_approval_requested_at: contractObj.consultantApprovalRequestedAt || null,
      consultant_approved_at: contractObj.consultantApprovedAt || null,
      consultant_rejected_at: contractObj.consultantRejectedAt || null,
      consultant_rejection_reason: contractObj.consultantRejectionReason || null,
      certification_recheck_at: contractObj.certificationRecheckAt || null,
      certification_recheck_reason: contractObj.certificationRecheckReason || null,
      certification_expired_at: contractObj.certificationExpiredAt || null,
      disputed_at: contractObj.disputedAt || null,
      dispute_reason: contractObj.disputeReason || null,
      dispute_status: contractObj.disputeStatus || null,
      awarded_at: contractObj.awardedAt,
      signed_at: contractObj.signedAt || null,
      completed_at: contractObj.completedAt || null,
      created_at: contractObj.createdAt,
      updated_at: contractObj.updatedAt,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create contract" },
      { status: 500 }
    );
  }
}
