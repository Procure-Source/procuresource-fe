import { NextRequest } from "next/server";

import { awardQuoteInputSchema } from "@/lib/rfq-data";
import {
  jsonError,
  jsonOk,
  readJsonBody,
  repository,
  requirePurchaserActor,
  toApiRfq,
} from "@/app/api/rfqs/_helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const actor = requirePurchaserActor(request);
    const id = decodeURIComponent((await context.params).id);
    const body = await readJsonBody(request);
    const input = awardQuoteInputSchema.parse(body);
    const rfq = await repository().awardQuote(id, input, { actor });

    return jsonOk(toApiRfq(rfq));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return POST(request, context);
}
