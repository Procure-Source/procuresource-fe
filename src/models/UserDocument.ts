import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserDocument extends Document {
  userId: Types.ObjectId;
  documentType: string;
  fileName: string;
  fileUrl: string;
  verifiedAt?: Date;
  createdAt: Date;
}

const UserDocumentSchema = new Schema<IUserDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    documentType: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    verifiedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UserDocumentSchema.index({ userId: 1 });

export default mongoose.models.UserDocument || mongoose.model<IUserDocument>("UserDocument", UserDocumentSchema);
