import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFlaggedContent extends Document {
  contentType: string;
  contentId: Types.ObjectId;
  flaggedBy: Types.ObjectId;
  reason: string;
  description?: string;
  status: string;
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

const FlaggedContentSchema = new Schema<IFlaggedContent>({
  contentType: { type: String, required: true },
  contentId: { type: Schema.Types.ObjectId, required: true },
  flaggedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  description: String,
  status: { type: String, default: "pending", enum: ["pending", "dismissed", "action_taken"] },
  reviewedBy: String,
  reviewNote: String,
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

FlaggedContentSchema.index({ contentType: 1, contentId: 1, flaggedBy: 1 }, { unique: true });
FlaggedContentSchema.index({ status: 1 });

export default mongoose.models.FlaggedContent || mongoose.model<IFlaggedContent>("FlaggedContent", FlaggedContentSchema);
