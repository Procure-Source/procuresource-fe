import type { Metadata } from "next";

import { NewsletterSignup } from "@/components/launch/newsletter-signup";
import { ProductShell } from "@/components/product/product-shell";
import { mepNewsItems, mepNewsUpdatedAt, type MepNewsItem } from "@/lib/mep-news";

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

const filterRules = [
  { label: "All", href: "#latest", needles: [] },
  { label: "Dubai", href: "#dubai", needles: ["dubai", "dewa", "empower", "etihad esco"] },
  { label: "UAE", href: "#uae", needles: ["uae", "abu dhabi", "sharjah", "tadweer"] },
  { label: "GCC", href: "#gcc", needles: ["gcc", "saudi", "qatar", "oman", "kuwait", "bahrain", "doha", "lusail", "riyadh"] },
  { label: "MEP", href: "#latest", needles: ["mep", "hvac", "cooling", "ashrae", "cibse", "electrical", "water"] },
  { label: "Utilities", href: "#utilities", needles: ["utility", "utilities", "dewa", "water", "power", "energy", "waste"] },
  { label: "Projects", href: "#projects", needles: ["project", "contract", "infrastructure", "pipeline", "consultancy"] },
  { label: "International", href: "#international", needles: ["international", "global", "cibse", "construction dive", "data center dynamics", "electrical contracting news"] },
  { label: "Policy / Law", href: "#policy-law", needles: ["policy", "law", "regulation", "code"] },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function textForItem(item: MepNewsItem) {
  return [item.title, item.summary, item.source, item.region, ...item.categories]
    .join(" ")
    .toLowerCase();
}

function countByNeedles(needles: string[]) {
  if (needles.length === 0) {
    return mepNewsItems.length;
  }

  return mepNewsItems.filter((item) =>
    needles.some((needle) => textForItem(item).includes(needle)),
  ).length;
}

function inferTags(item: MepNewsItem) {
  const text = textForItem(item);
  const tags = new Set<string>();

  if (text.includes("dubai") || text.includes("dewa") || text.includes("empower")) {
    tags.add("Dubai");
  }
  if (text.includes("uae") || text.includes("abu dhabi") || text.includes("sharjah")) {
    tags.add("UAE");
  }
  if (text.includes("gcc") || text.includes("saudi") || text.includes("qatar") || text.includes("oman")) {
    tags.add("GCC");
  }
  if (text.includes("mep") || text.includes("hvac") || text.includes("cooling") || text.includes("electrical")) {
    tags.add("MEP");
  }
  if (text.includes("utility") || text.includes("utilities") || text.includes("water") || text.includes("power")) {
    tags.add("Utilities");
  }
  if (text.includes("project") || text.includes("contract") || text.includes("infrastructure")) {
    tags.add("Projects");
  }
  if (text.includes("international") || item.region === "International") {
    tags.add("International");
  }

  if (tags.size === 0) {
    tags.add(item.region || "Market");
  }

  return Array.from(tags).slice(0, 4);
}

function NewsBox({ item }: { item: MepNewsItem }) {
  const tags = inferTags(item);

  return (
    <article className="news-box">
      <div className="news-box-meta">
        <span>{item.source}</span>
        <span>{formatDate(item.publishedAt)}</span>
      </div>
      <h2>{item.title}</h2>
      <p>{item.summary || "Read the source for the full story and current context."}</p>
      <div className="news-box-tags" aria-label="News tags">
        {tags.map((tag) => (
          <span key={`${item.href}-${tag}`}>{tag}</span>
        ))}
      </div>
      <a href={item.href} target="_blank" rel="noreferrer">
        Read source
      </a>
    </article>
  );
}

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
  const latest = mepNewsItems.slice(0, 12);
  const more = mepNewsItems.slice(12);
  const dubaiItems = mepNewsItems
    .filter((item) => filterRules[1].needles.some((needle) => textForItem(item).includes(needle)))
    .slice(0, 4);
  const uaeItems = mepNewsItems
    .filter((item) => filterRules[2].needles.some((needle) => textForItem(item).includes(needle)))
    .slice(0, 4);
  const projectItems = mepNewsItems
    .filter((item) => filterRules[6].needles.some((needle) => textForItem(item).includes(needle)))
    .slice(0, 4);
  const utilityItems = mepNewsItems
    .filter((item) => filterRules[5].needles.some((needle) => textForItem(item).includes(needle)))
    .slice(0, 4);

  return (
    <ProductShell>
      <main className="stand-site stand-inner-site">
        <section className="news-app" aria-labelledby="news-title">
          <div className="stand-grain" aria-hidden="true" />
          <div className="news-app-top">
            <p>/News</p>
            <h1 id="news-title">MEP, utilities, policy.</h1>
            <span>
              A public board for UAE, Dubai, GCC, and connected international signals. Refreshed{" "}
              {formatDate(mepNewsUpdatedAt)} from public sources.
            </span>
          </div>

          <nav className="news-filter-bar" aria-label="News filters">
            {filterRules.map((rule) => (
              <a key={rule.label} href={rule.href}>
                <span>{rule.label}</span>
                <b>
                  {rule.label === "Policy / Law"
                    ? policyWatchItems.length
                    : rule.label === "International"
                      ? mepNewsItems.filter((item) => item.region === "International").length
                      : countByNeedles(rule.needles)}
                </b>
              </a>
            ))}
          </nav>

          <div id="latest" className="news-card-grid" aria-label="Latest MEP news">
            {latest.map((item) => (
              <NewsBox key={item.href} item={item} />
            ))}
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

        <section id="gcc" className="news-app-section news-app-section--split" aria-label="Regional news filters">
          <div id="dubai">
            <div className="news-section-title">
              <p>Dubai</p>
              <h2>Dubai and authority signals.</h2>
            </div>
            <div className="news-stack">
              {dubaiItems.map((item) => (
                <NewsBox key={`dubai-${item.href}`} item={item} />
              ))}
            </div>
          </div>

          <div id="uae">
            <div className="news-section-title">
              <p>UAE</p>
              <h2>UAE market movement.</h2>
            </div>
            <div className="news-stack">
              {uaeItems.map((item) => (
                <NewsBox key={`uae-${item.href}`} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="news-app-section" aria-labelledby="projects-title">
          <div className="news-section-title">
            <p>Projects</p>
            <h2 id="projects-title">Contracts, infrastructure, and demand signals.</h2>
          </div>
          <div className="news-card-grid news-card-grid--compact">
            {projectItems.map((item) => (
              <NewsBox key={`project-${item.href}`} item={item} />
            ))}
          </div>
        </section>

        <section id="utilities" className="news-app-section" aria-labelledby="utilities-title">
          <div className="news-section-title">
            <p>Utilities</p>
            <h2 id="utilities-title">Power, water, waste, and energy notes.</h2>
          </div>
          <div className="news-card-grid news-card-grid--compact">
            {utilityItems.map((item) => (
              <NewsBox key={`utility-${item.href}`} item={item} />
            ))}
          </div>
        </section>

        <section id="newsletter" className="news-app-section news-newsletter-section" aria-label="Newsletter signup">
          <NewsletterSignup />
        </section>

        {more.length > 0 ? (
          <section id="international" className="news-app-section" aria-labelledby="more-title">
            <div className="news-section-title">
              <p>More</p>
              <h2 id="more-title">More GCC, regional, and international notes.</h2>
            </div>
            <div className="news-card-grid news-card-grid--compact">
              {more.map((item) => (
                <NewsBox key={`more-${item.href}`} item={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </ProductShell>
  );
}
