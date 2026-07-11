import { writeFile } from "node:fs/promises";

const outputPath = "src/lib/mep-news.ts";
const feedTimeoutMs = 12_000;

const feeds = [
  {
    name: "MEP Middle East",
    region: "GCC",
    url: "https://www.mepmiddleeast.com/feed",
    scope: "regional",
  },
  {
    name: "Construction Week Middle East",
    region: "Middle East",
    url: "https://www.constructionweekonline.com/feed",
    scope: "regional",
  },
  {
    name: "Utilities Middle East",
    region: "Middle East",
    url: "https://www.utilities-me.com/feed",
    scope: "regional",
  },
  {
    name: "Facilities Management Middle East",
    region: "Middle East",
    url: "https://www.fm-middleeast.com/feed",
    scope: "regional",
  },
  {
    name: "Construction Business News ME",
    region: "Middle East",
    url: "https://www.cbnme.com/feed/",
    scope: "regional",
  },
  {
    name: "Big Project Middle East",
    region: "Middle East",
    url: "https://www.bigprojectme.com/feed/",
    scope: "regional",
  },
  {
    name: "Middle East Construction News",
    region: "Middle East",
    url: "https://meconstructionnews.com/feed",
    scope: "regional",
  },
  {
    name: "PV Magazine Middle East",
    region: "Middle East",
    url: "https://www.pv-magazine.com/region/middle-east/feed/",
    scope: "regional",
  },
  {
    name: "CIBSE Journal",
    region: "International",
    url: "https://www.cibsejournal.com/feed/",
    scope: "international",
  },
  {
    name: "Construction Dive",
    region: "International",
    url: "https://www.constructiondive.com/feeds/news/",
    scope: "international",
  },
  {
    name: "World Construction Network",
    region: "International",
    url: "https://www.worldconstructionnetwork.com/feed/",
    scope: "international",
  },
  {
    name: "Global Construction Review",
    region: "International",
    url: "https://www.globalconstructionreview.com/feed/",
    scope: "international",
  },
  {
    name: "Electrical Contracting News",
    region: "International",
    url: "https://electricalcontractingnews.com/feed/",
    scope: "international",
  },
  {
    name: "Data Center Dynamics",
    region: "International",
    url: "https://www.datacenterdynamics.com/en/rss/",
    scope: "international",
  },
];

const coreKeywords = [
  "mep",
  "mechanical",
  "electrical",
  "plumbing",
  "hvac",
  "cooling",
  "district cooling",
  "ashrae",
  "cibse",
  "dewa",
  "utility",
  "utilities",
  "water",
  "wastewater",
  "power",
  "energy",
  "facility",
  "facilities",
  "facilities management",
  "maintenance",
  "building services",
  "fire safety",
  "retrofit",
  "retrofits",
  "energy efficiency",
  "net zero",
  "leed",
  "estidama",
  "bim",
  "digital twin",
  "data center",
  "data centre",
  "datacenter",
  "grid",
  "substation",
  "solar",
  "renewable",
  "heat pump",
  "electrification",
  "tadweer",
  "waste",
  "pipeline",
  "building",
  "buildings",
];

const connectedKeywords = [
  "construction",
  "contract",
  "consultancy",
  "contractor",
  "project",
  "projects",
  "tender",
  "procurement",
  "supplier",
  "infrastructure",
  "building",
  "buildings",
];

const geoKeywords = [
  "dubai",
  "abu dhabi",
  "sharjah",
  "uae",
  "gcc",
  "middle east",
  "saudi",
  "qatar",
  "oman",
  "kuwait",
  "bahrain",
  "riyadh",
  "doha",
  "lusail",
  "jeddah",
  "neom",
  "red sea",
  "alula",
];

const excludeKeywords = [
  "air taxi",
  "aviation",
  "airport",
  "taxi",
  "mortgage",
  "home financing",
  "property market",
  "cultural heritage",
  "metro",
  "mobility",
  "ipo",
  "dividend",
  "automotive",
  "acquisition",
  "fashion",
  "hotel opening",
  "hospitality",
  "restaurant",
  "luxury",
  "residential sale",
  "office market",
  "rent",
  "rental",
  "real estate prices",
  "racecourse",
  "equestrian",
  "horse racing",
  "egypt",
  "africa",
  "asia infrastructure fund",
  "tourism",
  "retail",
];

const priorityKeywords = [
  "mep",
  "hvac",
  "mechanical",
  "electrical",
  "plumbing",
  "cooling",
  "district cooling",
  "tender",
  "procurement",
  "contract",
  "consultancy",
  "infrastructure",
  "dewa",
  "water",
  "energy",
  "power",
  "grid",
  "solar",
  "renewable",
  "data center",
  "building services",
  "retrofit",
  "facility",
  "maintenance",
  "dubai",
  "abu dhabi",
  "uae",
];

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\u00e2\u20ac\u2122/g, "'")
    .replace(/\u00e2\u20ac\u02dc/g, "'")
    .replace(/\u00e2\u20ac\u0153/g, '"')
    .replace(/\u00e2\u20ac\ufffd/g, '"')
    .replace(/\u00e2\u20ac\u201c/g, "-")
    .replace(/\u00e2\u20ac\u201d/g, "-")
    .replace(/\u00e2\u20ac\u00a6/g, "...")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeEntities(match?.[1] || "");
}

