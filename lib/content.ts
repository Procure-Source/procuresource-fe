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
    question: "What is ProcureSource?",
    answer:
      "ProcureSource is a procurement workspace built for project teams managing MEP and construction purchasing. It brings BOQs, RFQs, supplier quotations, and commercial comparison into a structured workflow so teams can move from requirement to purchasing decision with a clear record of what was requested, quoted, and selected.",
  },
  {
    id: "faq-2",
    question: "Is ProcureSource a supplier marketplace?",
    answer:
      "No. ProcureSource is not a marketplace and does not replace your supplier relationships. You remain in control of which suppliers receive an RFQ, how suppliers are evaluated, and who you ultimately purchase from. ProcureSource provides the workflow and procurement record around those interactions.",
  },
  {
    id: "faq-3",
    question: "How does ProcureSource handle a BOQ?",
    answer:
      "A BOQ becomes the structured basis for an RFQ. Line items, quantities, units, descriptions, and relevant requirements are organized so suppliers can respond against a consistent request. Your team can review the structured BOQ before sending it to suppliers.",
  },
  {
    id: "faq-4",
    question: "Can I invite my existing suppliers?",
    answer:
      "Yes. ProcureSource is designed around your existing supplier network. You decide which suppliers participate in each RFQ, rather than being limited to a marketplace directory or an unfamiliar supplier pool.",
  },
  {
    id: "faq-5",
    question: "Can suppliers see each other's quotations?",
    answer:
      "No. Supplier responses are isolated from one another. A supplier can respond to the RFQ they received, but cannot see another supplier's pricing, commercial terms, lead time, or submission. Buyer-side comparison is kept within the procurement workspace.",
  },
  {
    id: "faq-6",
    question: "What happens after suppliers submit quotations?",
    answer:
      "Supplier quotations are brought into a common structure so your team can compare commercial responses against the original requirement. The goal is to make differences in price, quantity, unit, lead time, and other quotation details easier to identify before a purchasing decision is made.",
  },
  {
    id: "faq-7",
    question: "Does ProcureSource replace our procurement process?",
    answer:
      "No. ProcureSource structures and strengthens the process you already run. Your procurement team retains responsibility for specifications, supplier selection, approvals, negotiation, and the final purchasing decision.",
  },
  {
    id: "faq-8",
    question: "Does ProcureSource take a commission from suppliers?",
    answer:
      "ProcureSource is designed as procurement software rather than a transaction marketplace. Supplier relationships and commercial agreements remain between the buyer and supplier.",
  },
  {
    id: "faq-9",
    question: "Who is ProcureSource built for?",
    answer:
      "ProcureSource is built for contractors, procurement teams, project managers, consultants, and other organizations that regularly source MEP materials, equipment, and project requirements from multiple suppliers.",
  },
  {
    id: "faq-10",
    question: "Where is ProcureSource focused?",
    answer:
      "ProcureSource is starting with the UAE MEP and construction procurement market, where project teams often manage large BOQs, multiple suppliers, frequent RFQs, and quotation-heavy purchasing workflows.",
  },
  {
    id: "faq-11",
    question: "When can I use ProcureSource?",
    answer:
      "ProcureSource is being introduced in stages with selected procurement teams. If you are interested in using it for your procurement workflow, contact the team to discuss access and the type of procurement operation you run.",
  },
];

const migratedFaqItems = faqItems.map(({ question, answer }) => ({
  question,
  answer,
}));

export type StaticPageKey = "about" | "faq" | "contact" | "privacy" | "terms";

export interface StaticPageContent {
  href: `/${string}`;
  eyebrow: string;
  title: string;
  location: string;
  intro: string;
  rows: Array<{ label: string; title: string; body: string }>;
  closing: string;
  metaTitle: string;
  metaDescription: string;
}

