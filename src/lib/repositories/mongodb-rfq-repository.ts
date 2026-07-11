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
import { getRfqRecordModel } from "@/lib/db/rfq-record-model";
import {
  RfqRepositoryError,
  type RfqListQuery,
  type RfqListResult,
  type RfqMutationContext,
  type RfqRepository,
} from "@/lib/repositories/rfq-repository";

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

function toRecord(value: unknown): RfqRecord {
  return clone(value) as RfqRecord;
}

async function createPublicId(title: string) {
  const model = await getRfqRecordModel();
  const base = sanitizePublicId(title) || "rfq";
  let candidate = `${base}-${randomPart().slice(0, 6)}`;

  while (await model.exists({ publicId: candidate })) {
    candidate = `${base}-${randomPart().slice(0, 6)}`;
  }

  return candidate;
}

async function findRfq(id: string): Promise<RfqRecord | null> {
  const model = await getRfqRecordModel();
  const record = await model.findOne({ $or: [{ id }, { publicId: id }] }).lean<RfqRecord>().exec();
  return record ? toRecord(record) : null;
}

class MongodbRfqRepository implements RfqRepository {
  async listRfqs(query: RfqListQuery): Promise<RfqListResult> {
    const model = await getRfqRecordModel();
    const limit = Math.max(1, Math.min(query.limit || 50, 100));
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.visibility) filter.visibility = query.visibility;
    if (query.createdById) filter.createdById = query.createdById;
    if (query.publicOnly) {
      filter.visibility = "public";
      filter.status = { $nin: ["closed", "cancelled"] };
    }

    const [items, total] = await Promise.all([
      model.find(filter).sort({ createdAt: -1 }).limit(limit).lean<RfqRecord[]>().exec(),
      model.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map(toRecord),
      total,
    };
  }

  async createRfq(input: CreateRfqInput, context: RfqMutationContext): Promise<RfqRecord> {
    const model = await getRfqRecordModel();
    const timestamp = nowIso(context);
    const rfq: RfqRecord = {
      id: createId("rfq"),
      publicId: await createPublicId(input.title),
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

    await model.create(rfq);
    return clone(rfq);
  }

  async getRfq(id: string): Promise<RfqRecord | null> {
    return findRfq(id);
  }

  async getRfqByPublicId(publicId: string): Promise<RfqRecord | null> {
    const model = await getRfqRecordModel();
    const rfq = await model.findOne({ publicId }).lean<RfqRecord>().exec();
    return rfq ? toRecord(rfq) : null;
  }

  async updateRfq(id: string, input: UpdateRfqInput, context: RfqMutationContext): Promise<RfqRecord> {
    const existing = await findRfq(id);
    if (!existing) {
      throw new RfqRepositoryError("RFQ not found.", 404, "RFQ_NOT_FOUND");
    }

    const updated: RfqRecord = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      projectName: input.projectName ?? existing.projectName,
      metricSystem: input.metricSystem ?? existing.metricSystem,
      status: input.status ?? existing.status,
      visibility: input.visibility ?? existing.visibility,
      deadline: input.deadline ?? existing.deadline,
      responseDeadlineAt: input.responseDeadlineAt ?? existing.responseDeadlineAt,
      leadTime: input.leadTime ?? existing.leadTime,
      currency: input.currency ?? existing.currency,
      fileUrl: input.fileUrl ?? existing.fileUrl,
      lineItems: input.lineItems ? normalizeLineItems(input.lineItems) : existing.lineItems,
      updatedAt: nowIso(context),
    };

    const model = await getRfqRecordModel();
    await model.updateOne({ id: existing.id }, updated, { runValidators: true }).exec();
    return clone(updated);
  }

  async updateStatus(id: string, status: RfqRecord["status"], context: RfqMutationContext): Promise<RfqRecord> {
    const existing = await findRfq(id);
    if (!existing) {
      throw new RfqRepositoryError("RFQ not found.", 404, "RFQ_NOT_FOUND");
    }

    const updated = {
      ...existing,
      status,
      updatedAt: nowIso(context),
    };

    const model = await getRfqRecordModel();
    await model.updateOne({ id: existing.id }, updated, { runValidators: true }).exec();
    return clone(updated);
  }

  async submitQuote(id: string, input: SubmitQuoteInput, context: RfqMutationContext) {
    const rfq = await findRfq(id);
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
      lineItems: normalizeQuoteLineItems(input.lineItems, rfq),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const updated: RfqRecord = {
      ...rfq,
      status: rfq.status === "awarded" ? rfq.status : "quoted",
      quotes: [...rfq.quotes, quote],
      updatedAt: timestamp,
    };

    const model = await getRfqRecordModel();
    await model.updateOne({ id: rfq.id }, updated, { runValidators: true }).exec();

    return {
      rfq: clone(updated),
      quote: clone(quote),
    };
  }

  async awardQuote(id: string, input: AwardQuoteInput, context: RfqMutationContext): Promise<RfqRecord> {
    const rfq = await findRfq(id);
    if (!rfq) {
      throw new RfqRepositoryError("RFQ not found.", 404, "RFQ_NOT_FOUND");
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

    const model = await getRfqRecordModel();
    await model.updateOne({ id: rfq.id }, updated, { runValidators: true }).exec();
    return clone(updated);
  }
}

let mongodbRepository: RfqRepository | null = null;

export function getMongodbRfqRepository(): RfqRepository {
  if (!mongodbRepository) {
    mongodbRepository = new MongodbRfqRepository();
  }

  return mongodbRepository;
}
