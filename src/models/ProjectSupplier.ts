import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProjectSupplier extends Document {
  projectId: Types.ObjectId;
  supplierId: Types.ObjectId;
  source: string;
  status: string;
  createdAt: Date;
}

const ProjectSupplierSchema = new Schema<IProjectSupplier>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  source: { type: String, default: "manual" },
  status: { type: String, default: "shortlisted" },
  createdAt: { type: Date, default: Date.now },
});

ProjectSupplierSchema.index({ projectId: 1, supplierId: 1 }, { unique: true });

export default mongoose.models.ProjectSupplier || mongoose.model<IProjectSupplier>("ProjectSupplier", ProjectSupplierSchema);
