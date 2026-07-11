import mongoose, { Schema, Document, Types } from "mongoose";

export type NotificationType =
  | "quote_received"
  | "quote_not_selected"
  | "contract_awarded"
  | "delivery_update"
  | "delivery_shipped"
  | "delivery_delivered"
  | "user_verified"
  | "product_approved"
  | "product_rejected"
  | "connection_request"
  | "connection_accepted"
  | "connection_declined"
  | "rfq_created"
  | "rfq_closed"
  | "new_message"
  | "system";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "quote_received",
        "quote_not_selected",
        "contract_awarded",
        "delivery_update",
        "delivery_shipped",
        "delivery_delivered",
        "user_verified",
        "product_approved",
        "product_rejected",
        "connection_request",
        "connection_accepted",
        "connection_declined",
        "rfq_created",
        "rfq_closed",
        "new_message",
        "system",
      ],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    referenceId: String,
    referenceType: String,
    isRead: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
