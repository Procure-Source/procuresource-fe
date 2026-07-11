import type { BoqLineItem } from "@/lib/rfq-flow";

const maxBodyBytes = Number(process.env.MAX_BODY_BYTES || 6 * 1024 * 1024);
const maxBoqTextChars = Number(process.env.MAX_BOQ_TEXT_CHARS || 60000);
const maxDataUrlChars = Number(process.env.MAX_DATA_URL_CHARS || 5 * 1024 * 1024);
const parserRequestTimeoutMs = Number(process.env.PARSER_REQUEST_TIMEOUT_MS || 45000);
const parseRateWindowMs = Number(process.env.PARSE_RATE_WINDOW_MS || 60 * 1000);
const parseRateMax = Number(process.env.PARSE_RATE_MAX || 12);
const parseRateBuckets = new Map<string, { count: number; resetAt: number }>();

type ParseInput = {
  text: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
};

type ParseResult = {
  lineItems: BoqLineItem[];
  notes: string[];
};

export function jsonHeaders() {
  return {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  };
}

export function isParserConfigured() {
  return Boolean(getParserApiKey() && getParserEndpoint() && getParserModel());
}

export function isDatabaseConfigured() {
  return Boolean(process.env.COSMOS_MONGODB_URI || process.env.MONGODB_URI);
}

export function isAllowedRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = new Set(
    (process.env.PROCURESOURCE_ALLOWED_ORIGINS || "")
      .split(",")
      .map((item) => item.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  );

  const host = request.headers.get("host");
  try {
    const originUrl = new URL(origin);
    if (host && originUrl.host === host) return true;
    return allowedOrigins.has(origin.replace(/\/+$/, ""));
  } catch {
    return false;
  }
}

export function hasProductClientHeader(request: Request) {
  const client = request.headers.get("x-procuresource-client");
  return client === "web-product" || client === "local-qa";
}

export function takeRateLimit(request: Request) {
  const key = getClientKey(request);
  const now = Date.now();
  const bucket = parseRateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    parseRateBuckets.set(key, { count: 1, resetAt: now + parseRateWindowMs });
    return true;
  }

  if (bucket.count >= parseRateMax) return false;
  bucket.count += 1;
  return true;
}

export async function readBoundedJson(request: Request, limitBytes = maxBodyBytes) {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";
  if (!contentType.includes("application/json")) {
    throw requestError("Unsupported content type", 415);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > limitBytes) {
    throw requestError("Request body is too large", 413);
  }

  if (!raw.trim()) return {};

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw requestError("Invalid JSON body", 400);
  }
}

export function normalizeParseInput(body: unknown): ParseInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw requestError("Invalid request body", 400);
  }

  const value = body as Record<string, unknown>;
  const text = sanitizeString(value.text, maxBoqTextChars);
  const fileName = sanitizeString(value.fileName, 180);
  const mimeType = sanitizeString(value.mimeType, 100).toLowerCase();
  const dataUrl = sanitizeString(value.dataUrl, maxDataUrlChars);
  const allowedMimeTypes = new Set([
    "",
    "text/plain",
    "text/csv",
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ]);

  if (mimeType && !allowedMimeTypes.has(mimeType)) {
    throw requestError("Unsupported file type", 415);
  }

  if (typeof value.text === "string" && value.text.length > maxBoqTextChars) {
    throw requestError("BOQ text is too large", 413);
  }

  if (typeof value.dataUrl === "string") {
    if (value.dataUrl.length > maxDataUrlChars) {
      throw requestError("Document payload is too large", 413);
    }

    if (dataUrl && !/^data:(image\/png|image\/jpeg|application\/pdf);base64,/i.test(dataUrl)) {
      throw requestError("Unsupported document payload", 415);
    }
  }

  return { text, fileName, mimeType, dataUrl };
}

export async function parseBoq(input: ParseInput): Promise<ParseResult> {
  const fallbackText = input.text || input.fileName || "";

  try {
    const remoteResult = await parseWithConfiguredParser(input);
    if (remoteResult) {
      return {
        lineItems: normalizeLineItems(remoteResult.lineItems, fallbackText),
        notes: normalizeNotes(remoteResult.notes),
      };
    }
  } catch {
    return {
      lineItems: deterministicParseBoq(fallbackText),
      notes: [],
    };
  }

  return {
    lineItems: deterministicParseBoq(fallbackText),
    notes: [],
  };
}

