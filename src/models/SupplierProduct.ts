import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICertification {
  _id?: Types.ObjectId;
  certificationType: string;
  certificateNumber?: string;
  standard?: string;
  issuingAuthority?: string;
  mandatory?: string;
  appliesIn?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
}

export interface ISupplierProduct extends Document {
  supplierId: Types.ObjectId;
  name: string;
  slug: string;
  brand?: string;
  brandId?: Types.ObjectId;
  category?: string;
  productType?: string;
  modelNumber?: string;
  description?: string;
  technicalSpecs?: Record<string, unknown>;
  priceRangeMin?: number;
  priceRangeMax?: number;
  currency: string;
  availability: string;
  serviceRegions: string[];
  status: string;
  rejectionReason?: string;
  reviewedAt?: Date;
  certifications: ICertification[];
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema = new Schema<ICertification>({
  certificationType: { type: String, required: true },
  certificateNumber: String,
  standard: String,
  issuingAuthority: String,
  mandatory: String,
  appliesIn: String,
  notes: String,
  fileUrl: String,
  fileName: String,
  issuedDate: Date,
  expiryDate: Date,
  createdAt: { type: Date, default: Date.now },
});

const SupplierProductSchema = new Schema<ISupplierProduct>(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    brand: String,
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    category: String,
    productType: String,
    modelNumber: String,
    description: String,
    technicalSpecs: Schema.Types.Mixed,
    priceRangeMin: Number,
    priceRangeMax: Number,
    currency: { type: String, default: "AED" },
    availability: { type: String, default: "in_stock" },
    serviceRegions: { type: [String], default: [] },
    status: { type: String, default: "pending", enum: ["pending", "approved", "rejected"] },
    rejectionReason: String,
    reviewedAt: Date,
    certifications: [CertificationSchema],
  },
  { timestamps: true }
);

SupplierProductSchema.index({ supplierId: 1 });
SupplierProductSchema.index({ status: 1 });
SupplierProductSchema.index({ slug: 1 });
SupplierProductSchema.index({ brandId: 1 });

export default mongoose.models.SupplierProduct || mongoose.model<ISupplierProduct>("SupplierProduct", SupplierProductSchema);
