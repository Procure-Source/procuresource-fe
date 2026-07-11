import type {
  AwardQuoteInput,
  CreateRfqInput,
  RfqRecord,
  RfqStatus,
  RfqVisibility,
  SubmitQuoteInput,
  SupplierQuote,
  UpdateRfqInput,
} from "@/lib/rfq-data";

export type RfqActor = {
  id: string;
  role: "purchase_manager" | "purchaser_admin" | "supplier" | "supplier_admin" | "admin" | "anonymous";
  email?: string;
  companyName?: string;
  contactName?: string;
};

export type RfqListQuery = {
  status?: RfqStatus;
  visibility?: RfqVisibility;
  createdById?: string;
  publicOnly?: boolean;
  limit?: number;
};

export type RfqListResult = {
  items: RfqRecord[];
  total: number;
};

export type RfqMutationContext = {
  actor: RfqActor;
  now?: Date;
};

export interface RfqRepository {
  listRfqs(query: RfqListQuery): Promise<RfqListResult>;
  createRfq(input: CreateRfqInput, context: RfqMutationContext): Promise<RfqRecord>;
  getRfq(id: string): Promise<RfqRecord | null>;
  getRfqByPublicId(publicId: string): Promise<RfqRecord | null>;
  updateRfq(id: string, input: UpdateRfqInput, context: RfqMutationContext): Promise<RfqRecord>;
  updateStatus(id: string, status: RfqStatus, context: RfqMutationContext): Promise<RfqRecord>;
  submitQuote(id: string, input: SubmitQuoteInput, context: RfqMutationContext): Promise<{
    rfq: RfqRecord;
    quote: SupplierQuote;
  }>;
  awardQuote(id: string, input: AwardQuoteInput, context: RfqMutationContext): Promise<RfqRecord>;
}

export class RfqRepositoryError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = "RFQ_REPOSITORY_ERROR") {
    super(message);
    this.name = "RfqRepositoryError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
