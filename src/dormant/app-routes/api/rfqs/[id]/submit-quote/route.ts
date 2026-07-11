import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Rfq from "@/models/Rfq";
import Quote from "@/models/Quote";
import RfqSubmission from "@/models/RfqSubmission";
import RfqInvitation from "@/models/RfqInvitation";
import User from "@/models/User";
import { notifyQuoteReceived } from "@/lib/notifications";
import { isSupplySideRole } from "@/lib/tags";

// POST /api/rfqs/[id]/submit-quote — Supplier submits a quote for an RFQ
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Please login as a verified supply-side partner to submit a quote" }, { status: 401 });
    }

    const { id: rfqId } = await params;

    if (!isSupplySideRole(auth.role)) {
      return NextResponse.json({ error: "Only registered supply-side partners can submit quotes" }, { status: 403 });
    }

    // Verify RFQ exists and is open
    const rfq = await Rfq.findById(rfqId, "status title creatorId").lean();
    if (!rfq) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }
    if (!["open", "awaiting_response", "escalated"].includes((rfq as any).status)) {
      return NextResponse.json({ error: "This RFQ is no longer accepting quotes" }, { status: 400 });
    }

    const body = await request.json();
    const { quote_number, total_amount, currency, lead_time, valid_until, notes, items } = body;

    // 1. Create the quote with embedded items
    const quoteItems = (items || []).map((item: any) => ({
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unit_price || 0,
      totalPrice: item.total_price || 0,
      metricSpec: item.metric_spec || null,
    }));

    const quote = await new Quote({
      rfqId,
      supplierId: auth.userId,
      quoteNumber: quote_number || `QT-${Date.now().toString(36).toUpperCase()}`,
      totalAmount: total_amount,
      currency: currency || "AED",
      leadTime: lead_time || undefined,
      validUntil: valid_until || undefined,
      notes: notes || undefined,
      status: "submitted",
      items: quoteItems,
    }).save();

    // 2. Create RFQ submission record
    await new RfqSubmission({
      rfqId,
      supplierId: auth.userId,
      quoteId: quote._id,
      quoteData: body,
      status: "pending",
    }).save();

    await RfqInvitation.findOneAndUpdate(
      { rfqId, supplierId: auth.userId },
      { $set: { status: "responded", respondedAt: new Date() } }
    );

    // 3. Notify the RFQ creator (PM) about the new quote
    const supplier = await User.findById(auth.userId).select("fullName companyName").lean();
    const supplierName = (supplier as any)?.companyName || (supplier as any)?.fullName || "A supplier";
    notifyQuoteReceived(
      String((rfq as any).creatorId),
      supplierName,
      (rfq as any).title || "Untitled RFQ",
      rfqId
    ).catch(() => {});

    return NextResponse.json({ success: true, quote_id: quote._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submission failed" },
      { status: 500 }
    );
  }
}
