import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRfqItem {
  _id?: Types.ObjectId;
  description: string;
  quantity: number;
  metricSpec?: string;
}

export interface IRfq extends Document {
  creatorId: Types.ObjectId;
  title: string;
  description?: string;
  metricSystem: string;
  uniqueLink: string;
  status: "open" | "awaiting_response" | "escalated" | "no_response" | "approval_pending" | "approval_rejected" | "awarded" | "closed" | "cancelled";
  deadline?: Date;
  responseDeadlineAt?: Date;
  escalatedAt?: Date;
  noResponseNotifiedAt?: Date;
  projectId?: Types.ObjectId;
  visibility: string;
  consultantId?: Types.ObjectId;
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  approvalRequestedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  approvalNotes?: string;
  verificationRefreshRequiredAt?: Date;
  verificationRefreshReason?: string;
  fileUrl?: string;
  leadTime?: string;
  currency: string;
  items: IRfqItem[];
  createdAt: Date;
  updatedAt: Date;
}

const RfqItemSchema = new Schema<IRfqItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    metricSpec: String,
  },
  { _id: true }
);

const RfqSchema = new Schema<IRfq>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    metricSystem: { type: String, default: "Metric" },
    uniqueLink: { type: String, unique: true },
    status: {
      type: String,
      default: "open",
      enum: [
        "open",
        "awaiting_response",
        "escalated",
        "no_response",
        "approval_pending",
        "approval_rejected",
        "awarded",
        "closed",
        "cancelled",
      ],
    },
    deadline: Date,
    responseDeadlineAt: Date,
    escalatedAt: Date,
    noResponseNotifiedAt: Date,
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    visibility: { type: String, default: "public", enum: ["public", "targeted", "private"] },
    consultantId: { type: Schema.Types.ObjectId, ref: "User" },
    approvalStatus: {
      type: String,
      default: "not_required",
      enum: ["not_required", "pending", "approved", "rejected"],
    },
    approvalRequestedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    approvalNotes: String,
    verificationRefreshRequiredAt: Date,
    verificationRefreshReason: String,
    fileUrl: String,
    leadTime: String,
    currency: { type: String, default: "AED" },
    items: [RfqItemSchema],
  },
  { timestamps: true }
);

RfqSchema.index({ creatorId: 1 });
RfqSchema.index({ status: 1 });
RfqSchema.index({ uniqueLink: 1 });
RfqSchema.index({ projectId: 1 });
RfqSchema.index({ responseDeadlineAt: 1, status: 1 });
RfqSchema.index({ verificationRefreshRequiredAt: 1 });
RfqSchema.index({ consultantId: 1, approvalStatus: 1 });

export default mongoose.models.Rfq || mongoose.model<IRfq>("Rfq", RfqSchema);
