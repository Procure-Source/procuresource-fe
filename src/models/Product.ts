import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  brandId?: Types.ObjectId;
  equipmentTypeId?: Types.ObjectId;
  modelNumber?: string;
  capacity?: string;
  description?: string;
  specifications?: Record<string, unknown>;
  isCertified: boolean;
  certificationType?: string;
  productCategory?: string;
  productType?: string;
  standardCode?: string;
  issuingAuthority?: string;
  isMandatory: boolean;
  appliesIn?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    equipmentTypeId: { type: Schema.Types.ObjectId, ref: "EquipmentType" },
    modelNumber: String,
    capacity: String,
    description: String,
    specifications: Schema.Types.Mixed,
    isCertified: { type: Boolean, default: false },
    certificationType: String,
    productCategory: String,
    productType: String,
    standardCode: String,
    issuingAuthority: String,
    isMandatory: { type: Boolean, default: false },
    appliesIn: String,
    notes: String,
  },
  { timestamps: true }
);

ProductSchema.index({ brandId: 1 });
ProductSchema.index({ equipmentTypeId: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
