import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRfqInvitation extends Document {
  rfqId: Types.ObjectId;
  supplierId: Types.ObjectId;
  status: "pending" | "viewed" | "accepted" | "declined" | "responded" | "no_response" | "escalated" | "expired" | "backup_contacted" | "agent_non_responsive";
  invitedAt: Date;
  viewedAt?: Date;
  respondedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
  escalationDueAt?: Date;
  escalationNotifiedAt?: Date;
  nonResponsiveDueAt?: Date;
  agentNonResponsiveAt?: Date;
  responseScoreImpact?: number;
  backupContactName?: string;
  backupContactEmail?: string;
  backupContactPhone?: string;
  backupContactedAt?: Date;
}

const RfqInvitationSchema = new Schema<IRfqInvitation>({
  rfqId: { type: Schema.Types.ObjectId, ref: "Rfq", required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "viewed", "accepted", "declined", "responded", "no_response", "escalated", "expired", "backup_contacted", "agent_non_responsive"],
  },
  invitedAt: { type: Date, default: Date.now },
  viewedAt: Date,
  respondedAt: Date,
  declinedAt: Date,
  declineReason: String,
  escalationDueAt: Date,
  escalationNotifiedAt: Date,
  nonResponsiveDueAt: Date,
  agentNonResponsiveAt: Date,
  responseScoreImpact: Number,
  backupContactName: String,
  backupContactEmail: String,
  backupContactPhone: String,
  backupContactedAt: Date,
});

RfqInvitationSchema.index({ rfqId: 1, supplierId: 1 }, { unique: true });
RfqInvitationSchema.index({ status: 1, escalationDueAt: 1 });
RfqInvitationSchema.index({ status: 1, nonResponsiveDueAt: 1 });

export default mongoose.models.RfqInvitation || mongoose.model<IRfqInvitation>("RfqInvitation", RfqInvitationSchema);
