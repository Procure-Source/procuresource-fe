import { z } from "zod";

const MAX_ITEMS = 250;
const MAX_QUOTES = 500;

export type MetricSystem = "Metric" | "Imperial";

const optionalString = (maxLength: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.replace(/\u0000/g, "").trim();
      return trimmed ? trimmed.slice(0, maxLength) : undefined;
    });

const requiredString = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).transform((value) => value.replace(/\u0000/g, ""));

const optionalFiniteNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().refine(Number.isFinite).optional(),
);

const optionalNonNegativeNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().nonnegative().refine(Number.isFinite).optional(),
);

const quantityNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? 1 : value),
  z.coerce.number().positive().max(1_000_000).refine(Number.isFinite),
);

const optionalDateString = optionalString(80).refine(
  (value) => !value || !Number.isNaN(Date.parse(value)),
  "Expected an ISO date string.",
);

const currencyCode = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return "AED";
    const normalized = value.trim().toUpperCase();
    return /^[A-Z]{3}$/.test(normalized) ? normalized : "AED";
  });

export const metricSystemSchema = z
  .union([z.literal("Metric"), z.literal("Imperial"), z.literal("metric"), z.literal("imperial")])
  .transform((value): MetricSystem => (value.toLowerCase() === "imperial" ? "Imperial" : "Metric"));

export const rfqStatusSchema = z.enum([
  "draft",
  "open",
  "awaiting_response",
  "quoted",
  "escalated",
  "no_response",
  "approval_pending",
  "approval_rejected",
  "awarded",
  "closed",
  "cancelled",
]);

export const quoteStatusSchema = z.enum(["submitted", "accepted", "rejected", "withdrawn"]);
export const rfqVisibilitySchema = z.enum(["public", "targeted", "private"]);

export type RfqStatus = z.output<typeof rfqStatusSchema>;
export type QuoteStatus = z.output<typeof quoteStatusSchema>;
export type RfqVisibility = z.output<typeof rfqVisibilitySchema>;

export type RfqLineItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  metricSpec?: string;
  specification?: string;
  category?: string;
  requiredCertifications: string[];
};

export type QuoteLineItem = {
  id: string;
  rfqItemId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  compliant?: boolean;
  remarks?: string;
  metricSpec?: string;
};

export type SupplierQuote = {
  id: string;
  rfqId: string;
  supplierId?: string;
  supplierName: string;
  contactName?: string;
  email?: string;
  quoteNumber?: string;
  currency: string;
  totalAmount: number;
  leadTimeDays?: number;
  leadTime?: string;
  validUntil?: string;
  complianceScore?: number;
  notes?: string;
  status: QuoteStatus;
  lineItems: QuoteLineItem[];
  createdAt: string;
  updatedAt: string;
};

export type RfqRecord = {
  id: string;
  publicId: string;
  createdById: string;
  purchaserCompanyName?: string;
  title: string;
  description?: string;
  projectName?: string;
  metricSystem: MetricSystem;
  status: RfqStatus;
  visibility: RfqVisibility;
  deadline?: string;
  responseDeadlineAt?: string;
  awardedQuoteId?: string;
  awardedAt?: string;
  awardedById?: string;
  awardNotes?: string;
  leadTime?: string;
  currency: string;
  fileUrl?: string;
  lineItems: RfqLineItem[];
  quotes: SupplierQuote[];
  createdAt: string;
  updatedAt: string;
};

export const rfqLineItemInputSchema = z
  .object({
    id: optionalString(120),
    description: requiredString(300),
    quantity: quantityNumber,
    unit: optionalString(40),
    metricSpec: optionalString(1000),
    metric_spec: optionalString(1000),
    specification: optionalString(1200),
    category: optionalString(80),
    requiredCertifications: z.array(requiredString(80)).max(24).optional(),
    required_certifications: z.array(requiredString(80)).max(24).optional(),
  })
  .passthrough()
  .transform((value) => ({
    id: value.id,
    description: value.description,
    quantity: value.quantity,
    unit: value.unit || "lot",
    metricSpec: value.metricSpec || value.metric_spec,
    specification: value.specification,
    category: value.category,
    requiredCertifications: value.requiredCertifications || value.required_certifications || [],
  }));

