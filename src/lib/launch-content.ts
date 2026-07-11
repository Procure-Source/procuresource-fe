export const launchNavItems = [
  { label: "Home", href: "/" },
  { label: "FAQ", href: "/faq" },
  { label: "Access", href: "/access" },
];

export const publicLaunchRoutes = [
  { path: "/", label: "Home", priority: 1 },
  { path: "/product", label: "RFQ workspace", priority: 0.96 },
  { path: "/purchasers", label: "For purchasers", priority: 0.94 },
  { path: "/suppliers", label: "For suppliers", priority: 0.94 },
  { path: "/pm/dashboard", label: "Purchaser dashboard", priority: 0.9 },
  { path: "/supplier/dashboard", label: "Supplier dashboard", priority: 0.9 },
  { path: "/admin/dashboard", label: "Verification dashboard", priority: 0.72 },
  { path: "/rfqs", label: "Supplier RFQ link", priority: 0.86 },
  { path: "/login", label: "Sign in", priority: 0.68 },
  { path: "/register", label: "Register", priority: 0.68 },
  { path: "/news", label: "News", priority: 0.92 },
  { path: "/about", label: "About", priority: 0.74 },
  { path: "/faq", label: "FAQ", priority: 0.7 },
  { path: "/access", label: "Access", priority: 0.72 },
  { path: "/advertise", label: "Advertise", priority: 0.64 },
  { path: "/security", label: "Security", priority: 0.62 },
  { path: "/contact", label: "Contact", priority: 0.6 },
  { path: "/status", label: "Status", priority: 0.56 },
  { path: "/privacy", label: "Privacy", priority: 0.36 },
  { path: "/terms", label: "Terms", priority: 0.36 },
];

export const standSections = [
  {
    id: "about",
    eyebrow: "About",
    title: "A private RFQ workspace for UAE MEP procurement.",
    body:
      "ProcureSource is being built for contractors, consultants, and project teams who need cleaner buying records without another noisy marketplace.",
    href: "/about",
  },
  {
    id: "news",
    eyebrow: "News",
    title: "Market signals, not product disclosure.",
    body:
      "News keeps the public site useful for MEP teams while the actual product surface stays closed.",
    href: "/news",
  },
  {
    id: "access",
    eyebrow: "Access",
    title: "Early access stays narrow on purpose.",
    body:
      "The first group will be people close to live UAE MEP procurement work: buyers, specifiers, operators, and serious regional partners.",
    href: "/access",
  },
];

export const launchNotes = [
  {
    label: "Focus",
    value: "UAE MEP RFQs",
    detail: "Built around mechanical, electrical, and plumbing procurement for project teams in the UAE.",
  },
  {
    label: "Status",
    value: "Private access",
    detail: "ProcureSource is opening carefully for focused procurement teams.",
  },
  {
    label: "Posture",
    value: "Quiet build",
    detail: "Enough context for buyers to understand the direction. Not enough to expose the playbook.",
  },
  {
    label: "First users",
    value: "By invite",
    detail: "Early access is for teams who can bring real procurement pressure, not casual browsing.",
  },
];

export const faqs = [
  {
    question: "What is ProcureSource?",
    answer:
      "ProcureSource is a UAE-first MEP RFQ workspace for teams that need cleaner BOQ line items, supplier quote links, side-by-side quote comparison, supplier records, and award exports.",
  },
  {
    question: "What can teams do in ProcureSource?",
    answer:
      "Purchasers can prepare RFQs, share supplier links, compare replies, and keep award records. Suppliers can receive RFQs, quote line items, and track responses.",
  },
  {
    question: "Does ProcureSource expose sensitive procurement records?",
    answer:
      "No. RFQ records, supplier evidence, pricing history, and verification details stay protected behind the right account access.",
  },
  {
    question: "What is the News page for?",
    answer:
      "It gives buyers and partners a current view of regional MEP, construction, infrastructure, utilities, and facilities-management signals without exposing the private product.",
  },
  {
    question: "Are buyer accounts open?",
    answer:
      "Access is opening gradually. Purchaser and supplier teams can request entry through the Access page.",
  },
  {
    question: "When is ProcureSource launching?",
    answer:
      "The public target is 2026. Access will open gradually, starting with a controlled UAE MEP group.",
  },
];

