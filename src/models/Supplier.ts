import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISupplier extends Document {
  userId: Types.ObjectId;
  name: string;
  slug: string;
  type: string;
  specializations: string[];
  email?: string;
  phone?: string;
  websiteUrl?: string;
  address?: string;
  country?: string;
  city?: string;
  isVerified: boolean;
  certifications: string[];
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String },
    type: { type: String, default: "distributor", enum: ["manufacturer", "distributor", "dealer_agent", "service_provider", "rental_company", "freight_logistics", "inspection_agency", "certification_body"] },
    specializations: { type: [String], default: [] },
    email: String,
    phone: String,
    websiteUrl: String,
    address: String,
    country: String,
    city: String,
    isVerified: { type: Boolean, default: false },
    certifications: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SupplierSchema.index({ isVerified: 1 });
SupplierSchema.index({ slug: 1 });

export default mongoose.models.Supplier || mongoose.model<ISupplier>("Supplier", SupplierSchema);
