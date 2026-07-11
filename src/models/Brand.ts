import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  category?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  verified: boolean;
  productCount: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: String,
    description: String,
    logoUrl: String,
    websiteUrl: String,
    verified: { type: Boolean, default: false },
    productCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

BrandSchema.index({ createdBy: 1 });

export default mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);
