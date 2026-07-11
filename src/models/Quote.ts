import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuoteItem {
  _id?: Types.ObjectId;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metricSpec?: string;
}

export interface IQuote extends Document {
  rfqId: Types.ObjectId;
  supplierId: Types.ObjectId;
  quoteNumber?: string;
  totalAmount: number;
  currency: string;
  leadTime?: string;
  validUntil?: Date;
  notes?: string;
  status: string;
  items: IQuoteItem[];
  createdAt: Date;
  updatedAt: Date;
}

const QuoteItemSchema = new Schema<IQuoteItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    metricSpec: String,
  },
  { _id: true }
);

const QuoteSchema = new Schema<IQuote>(
  {
    rfqId: { type: Schema.Types.ObjectId, ref: "Rfq", required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quoteNumber: String,
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: "AED" },
    leadTime: String,
    validUntil: Date,
    notes: String,
    status: { type: String, default: "submitted", enum: ["submitted", "accepted", "rejected"] },
    items: [QuoteItemSchema],
  },
  { timestamps: true }
);

QuoteSchema.index({ rfqId: 1 });
QuoteSchema.index({ supplierId: 1 });

export default mongoose.models.Quote || mongoose.model<IQuote>("Quote", QuoteSchema);
