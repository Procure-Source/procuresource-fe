import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getRfqRepository } from "@/lib/db/rfq-persistence";
import { getUserFromRequest } from "@/lib/auth";
import {
  defaultSharePath,
  rfqStatusSchema,
  rfqVisibilitySchema,
  type RfqLineItem,
  type RfqRecord,
  type SupplierQuote,
} from "@/lib/rfq-data";
import {
  RfqRepositoryError,
  type RfqActor,
  type RfqListQuery,
  type RfqRepository,
} from "@/lib/repositories/rfq-repository";

const jsonHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

const validRoles = new Set<RfqActor["role"]>([
  "purchase_manager",
  "purchaser_admin",
  "supplier",
  "supplier_admin",
  "admin",
  "anonymous",
]);

export class RfqRouteError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "RfqRouteError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function repository(): RfqRepository {
  return getRfqRepository();
}

export function jsonOk(data: unknown, init?: ResponseInit, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      ok: true,
      data,
      ...extra,
    },
    {
      ...init,
      headers: {
        ...jsonHeaders,
        ...init?.headers,
      },
    },
  );
}

export function jsonError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400, headers: jsonHeaders },
    );
  }

  if (error instanceof RfqRepositoryError || error instanceof RfqRouteError) {
    return NextResponse.json(
      {
        ok: false,
        code: error.code,
        message: error.message,
      },
      { status: error.statusCode, headers: jsonHeaders },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      code: "INTERNAL_ERROR",
      message: "RFQ request could not be processed.",
    },
    { status: 500, headers: jsonHeaders },
  );
}

export async function readJsonBody(request: Request, limitBytes = 1024 * 1024) {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";
  if (contentType && !contentType.includes("application/json")) {
    throw new RfqRouteError("Unsupported content type.", 415, "UNSUPPORTED_CONTENT_TYPE");
  }

  const raw = await request.text();
  if (!raw.trim()) return {};

  if (new TextEncoder().encode(raw).length > limitBytes) {
    throw new RfqRouteError("Request body is too large.", 413, "REQUEST_TOO_LARGE");
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new RfqRouteError("Invalid JSON body.", 400, "INVALID_JSON");
  }
}

export function getActor(request: NextRequest, fallbackRole: RfqActor["role"]): RfqActor | null {
  const auth = getUserFromRequest(request);
  if (auth) {
    return {
      id: auth.userId,
      role: normalizeRole(auth.role, fallbackRole),
      email: auth.email,
    };
  }

  if (process.env.NODE_ENV === "production" && !canUseLocalActorFallback(request)) {
    return null;
  }

  const headerRole = normalizeRole(request.headers.get("x-procuresource-actor-role"), fallbackRole);
  const actorId = request.headers.get("x-procuresource-actor-id")?.trim() || `local-${headerRole}`;

  return {
    id: actorId,
    role: headerRole,
    email: request.headers.get("x-procuresource-actor-email")?.trim() || undefined,
    companyName: request.headers.get("x-procuresource-company")?.trim() || undefined,
    contactName: request.headers.get("x-procuresource-contact")?.trim() || undefined,
  };
}