function parseItems(xml, source) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)]
    .map((match) => {
      const item = match[0];
      const title = getTag(item, "title");
      const href = getTag(item, "link");
      const publishedAt = getTag(item, "pubDate") || getTag(item, "dc:date");
      const summary = getTag(item, "description");
      const categories = [...item.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)]
        .map((category) => decodeEntities(category[1]))
        .filter(Boolean);

      return {
        title,
        href,
        source: source.name,
        region: source.region,
        publishedAt,
        summary,
        categories,
      };
    })
    .filter((item) => item.title && item.href);
}

function parseEntries(xml, source) {
  return [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)]
    .map((match) => {
      const entry = match[0];
      const linkMatch = entry.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
      const categories = [...entry.matchAll(/<category[^>]+term=["']([^"']+)["'][^>]*>/gi)]
        .map((category) => decodeEntities(category[1]))
        .filter(Boolean);

      return {
        title: getTag(entry, "title"),
        href: decodeEntities(linkMatch?.[1] || getTag(entry, "link")),
        source: source.name,
        region: source.region,
        publishedAt: getTag(entry, "updated") || getTag(entry, "published"),
        summary: getTag(entry, "summary") || getTag(entry, "content"),
        categories,
      };
    })
    .filter((item) => item.title && item.href);
}

function parseFeed(xml, source) {
  const rssItems = parseItems(xml, source);
  if (rssItems.length > 0) {
    return rssItems;
  }

  return parseEntries(xml, source);
}

function scoreItem(item) {
  const text = `${item.title} ${item.summary} ${item.categories.join(" ")}`.toLowerCase();
  const hasCoreSignal = coreKeywords.some((keyword) => text.includes(keyword));
  const hasConnectedSignal = connectedKeywords.some((keyword) => text.includes(keyword));
  const hasGeoSignal = geoKeywords.some((keyword) => text.includes(keyword));
  const hasExcludedSignal = excludeKeywords.some((keyword) => text.includes(keyword));
  const isInternational = item.scope === "international";
  const isSpecialistSource =
    item.source === "MEP Middle East" ||
    item.source === "Utilities Middle East" ||
    item.source === "Facilities Management Middle East" ||
    item.source === "CIBSE Journal" ||
    item.source === "Electrical Contracting News" ||
    item.source === "Data Center Dynamics";

  if (isInternational && !hasCoreSignal) {
    return -1;
  }

  if (!isInternational && !hasCoreSignal && !(isSpecialistSource && hasConnectedSignal && hasGeoSignal)) {
    return -1;
  }

  if (hasExcludedSignal) {
    return -1;
  }

  let score = 0;
  for (const keyword of priorityKeywords) {
    if (text.includes(keyword)) score += 2;
  }
  for (const keyword of coreKeywords) {
    if (text.includes(keyword)) score += 1;
  }
  if (isSpecialistSource) score += 4;
  if (hasGeoSignal) score += 2;
  if (isInternational) score -= 3;
  const time = Date.parse(item.publishedAt);
  if (Number.isFinite(time)) {
    const daysOld = Math.max(0, (Date.now() - time) / 86_400_000);
    score += Math.max(0, 18 - daysOld);
  }
  return score;
}

function uniqByHref(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.href.replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function cleanSummary(summary) {
  return decodeEntities(summary)
    .replace(/\bRead More\b.*$/i, "")
    .slice(0, 210)
    .trim();
}

function toModule(items, refreshedAt) {
  const normalized = items.map((item) => ({
    ...item,
    summary: cleanSummary(item.summary),
  }));

  return `export type MepNewsItem = {
  title: string;
  href: string;
  source: string;
  region: string;
  scope: string;
  publishedAt: string;
  summary: string;
  categories: string[];
};

export const mepNewsUpdatedAt = ${JSON.stringify(refreshedAt)};

export const mepNewsItems: MepNewsItem[] = ${JSON.stringify(normalized, null, 2)};
`;
}

async function fetchFeed(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), feedTimeoutMs);

  const response = await fetch(source.url, {
    signal: controller.signal,
    headers: {
      "user-agent": "Mozilla/5.0 ProcureSourceLaunch/1.0 (+https://procuresource.co; hello@procuresource.co)",
      accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`${source.name} returned ${response.status}`);
  }

  return response.text();
}

async function main() {
  const allItems = [];

  for (const source of feeds) {
    try {
      const xml = await fetchFeed(source);
      allItems.push(...parseFeed(xml, source).map((item) => ({ ...item, scope: source.scope })));
    } catch (error) {
      console.warn(`[news:update] Skipped ${source.name}: ${error.message}`);
    }
  }

  const ranked = uniqByHref(allItems)
    .map((item) => ({ item, score: scoreItem(item) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => {
      const dateA = Date.parse(a.item.publishedAt) || 0;
      const dateB = Date.parse(b.item.publishedAt) || 0;
      return b.score - a.score || dateB - dateA;
    })
    .slice(0, 30)
    .map((entry) => entry.item);

  if (ranked.length === 0) {
    console.warn(`[news:update] No relevant feed items found. Keeping existing ${outputPath}.`);
    return;
  }

  const refreshedAt = new Date().toISOString();
  await writeFile(outputPath, toModule(ranked, refreshedAt));
  console.log(`[news:update] Wrote ${ranked.length} items to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
