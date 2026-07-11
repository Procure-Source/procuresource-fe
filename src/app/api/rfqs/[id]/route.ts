import { NextRequest } from "next/server";

import { updateRfqInputSchema } from "@/lib/rfq-data";
import {
  jsonError,
  jsonOk,
  readJsonBody,
  repository,
  requirePurchaserActor,
  RfqRouteError,
  toApiRfq,
} from "@/app/api/rfqs/_helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const id = decodeURIComponent((await context.params).id);
    const rfq = await repository().getRfq(id);

    if (!rfq) {
      throw new RfqRouteError("RFQ not found.", 404, "RFQ_NOT_FOUND");
    }

    return jsonOk(toApiRfq(rfq));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const actor = requirePurchaserActor(request);
    const id = decodeURIComponent((await context.params).id);
    const body = await readJsonBody(request);
    const input = updateRfqInputSchema.parse(body);
    const rfq = await repository().updateRfq(id, input, { actor });

    return jsonOk(toApiRfq(rfq));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return PATCH(request, context);
}
