import { staticPages } from "@/lib/content";
import { siteConfig } from "@/lib/site";

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

const pages = siteConfig.publicRoutes.map((route) => ({
  name: route.label,
  url: `${siteConfig.url}${route.path === "/" ? "" : route.path}`,
}));

const structuredGraph: JsonLdValue[] = [
  {
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: "ProcureSource UAE MEP RFQ Platform",
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.email.general,
    slogan: "Built from Dubai to the world.",
    description: siteConfig.description,
    logo: `${siteConfig.url}/procuresource-logo-mark.svg`,
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
        email: siteConfig.email.general,
        availableLanguage: ["en"],
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.email.support,
        availableLanguage: ["en"],
      },
    ],
    sameAs: [siteConfig.url],
  },
  {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    alternateName: "ProcureSource UAE MEP RFQ Platform",
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    inLanguage: "en",
    about: [
      "UAE MEP RFQ platform",
      "Dubai MEP procurement",
      "MEP procurement UAE",
      "construction procurement UAE",
    ],
  },
  {
    "@type": "SiteNavigationElement",
    "@id": `${siteConfig.url}/#navigation`,
    name: pages.map((page) => page.name),
    url: pages.map((page) => page.url),
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": structuredGraph,
} satisfies JsonLdValue;

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${siteConfig.url}/faq#faq`,
  mainEntity: staticPages.faq.rows.map((row) => ({
    "@type": "Question",
    name: row.title,
    acceptedAnswer: {
      "@type": "Answer",
      text: row.body,
    },
  })),
} satisfies JsonLdValue;

function JsonLdScript({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function StructuredData() {
  return <JsonLdScript data={structuredData} />;
}

export function FaqStructuredData() {
  return <JsonLdScript data={faqStructuredData} />;
}