export const staticPages: Record<StaticPageKey, StaticPageContent> = {
  about: {
    href: "/about",
    eyebrow: "About",
    title: "Procurement infrastructure for project-driven buying.",
    location: "DUBAI · UAE",
    intro:
      "ProcureSource brings the operational side of procurement into one structured workspace — from the original BOQ and supplier RFQ to quotation collection, commercial comparison, and the final purchasing decision.",
    rows: [
      {
        label: "The problem",
        title: "Procurement data is fragmented across the project.",
        body:
          "BOQs live in spreadsheets and PDFs. RFQs move through email and messaging apps. Supplier quotations arrive in different formats. Commercial comparisons are rebuilt manually. ProcureSource connects these steps into a single procurement workflow.",
      },
      {
        label: "The workflow",
        title: "Start with the requirement. Keep the decision traceable.",
        body:
          "A structured BOQ becomes the foundation for an RFQ. Suppliers respond against the same requirement, quotations are organized for comparison, and the procurement team retains a record of the information behind its decision.",
      },
      {
        label: "The buyer",
        title: "Your suppliers. Your commercial relationships. Your decision.",
        body:
          "ProcureSource does not attempt to replace your supplier network with a marketplace. Buyers control their RFQs, supplier participation, evaluation, and purchasing decisions.",
      },
      {
        label: "The focus",
        title: "Built around the realities of MEP procurement.",
        body:
          "MEP procurement involves detailed BOQs, specification-sensitive materials, multiple supplier responses, substitutions, varying commercial terms, and project deadlines. ProcureSource is being built around those realities rather than a generic purchasing workflow.",
      },
      {
        label: "The direction",
        title: "From procurement administration to procurement intelligence.",
        body:
          "The long-term objective is more than digitizing RFQs. By structuring requirements and supplier responses consistently, ProcureSource can help procurement teams build better supplier knowledge, understand commercial history, and make more informed purchasing decisions.",
      },
    ],
    closing:
      "ProcureSource exists to make procurement easier to run, easier to compare, and easier to trust.",
    metaTitle: "About ProcureSource",
    metaDescription:
      "ProcureSource is procurement infrastructure for project-driven MEP and construction purchasing, connecting BOQs, RFQs, supplier quotations, and commercial decisions.",
  },

  faq: {
    href: "/faq",
    eyebrow: "FAQ",
    title: "Questions about ProcureSource.",
    location: "QUESTIONS · ANSWERS",
    intro:
      "ProcureSource is designed to bring structure to the procurement work between a project requirement and a purchasing decision.",
    rows: migratedFaqItems.map((faq) => ({
      label: "FAQ",
      title: faq.question,
      body: faq.answer,
    })),
    closing:
      "Have a procurement workflow that does not fit the standard model? Tell us how your team currently operates.",
    metaTitle: "ProcureSource FAQ",
    metaDescription:
      "Frequently asked questions about ProcureSource, a procurement workspace for MEP and construction teams.",
  },

  contact: {
    href: "/contact",
    eyebrow: "Contact",
    title: "Talk to us about how your procurement actually works.",
    location: "DUBAI · UAE",
    intro:
      "We are interested in understanding the procurement operations behind real projects — the BOQs, supplier workflows, quotation formats, and commercial decisions your team manages every day.",
    rows: [
      {
        label: "Procurement teams",
        title: "Show us where the process breaks down.",
        body:
          "Tell us how your team creates BOQs, runs RFQs, follows up with suppliers, compares quotations, and records purchasing decisions. The most useful conversations start with the actual workflow.",
      },
      {
        label: "Contractors",
        title: "Bring the project procurement problem.",
        body:
          "MEP packages, material procurement, supplier coordination, substitutions, and deadline-driven purchasing all create different operational requirements. We want to understand which parts consume the most time and create the most risk.",
      },
      {
        label: "Suppliers",
        title: "Help us build a better quoting experience.",
        body:
          "Supplier feedback matters because an RFQ workflow only works when suppliers can understand the requirement and respond efficiently. Tell us what makes buyer RFQs difficult to quote today.",
      },
      {
        label: "Partnerships",
        title: "Bring a specific procurement use case.",
        body:
          "If you operate in MEP, construction, infrastructure, facilities, or an adjacent procurement ecosystem, tell us what you want to build, integrate, or solve.",
      },
    ],
    closing:
      "Specific procurement problems are more useful than generic product feedback.",
    metaTitle: "Contact ProcureSource",
    metaDescription:
      "Contact ProcureSource about MEP procurement workflows, supplier quoting, RFQs, and procurement operations in the UAE.",
  },

  privacy: {
    href: "/privacy",
    eyebrow: "Privacy",
    title: "Privacy built around procurement data.",
    location: "DATA · TRUST",
    intro:
      "ProcureSource is built to handle business and procurement information responsibly. This policy explains what information we collect, why we use it, how it is protected, and the choices available to you.",

    rows: [
      {
        label: "ProcureSource",
        title: "ProcureSource Terms and Conditions apply to all information.",
        body:
          "This policy applies to the ProcureSource website, contact and access requests, communications, and any ProcureSource product or service to which you have been granted access.",
      },

      {
        label: "Website",
        title: "We collect information needed to operate the site.",
        body:
          "Depending on how you interact with ProcureSource, this may include your name, work email, company, role, region, message, and information you provide through contact or access forms. We may also collect technical information such as IP address, browser type, device information, timestamps, and website activity for security, reliability, and performance.",
      },

      {
        label: "Procurement",
        title: "The product may contain business and procurement information.",
        body:
          "When using ProcureSource, organizations and authorized users may submit information such as BOQs, project requirements, RFQs, supplier information, quotations, pricing, lead times, specifications, documents, and procurement decisions. This information is used to provide and operate the procurement workflows requested by the organization.",
      },

      {
        label: "Purpose",
        title: "We use information to operate and improve ProcureSource.",
        body:
          "Information may be used to provide the requested service, communicate with users, process procurement workflows, maintain security, prevent misuse, troubleshoot problems, improve product reliability, understand product usage, and comply with legal or regulatory obligations.",
      },

      {
        label: "Supplier data",
        title: "Procurement information is shared according to the workflow.",
        body:
          "When a buyer creates an RFQ, information is made available to the suppliers and users authorized to participate in that RFQ. Supplier responses are intended to remain within the relevant procurement workflow and are not presented to other suppliers participating in the same RFQ.",
      },

      {
        label: "Service providers",
        title: "We use trusted providers to operate the service.",
        body:
          "ProcureSource may use third-party infrastructure and service providers for hosting, storage, email delivery, authentication, analytics, security, monitoring, document processing, and other operational functions. These providers receive only the information reasonably required to provide their services and are subject to applicable contractual or legal obligations.",
      },

      {
        label: "AI & processing",
        title: "Documents may be processed to structure procurement information.",
        body:
          "Where ProcureSource provides document extraction, classification, normalization, or other automated processing, submitted procurement documents may be processed by the services used to provide those capabilities. Automated processing supports the workflow but does not replace the user's responsibility to review procurement information before making a commercial decision.",
      },

      {
        label: "Sharing",
        title: "We do not sell personal information.",
        body:
          "ProcureSource does not sell personal information. Information may be disclosed to service providers operating the platform, to participants authorized within a procurement workflow, when required to protect the service or users, or where disclosure is required by applicable law.",
      },

      {
        label: "Security",
        title: "Access to procurement information is controlled.",
        body:
          "We use technical and organizational measures intended to protect information against unauthorized access, alteration, disclosure, or destruction. Access is designed around user roles, organizations, and procurement workflows. No internet-based service can guarantee absolute security.",
      },

      {
        label: "Retention",
        title: "Information is retained for legitimate operational purposes.",
        body:
          "We retain information for as long as reasonably necessary to provide the service, maintain procurement records, communicate with users, protect the platform, resolve disputes, meet contractual obligations, or comply with legal requirements. Retention periods may differ depending on the type and purpose of the information.",
      },

      {
        label: "Your choices",
        title: "You can request access or changes to your information.",
        body:
          "Depending on applicable law and your relationship with ProcureSource, you may request access to, correction of, deletion of, or other action regarding personal information we hold about you. You may also unsubscribe from non-essential communications at any time.",
      },

      {
        label: "Cookies",
        title: "The website may use cookies and similar technologies.",
        body:
          "ProcureSource may use cookies or similar technologies that are necessary for site operation, security, preferences, analytics, or other legitimate purposes. The technologies used and available controls may depend on the configuration of the website and services at the time you access it.",
      },

      {
        label: "Third parties",
        title: "External websites have their own privacy practices.",
        body:
          "The ProcureSource website may link to external publishers, suppliers, government websites, or other services. When you leave ProcureSource and interact with a third-party service, that service's own privacy policy and terms apply.",
      },

      {
        label: "Contact",
        title: "Contact us about your personal information.",
        body:
          "For privacy questions or requests, write to support@procuresource.co with the subject line Privacy Request. Please include enough information for us to identify the relevant request without sending unnecessary sensitive information.",
      },
    ],

    closing:
      "Procurement software earns trust by treating commercial information, supplier relationships, and user data as first-class responsibilities.",

    metaTitle: "Privacy Policy | ProcureSource",

    metaDescription:
      "Learn how ProcureSource collects, uses, protects, and manages personal and procurement information across its website and procurement platform.",
  },

  terms: {
    href: "/terms",
    eyebrow: "Terms",
    title: "Terms of use.",
    location: "TERMS · PROCURESOURCE",
    intro:
      "These terms govern use of the ProcureSource website and, where applicable, access to ProcureSource services.",
    rows: [
      {
        label: "Website",
        title: "The public website is provided for information.",
        body:
          "Content published on the ProcureSource website describes the product, its intended use, and related procurement topics. Website content should not be interpreted as a quotation, purchase order, supplier commitment, engineering approval, legal advice, or guarantee of commercial outcome.",
      },
      {
        label: "Procurement",
        title: "ProcureSource supports decisions; it does not make them.",
        body:
          "Users remain responsible for reviewing specifications, quantities, supplier qualifications, quotations, commercial terms, delivery requirements, approvals, and project requirements before committing to a purchase.",
      },
      {
        label: "Supplier data",
        title: "Users remain responsible for the information they submit.",
        body:
          "Procurement teams and suppliers are responsible for ensuring that information submitted to ProcureSource is accurate, authorized, and appropriate to share through the relevant workflow.",
      },
      {
        label: "Access",
        title: "Access may be controlled during the product rollout.",
        body:
          "ProcureSource may limit access based on organization, role, geography, product availability, operational capacity, or other legitimate business requirements. Access to a particular feature or workflow is not guaranteed.",
      },
      {
        label: "Confidentiality",
        title: "Procurement information should be shared deliberately.",
        body:
          "Users are responsible for determining what commercial, technical, project, or supplier information they are authorized to submit or share. Access controls within the product are intended to support controlled collaboration, not to replace appropriate internal confidentiality procedures.",
      },
      {
        label: "Third parties",
        title: "External content remains the responsibility of its publisher.",
        body:
          "Where the website references external sources, publications, services, or organizations, those third parties remain responsible for their own content, availability, and terms.",
      },
      {
        label: "Acceptable use",
        title: "Use ProcureSource only for legitimate business purposes.",
        body:
          "Users may not attempt to circumvent access controls, access another user's information without authorization, interfere with the service, reverse engineer protected systems, or use ProcureSource to facilitate unlawful activity.",
      },
      {
        label: "Intellectual property",
        title: "ProcureSource and its materials are protected.",
        body:
          "The ProcureSource name, brand, software, interface, original content, and related materials belong to ProcureSource or their respective rights holders and may not be copied, republished, or commercially reused without authorization.",
      },
      {
        label: "Contact",
        title: "Questions about these terms.",
        body:
          "For questions about the website, product access, or these terms, contact hello@procuresource.co.",
      },
    ],
    closing:
      "ProcureSource is being built around a simple principle: procurement software should improve operational control without taking control away from the people making the decision.",
    metaTitle: "Terms of Use | ProcureSource",
    metaDescription:
      "Terms of use for the ProcureSource procurement platform and public website.",
  },
};

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
