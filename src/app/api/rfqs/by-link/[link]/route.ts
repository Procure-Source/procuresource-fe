import { NextRequest } from "next/server";

import {
  jsonError,
  jsonOk,
  repository,
  RfqRouteError,
  toApiRfq,
} from "@/app/api/rfqs/_helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ link: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const publicId = decodeURIComponent((await context.params).link);
    const rfq = await repository().getRfqByPublicId(publicId);

    if (!rfq || ["closed", "cancelled"].includes(rfq.status)) {
      throw new RfqRouteError("RFQ not found or no longer available.", 404, "RFQ_NOT_AVAILABLE");
    }

    return jsonOk(toApiRfq(rfq), { status: 200 }, { items: rfq.lineItems });
  } catch (error) {
    return jsonError(error);
  }
}
