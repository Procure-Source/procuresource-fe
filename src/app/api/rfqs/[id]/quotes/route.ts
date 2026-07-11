import { NextRequest } from "next/server";

import { listQuotes, submitQuote } from "@/app/api/rfqs/_quote-handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return listQuotes(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return submitQuote(request, context);
}
