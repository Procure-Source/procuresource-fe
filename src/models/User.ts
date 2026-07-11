import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  companyName?: string;
  role: "supplier" | "manufacturer" | "agent" | "purchase_manager" | "consultant" | "admin";
  tags: string[];
  phone?: string;
  accountStatus: "active" | "document_review" | "resubmission_required" | "suspended" | "reactivation_pending";
  verificationDueAt?: Date;
  suspendedAt?: Date;
  suspensionReason?: string;
  reactivationRequestedAt?: Date;
  backupContacts?: Array<{
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    lastConfirmedAt?: Date;
  }>;
  isVerified: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, default: "" },
    companyName: { type: String },
    role: { type: String, enum: ["supplier", "manufacturer", "agent", "purchase_manager", "consultant", "admin"], default: "purchase_manager" },
    tags: { type: [String], default: [] },
    phone: { type: String },
    accountStatus: {
      type: String,
      default: "document_review",
      enum: ["active", "document_review", "resubmission_required", "suspended", "reactivation_pending"],
      index: true,
    },
    verificationDueAt: Date,
    suspendedAt: Date,
    suspensionReason: String,
    reactivationRequestedAt: Date,
    backupContacts: {
      type: [
        {
          name: { type: String, required: true },
          email: String,
          phone: String,
          role: String,
          lastConfirmedAt: Date,
        },
      ],
      default: [],
    },
    isVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ tags: 1 });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
