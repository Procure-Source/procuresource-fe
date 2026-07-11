import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDeliveryEvent {
  _id?: Types.ObjectId;
  eventType: string;
  title: string;
  description?: string;
  oldStatus?: string;
  newStatus?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface IDelivery extends Document {
  contractId: Types.ObjectId;
  status: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  shippingMethod?: string;
  notes?: string;
  events: IDeliveryEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryEventSchema = new Schema<IDeliveryEvent>({
  eventType: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  oldStatus: String,
  newStatus: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const DeliverySchema = new Schema<IDelivery>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: "Contract", required: true },
    status: { type: String, default: "pending", enum: ["pending", "shipped", "in_transit", "delivered", "confirmed"] },
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    trackingNumber: String,
    shippingMethod: String,
    notes: String,
    events: [DeliveryEventSchema],
  },
  { timestamps: true }
);

DeliverySchema.index({ contractId: 1 });

export default mongoose.models.Delivery || mongoose.model<IDelivery>("Delivery", DeliverySchema);
