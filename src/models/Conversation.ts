import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  type: "direct" | "rfq" | "contract";
  rfqId?: Types.ObjectId;
  contractId?: Types.ObjectId;
  title?: string;
  lastMessageAt: Date;
  lastMessagePreview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ["direct", "rfq", "contract"], default: "direct" },
    rfqId: { type: Schema.Types.ObjectId, ref: "Rfq" },
    contractId: { type: Schema.Types.ObjectId, ref: "Contract" },
    title: String,
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: String,
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ rfqId: 1 }, { sparse: true });
ConversationSchema.index({ contractId: 1 }, { sparse: true });

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