export const quoteLineItemInputSchema = z
  .object({
    id: optionalString(120),
    rfqItemId: optionalString(120),
    rfq_item_id: optionalString(120),
    boqItemId: optionalString(120),
    boq_item_id: optionalString(120),
    description: optionalString(300),
    quantity: quantityNumber,
    unitPrice: optionalNonNegativeNumber,
    unit_price: optionalNonNegativeNumber,
    totalPrice: optionalNonNegativeNumber,
    total_price: optionalNonNegativeNumber,
    compliant: z.boolean().optional(),
    remarks: optionalString(1000),
    metricSpec: optionalString(1000),
    metric_spec: optionalString(1000),
  })
  .passthrough()
  .transform((value) => {
    const unitPrice = value.unitPrice ?? value.unit_price ?? 0;
    const totalPrice = value.totalPrice ?? value.total_price ?? unitPrice * value.quantity;

    return {
      id: value.id,
      rfqItemId: value.rfqItemId || value.rfq_item_id || value.boqItemId || value.boq_item_id,
      description: value.description,
      quantity: value.quantity,
      unitPrice,
      totalPrice,
      compliant: value.compliant,
      remarks: value.remarks,
      metricSpec: value.metricSpec || value.metric_spec,
    };
  });

export const createRfqInputSchema = z
  .object({
    title: requiredString(180),
    description: optionalString(3000),
    projectName: optionalString(180),
    project_name: optionalString(180),
    purchaserCompanyName: optionalString(180),
    purchaser_company_name: optionalString(180),
    metricSystem: metricSystemSchema.optional(),
    metric_system: metricSystemSchema.optional(),
    status: rfqStatusSchema.optional(),
    visibility: rfqVisibilitySchema.optional(),
    deadline: optionalDateString.optional(),
    responseDeadlineAt: optionalDateString.optional(),
    response_deadline_at: optionalDateString.optional(),
    leadTime: optionalString(120),
    lead_time: optionalString(120),
    currency: currencyCode.optional(),
    fileUrl: optionalString(1000),
    file_url: optionalString(1000),
    lineItems: z.array(rfqLineItemInputSchema).max(MAX_ITEMS).optional(),
    items: z.array(rfqLineItemInputSchema).max(MAX_ITEMS).optional(),
    rfq_items: z.array(rfqLineItemInputSchema).max(MAX_ITEMS).optional(),
  })
  .passthrough()
  .transform((value) => {
    const visibility = value.visibility || "public";

    return {
      title: value.title,
      description: value.description,
      projectName: value.projectName || value.project_name,
      purchaserCompanyName: value.purchaserCompanyName || value.purchaser_company_name,
      metricSystem: value.metricSystem || value.metric_system || "Metric",
      status: value.status || (visibility === "targeted" ? "awaiting_response" : "open"),
      visibility,
      deadline: value.deadline,
      responseDeadlineAt: value.responseDeadlineAt || value.response_deadline_at,
      leadTime: value.leadTime || value.lead_time,
      currency: value.currency || "AED",
      fileUrl: value.fileUrl || value.file_url,
      lineItems: value.lineItems || value.items || value.rfq_items || [],
    };
  });

export const updateRfqInputSchema = z
  .object({
    title: requiredString(180).optional(),
    description: optionalString(3000),
    projectName: optionalString(180),
    project_name: optionalString(180),
    metricSystem: metricSystemSchema.optional(),
    metric_system: metricSystemSchema.optional(),
    status: rfqStatusSchema.optional(),
    visibility: rfqVisibilitySchema.optional(),
    deadline: optionalDateString.optional(),
    responseDeadlineAt: optionalDateString.optional(),
    response_deadline_at: optionalDateString.optional(),
    leadTime: optionalString(120),
    lead_time: optionalString(120),
    currency: currencyCode.optional(),
    fileUrl: optionalString(1000),
    file_url: optionalString(1000),
    lineItems: z.array(rfqLineItemInputSchema).max(MAX_ITEMS).optional(),
    items: z.array(rfqLineItemInputSchema).max(MAX_ITEMS).optional(),
    rfq_items: z.array(rfqLineItemInputSchema).max(MAX_ITEMS).optional(),
  })
  .passthrough()
  .transform((value) => ({
    title: value.title,
    description: value.description,
    projectName: value.projectName || value.project_name,
    metricSystem: value.metricSystem || value.metric_system,
    status: value.status,
    visibility: value.visibility,
    deadline: value.deadline,
    responseDeadlineAt: value.responseDeadlineAt || value.response_deadline_at,
    leadTime: value.leadTime || value.lead_time,
    currency: value.currency,
    fileUrl: value.fileUrl || value.file_url,
    lineItems: value.lineItems || value.items || value.rfq_items,
  }));

