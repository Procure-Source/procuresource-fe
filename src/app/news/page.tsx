import type { Metadata } from "next";

import { LaunchFooter } from "@/components/launch/launch-footer";
import { LaunchNav } from "@/components/launch/launch-nav";
import { NewsletterSignup } from "@/components/launch/newsletter-signup";

export const metadata: Metadata = {
  title: "News",
  description:
    "Curated UAE, Dubai, GCC, and international MEP procurement news, utilities updates, facilities management signals, and policy watch items.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "News | ProcureSource",
    description:
      "Curated UAE, Dubai, GCC, and international MEP procurement news, utilities updates, facilities management signals, and policy watch items.",
    url: "/news",
    images: [
      {
        url: "/procuresource-og.png",
        width: 1200,
        height: 630,
        alt: "ProcureSource MEP procurement news",
      },
    ],
  },
};

type PolicyWatchItem = {
  title: string;
  href: string;
  source: string;
  region: string;
  summary: string;
  tags: string[];
};

const policyWatchItems: PolicyWatchItem[] = [
  {
    title: "Dubai Building Code",
    href: "https://www.dm.gov.ae/municipality-business/planning-and-construction/dubai-building-code-2/",
    source: "Dubai Municipality",
    region: "Dubai",
    summary:
      "Official building-code reference point for Dubai project teams watching design, construction, and approval requirements.",
    tags: ["Policy", "Dubai", "Building"],
  },
  {
    title: "DEWA electricity connection standards",
    href: "https://www.dewa.gov.ae/en/builder/electricity-services/electrical-connections/getting-electricity",
    source: "DEWA",
    region: "Dubai",
    summary:
      "Official service path for electricity connections, useful for teams tracking electrical submission and authority requirements.",
    tags: ["Utility", "Dubai", "Electrical"],
  },
  {
    title: "DEWA regulations for electrical installations",
    href: "https://www.dewa.gov.ae/~/media/Files/Consultants%20and%20Contractors/DEWA_2017_REGULATIONS%20FOR%20ELECTRICAL%20INSTALLATIONS_EDITION%202017.ashx",
    source: "DEWA",
    region: "Dubai",
    summary:
      "Reference document for electrical installation requirements. Teams should confirm the latest authority guidance before submittals.",
    tags: ["Regulation", "Dubai", "MEP"],
  },
  {
    title: "UAE federal procurement legislation",
    href: "https://uaelegislation.gov.ae/en/legislations/2165/download",
    source: "UAE Legislation",
    region: "UAE",
    summary:
      "Federal procurement-law watch item for public-sector purchasing context and contract governance signals.",
    tags: ["Law", "UAE", "Procurement"],
  },
  {
    title: "UAE government tendering and awarding",
    href: "https://u.ae/en/information-and-services/business/public-private-people-partnership/ppp/government-tendering-and-awarding",
    source: "UAE Government Portal",
    region: "UAE",
    summary:
      "Public procurement overview for teams monitoring government tendering, awarding, and public-private delivery context.",
    tags: ["Policy", "UAE", "Tendering"],
  },
  {
    title: "National Green Building Regulation",
    href: "https://www.moei.gov.ae/assets/download/f872fbf7/Green%20building%20-%20EngV2.pdf.aspx",
    source: "UAE Ministry of Energy and Infrastructure",
    region: "UAE",
    summary:
      "Federal green-building reference for energy, water, materials, indoor environment, and construction efficiency themes.",
    tags: ["Sustainability", "UAE", "Building"],
  },
];

function PolicyBox({ item }: { item: PolicyWatchItem }) {
  return (
    <article className="news-box news-box--policy">
      <div className="news-box-meta">
        <span>{item.source}</span>
        <span>{item.region}</span>
      </div>
      <h2>{item.title}</h2>
      <p>{item.summary}</p>
      <div className="news-box-tags" aria-label="Policy tags">
        {item.tags.map((tag) => (
          <span key={`${item.href}-${tag}`}>{tag}</span>
        ))}
      </div>
      <a href={item.href} target="_blank" rel="noreferrer">
        Open reference
      </a>
    </article>
  );
}

export default function NewsPage() {
  return (
    <main className="stand-site stand-inner-site">
      <LaunchNav />

      <section className="news-app" aria-labelledby="news-title">
        <div className="stand-grain" aria-hidden="true" />
        <div className="news-app-top">
          <p>/News</p>
          <h1 id="news-title">MEP, utilities, policy.</h1>
          <span>
            Official references and policy watch items for UAE, Dubai, GCC, and international MEP procurement.
          </span>
        </div>
      </section>

      <section id="policy-law" className="news-app-section" aria-labelledby="policy-title">
        <div className="news-section-title">
          <p>Policy / Law</p>
          <h2 id="policy-title">Official references to keep watching.</h2>
          <span>
            These boxes are not legal advice. They are the public references a
            UAE MEP team should keep close when requirements move.
          </span>
        </div>
        <div className="news-card-grid news-card-grid--compact">
          {policyWatchItems.map((item) => (
            <PolicyBox key={item.href} item={item} />
          ))}
        </div>
      </section>

      <section id="newsletter" className="news-app-section news-newsletter-section" aria-label="Newsletter signup">
        <NewsletterSignup />
      </section>

      <LaunchFooter />
    </main>
  );
}