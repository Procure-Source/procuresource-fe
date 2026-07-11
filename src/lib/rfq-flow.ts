import {
  Award,
  ClipboardCheck,
  FileUp,
  GitCompare,
  Link2,
  type LucideIcon,
} from "lucide-react";

export type BoqLineItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  specification: string;
  category: string;
  confidence: number;
};

export type SupplierQuote = {
  id: string;
  supplierName: string;
  contactName: string;
  email: string;
  currency: string;
  total: number;
  leadTimeDays: number;
  complianceScore: number;
  notes: string;
  lineItems: Array<{
    boqItemId: string;
    unitPrice: number;
    total: number;
    compliant: boolean;
    remarks: string;
  }>;
};

export type RfqRecord = {
  id: string;
  title: string;
  projectName: string;
  metricSystem: "Metric" | "Imperial";
  createdAt: string;
  status: "draft" | "shared" | "quoted" | "awarded";
  lineItems: BoqLineItem[];
  shareUrl?: string;
  quotes: SupplierQuote[];
  awardedQuoteId?: string;
};

export type RfqFlowStep = {
  id: string;
  number: string;
  title: string;
  detail: string;
  icon: LucideIcon;
};

export const rfqFlowSteps: RfqFlowStep[] = [
  {
    id: "upload",
    number: "1.",
    title: "Upload BOQ",
    detail: "Turn it into clear line items",
    icon: FileUp,
  },
  {
    id: "share",
    number: "2.",
    title: "Share a link",
    detail: "Suppliers quote from one link",
    icon: Link2,
  },
  {
    id: "compare",
    number: "3.",
    title: "Compare",
    detail: "See supplier quotes side by side",
    icon: GitCompare,
  },
  {
    id: "award",
    number: "4.",
    title: "Award",
    detail: "Select and export",
    icon: Award,
  },
];

export const buyerUseCases = [
  "Upload BOQ and clean the line items.",
  "Lock the quote basis.",
  "Send one supplier link.",
  "Compare price, lead time, and proof.",
  "Award and export the summary.",
];

export const supplierUseCases = [
  "Open the RFQ link.",
  "Quote the requested line items.",
  "Add lead time and exceptions.",
  "Attach required proof.",
  "Track quote and award status.",
];

export function formatMoney(value: number, currency = "AED") {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildAwardSummary(rfq: RfqRecord, quote: SupplierQuote) {
  const lines = [
    "ProcureSource RFQ Award Summary",
    "",
    `RFQ: ${rfq.title}`,
    `Project: ${rfq.projectName}`,
    `Metric basis: ${rfq.metricSystem}`,
    `Awarded supplier: ${quote.supplierName}`,
    `Contact: ${quote.contactName} <${quote.email}>`,
    `Total: ${formatMoney(quote.total, quote.currency)}`,
    `Lead time: ${quote.leadTimeDays} days`,
    `Compliance score: ${quote.complianceScore}%`,
    "",
    "Line Items",
    ...quote.lineItems.map((item, index) => {
      const boqItem = rfq.lineItems.find((lineItem) => lineItem.id === item.boqItemId);
      return `${index + 1}. ${boqItem?.description || item.boqItemId} - ${formatMoney(
        item.total,
        quote.currency,
      )} - ${item.compliant ? "Compliant" : "Exception"} - ${item.remarks}`;
    }),
    "",
    "Generated for review. Final award requires commercial, legal, consultant, and authority checks.",
  ];

  return lines.join("\n");
}

export function buildEmptyRfq(lineItems: BoqLineItem[] = []): RfqRecord {
  const id = `rfq-${Date.now().toString(36)}`;
  return {
    id,
    title: "New RFQ",
    projectName: "",
    metricSystem: "Metric",
    createdAt: new Date().toISOString(),
    status: "draft",
    lineItems,
    shareUrl: `/rfqs?link=${id}`,
    quotes: [],
  };
}

export const productMilestones = [
  {
    label: "BOQ",
    value: "Clear line items",
    icon: ClipboardCheck,
  },
  {
    label: "Suppliers",
    value: "One quote link",
    icon: Link2,
  },
  {
    label: "Award",
    value: "Clean export",
    icon: Award,
  },
];
