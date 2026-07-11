import { NextRequest } from "next/server";

import { createRfqInputSchema } from "@/lib/rfq-data";
import { publishSupplierAlert } from "@/lib/alerts";
import {
  getActor,
  jsonError,
  jsonOk,
  parseListQuery,
  readJsonBody,
  repository,
  requirePurchaserActor,
  toApiRfq,
} from "@/app/api/rfqs/_helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const actor = getActor(request, "purchase_manager");
    const result = await repository().listRfqs(parseListQuery(request, actor));

    return jsonOk(result.items.map(toApiRfq), { status: 200 }, { total: result.total });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = requirePurchaserActor(request);
    const body = await readJsonBody(request);
    const input = createRfqInputSchema.parse(body);
    const rfq = await repository().createRfq(input, { actor });
    const apiRfq = toApiRfq(rfq);

    try {
      publishSupplierAlert({ rfq: apiRfq });
    } catch {
      // RFQ creation should not fail if the non-critical alert cache cannot update.
    }

    return jsonOk(apiRfq, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
