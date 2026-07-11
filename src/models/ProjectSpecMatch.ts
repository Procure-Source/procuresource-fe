import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProjectSpecMatch extends Document {
  projectId: Types.ObjectId;
  specText?: string;
  matchResults?: Record<string, unknown>;
  createdAt: Date;
}

const ProjectSpecMatchSchema = new Schema<IProjectSpecMatch>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  specText: String,
  matchResults: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

ProjectSpecMatchSchema.index({ projectId: 1 });

export default mongoose.models.ProjectSpecMatch || mongoose.model<IProjectSpecMatch>("ProjectSpecMatch", ProjectSpecMatchSchema);
