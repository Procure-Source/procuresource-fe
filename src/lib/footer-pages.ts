export type FooterLandingPage = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  highlights: string[];
  primaryHub: string;
  ctaHref: string;
  ctaLabel: string;
};

export const marketPages: FooterLandingPage[] = [
  {
    slug: "uae",
    title: "UAE Industrial Procurement",
    subtitle: "Dubai and Abu Dhabi procurement coverage for verified MEP and industrial suppliers.",
    summary:
      "ProcureSource supports UAE procurement teams with supplier discovery, RFQ handling, certification review, and technical product records for fast-moving construction and industrial projects.",
    highlights: ["Dubai and Abu Dhabi supplier visibility", "AHRI, UL, SASO, ISO and consultant-ready records", "RFQ and submittal support for local procurement teams"],
    primaryHub: "Dubai, UAE",
    ctaHref: "/agents?country=AE",
    ctaLabel: "View UAE suppliers",
  },
  {
    slug: "saudi-arabia",
    title: "Saudi Arabia Industrial Procurement",
    subtitle: "Riyadh and Jeddah procurement coverage for large-scale MEP and infrastructure programs.",
    summary:
      "The Saudi Arabia market page connects purchase managers with technical product data, supplier records, compliance requirements, and RFQ support for industrial procurement.",
    highlights: ["Riyadh and Jeddah supplier discovery", "SASO and project compliance readiness", "Industrial RFQ support for MEP packages"],
    primaryHub: "Riyadh, Saudi Arabia",
    ctaHref: "/agents?country=SA",
    ctaLabel: "View Saudi suppliers",
  },
  {
    slug: "qatar",
    title: "Qatar Industrial Procurement",
    subtitle: "Doha-focused procurement support for verified products, suppliers, and RFQs.",
    summary:
      "ProcureSource helps Qatar-based teams compare manufacturer data, certifications, technical specifications, and supplier readiness for procurement decisions.",
    highlights: ["Doha supplier visibility", "Certification and product record review", "RFQ support for project procurement"],
    primaryHub: "Doha, Qatar",
    ctaHref: "/agents?country=QA",
    ctaLabel: "View Qatar suppliers",
  },
  {
    slug: "kuwait",
    title: "Kuwait Industrial Procurement",
    subtitle: "Kuwait City coverage for MEP equipment, industrial suppliers, and RFQ support.",
    summary:
      "ProcureSource organizes supplier, brand, and equipment data for Kuwait procurement teams that need verified technical records and consultant-ready documentation.",
    highlights: ["Kuwait City market coverage", "Verified MEP and industrial supplier records", "Submittal and compliance support"],
    primaryHub: "Kuwait City, Kuwait",
    ctaHref: "/agents?country=KW",
    ctaLabel: "View Kuwait suppliers",
  },
  {
    slug: "oman",
    title: "Oman Industrial Procurement",
    subtitle: "Muscat-centered procurement visibility for industrial and MEP supply chains.",
    summary:
      "ProcureSource supports Oman project teams with searchable equipment records, supplier discovery, RFQ handling, and technical compliance review.",
    highlights: ["Muscat procurement coverage", "MEP product and supplier search", "RFQ and document review support"],
    primaryHub: "Muscat, Oman",
    ctaHref: "/agents?country=OM",
    ctaLabel: "View Oman suppliers",
  },
  {
    slug: "bahrain",
    title: "Bahrain Industrial Procurement",
    subtitle: "Manama procurement support for verified MEP suppliers, products, and project RFQs.",
    summary:
      "ProcureSource gives Bahrain procurement teams a structured way to evaluate supplier availability, product specifications, certifications, and RFQ responses.",
    highlights: ["Manama supplier coverage", "Verified technical records", "Procurement collaboration across buyers and suppliers"],
    primaryHub: "Manama, Bahrain",
    ctaHref: "/agents?country=BH",
    ctaLabel: "View Bahrain suppliers",
  },
];

export const globalPages: FooterLandingPage[] = [
  {
    slug: "european-union",
    title: "European Union Operations",
    subtitle: "International manufacturer records and compliance-aware procurement support.",
    summary:
      "ProcureSource tracks international supplier and manufacturer context so GCC procurement teams can evaluate imported equipment with clearer technical and compliance records.",
    highlights: ["European manufacturer visibility", "International documentation review", "Cross-border procurement context"],
    primaryHub: "European Union",
    ctaHref: "/manufacturers",
    ctaLabel: "Browse manufacturers",
  },
  {
    slug: "north-america",
    title: "North American Partners",
    subtitle: "Technical procurement support for North American brands and regional supply relationships.",
    summary:
      "ProcureSource helps connect product records, brand data, certifications, and supplier pathways for North American equipment entering GCC projects.",
    highlights: ["North American brand records", "Product and certification visibility", "Regional supplier mapping"],
    primaryHub: "North America",
    ctaHref: "/manufacturers",
    ctaLabel: "Browse brands",
  },
  {
    slug: "asia-pacific",
    title: "Asia-Pacific Distribution",
    subtitle: "Supplier and product discovery for Asia-Pacific industrial equipment sources.",
    summary:
      "ProcureSource supports international sourcing by connecting equipment details, supplier documentation, logistics context, and project-ready procurement records.",
    highlights: ["Asia-Pacific supplier context", "Product record comparison", "Documentation and RFQ readiness"],
    primaryHub: "Asia-Pacific",
    ctaHref: "/agents",
    ctaLabel: "Browse suppliers",
  },
  {
    slug: "logistics-network",
    title: "Global Logistics Network",
    subtitle: "Procurement visibility for international availability, delivery status, and project coordination.",
    summary:
      "ProcureSource brings delivery events, contract context, supplier messaging, and procurement data into one platform for better international coordination.",
    highlights: ["Delivery timeline support", "Supplier and buyer coordination", "Cross-border project visibility"],
    primaryHub: "Global",
    ctaHref: "/rfqs",
    ctaLabel: "View RFQs",
  },
  {
    slug: "international-compliance",
    title: "International Compliance",
    subtitle: "Certification-aware procurement for imported MEP and industrial equipment.",
    summary:
      "ProcureSource structures product certifications, authority requirements, consultant review notes, and submittal data to reduce ambiguity in procurement decisions.",
    highlights: ["AHRI, UL, SASO and ISO review support", "Compliance table support", "Consultant-ready technical summaries"],
    primaryHub: "Global Compliance",
    ctaHref: "/certifications",
    ctaLabel: "Review certifications",
  },
  {
    slug: "sustainability",
    title: "Global Sustainability",
    subtitle: "Procurement support for efficient equipment selection and documented project decisions.",
    summary:
      "ProcureSource helps teams compare technical specifications, performance data, and documentation so sustainability claims can be reviewed against engineering evidence.",
    highlights: ["Efficiency and performance data visibility", "Documented technical comparisons", "Project-ready procurement records"],
    primaryHub: "Global",
    ctaHref: "/products",
    ctaLabel: "Browse products",
  },
];

export function findFooterPage(collection: FooterLandingPage[], slug: string) {
  return collection.find((page) => page.slug === slug);
}
