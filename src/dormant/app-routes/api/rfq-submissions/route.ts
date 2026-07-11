import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import RfqSubmission from "@/models/RfqSubmission";
import Quote from "@/models/Quote";
import Rfq from "@/models/Rfq";

// GET /api/rfq-submissions?mine=true — List submissions for the authenticated supplier
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await RfqSubmission.find({ supplierId: auth.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with quote and RFQ details
    const enriched = await Promise.all(
      submissions.map(async (sub: any) => {
        const [quote, rfq] = await Promise.all([
          sub.quoteId ? Quote.findById(sub.quoteId).lean() : null,
          Rfq.findById(sub.rfqId, "title metricSystem").lean(),
        ]);

        return {
          _id: sub._id,
          id: sub._id,
          rfqId: sub.rfqId,
          supplierId: sub.supplierId,
          quoteId: sub.quoteId || null,
          status: sub.status,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
          rfq: rfq
            ? { title: (rfq as any).title, metricSystem: (rfq as any).metricSystem }
            : null,
          quote: quote
            ? {
                quoteNumber: (quote as any).quoteNumber || null,
                totalAmount: (quote as any).totalAmount,
                currency: (quote as any).currency,
              }
            : null,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
