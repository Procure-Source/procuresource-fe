import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVerificationRecord extends Document {
  manufacturerName: string;
  productLine?: string;
  modelNumber?: string;
  certificateNumber?: string;
  standard: string;
  issuingAuthority: string;
  status: "verified" | "mismatch" | "stale" | "pending";
  lifecycleStatus: "active" | "reverification_due" | "disputed" | "suspended" | "superseded" | "archived";
  verifiedOn?: Date;
  nextReviewOn?: Date;
  expiresOn?: Date;
  reviewIntervalDays?: number;
  lastReverificationTriggeredOn?: Date;
  reverificationReason?: string;
  mismatchNote?: string;
  disputeStatus?: "open" | "investigating" | "resolved" | "rejected";
  disputeReason?: string;
  disputedAt?: Date;
  disputedBy?: Types.ObjectId;
  resolvedAt?: Date;
  productSpecVersion?: string;
  supersededByVersion?: string;
  effectiveFrom?: Date;
  versionNotes?: string;
  affectedProjectIds?: Types.ObjectId[];
  agentName?: string;
  agentRegion?: string;
  agentCity?: string;
  agentCountry?: string;
  distanceToDubaiKm?: number;
  distanceToAbuDhabiKm?: number;
  distanceToSharjahKm?: number;
  agentAuthorizationStatus: "verified" | "mismatch" | "stale" | "pending";
  agentConfirmedOn?: Date;
  confirmationMethod?: string;
  pricingCurrency?: string;
  pricingRange?: string;
  pricingBasis?: "verified_quote" | "supplier_reported" | "not_recorded";
  pricingEstimateAmount?: number;
  pricingEstimateCurrency?: string;
  pricingEstimateConfidence?: "quoted" | "budgetary" | "indicative";
  pricingUpdatedOn?: Date;
  pricingSource?: string;
  documentsOnFile?: boolean;
  phoneConfirmed?: boolean;
  verificationSources?: Array<{
    label: string;
    evidence: string;
    checkedOn: Date;
    status: "verified" | "mismatch" | "stale" | "pending";
  }>;
  avgResponseHours?: number;
  responseSampleSize?: number;
  claimedLeadWeeks?: number;
  observedLeadWeeks?: number;
  observedLeadSampleSize?: number;
  projectShortlistCount?: number;
  projectSelectedCount?: number;
  substitutionRequestCount?: number;
  verifierName?: string;
  verifierRole?: string;
  verifierOrganization?: string;
  verifierProfileUrl?: string;
  verifierCreditStatement?: string;
  contractClause?: string;
  trail: Array<{
    date: Date;
    method: string;
    outcome: string;
    source: string;
  }>;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationTrailSchema = new Schema(
  {
    date: { type: Date, required: true },
    method: { type: String, required: true },
    outcome: { type: String, required: true },
    source: { type: String, required: true },
  },
  { _id: false }
);

const VerificationSourceSchema = new Schema(
  {
    label: { type: String, required: true },
    evidence: { type: String, required: true },
    checkedOn: { type: Date, required: true },
    status: {
      type: String,
      default: "pending",
      enum: ["verified", "mismatch", "stale", "pending"],
    },
  },
  { _id: false }
);

const VerificationRecordSchema = new Schema<IVerificationRecord>(
  {
    manufacturerName: { type: String, required: true, index: true },
    productLine: String,
    modelNumber: String,
    certificateNumber: { type: String, index: true },
    standard: { type: String, required: true },
    issuingAuthority: { type: String, required: true },
    status: {
      type: String,
      default: "pending",
      enum: ["verified", "mismatch", "stale", "pending"],
      index: true,
    },
    lifecycleStatus: {
      type: String,
      default: "active",
      enum: ["active", "reverification_due", "disputed", "suspended", "superseded", "archived"],
      index: true,
    },
    verifiedOn: Date,
    nextReviewOn: Date,
    expiresOn: Date,
    reviewIntervalDays: { type: Number, default: 90 },
    lastReverificationTriggeredOn: Date,
    reverificationReason: String,
    mismatchNote: String,
    disputeStatus: {
      type: String,
      enum: ["open", "investigating", "resolved", "rejected"],
    },
    disputeReason: String,
    disputedAt: Date,
    disputedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: Date,
    productSpecVersion: { type: String, default: "v1" },
    supersededByVersion: String,
    effectiveFrom: Date,
    versionNotes: String,
    affectedProjectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    agentName: String,
    agentRegion: String,
    agentCity: String,
    agentCountry: String,
    distanceToDubaiKm: Number,
    distanceToAbuDhabiKm: Number,
    distanceToSharjahKm: Number,
    agentAuthorizationStatus: {
      type: String,
      default: "pending",
      enum: ["verified", "mismatch", "stale", "pending"],
    },
    agentConfirmedOn: Date,
    confirmationMethod: String,
    pricingCurrency: String,
    pricingRange: String,
    pricingBasis: {
      type: String,
      default: "not_recorded",
      enum: ["verified_quote", "supplier_reported", "not_recorded"],
    },
    pricingEstimateAmount: Number,
    pricingEstimateCurrency: String,
    pricingEstimateConfidence: {
      type: String,
      enum: ["quoted", "budgetary", "indicative"],
    },
    pricingUpdatedOn: Date,
    pricingSource: String,
    documentsOnFile: Boolean,
    phoneConfirmed: Boolean,
    verificationSources: { type: [VerificationSourceSchema], default: [] },
    avgResponseHours: Number,
    responseSampleSize: Number,
    claimedLeadWeeks: Number,
    observedLeadWeeks: Number,
    observedLeadSampleSize: Number,
    projectShortlistCount: Number,
    projectSelectedCount: Number,
    substitutionRequestCount: Number,
    verifierName: String,
    verifierRole: String,
    verifierOrganization: String,
    verifierProfileUrl: String,
    verifierCreditStatement: String,
    contractClause: String,
    trail: { type: [VerificationTrailSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

VerificationRecordSchema.index({ manufacturerName: 1, modelNumber: 1, standard: 1 });
VerificationRecordSchema.index({ lifecycleStatus: 1, nextReviewOn: 1 });
VerificationRecordSchema.index({ expiresOn: 1, lifecycleStatus: 1 });
VerificationRecordSchema.index({ productSpecVersion: 1, manufacturerName: 1, modelNumber: 1 });

export default mongoose.models.VerificationRecord ||
  mongoose.model<IVerificationRecord>("VerificationRecord", VerificationRecordSchema);
