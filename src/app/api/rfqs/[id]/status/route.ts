import { NextRequest } from "next/server";

import { updateRfqStatusInputSchema } from "@/lib/rfq-data";
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const actor = requirePurchaserActor(request);
    const id = decodeURIComponent((await context.params).id);
    const body = await readJsonBody(request);
    const input = updateRfqStatusInputSchema.parse(body);
    const rfq = await repository().updateStatus(id, input.status, { actor });

    return jsonOk(toApiRfq(rfq), { status: 200 }, { note: input.note || null });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return PATCH(request, context);
}