export type LaunchPageKey =
  | "about"
  | "faq"
  | "access"
  | "advertise"
  | "contact"
  | "status"
  | "security"
  | "privacy"
  | "terms";

export type LaunchPageContent = {
  href: string;
  eyebrow: string;
  title: string;
  location: string;
  intro: string;
  rows: Array<{ label: string; title: string; body: string }>;
  closing: string;
  metaTitle: string;
  metaDescription: string;
};

export const launchPages: Record<LaunchPageKey, LaunchPageContent> = {
  about: {
    href: "/about",
    eyebrow: "About",
    title: "A private RFQ workspace for UAE MEP teams.",
    location: "Dubai, UAE",
    intro:
      "ProcureSource is a coming-soon procurement platform for teams who source MEP packages under real project pressure.",
    rows: [
      {
        label: "Problem",
        title: "MEP buying work is still too scattered.",
        body:
          "Project teams move between files, messages, supplier notes, and internal approvals. The work needs a cleaner record.",
      },
      {
        label: "Focus",
        title: "UAE first, because the details matter.",
        body:
          "ProcureSource is being shaped around UAE procurement behavior before any broader claim is made.",
      },
      {
        label: "Private",
        title: "Private access is opening gradually.",
        body:
          "ProcureSource starts with RFQs, supplier links, quote comparison, and clear award records.",
      },
    ],
    closing: "The standard is simple: make procurement easier to trust before making it bigger.",
    metaTitle: "About",
    metaDescription:
      "ProcureSource is a UAE-first MEP RFQ workspace for contractors, consultants, suppliers, and procurement teams.",
  },
  faq: {
    href: "/faq",
    eyebrow: "FAQ",
    title: "Plain answers for the private launch.",
    location: "Questions",
    intro:
      "A short set of answers about ProcureSource, early access, news, and the current public status.",
    rows: faqs.map((faq) => ({
      label: "FAQ",
      title: faq.question,
      body: faq.answer,
    })),
    closing: "If an answer would reveal non-public product details, it belongs inside the private product.",
    metaTitle: "FAQ",
    metaDescription:
      "FAQ for ProcureSource, a UAE-first MEP RFQ workspace with purchaser and supplier flows.",
  },
  access: {
    href: "/access",
    eyebrow: "Access",
    title: "Request access to the private launch group.",
    location: "Invite",
    intro:
      "The first access window is for people close enough to UAE MEP procurement work to pressure-test the product.",
    rows: [
      {
        label: "Who",
        title: "Contractors, consultants, operators, and procurement teams.",
        body:
          "Useful early users are close to real MEP buying work and can explain where the current process breaks.",
      },
      {
        label: "How",
        title: "Send a short note.",
        body:
          "Write to hello@procuresource.co with your role, region, and the procurement category you handle.",
      },
      {
        label: "When",
        title: "Invites open gradually.",
        body:
          "ProcureSource will open to a controlled group before any public product access is offered.",
      },
    ],
    closing: "Good early users are not an audience. They are pressure.",
    metaTitle: "Early Access",
    metaDescription:
      "Request early access to ProcureSource, a private UAE MEP RFQ platform launching soon.",
  },
  advertise: {
    href: "/advertise",
    eyebrow: "Advertise",
    title: "Reach serious procurement teams without disrupting the RFQ process.",
    location: "Media",
    intro:
      "Advertising on ProcureSource must respect procurement trust. The goal is category visibility for qualified industrial brands, not noisy interruption inside buyer decisions.",
    rows: [
      {
        label: "Audience",
        title: "MEP purchasers, suppliers, contractors, consultants, and operators.",
        body:
          "Advertise is intended for brands with real industrial relevance: equipment manufacturers, authorized distributors, certified service companies, logistics partners, testing labs, and regional procurement service companies.",
      },
      {
        label: "Formats",
        title: "Sponsorship should be useful, clearly labeled, and separate from evaluation logic.",
        body:
          "Potential formats include category sponsorships, market notes, supplier education, event partnerships, and clearly marked product visibility. Paid placement must not silently alter quote comparisons, verification labels, or award suggestions.",
      },
      {
        label: "Rules",
        title: "No misleading certification, hidden influence, scraping, or buyer impersonation.",
        body:
          "Partners must provide accurate company identity, authority to represent the brand, relevant certificates, and compliant claims. ProcureSource may reject advertisers that weaken platform trust or conflict with active procurement integrity.",
      },
      {
        label: "Start",
        title: "Send a specific proposal.",
        body:
          "Write to hello@procuresource.co with your company, target categories, region, proof of authorization where relevant, campaign goal, and proposed timing. Generic advertising blasts are unlikely to fit the product.",
      },
    ],
    closing: "Visibility is valuable only when the procurement record stays clean.",
    metaTitle: "Advertise",
    metaDescription:
      "Advertise with ProcureSource through trust-safe sponsorships, category visibility, and industrial procurement partnerships.",
  },
  contact: {
    href: "/contact",
    eyebrow: "Contact",
    title: "Talk to ProcureSource about UAE MEP procurement.",
    location: "Hello",
    intro:
      "Use this route for early access, launch questions, and serious regional partner notes.",
    rows: [
      {
        label: "Email",
        title: "hello@procuresource.co",
        body:
          "Send your role, company context, region, and the procurement category you want ProcureSource to understand first.",
      },
      {
        label: "Buyer",
        title: "Bring the messy procurement cases.",
        body:
          "The best notes explain which MEP packages create repeated RFQ friction.",
      },
      {
        label: "Partner",
        title: "Keep partnership notes specific.",
        body:
          "Tell us which UAE categories, project types, or supplier paths matter most.",
      },
    ],
    closing: "Specific notes beat general interest.",
    metaTitle: "Contact",
    metaDescription:
      "Contact ProcureSource about UAE MEP procurement, early access, and private launch participation.",
  },
  security: {
    href: "/security",
    eyebrow: "Security",
    title: "Security for procurement records.",
    location: "Trust",
    intro:
      "ProcureSource handles business procurement records that can include prices, certificates, company details, supplier evidence, and RFQ history. Sensitive records and credentials need strong access control.",
    rows: [
      {
        label: "Secrets",
        title: "Sensitive credentials stay protected.",
        body:
          "Passwords, service credentials, database strings, and private configuration must not be exposed in public pages, browser code, repositories, or shared documents.",
      },
      {
        label: "Access",
        title: "Buyer, supplier, and admin access stay role based.",
        body:
          "Purchaser actions, supplier actions, quote-link actions, and verification actions are limited to the accounts and teams that should use them.",
      },
      {
        label: "Data",
        title: "Procurement documents should be minimized, validated, and retained deliberately.",
        body:
          "Users should upload only procurement-relevant content. The platform should validate file type and size, avoid serving user uploads as executable content, retain audit records where needed, and avoid collecting unnecessary personal data.",
      },
      {
        label: "Controls",
        title: "File, request, and account controls reduce misuse.",
        body:
          "Upload limits, rate limits, role checks, audit records, and clear error handling help protect procurement data and service availability.",
      },
      {
        label: "Reporting",
        title: "Report security concerns directly and include enough context to investigate.",
        body:
          "Send security concerns to support@procuresource.co with the route, timestamp, browser or request context, affected account or RFQ reference, and a concise description. Do not include exploit payloads or unrelated personal data unless needed for triage.",
      },
    ],
    closing: "Trust is not a design claim. It is the way the product handles credentials, roles, documents, and decisions.",
    metaTitle: "Security",
    metaDescription:
      "Security posture for ProcureSource procurement data, credential handling, role separation, document handling, and backend controls.",
  },
  status: {
    href: "/status",
    eyebrow: "Status",
    title: "ProcureSource is in private access.",
    location: "Status",
    intro:
      "ProcureSource is opening carefully for procurement teams that can use the RFQ workflow in real project conditions.",
    rows: [
      {
        label: "Product",
        title: "RFQs, supplier links, quote comparison, and award records.",
        body:
          "The first product surface focuses on the buying and quoting loop, with clear paths for purchasers and suppliers.",
      },
      {
        label: "Access",
        title: "Accounts open gradually.",
        body:
          "Private access lets the team keep onboarding focused while procurement records, documents, and account roles are reviewed carefully.",
      },
      {
        label: "Documents",
        title: "BOQ reading supports quote preparation.",
        body:
          "BOQ files may be processed to prepare quote lines. Users should review quantities, units, and specifications before sharing an RFQ.",
      },
      {
        label: "Database",
        title: "Procurement records need managed persistence.",
        body:
          "RFQs, quotes, supplier alerts, documents, and award records should be stored with restricted access and protected configuration.",
      },
      {
        label: "Security",
        title: "Sensitive credentials stay out of the browser.",
        body:
          "Service credentials, database connection strings, and private configuration must stay in protected settings and secret stores.",
      },
    ],
    closing: "Private access keeps the product focused while procurement teams begin using it.",
    metaTitle: "Status",
    metaDescription:
      "Current ProcureSource status for RFQ workspace, supplier links, quote comparison, document handling, and managed procurement records.",
  },
  privacy: {
    href: "/privacy",
    eyebrow: "Privacy",
    title: "Privacy policy for ProcureSource product data.",
    location: "Data",
    intro:
      "This policy explains how ProcureSource handles account, company, RFQ, document, supplier, quote, and support information.",
    rows: [
      {
        label: "Updated",
        title: "Last updated: July 10, 2026.",
        body:
          "This policy applies to ProcureSource accounts, RFQ workspace, supplier quote links, access requests, support messages, and related operational communications.",
      },
      {
        label: "Account data",
        title: "We collect identity and company details needed to operate a procurement account.",
        body:
          "This may include name, work email, phone, company name, role, region, login metadata, supplier or purchaser role, invitation source, communication preferences, and support history. Do not submit personal information that is not needed for procurement work.",
      },
      {
        label: "Procurement data",
        title: "RFQ records can include commercial and technical procurement information.",
        body:
          "Procurement data may include BOQs, specifications, line items, units, quantities, drawings or document text, supplier invitations, quote prices, lead times, exceptions, compliance notes, award decisions, export files, and internal review notes submitted through the platform.",
      },
      {
        label: "Verification",
        title: "Supplier verification data is handled as a platform trust record.",
        body:
          "Verification data may include trade licenses, VAT certificates, manufacturer authorization letters, certification records, agent confirmation evidence, response history, mismatch or stale-status notes, and audit timestamps. Verification status is not guaranteed legal, engineering, financial, or authority approval.",
      },
      {
        label: "Documents",
        title: "BOQ files may be processed to prepare quote lines.",
        body:
          "When you ask ProcureSource to read or organize procurement material, relevant document content may be processed to prepare line items. Users must review the output before using it for commercial, engineering, legal, or compliance decisions.",
      },
      {
        label: "Legal basis",
        title: "We process data for product operation, legitimate business purposes, consent where required, and legal obligations.",
        body:
          "Depending on the context, processing may be needed to provide the service, administer accounts, handle RFQs and quotes, respond to requests, protect the platform, maintain procurement records, comply with law, or act on consent for optional communications.",
      },
      {
        label: "Cookies",
        title: "Cookies and local storage support authentication and preferences.",
        body:
          "We may use cookies, browser storage, and similar technologies for sign-in state, role selection, UI preferences, security, analytics, and product operation. Browser storage should not be treated as secure long-term record storage.",
      },
      {
        label: "Use",
        title: "We use data to provide, secure, improve, and verify the product.",
        body:
          "We may use data to create RFQs, read BOQs, compare supplier quotes, generate award summaries, verify suppliers, maintain audit trails, prevent abuse, support users, improve matching logic, measure performance, and comply with legal or operational obligations.",
      },
      {
        label: "Sharing",
        title: "We do not sell personal information or raw procurement account data.",
        body:
          "We may share limited data with hosting, database, email, security, analytics, BOQ or document reading, storage, professional, or legal vendors who help run ProcureSource; with counterparties you intentionally invite into an RFQ; or when required to protect rights, safety, security, or legal compliance.",
      },
      {
        label: "Exports",
        title: "User exports do not transfer ProcureSource's non-public product records.",
        body:
          "We may provide practical exports such as award summaries, RFQ records, compliance packets, or procurement documents. Non-public verification records, supplier scoring, pricing benchmarks, matching logic, and aggregated trust records remain ProcureSource assets unless a separate written agreement says otherwise.",
      },
      {
        label: "Retention",
        title: "We keep records for as long as needed for procurement, security, and legal purposes.",
        body:
          "RFQ, quote, verification, audit, security, and support records may be retained to preserve procurement history, resolve disputes, improve verification quality, prevent abuse, and meet legal obligations. Local browser test data can be cleared by clearing site storage.",
      },
      {
        label: "Transfers",
        title: "Data may be processed in regions where approved vendors operate.",
        body:
          "ProcureSource may use cloud hosting, database, email, storage, security, analytics, and document vendors. Where law requires it, we intend to use appropriate contractual, technical, and organizational safeguards for cross-border processing.",
      },
      {
        label: "Security",
        title: "Secrets and sensitive data must stay out of client code and public repositories.",
        body:
          "ProcureSource is designed so service keys, database strings, app settings, publish profiles, and other secrets live in ignored local env files, CI/CD secrets, cloud app settings, or secure secret stores. Users must not upload secrets, passwords, or unnecessary personal data inside RFQ documents.",
      },
      {
        label: "Children",
        title: "ProcureSource is a business procurement product, not a consumer or children's service.",
        body:
          "The platform is intended for business users acting for companies or procurement teams. Users should not submit information about children or unrelated individuals inside RFQ documents, supplier records, or support requests.",
      },
      {
        label: "Incidents",
        title: "Security incidents are handled through investigation, containment, and appropriate notification.",
        body:
          "If we identify a security incident affecting relevant personal data or business records, we will assess scope, contain risk, preserve evidence, notify affected parties or authorities where legally required, and improve controls where needed.",
      },
      {
        label: "Rights",
        title: "You can request access, correction, deletion, or unsubscribe action.",
        body:
          "Depending on your region and legal rights, you may ask us to access, correct, delete, restrict, or export personal information you provided. Some records may need to be retained for legal, audit, security, dispute, or procurement-history reasons.",
      },
      {
        label: "Contact",
        title: "Use email for privacy and security requests.",
        body:
          "Write to support@procuresource.co with the subject Privacy Request or Security Request. Include the company, account, RFQ reference, and the specific request so the correct records can be located.",
      },
    ],
    closing: "A procurement product earns trust by collecting less than it could, protecting more than it exposes, and keeping verification integrity intact.",
    metaTitle: "Privacy",
    metaDescription:
      "Privacy policy for ProcureSource RFQ, BOQ reading, supplier verification, quote comparison, document support, database persistence, and user data.",
  },
  terms: {
    href: "/terms",
    eyebrow: "Terms",
    title: "Terms and conditions for ProcureSource.",
    location: "Terms",
    intro:
      "These terms apply to ProcureSource accounts, RFQs, supplier links, quotes, dashboards, and related communications.",
    rows: [
      {
        label: "Updated",
        title: "Last updated: July 10, 2026.",
        body:
          "By using ProcureSource, opening a product route, submitting information, requesting access, uploading a BOQ, using an RFQ link, or sending a quote, you agree to these terms for lawful business procurement purposes only.",
      },
      {
        label: "Access",
        title: "Product access can be limited, changed, suspended, or refused.",
        body:
          "ProcureSource may provide local, private, beta, invite-only, or production access at its discretion. We may limit, suspend, refuse, remove, or modify access for security, legal, operational, abuse-prevention, verification, capacity, or commercial reasons.",
      },
      {
        label: "Advice",
        title: "ProcureSource does not replace professional procurement, legal, engineering, or authority review.",
        body:
          "Users remain responsible for checking specifications, drawings, units, quantities, compliance, laws, authority requirements, consultant approvals, supplier claims, prices, taxes, lead times, delivery conditions, commercial terms, and award decisions with qualified professionals.",
      },
      {
        label: "User duties",
        title: "Users must submit accurate business information and protect their account.",
        body:
          "You must provide accurate company, contact, supplier, purchaser, RFQ, quote, and document information; keep credentials confidential; avoid uploading unnecessary personal data; and promptly tell ProcureSource about unauthorized access, data errors, suspicious supplier activity, or security concerns.",
      },
      {
        label: "BOQ output",
        title: "BOQ reading is assistive, not final authority.",
        body:
          "BOQ reading may contain errors or omissions. Users must review BOQ lines, quantities, units, specifications, compliance notes, and award exports before relying on them.",
      },
      {
        label: "Suppliers",
        title: "Supplier verification is a trust signal, not a guarantee.",
        body:
          "Verification labels, certificate checks, agent status, response scores, price history, and supplier records are based on available evidence and platform processes. They do not guarantee performance, availability, pricing, legal capacity, engineering acceptance, or future compliance.",
      },
      {
        label: "Purchasers",
        title: "Purchasers control award decisions and downstream commitments.",
        body:
          "ProcureSource may help compare quotes and produce exports, but purchasers decide whether to invite, evaluate, shortlist, negotiate, award, contract, reject, or re-tender. ProcureSource is not automatically a party to supplier or purchaser contracts unless a written agreement says so.",
      },
      {
        label: "IP",
        title: "ProcureSource owns the product, brand, and non-public records layer.",
        body:
          "The ProcureSource name, mark, interface, flows, copy, code, design, matching logic, supplier verification records, quote comparison methods, price and performance history, aggregated benchmarks, and product data structures may not be copied, scraped, reverse engineered, or reused to build a competing service.",
      },
      {
        label: "Exports",
        title: "Exports are practical records, not a database replication right.",
        body:
          "Users may receive or generate RFQ, quote, award, compliance, or procurement exports where enabled. Those exports do not grant ownership of ProcureSource's aggregated records, supplier trust graph, verification status logic, price benchmarks, matching scores, or product analytics.",
      },
      {
        label: "Restrictions",
        title: "Do not attack, scrape, clone, or bypass the product.",
        body:
          "You may not probe, scan, overload, exploit, bypass access controls, use another user's account, harvest supplier or purchaser data, submit malware, upload unlawful content, scrape at scale, reverse engineer non-public APIs, exfiltrate secrets, or use ProcureSource to mislead buyers or suppliers.",
      },
      {
        label: "Confidentiality",
        title: "Procurement documents and quotes should be treated as confidential business information.",
        body:
          "Users must not share another party's BOQ, quote, certificate, pricing, supplier response, contact details, project data, or award material outside the intended RFQ process unless they have the necessary authority and legal right.",
      },
      {
        label: "Availability",
        title: "The product may change as access expands.",
        body:
          "Private-access features may be unavailable, rate-limited, changed, or removed. ProcureSource does not promise uninterrupted service, exact BOQ reading results, complete supplier coverage, or unchanged feature behavior.",
      },
      {
        label: "Liability",
        title: "Use the platform with commercial judgment and independent review.",
        body:
          "To the fullest extent permitted by law, ProcureSource is not liable for procurement losses, specification mistakes, supplier non-performance, pricing changes, delay, lost profit, lost opportunity, or indirect damages caused by reliance on incomplete, incorrect, or unreviewed platform output.",
      },
      {
        label: "Law",
        title: "Disputes and governing terms will be refined for the operating entity and launch jurisdiction.",
        body:
          "Until formal production contracts are issued, these terms are intended as protective product terms for early use. Any paid or enterprise deployment may require a separate written agreement, order form, data processing addendum, or jurisdiction-specific terms.",
      },
      {
        label: "Legal review",
        title: "Production legal documents should be reviewed for the final operating entity and launch markets.",
        body:
          "These terms are designed to protect ProcureSource and its users. Before public paid launch, the final entity, governing law, dispute venue, data processing terms, payment terms, and jurisdiction-specific notices should be reviewed by qualified counsel.",
      },
      {
        label: "Company",
        title: "Contact ProcureSource for legal, privacy, security, and access questions.",
        body:
          "For access, legal, privacy, security, or product questions, write to hello@procuresource.co or support@procuresource.co and include the relevant company, account, RFQ, or supplier reference.",
      },
    ],
    closing: "The product can be simple for users while the legal, security, verification, and data boundaries stay firm.",
    metaTitle: "Terms",
    metaDescription:
      "Terms and conditions for ProcureSource RFQ workspace, supplier verification, quote comparison, BOQ reading, exports, and product data rights.",
  },
};

export const footerColumns = [
  {
    title: "Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "RFQ workspace", href: "/product" },
      { label: "Purchasers", href: "/purchasers" },
      { label: "Suppliers", href: "/suppliers" },
      { label: "News", href: "/news" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Advertise", href: "/advertise" },
      { label: "Security", href: "/security" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
