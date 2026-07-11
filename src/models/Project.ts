import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  creatorId: Types.ObjectId;
  name: string;
  location?: string;
  projectType?: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    location: String,
    projectType: String,
    description: String,
    status: { type: String, default: "active", enum: ["active", "completed", "archived"] },
  },
  { timestamps: true }
);

ProjectSchema.index({ creatorId: 1 });

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
