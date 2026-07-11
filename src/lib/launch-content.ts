export const launchNavItems = [
  { label: "News", href: "/news" },
  { label: "FAQ", href: "/faq" },
  { label: "Access", href: "/access" },
];

export const publicLaunchRoutes = [
  { path: "/", label: "Home", priority: 1 },
  { path: "/news", label: "News", priority: 0.92 },
  { path: "/about", label: "About", priority: 0.74 },
  { path: "/faq", label: "FAQ", priority: 0.7 },
  { path: "/access", label: "Access", priority: 0.72 },
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
    value: "Coming soon",
    detail: "The website is public. The product, accounts, and APIs remain closed until launch.",
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
      "ProcureSource is a UAE-first MEP RFQ platform in private build. It is for project teams that need cleaner procurement records and more confident buying decisions.",
  },
  {
    question: "Why is the product private?",
    answer:
      "Because the important work is in the underlying procurement layer. We are not publishing the product surface until the first release is useful, controlled, and safe.",
  },
  {
    question: "Does the public site explain the full workflow?",
    answer:
      "No. The public site describes the category, the launch posture, and who should request access. The detailed operating model stays private.",
  },
  {
    question: "What is the News page for?",
    answer:
      "It gives buyers and partners a current view of regional MEP, construction, infrastructure, utilities, and facilities-management signals without exposing the private product.",
  },
  {
    question: "Are buyer accounts open?",
    answer:
      "No. Buyer and supplier accounts are dormant until the private launch group is ready.",
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
  | "contact"
  | "status"
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
    location: "DXB . UAE",
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
        title: "The product surface stays closed for now.",
        body:
          "The public site is intentionally limited. The private build contains the workflow, records, and release logic.",
      },
    ],
    closing: "The standard is simple: make procurement easier to trust before making it bigger.",
    metaTitle: "About",
    metaDescription:
      "ProcureSource is a UAE-first MEP RFQ platform in private build for contractors, consultants, and procurement teams.",
  },
  faq: {
    href: "/faq",
    eyebrow: "FAQ",
    title: "Plain answers for the private launch.",
    location: "Q / A",
    intro:
      "A short set of answers about ProcureSource, early access, news, and the current public status.",
    rows: faqs.map((faq) => ({
      label: "FAQ",
      title: faq.question,
      body: faq.answer,
    })),
    closing: "If an answer would reveal the workflow, it belongs inside the private product.",
    metaTitle: "FAQ",
    metaDescription:
      "FAQ for ProcureSource, a UAE-first MEP RFQ platform currently in private build.",
  },
  access: {
    href: "/access",
    eyebrow: "Access",
    title: "Request access to the private launch group.",
    location: "INVITE",
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
  contact: {
    href: "/contact",
    eyebrow: "Contact",
    title: "Talk to ProcureSource about UAE MEP procurement.",
    location: "HELLO",
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
  status: {
    href: "/status",
    eyebrow: "Status",
    title: "Public website live. Product access closed.",
    location: "NOW",
    intro:
      "The launch site is public. The buyer and supplier product, accounts, and APIs remain dormant.",
    rows: [
      {
        label: "Website",
        title: "The public launch surface is live.",
        body:
          "Home, news, FAQ, access, contact, privacy, and terms are the intended public surface right now.",
      },
      {
        label: "Product",
        title: "The application remains private.",
        body:
          "Visitors cannot use buyer workflows, supplier workflows, backend routes, or product APIs from the public site.",
      },
      {
        label: "Safety",
        title: "Provider details and secrets are not public content.",
        body:
          "The hosted site should not expose API keys, model names, private endpoints, or internal integration details.",
      },
    ],
    closing: "Coming soon should still be secure.",
    metaTitle: "Status",
    metaDescription:
      "The ProcureSource public site is live while the UAE MEP RFQ product remains private and dormant.",
  },
  privacy: {
    href: "/privacy",
    eyebrow: "Privacy",
    title: "Privacy for a private launch site.",
    location: "DATA",
    intro:
      "This privacy policy explains what ProcureSource collects on the public launch site while the product, accounts, and APIs remain closed.",
    rows: [
      {
        label: "Updated",
        title: "Last updated: July 9, 2026.",
        body:
          "This policy applies to the public ProcureSource website, early access requests, newsletter requests, and direct email contact.",
      },
      {
        label: "Data",
        title: "We collect only what you choose to send.",
        body:
          "That may include your name, work email, company, role, region, message, newsletter interest, and any procurement context you include in a note.",
      },
      {
        label: "No app",
        title: "No public RFQ account data is collected here.",
        body:
          "The public website does not accept live BOQs, supplier quotes, awarded contracts, account passwords, payment data, or product API usage from visitors.",
      },
      {
        label: "Use",
        title: "We use submitted details for launch communication.",
        body:
          "We may use your details to respond to you, assess early access fit, send requested weekly updates, improve launch content, protect the site, and keep a basic record of serious inbound interest.",
      },
      {
        label: "News",
        title: "News links remain third-party content.",
        body:
          "The News page links to public sources. If you open an external article, that publisher or official body controls its own privacy practices.",
      },
      {
        label: "Sharing",
        title: "We do not sell personal information.",
        body:
          "We may share limited information with service providers who help operate email, hosting, security, or analytics, or where required by law. We do not sell early access or newsletter details.",
      },
      {
        label: "Retention",
        title: "We keep launch data only as long as useful.",
        body:
          "Early access and newsletter records are retained while they are needed for launch, communication, security, or legal purposes. You can ask us to correct, unsubscribe, or delete your submitted details.",
      },
      {
        label: "Contact",
        title: "Use email for privacy requests.",
        body:
          "Write to support@procuresource.co with the subject Privacy Request if you want to correct, export, unsubscribe from, or remove information you sent to ProcureSource.",
      },
    ],
    closing: "A procurement product should earn trust before it asks for more data.",
    metaTitle: "Privacy",
    metaDescription:
      "Privacy policy for the ProcureSource public launch site, newsletter, and early access requests.",
  },
  terms: {
    href: "/terms",
    eyebrow: "Terms",
    title: "Terms for a launch site, not a live marketplace.",
    location: "TERMS",
    intro:
      "These terms apply to the public ProcureSource website while the UAE MEP RFQ product remains private and dormant.",
    rows: [
      {
        label: "Updated",
        title: "Last updated: July 9, 2026.",
        body:
          "By using this public website, reading the News page, or requesting access, you agree to use the site only for lawful business and information purposes.",
      },
      {
        label: "Status",
        title: "The public site is informational only.",
        body:
          "No visible route should be read as a live marketplace, guaranteed quote source, public RFQ workspace, supplier onboarding flow, or active procurement instruction.",
      },
      {
        label: "Advice",
        title: "Nothing here is procurement, legal, or engineering advice.",
        body:
          "You remain responsible for checking specifications, laws, authority requirements, consultant approvals, supplier claims, prices, lead times, and project decisions with qualified professionals.",
      },
      {
        label: "Access",
        title: "Early access can be limited.",
        body:
          "ProcureSource may accept, delay, refuse, suspend, or close early access at its discretion based on role, region, category, readiness, capacity, and operational fit.",
      },
      {
        label: "News",
        title: "News cards link to external sources.",
        body:
          "Headlines, excerpts, and links are provided for convenience and source discovery. External publishers and official bodies are responsible for their own content, availability, and terms.",
      },
      {
        label: "Use",
        title: "Do not misuse the launch site.",
        body:
          "You may not attempt to access private routes, backend systems, dormant APIs, secrets, accounts, unpublished product flows, or security controls.",
      },
      {
        label: "IP",
        title: "ProcureSource owns its public brand and site materials.",
        body:
          "The ProcureSource name, mark, layout, copy, and launch materials may not be copied, scraped, misrepresented, or reused as a competing service without permission.",
      },
      {
        label: "Company",
        title: "Built from Dubai to the world.",
        body:
          "ProcureSource is a private product initiative for UAE MEP procurement teams. For questions, write to hello@procuresource.co or support@procuresource.co.",
      },
    ],
    closing: "Do not overstate what is live. That discipline is part of the product standard.",
    metaTitle: "Terms",
    metaDescription:
      "Terms for the ProcureSource public launch website while the UAE MEP RFQ platform remains private and dormant.",
  },
};

export const footerColumns = [
  {
    title: "Public",
    links: [
      { label: "News", href: "/news" },
      { label: "FAQ", href: "/faq" },
      { label: "Access", href: "/access" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Status",
    links: [
      { label: "Launch status", href: "/status" },
      { label: "Contact", href: "/contact" },
      { label: "Request access", href: "/access#launch-updates" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