export function requestError(message: string, statusCode: number) {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

function sanitizeString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function detectCategory(text: string) {
  const normalized = text.toLowerCase();
  if (/chiller|ahu|fan coil|cooling|hvac|refrigerant/.test(normalized)) return "HVAC";
  if (/pump|flow|head|booster|pressur/.test(normalized)) return "Pumps";
  if (/switchgear|switchboard|panel|mccb|cable|voltage|iec|busbar/.test(normalized)) return "Electrical";
  if (/valve|pipe|fitting|flange/.test(normalized)) return "Plumbing";
  if (/fire|sprinkler|alarm|fm200/.test(normalized)) return "Fire Fighting";
  return "MEP";
}

function cleanLine(line: string) {
  return line
    .replace(/^\s*(?:\d+[\).\-\s]+|[A-Z][\).\-\s]+)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseQuantity(line: string) {
  const match = line.match(/\b(\d+(?:\.\d+)?)\s*(nos|no|pcs|set|sets|m|m2|m3|kg|tr|kw|lot)\b/i);
  if (!match) return { quantity: 1, unit: "lot" };

  return {
    quantity: Number(match[1]) || 1,
    unit: match[2].toLowerCase() === "no" ? "nos" : match[2].toLowerCase(),
  };
}

function parseDescription(line: string) {
  const segments = line
    .split(/\s+-\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length >= 2) return segments[0];

  return line
    .replace(/\b\d+(?:\.\d+)?\s*(nos|no|pcs|set|sets|lot)\b/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deterministicParseBoq(text: string): BoqLineItem[] {
  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 8)
    .slice(0, 24);

  if (lines.length === 0) return [];

  return lines.slice(0, 12).map((line, index) => {
    const { quantity, unit } = parseQuantity(line);

    return {
      id: `boq-${String(index + 1).padStart(3, "0")}`,
      description: parseDescription(line) || line,
      quantity,
      unit,
      specification: line,
      category: detectCategory(line),
      confidence: 74,
    };
  });
}

function normalizeLineItems(value: unknown, fallbackText: string): BoqLineItem[] {
  if (!Array.isArray(value)) return deterministicParseBoq(fallbackText);

  const items = value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const source = item as Record<string, unknown>;
      const description =
        typeof source.description === "string" && source.description.trim()
          ? source.description.trim()
          : typeof source.item === "string"
            ? source.item.trim()
            : "";

      if (!description) return null;

      return {
        id: typeof source.id === "string" && source.id.trim() ? source.id.trim() : `boq-${String(index + 1).padStart(3, "0")}`,
        description,
        quantity: typeof source.quantity === "number" && source.quantity > 0 ? source.quantity : Number(source.quantity) || 1,
        unit: typeof source.unit === "string" && source.unit.trim() ? source.unit.trim() : "lot",
        specification:
          typeof source.specification === "string" && source.specification.trim()
            ? source.specification.trim()
            : description,
        category:
          typeof source.category === "string" && source.category.trim()
            ? source.category.trim()
            : detectCategory(description),
        confidence: normalizeConfidence(source.confidence),
      };
    })
    .filter((item): item is BoqLineItem => Boolean(item));

  return items.length > 0 ? items.slice(0, 80) : deterministicParseBoq(fallbackText);
}

function normalizeConfidence(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 80;
  const percent = numeric > 0 && numeric <= 1 ? numeric * 100 : numeric;
  return Math.round(Math.max(0, Math.min(100, percent)));
}

function normalizeNotes(value: unknown) {
  return Array.isArray(value) ? value.filter((note): note is string => typeof note === "string").slice(0, 6) : [];
}

function getParserEndpoint() {
  return (process.env.PRIMARY_AI_API_ENDPOINT || process.env.AI_API_ENDPOINT || "").trim();
}

function getParserApiKey() {
  return (process.env.PRIMARY_AI_API_KEY || process.env.AI_API_KEY || "").trim();
}

function getParserModel() {
  return (process.env.PRIMARY_AI_MODEL || process.env.AI_MODEL || "").trim();
}

function getDataUrlMimeType(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+)[;,]/i);
  return match ? match[1].toLowerCase() : "";
}

function buildPrompt(input: ParseInput) {
  return `Return only valid JSON with lineItems and notes.

Shape:
{
  "lineItems": [
    {
      "id": "boq-001",
      "description": "string",
      "quantity": 1,
      "unit": "string",
      "specification": "string",
      "category": "HVAC | Pumps | Electrical | Plumbing | Fire Fighting | MEP",
      "confidence": 0
    }
  ],
  "notes": ["string"]
}

Rules:
- Split the BOQ into clean supplier-quotable line items.
- Preserve unit basis exactly as supplied.
- Keep quantity numeric and unit separate.
- Put certificates, standards, voltages, duty points, flow, head, TR, kW, IP rating, and material requirements in specification.
- Do not invent prices.

File name: ${input.fileName || "not provided"}
MIME type: ${input.mimeType || "not provided"}
Document payload: ${input.dataUrl ? `${getDataUrlMimeType(input.dataUrl)} attached` : "not attached"}
BOQ text:
${input.text || "No text provided. Extract likely line items from the document content if available."}`;
}

function candidateChatUrls(endpoint: string) {
  const trimmed = endpoint.replace(/\/+$/, "");
  if (/\/chat\/completions(?:\?|$)/i.test(trimmed)) return [trimmed];

  if (/\.services\.ai\.azure\.com/i.test(trimmed)) {
    return [
      `${trimmed}/models/chat/completions?api-version=${process.env.AI_API_VERSION || "2024-05-01-preview"}`,
      `${trimmed}/openai/v1/chat/completions`,
    ];
  }

  if (/\/v1$/i.test(trimmed)) return [`${trimmed}/chat/completions`];
  if (/\/openai\/v1$/i.test(trimmed)) return [`${trimmed}/chat/completions`];
  return [`${trimmed}/v1/chat/completions`, `${trimmed}/chat/completions`];
}

async function parseWithConfiguredParser(input: ParseInput) {
  const endpoint = getParserEndpoint();
  const apiKey = getParserApiKey();
  const model = getParserModel();

  if (!endpoint || !apiKey || !model) return null;

  const prompt = buildPrompt(input);
  const userContent = input.dataUrl && /^data:image\/(png|jpeg|jpg);base64,/i.test(input.dataUrl)
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: input.dataUrl } },
      ]
    : prompt;

  for (const url of candidateChatUrls(endpoint)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), parserRequestTimeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "Return procurement BOQ parsing JSON only." },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (!response.ok) continue;

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      const parsed = parseJsonObject(Array.isArray(content) ? content.map((part) => part.text || "").join("\n") : content);
      if (parsed) return parsed;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

function parseJsonObject(rawText: unknown) {
  if (typeof rawText !== "string" || !rawText.trim()) return null;
  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || rawText;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  try {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
