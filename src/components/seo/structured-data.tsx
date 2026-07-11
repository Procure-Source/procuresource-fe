import { faqs, publicLaunchRoutes } from "@/lib/launch-content";

const baseUrl = "https://procuresource.co";

const pages = publicLaunchRoutes.map((page) => ({
  name: page.label,
  url: `${baseUrl}${page.path}`,
}));

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "ProcureSource",
      alternateName: "ProcureSource by Grow Technology Services FZ LLC",
      legalName: "Grow Technology Services FZ LLC",
      url: baseUrl,
      email: "hello@procuresource.co",
      slogan: "Built from Dubai to the world.",
      description: "ProcureSource is a UAE-first MEP RFQ platform in private build.",
      logo: `${baseUrl}/procuresource-logo.svg`,
      foundingLocation: {
        "@type": "Place",
        name: "Dubai, United Arab Emirates",
      },
      areaServed: [
        {
          "@type": "Country",
          name: "United Arab Emirates",
        },
        {
          "@type": "Place",
          name: "Gulf Cooperation Council",
        },
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "general inquiries",
          email: "hello@procuresource.co",
          availableLanguage: ["en"],
        },
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@procuresource.co",
          availableLanguage: ["en"],
        },
      ],
      sameAs: ["https://procuresource.co"],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "ProcureSource",
      description: "ProcureSource is a UAE MEP RFQ platform in private build, with public accounts coming soon.",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      inLanguage: "en",
      about: [
        "UAE MEP RFQ platform",
        "Dubai construction procurement",
        "GCC MEP news",
        "regional utilities updates",
        "facilities management procurement",
      ],
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/news?query={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${baseUrl}/#navigation`,
      name: pages.map((page) => page.name),
      url: pages.map((page) => page.url),
    },
    {
      "@type": "FAQPage",
      "@id": `${baseUrl}/#faq`,
      mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${baseUrl}/#breadcrumbs`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Coming Soon",
          item: baseUrl,
        },
      ],
    },
  ],
};

export default function StructuredData() {
  return <script type="application/ld+json">{JSON.stringify(structuredData)}</script>;
}
