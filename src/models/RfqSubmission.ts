import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRfqSubmission extends Document {
  rfqId: Types.ObjectId;
  supplierId: Types.ObjectId;
  quoteId?: Types.ObjectId;
  quoteData?: Record<string, unknown>;
  status: "pending" | "accepted" | "rejected" | "declined" | "withdrawn" | "awarded_lost" | "clarification_requested";
  declinedAt?: Date;
  declineReason?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  awardNotifiedAt?: Date;
  clarificationRequestedAt?: Date;
  clarificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RfqSubmissionSchema = new Schema<IRfqSubmission>(
  {
    rfqId: { type: Schema.Types.ObjectId, ref: "Rfq", required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quoteId: { type: Schema.Types.ObjectId, ref: "Quote" },
    quoteData: Schema.Types.Mixed,
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected", "declined", "withdrawn", "awarded_lost", "clarification_requested"],
    },
    declinedAt: Date,
    declineReason: String,
    rejectedAt: Date,
    rejectionReason: String,
    awardNotifiedAt: Date,
    clarificationRequestedAt: Date,
    clarificationNotes: String,
  },
  { timestamps: true }
);

RfqSubmissionSchema.index({ rfqId: 1 });
RfqSubmissionSchema.index({ supplierId: 1 });
RfqSubmissionSchema.index({ rfqId: 1, status: 1 });

export default mongoose.models.RfqSubmission || mongoose.model<IRfqSubmission>("RfqSubmission", RfqSubmissionSchema);
