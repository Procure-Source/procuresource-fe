/* Page copy, kept out of the JSX so it reads as content rather than markup. */

export interface Step {
  number: string;
  label: string;
  line: string;
}

export const steps: Step[] = [
  {
    number: "01",
    label: "Upload the BOQ",
    line: "Your BOQ is organized into structured line items so you can review everything before sending it out.",
  },
  {
    number: "02",
    label: "Share one link",
    line: "Send a single link to every supplier on the package. They submit their quotes directly against your line items.",
  },
  {
    number: "03",
    label: "Compare quotes",
    line: "Every quote lands in a single table, giving you side-by-side comparability on price, lead times, and payment terms.",
  },
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    question: "Is ProcureSource a marketplace?",
    answer:
      "No. ProcureSource is a workflow tool for running RFQs with your existing suppliers. Deals close directly between you and your supplier off-platform, and we do not charge any transaction fees or commissions.",
  },
  {
    id: "faq-2",
    question: "Do suppliers need an account before I can invite them?",
    answer:
      "No. You send a single shareable link to your suppliers. When they open it, they go through a quick registration process and land directly on your BOQ line items to start quoting immediately.",
  },
  {
    id: "faq-3",
    question: "What file formats does a BOQ upload accept?",
    answer:
      "We accept Excel, CSV, and readable PDF BOQs. Our system structures your document into clear line items, allowing you to review and adjust everything before your RFQ goes out.",
  },
  {
    id: "faq-4",
    question: "Who can see my BOQ and pricing?",
    answer:
      "Only you and the suppliers you invite. Each supplier can only view the BOQ line items you shared and their own submission. They cannot see other suppliers’ prices, lead times, or who else was invited. The comparison table is strictly visible to your team.",
  },
  {
    id: "faq-5",
    question: "What does it cost?",
    answer:
      "ProcureSource is completely free for procurement teams. We do not charge transaction fees, take commissions, or charge you to run RFQs.",
  },
  {
    id: "faq-6",
    question: "When does wider access open?",
    answer:
      "We are working with a small group of UAE MEP procurement teams first so that we can support each team’s first RFQ properly. Request access and we will come back to you as places open.",
  },
];

export interface Backer {
  name: string;
  src: string;
  /* Intrinsic ratio only — the strip sizes every logo by height in CSS. */
  width: number;
  height: number;
  /* Optical sizing. A two-line lockup carries its type at a third the height
     of its bounding box, so matching boxes does not mean matching presence. */
  size?: "tight";
}

/* Files live in public/logos/, all transparent. Add a backer here and it
   joins the strip. */
export const backers: Backer[] = [
  {
    name: "Dubai Founders HQ",
    src: "/logos/dubai-founders-logo.webp",
    width: 546,
    height: 225,
  },
  {
    name: "Ignyte",
    src: "/logos/ignyte.png",
    width: 444,
    height: 134,
  },
  {
    name: "Dubai Future Foundation",
    src: "/logos/dubai-future-foundation.png",
    width: 455,
    height: 55,
    size: "tight",
  },
];
