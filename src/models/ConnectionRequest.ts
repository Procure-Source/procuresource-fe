import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConnectionRequest extends Document {
  requesterId: Types.ObjectId;
  supplierId: Types.ObjectId;
  intent: string;
  message?: string;
  status: string;
  respondedAt?: Date;
  createdAt: Date;
}

const ConnectionRequestSchema = new Schema<IConnectionRequest>({
  requesterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  intent: { type: String, required: true },
  message: String,
  status: { type: String, default: "pending", enum: ["pending", "accepted", "declined"] },
  respondedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

ConnectionRequestSchema.index({ requesterId: 1, supplierId: 1 }, { unique: true });

export default mongoose.models.ConnectionRequest || mongoose.model<IConnectionRequest>("ConnectionRequest", ConnectionRequestSchema);