function canUseLocalActorFallback(request: NextRequest) {
  if (process.env.RFQ_ALLOW_LOCAL_FALLBACK === "true") return true;

  const host = request.headers.get("host")?.toLowerCase() || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function requirePurchaserActor(request: NextRequest) {
  const actor = getActor(request, "purchase_manager");

  if (!actor) {
    throw new RfqRouteError("Authentication is required.", 401, "AUTH_REQUIRED");
  }

  if (!["purchase_manager", "purchaser_admin", "admin"].includes(actor.role)) {
    throw new RfqRouteError("Purchaser access is required.", 403, "PURCHASER_REQUIRED");
  }

  return actor;
}

export function requireSupplierActor(request: NextRequest) {
  const actor = getActor(request, "supplier");

  if (!actor) {
    throw new RfqRouteError("Supplier authentication is required.", 401, "SUPPLIER_AUTH_REQUIRED");
  }

  if (!["supplier", "supplier_admin", "admin"].includes(actor.role)) {
    throw new RfqRouteError("Supplier access is required.", 403, "SUPPLIER_REQUIRED");
  }

  return actor;
}

export function parseListQuery(request: NextRequest, actor: RfqActor | null): RfqListQuery {
  const { searchParams } = new URL(request.url);
  const statusValue = searchParams.get("status") || undefined;
  const visibilityValue = searchParams.get("visibility") || undefined;
  const publicOnly = searchParams.get("public") === "true" || (!actor && process.env.NODE_ENV === "production");
  const limit = Number(searchParams.get("limit") || "50");
  const status = statusValue ? rfqStatusSchema.parse(statusValue) : undefined;
  const visibility = visibilityValue ? rfqVisibilitySchema.parse(visibilityValue) : undefined;
  const createdById = searchParams.get("createdById") || searchParams.get("creator_id") || undefined;

  return {
    status,
    visibility,
    createdById: createdById || (!publicOnly && actor?.role.startsWith("purchase") ? actor.id : undefined),
    publicOnly,
    limit: Number.isFinite(limit) ? limit : 50,
  };
}

export function toApiRfq(rfq: RfqRecord) {
  return {
    ...rfq,
    uniqueLink: rfq.publicId,
    shareUrl: defaultSharePath(rfq.publicId),
    created_by_id: rfq.createdById,
    public_id: rfq.publicId,
    purchaser_company_name: rfq.purchaserCompanyName || null,
    project_name: rfq.projectName || null,
    metric_system: rfq.metricSystem,
    awarded_quote_id: rfq.awardedQuoteId || null,
    awarded_at: rfq.awardedAt || null,
    awarded_by_id: rfq.awardedById || null,
    award_notes: rfq.awardNotes || null,
    lead_time: rfq.leadTime || null,
    file_url: rfq.fileUrl || null,
    created_at: rfq.createdAt,
    updated_at: rfq.updatedAt,
    lineItems: rfq.lineItems.map(toApiLineItem),
    rfq_items: rfq.lineItems.map(toApiLineItem),
    quotes: rfq.quotes.map(toApiQuote),
  };
}

export function toApiQuote(quote: SupplierQuote) {
  return {
    ...quote,
    rfq_id: quote.rfqId,
    supplier_id: quote.supplierId || null,
    supplier_name: quote.supplierName,
    contact_name: quote.contactName || null,
    quote_number: quote.quoteNumber || null,
    total_amount: quote.totalAmount,
    lead_time_days: quote.leadTimeDays || null,
    lead_time: quote.leadTime || null,
    valid_until: quote.validUntil || null,
    compliance_score: quote.complianceScore || null,
    created_at: quote.createdAt,
    updated_at: quote.updatedAt,
    lineItems: quote.lineItems.map((item) => ({
      ...item,
      rfq_item_id: item.rfqItemId || null,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      metric_spec: item.metricSpec || null,
    })),
    quote_items: quote.lineItems.map((item) => ({
      ...item,
      rfq_item_id: item.rfqItemId || null,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      metric_spec: item.metricSpec || null,
    })),
  };
}

function toApiLineItem(item: RfqLineItem) {
  return {
    ...item,
    metric_spec: item.metricSpec || null,
    required_certifications: item.requiredCertifications,
  };
}

function normalizeRole(role: string | null | undefined, fallbackRole: RfqActor["role"]): RfqActor["role"] {
  const normalized = role?.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized && validRoles.has(normalized as RfqActor["role"])) {
    return normalized as RfqActor["role"];
  }

  if (normalized?.includes("supplier")) return "supplier";
  if (normalized?.includes("admin")) return "admin";
  if (normalized?.includes("purchase") || normalized?.includes("purchaser") || normalized === "pm") {
    return "purchase_manager";
  }

  return fallbackRole;
}
