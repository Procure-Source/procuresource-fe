import { NextRequest } from "next/server";

import { submitQuoteInputSchema } from "@/lib/rfq-data";
import {
  jsonError,
  jsonOk,
  readJsonBody,
  repository,
  requireSupplierActor,
  RfqRouteError,
  toApiQuote,
  toApiRfq,
} from "@/app/api/rfqs/_helpers";

type QuoteRouteContext = {
  params: Promise<{ id: string }>;
};

export async function submitQuote(request: NextRequest, context: QuoteRouteContext) {
  try {
    const actor = requireSupplierActor(request);
    const id = decodeURIComponent((await context.params).id);
    const body = await readJsonBody(request);
    const input = submitQuoteInputSchema.parse(body);
    const { quote, rfq } = await repository().submitQuote(id, input, { actor });

    return jsonOk(toApiQuote(quote), { status: 201 }, { rfq: toApiRfq(rfq) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function listQuotes(_request: NextRequest, context: QuoteRouteContext) {
  try {
    const id = decodeURIComponent((await context.params).id);
    const rfq = await repository().getRfq(id);

    if (!rfq) {
      throw new RfqRouteError("RFQ not found.", 404, "RFQ_NOT_FOUND");
    }

    return jsonOk(rfq.quotes.map(toApiQuote), { status: 200 }, { total: rfq.quotes.length });
  } catch (error) {
    return jsonError(error);
  }
}
