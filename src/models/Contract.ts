import mongoose, { Schema, Document, Types } from "mongoose";

export interface IContract extends Document {
  rfqId: Types.ObjectId;
  rfqSubmissionId: Types.ObjectId;
  quoteId: Types.ObjectId;
  pmId: Types.ObjectId;
  supplierId: Types.ObjectId;
  contractNumber: string;
  title: string;
  totalValue: number;
  currency: string;
  terms?: string;
  paymentTerms?: string;
  deliveryDeadline?: Date;
  status: "awarded" | "consultant_review" | "signed" | "in_progress" | "reverification_required" | "disputed" | "completed" | "cancelled";
  consultantId?: Types.ObjectId;
  consultantApprovalStatus: "not_required" | "pending" | "approved" | "rejected";
  consultantApprovalRequestedAt?: Date;
  consultantApprovedAt?: Date;
  consultantRejectedAt?: Date;
  consultantRejectionReason?: string;
  certificationRecheckAt?: Date;
  certificationRecheckReason?: string;
  certificationExpiredAt?: Date;
  disputedAt?: Date;
  disputeReason?: string;
  disputeStatus?: "open" | "investigating" | "resolved" | "rejected";
  awardedAt: Date;
  signedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    rfqId: { type: Schema.Types.ObjectId, ref: "Rfq", required: true },
    rfqSubmissionId: { type: Schema.Types.ObjectId, ref: "RfqSubmission", required: true },
    quoteId: { type: Schema.Types.ObjectId, ref: "Quote", required: true },
    pmId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contractNumber: { type: String, required: true },
    title: { type: String, required: true },
    totalValue: { type: Number, required: true },
    currency: { type: String, default: "AED" },
    terms: String,
    paymentTerms: String,
    deliveryDeadline: Date,
    status: {
      type: String,
      default: "awarded",
      enum: ["awarded", "consultant_review", "signed", "in_progress", "reverification_required", "disputed", "completed", "cancelled"],
    },
    consultantId: { type: Schema.Types.ObjectId, ref: "User" },
    consultantApprovalStatus: {
      type: String,
      default: "not_required",
      enum: ["not_required", "pending", "approved", "rejected"],
    },
    consultantApprovalRequestedAt: Date,
    consultantApprovedAt: Date,
    consultantRejectedAt: Date,
    consultantRejectionReason: String,
    certificationRecheckAt: Date,
    certificationRecheckReason: String,
    certificationExpiredAt: Date,
    disputedAt: Date,
    disputeReason: String,
    disputeStatus: {
      type: String,
      enum: ["open", "investigating", "resolved", "rejected"],
    },
    awardedAt: { type: Date, default: Date.now },
    signedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

ContractSchema.index({ pmId: 1 });
ContractSchema.index({ supplierId: 1 });
ContractSchema.index({ rfqId: 1 });
ContractSchema.index({ consultantId: 1, consultantApprovalStatus: 1 });
ContractSchema.index({ certificationRecheckAt: 1, status: 1 });
ContractSchema.index({ disputeStatus: 1 });

export default mongoose.models.Contract || mongoose.model<IContract>("Contract", ContractSchema);
