import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProjectDocument extends Document {
  projectId: Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  documentType?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
}

const ProjectDocumentSchema = new Schema<IProjectDocument>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: Number,
  mimeType: String,
  documentType: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

ProjectDocumentSchema.index({ projectId: 1 });

export default mongoose.models.ProjectDocument || mongoose.model<IProjectDocument>("ProjectDocument", ProjectDocumentSchema);
