import mongoose, { Schema, Document } from "mongoose";

export interface IEquipmentType extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentTypeSchema = new Schema<IEquipmentType>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.EquipmentType || mongoose.model<IEquipmentType>("EquipmentType", EquipmentTypeSchema);
