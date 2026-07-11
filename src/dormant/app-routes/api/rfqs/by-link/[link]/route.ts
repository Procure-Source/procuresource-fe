import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Rfq from "@/models/Rfq";
import User from "@/models/User";

// GET /api/rfqs/by-link/[link] — Public: Fetch RFQ by unique link (for supplier submission)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ link: string }> }) {
  try {
    await connectDB();
    const { link } = await params;

    const rfq = await Rfq.findOne({ uniqueLink: link, status: "open" }).lean();
    if (!rfq) {
      return NextResponse.json({ error: "RFQ not found or expired" }, { status: 404 });
    }

    // Fetch creator's profile
    const creatorProfile = await User.findById((rfq as any).creatorId, "companyName isVerified").lean();

    // Transform to snake_case matching original API shape
    const formattedRfq = {
      id: (rfq as any)._id,
      creator_id: (rfq as any).creatorId,
      title: (rfq as any).title,
      description: (rfq as any).description || null,
      metric_system: (rfq as any).metricSystem,
      unique_link: (rfq as any).uniqueLink,
      status: (rfq as any).status,
      deadline: (rfq as any).deadline || null,
      project_id: (rfq as any).projectId || null,
      visibility: (rfq as any).visibility,
      lead_time: (rfq as any).leadTime || null,
      currency: (rfq as any).currency || "AED",
      file_url: (rfq as any).fileUrl || null,
      created_at: (rfq as any).createdAt,
      updated_at: (rfq as any).updatedAt,
      profiles: creatorProfile
        ? { company_name: (creatorProfile as any).companyName || null, is_verified: (creatorProfile as any).isVerified || false }
        : null,
    };

    const formattedItems = ((rfq as any).items || []).map((item: any) => ({
      id: item._id,
      rfq_id: (rfq as any)._id,
      description: item.description,
      quantity: item.quantity,
      metric_spec: item.metricSpec || null,
    }));

    return NextResponse.json({
      rfq: formattedRfq,
      items: formattedItems,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch RFQ" },
      { status: 500 }
    );
  }
}
