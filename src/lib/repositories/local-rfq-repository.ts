import {
  canAcceptQuotes,
  quoteCountIsWithinLimit,
  sanitizePublicId,
  type AwardQuoteInput,
  type CreateRfqInput,
  type QuoteLineItem,
  type RfqLineItem,
  type RfqLineItemInput,
  type RfqRecord,
  type SubmitQuoteInput,
  type SupplierQuote,
  type UpdateRfqInput,
} from "@/lib/rfq-data";
import {
  RfqRepositoryError,
  type RfqListQuery,
  type RfqListResult,
  type RfqMutationContext,
  type RfqRepository,
} from "@/lib/repositories/rfq-repository";

type LocalRfqStore = {
  rfqs: Map<string, RfqRecord>;
};

declare global {
  var __procureSourceRfqStore: LocalRfqStore | undefined;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso(context?: RfqMutationContext) {
  return (context?.now || new Date()).toISOString();
}

function randomPart() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }

  return Math.random().toString(36).slice(2, 14);
}

function createId(prefix: string) {
  return `${prefix}_${randomPart()}`;
}

function createPublicId(store: LocalRfqStore, title: string) {
  const base = sanitizePublicId(title) || "rfq";
  let candidate = `${base}-${randomPart().slice(0, 6)}`;

  while ([...store.rfqs.values()].some((rfq) => rfq.publicId === candidate)) {
    candidate = `${base}-${randomPart().slice(0, 6)}`;
  }

  return candidate;
}

function normalizeLineItems(items: RfqLineItemInput[]): RfqLineItem[] {
  return items.map((item, index) => ({
    id: item.id || `item_${String(index + 1).padStart(3, "0")}`,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    metricSpec: item.metricSpec,
    specification: item.specification,
    category: item.category,
    requiredCertifications: item.requiredCertifications,
  }));
}

function normalizeQuoteLineItems(items: SubmitQuoteInput["lineItems"], rfq: RfqRecord): QuoteLineItem[] {
  return items.map((item, index) => {
    const rfqItem = item.rfqItemId ? rfq.lineItems.find((lineItem) => lineItem.id === item.rfqItemId) : undefined;

    return {
      id: item.id || `quote_item_${String(index + 1).padStart(3, "0")}`,
      rfqItemId: item.rfqItemId,
      description: item.description || rfqItem?.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      compliant: item.compliant,
      remarks: item.remarks,
      metricSpec: item.metricSpec || rfqItem?.metricSpec,
    };
  });
}

function getStore() {
  if (!globalThis.__procureSourceRfqStore) {
    globalThis.__procureSourceRfqStore = {
      rfqs: new Map(),
    };
  }

  return globalThis.__procureSourceRfqStore;
}

class LocalRfqRepository implements RfqRepository {
  async listRfqs(query: RfqListQuery): Promise<RfqListResult> {
    const store = getStore();
    const limit = Math.max(1, Math.min(query.limit || 50, 100));
    let items = [...store.rfqs.values()];

    if (query.status) {
      items = items.filter((rfq) => rfq.status === query.status);
    }

    if (query.visibility) {
      items = items.filter((rfq) => rfq.visibility === query.visibility);
    }

    if (query.createdById) {
      items = items.filter((rfq) => rfq.createdById === query.createdById);
    }

    if (query.publicOnly) {
      items = items.filter((rfq) => rfq.visibility === "public" && !["closed", "cancelled"].includes(rfq.status));
    }

    items = items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return {
      items: clone(items.slice(0, limit)),
      total: items.length,
    };
  }

