import connectDB from "@/lib/db";
import { AGENT_NON_RESPONSIVE_TIMEOUT_DAYS, RFQ_SILENCE_TIMEOUT_HOURS } from "@/lib/procurement-flow";
import Rfq from "@/models/Rfq";
import RfqInvitation from "@/models/RfqInvitation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { rfq_id, supplier_ids } = body;

    if (!rfq_id || !supplier_ids?.length) {
      return NextResponse.json({ error: "RFQ ID and supplier IDs required" }, { status: 400 });
    }

    const escalationDueAt = new Date(Date.now() + RFQ_SILENCE_TIMEOUT_HOURS * 60 * 60 * 1000);
    const nonResponsiveDueAt = new Date(Date.now() + AGENT_NON_RESPONSIVE_TIMEOUT_DAYS * 24 * 60 * 60 * 1000);

    // Upsert each invitation using findOneAndUpdate
    const results = await Promise.all(
      supplier_ids.map((sid: string) =>
        RfqInvitation.findOneAndUpdate(
          { rfqId: rfq_id, supplierId: sid },
          {
            $setOnInsert: {
              rfqId: rfq_id,
              supplierId: sid,
              status: "pending",
              invitedAt: new Date(),
              escalationDueAt,
              nonResponsiveDueAt,
            },
          },
          { upsert: true, new: true }
        ).lean()
      )
    );

    await Rfq.findByIdAndUpdate(rfq_id, {
      $set: {
        status: "awaiting_response",
        responseDeadlineAt: escalationDueAt,
      },
    });

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create invitations" },
      { status: 500 }
    );
  }
}
