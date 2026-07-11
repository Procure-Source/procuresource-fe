import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProductCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: Types.ObjectId;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductCategorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    parentId: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductCategorySchema.index({ parentId: 1 });

export default mongoose.models.ProductCategory || mongoose.model<IProductCategory>("ProductCategory", ProductCategorySchema);