  async createRfq(input: CreateRfqInput, context: RfqMutationContext): Promise<RfqRecord> {
    const store = getStore();
    const timestamp = nowIso(context);
    const id = createId("rfq");
    const rfq: RfqRecord = {
      id,
      publicId: createPublicId(store, input.title),
      createdById: context.actor.id,
      purchaserCompanyName: input.purchaserCompanyName || context.actor.companyName,
      title: input.title,
      description: input.description,
      projectName: input.projectName,
      metricSystem: input.metricSystem,
      status: input.status,
      visibility: input.visibility,
      deadline: input.deadline,
      responseDeadlineAt: input.responseDeadlineAt,
      leadTime: input.leadTime,
      currency: input.currency,
      fileUrl: input.fileUrl,
      lineItems: normalizeLineItems(input.lineItems),
      quotes: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.rfqs.set(rfq.id, clone(rfq));
    return clone(rfq);
  }

  async getRfq(id: string): Promise<RfqRecord | null> {
    const store = getStore();
    const direct = store.rfqs.get(id);
    if (direct) return clone(direct);

    const byPublicId = [...store.rfqs.values()].find((rfq) => rfq.publicId === id);
    return byPublicId ? clone(byPublicId) : null;
  }

  async getRfqByPublicId(publicId: string): Promise<RfqRecord | null> {
    const store = getStore();
    const rfq = [...store.rfqs.values()].find((item) => item.publicId === publicId);
    return rfq ? clone(rfq) : null;
  }

  async updateRfq(id: string, input: UpdateRfqInput, context: RfqMutationContext): Promise<RfqRecord> {
    const store = getStore();
    const rfq = store.rfqs.get(id) || [...store.rfqs.values()].find((item) => item.publicId === id);
    if (!rfq) {
      throw new RfqRepositoryError("RFQ not found.", 404, "RFQ_NOT_FOUND");
    }

    const updated: RfqRecord = {
      ...rfq,
      title: input.title ?? rfq.title,
      description: input.description ?? rfq.description,
      projectName: input.projectName ?? rfq.projectName,
      metricSystem: input.metricSystem ?? rfq.metricSystem,
      status: input.status ?? rfq.status,
      visibility: input.visibility ?? rfq.visibility,
      deadline: input.deadline ?? rfq.deadline,
      responseDeadlineAt: input.responseDeadlineAt ?? rfq.responseDeadlineAt,
      leadTime: input.leadTime ?? rfq.leadTime,
      currency: input.currency ?? rfq.currency,
      fileUrl: input.fileUrl ?? rfq.fileUrl,
      lineItems: input.lineItems ? normalizeLineItems(input.lineItems) : rfq.lineItems,
      updatedAt: nowIso(context),
    };

    store.rfqs.set(updated.id, clone(updated));
    return clone(updated);
  }

  async updateStatus(id: string, status: RfqRecord["status"], context: RfqMutationContext): Promise<RfqRecord> {
    const store = getStore();
    const rfq = store.rfqs.get(id) || [...store.rfqs.values()].find((item) => item.publicId === id);

    if (!rfq) {
      throw new RfqRepositoryError("RFQ not found.", 404, "RFQ_NOT_FOUND");
    }

    const updated = {
      ...rfq,
      status,
      updatedAt: nowIso(context),
    };

    store.rfqs.set(updated.id, clone(updated));
    return clone(updated);
  }

  async submitQuote(id: string, input: SubmitQuoteInput, context: RfqMutationContext) {
    const store = getStore();
    const rfq = store.rfqs.get(id) || [...store.rfqs.values()].find((item) => item.publicId === id);

    if (!rfq) {
      throw new RfqRepositoryError("RFQ not found.", 404, "RFQ_NOT_FOUND");
    }

    if (!canAcceptQuotes(rfq.status)) {
      throw new RfqRepositoryError("This RFQ is not accepting supplier quotes.", 409, "RFQ_NOT_ACCEPTING_QUOTES");
    }

    if (!quoteCountIsWithinLimit(rfq)) {
      throw new RfqRepositoryError("This RFQ has reached its quote limit.", 409, "RFQ_QUOTE_LIMIT");
    }

    const timestamp = nowIso(context);
    const lineItems = normalizeQuoteLineItems(input.lineItems, rfq);
    const quote: SupplierQuote = {
      id: createId("quote"),
      rfqId: rfq.id,
      supplierId: input.supplierId || (context.actor.role !== "anonymous" ? context.actor.id : undefined),
      supplierName:
        input.supplierName ||
        context.actor.companyName ||
        context.actor.contactName ||
        context.actor.email ||
        "Local supplier",
      contactName: input.contactName || context.actor.contactName,
      email: input.email || context.actor.email,
      quoteNumber: input.quoteNumber || `QT-${randomPart().slice(0, 8).toUpperCase()}`,
      currency: input.currency || rfq.currency,
      totalAmount: input.totalAmount,
      leadTimeDays: input.leadTimeDays,
      leadTime: input.leadTime,
      validUntil: input.validUntil,
      complianceScore: input.complianceScore,
      notes: input.notes,
      status: "submitted",
      lineItems,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updated: RfqRecord = {
      ...rfq,
      status: rfq.status === "awarded" ? rfq.status : "quoted",
      quotes: [...rfq.quotes, quote],
      updatedAt: timestamp,
    };

    store.rfqs.set(updated.id, clone(updated));

    return {
      rfq: clone(updated),
      quote: clone(quote),
    };
  }

  async awardQuote(id: string, input: AwardQuoteInput, context: RfqMutationContext): Promise<RfqRecord> {
    const store = getStore();
    const rfq = store.rfqs.get(id) || [...store.rfqs.values()].find((item) => item.publicId === id);

    if (!rfq) {
      throw new RfqRepositoryError("RFQ not found.", 404, "RFQ_NOT_FOUND");
    }

    if (!input.quoteId) {
      throw new RfqRepositoryError("quoteId is required.", 400, "RFQ_QUOTE_REQUIRED");
    }

    const winningQuote = rfq.quotes.find((quote) => quote.id === input.quoteId);
    if (!winningQuote) {
      throw new RfqRepositoryError("Quote not found for this RFQ.", 404, "RFQ_QUOTE_NOT_FOUND");
    }

    const timestamp = nowIso(context);
    const updated: RfqRecord = {
      ...rfq,
      status: "awarded",
      awardedQuoteId: input.quoteId,
      awardedAt: timestamp,
      awardedById: context.actor.id,
      awardNotes: input.notes,
      quotes: rfq.quotes.map((quote) => ({
        ...quote,
        status: quote.id === input.quoteId ? "accepted" : quote.status === "withdrawn" ? quote.status : "rejected",
        updatedAt: timestamp,
      })),
      updatedAt: timestamp,
    };

    store.rfqs.set(updated.id, clone(updated));
    return clone(updated);
  }
}

let localRepository: RfqRepository | null = null;

export function getLocalRfqRepository(): RfqRepository {
  if (!localRepository) {
    localRepository = new LocalRfqRepository();
  }

  return localRepository;
}
