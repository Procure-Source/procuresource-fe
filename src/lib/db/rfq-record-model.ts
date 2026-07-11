import mongoose, { Schema, type Model } from "mongoose";

import connectDB from "@/lib/db";
import type { RfqRecord } from "@/lib/rfq-data";

const QuoteLineItemSchema = new Schema(
  {
    id: { type: String, required: true },
    rfqItemId: String,
    description: String,
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    compliant: Boolean,
    remarks: String,
    metricSpec: String,
  },
  { _id: false },
);

const SupplierQuoteSchema = new Schema(
  {
    id: { type: String, required: true },
    rfqId: { type: String, required: true },
    supplierId: String,
    supplierName: { type: String, required: true },
    contactName: String,
    email: String,
    quoteNumber: String,
    currency: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    leadTimeDays: Number,
    leadTime: String,
    validUntil: String,
    complianceScore: Number,
    notes: String,
    status: { type: String, required: true },
    lineItems: { type: [QuoteLineItemSchema], default: [] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { _id: false },
);

const RfqLineItemSchema = new Schema(
  {
    id: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    metricSpec: String,
    specification: String,
    category: String,
    requiredCertifications: { type: [String], default: [] },
  },
  { _id: false },
);

const RfqRecordSchema = new Schema<RfqRecord>(
  {
    id: { type: String, required: true, unique: true },
    publicId: { type: String, required: true, unique: true },
    createdById: { type: String, required: true, index: true },
    purchaserCompanyName: String,
    title: { type: String, required: true },
    description: String,
    projectName: String,
    metricSystem: { type: String, required: true },
    status: { type: String, required: true, index: true },
    visibility: { type: String, required: true, index: true },
    deadline: String,
    responseDeadlineAt: String,
    awardedQuoteId: String,
    awardedAt: String,
    awardedById: String,
    awardNotes: String,
    leadTime: String,
    currency: { type: String, required: true },
    fileUrl: String,
    lineItems: { type: [RfqLineItemSchema], default: [] },
    quotes: { type: [SupplierQuoteSchema], default: [] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    collection: "rfq_records",
    versionKey: false,
  },
);

RfqRecordSchema.index({ createdAt: -1 });
RfqRecordSchema.index({ publicId: 1, visibility: 1 });

export async function getRfqRecordModel(): Promise<Model<RfqRecord>> {
  await connectDB();
  return (mongoose.models.ProcureSourceRfqRecord as Model<RfqRecord> | undefined) ||
    mongoose.model<RfqRecord>("ProcureSourceRfqRecord", RfqRecordSchema);
}