export const submitQuoteInputSchema = z
  .object({
    supplierId: optionalString(120),
    supplier_id: optionalString(120),
    supplierName: optionalString(180),
    supplier_name: optionalString(180),
    contactName: optionalString(180),
    contact_name: optionalString(180),
    email: optionalString(180).refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Expected a valid email address.",
    }),
    quoteNumber: optionalString(80),
    quote_number: optionalString(80),
    totalAmount: optionalNonNegativeNumber,
    total_amount: optionalNonNegativeNumber,
    currency: currencyCode.optional(),
    leadTimeDays: optionalFiniteNumber,
    lead_time_days: optionalFiniteNumber,
    leadTime: optionalString(120),
    lead_time: optionalString(120),
    validUntil: optionalDateString.optional(),
    valid_until: optionalDateString.optional(),
    complianceScore: optionalNonNegativeNumber.refine((value) => value === undefined || value <= 100, {
      message: "Compliance score must be between 0 and 100.",
    }),
    compliance_score: optionalNonNegativeNumber.refine((value) => value === undefined || value <= 100, {
      message: "Compliance score must be between 0 and 100.",
    }),
    notes: optionalString(3000),
    lineItems: z.array(quoteLineItemInputSchema).max(MAX_ITEMS).optional(),
    items: z.array(quoteLineItemInputSchema).max(MAX_ITEMS).optional(),
    quote_items: z.array(quoteLineItemInputSchema).max(MAX_ITEMS).optional(),
  })
  .passthrough()
  .transform((value) => {
    const lineItems = value.lineItems || value.items || value.quote_items || [];
    const totalFromItems = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      supplierId: value.supplierId || value.supplier_id,
      supplierName: value.supplierName || value.supplier_name,
      contactName: value.contactName || value.contact_name,
      email: value.email,
      quoteNumber: value.quoteNumber || value.quote_number,
      totalAmount: value.totalAmount ?? value.total_amount ?? totalFromItems,
      currency: value.currency || "AED",
      leadTimeDays: value.leadTimeDays ?? value.lead_time_days,
      leadTime: value.leadTime || value.lead_time,
      validUntil: value.validUntil || value.valid_until,
      complianceScore: value.complianceScore ?? value.compliance_score,
      notes: value.notes,
      lineItems,
    };
  });

export const updateRfqStatusInputSchema = z
  .object({
    status: rfqStatusSchema,
    note: optionalString(1000),
    reason: optionalString(1000),
  })
  .passthrough()
  .transform((value) => ({
    status: value.status,
    note: value.note || value.reason,
  }));

export const awardQuoteInputSchema = z
  .object({
    quoteId: optionalString(120),
    quote_id: optionalString(120),
    notes: optionalString(1000),
  })
  .passthrough()
  .transform((value) => ({
    quoteId: value.quoteId || value.quote_id,
    notes: value.notes,
  }))
  .refine((value) => Boolean(value.quoteId), {
    message: "quoteId is required.",
    path: ["quoteId"],
  });

export type RfqLineItemInput = z.output<typeof rfqLineItemInputSchema>;
export type QuoteLineItemInput = z.output<typeof quoteLineItemInputSchema>;
export type CreateRfqInput = z.output<typeof createRfqInputSchema>;
export type UpdateRfqInput = z.output<typeof updateRfqInputSchema>;
export type SubmitQuoteInput = z.output<typeof submitQuoteInputSchema>;
export type UpdateRfqStatusInput = z.output<typeof updateRfqStatusInputSchema>;
export type AwardQuoteInput = z.output<typeof awardQuoteInputSchema>;

export function canAcceptQuotes(status: RfqStatus) {
  return ["open", "awaiting_response", "quoted", "escalated"].includes(status);
}

export function defaultSharePath(publicId: string) {
  return `/rfqs?link=${encodeURIComponent(publicId)}`;
}

export function sanitizePublicId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function quoteCountIsWithinLimit(rfq: RfqRecord) {
  return rfq.quotes.length < MAX_QUOTES;
}
