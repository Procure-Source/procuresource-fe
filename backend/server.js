import http from "node:http";
import fs from "node:fs";
import path from "node:path";

function loadLocalEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^"|"$/g, "")
      .replace(/^'|'$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const envRoots = [process.cwd(), path.resolve(process.cwd(), "..")];
for (const envRoot of envRoots) {
  loadLocalEnvFile(path.join(envRoot, ".env"));
  loadLocalEnvFile(path.join(envRoot, ".env.local"));
}

const port = Number(process.env.PORT || 8080);
const serviceName = process.env.SERVICE_NAME || "procuresource-backend";
const mode = process.env.PROCURESOURCE_BACKEND_MODE || "product";
const productMode = mode === "product";
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES || 6 * 1024 * 1024);
const maxBoqTextChars = Number(process.env.MAX_BOQ_TEXT_CHARS || 60000);
const maxDataUrlChars = Number(process.env.MAX_DATA_URL_CHARS || 5 * 1024 * 1024);
const parseRateWindowMs = Number(process.env.PARSE_RATE_WINDOW_MS || 60 * 1000);
const parseRateMax = Number(process.env.PARSE_RATE_MAX || 12);
const parserRequestTimeoutMs = Number(process.env.PARSER_REQUEST_TIMEOUT_MS || 45_000);
const parseRateBuckets = new Map();

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4173",
  "http://localhost:4174",
  "https://purple-forest-0948a4910.7.azurestaticapps.net",
  "https://procuresource.co",
];

const allowedOrigins = new Set(
  [...defaultAllowedOrigins, ...(process.env.FRONTEND_URLS || "").split(",")]
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
);

const securityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy":
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function isAllowedOrigin(origin) {
  if (!origin) return false;
  const normalized = origin.replace(/\/+$/, "");
  return allowedOrigins.has(normalized);
}

function buildHeaders(req, extraHeaders = {}) {
  const origin = req.headers.origin;
  const corsHeaders = isAllowedOrigin(origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin",
      }
    : {};

  return {
    ...securityHeaders,
    ...corsHeaders,
    ...extraHeaders,
  };
}

function sendJson(req, res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  const isHead = req.method === "HEAD";

  res.writeHead(
    statusCode,
    buildHeaders(req, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": isHead ? 0 : Buffer.byteLength(body),
    }),
  );

  res.end(isHead ? undefined : body);
}

function sendNoContent(req, res) {
  res.writeHead(
    204,
    buildHeaders(req, {
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-ProcureSource-Client",
      "Access-Control-Max-Age": "600",
    }),
  );
  res.end();
}

function getClientKey(req) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return forwardedFor || req.socket.remoteAddress || "unknown";
}

function isBrowserCrossSite(req) {
  const fetchSite = String(req.headers["sec-fetch-site"] || "").toLowerCase();
  return fetchSite === "cross-site" || fetchSite === "none";
}

function canAcceptStateChangingRequest(req) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  if (origin && !isAllowedOrigin(origin)) return false;
  if (!origin && isBrowserCrossSite(req)) return false;
  return true;
}

function hasProductClientHeader(req) {
  const client = String(req.headers["x-procuresource-client"] || "");
  return client === "web-product" || client === "local-qa";
}

function takeRateLimit(key, maxHits, windowMs) {
  const now = Date.now();
  const bucket = parseRateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    parseRateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= maxHits) return false;
  bucket.count += 1;
  return true;
}

function sanitizeString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function assertJsonRequest(req) {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    const error = new Error("Unsupported content type");
    error.statusCode = 415;
    throw error;
  }
}

async function readJsonBody(req, limitBytes = maxBodyBytes) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    chunks.push(chunk);
    total += chunk.length;
    if (total > limitBytes) {
      const error = new Error("Request body is too large");
      error.statusCode = 413;
      throw error;
    }
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Invalid JSON body");
    error.statusCode = 400;
    throw error;
  }
}

function normalizeParseInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const error = new Error("Invalid request body");
    error.statusCode = 400;
    throw error;
  }

  const text = sanitizeString(body.text, maxBoqTextChars);
  const fileName = sanitizeString(body.fileName, 180);
  const mimeType = sanitizeString(body.mimeType, 100).toLowerCase();
  const dataUrl = sanitizeString(body.dataUrl, maxDataUrlChars);
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
    const error = new Error("Unsupported file type");
    error.statusCode = 415;
    throw error;
  }

  if (typeof body.text === "string" && body.text.length > maxBoqTextChars) {
    const error = new Error("BOQ text is too large");
    error.statusCode = 413;
    throw error;
  }

  if (typeof body.dataUrl === "string") {
    if (body.dataUrl.length > maxDataUrlChars) {
      const error = new Error("Document payload is too large");
      error.statusCode = 413;
      throw error;
    }

    if (dataUrl && !/^data:(image\/png|image\/jpeg|application\/pdf);base64,/i.test(dataUrl)) {
      const error = new Error("Unsupported document payload");
      error.statusCode = 415;
      throw error;
    }
  }

  return { text, fileName, mimeType, dataUrl };
}

function getDataUrlMimeType(dataUrl) {
  const match = String(dataUrl || "").match(/^data:([^;,]+)[;,]/i);
  return match ? match[1].toLowerCase() : "";
}

function isImageDataUrl(dataUrl) {
  return /^image\/(png|jpeg|jpg)$/i.test(getDataUrlMimeType(dataUrl));
}

function isPdfDataUrl(dataUrl) {
  return getDataUrlMimeType(dataUrl) === "application/pdf";
}

async function fetchWithTimeout(url, options, timeoutMs = parserRequestTimeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function detectCategory(text) {
  const normalized = text.toLowerCase();
  if (/chiller|ahu|fan coil|cooling|hvac|refrigerant/.test(normalized)) return "HVAC";
  if (/pump|flow|head|booster|pressur/.test(normalized)) return "Pumps";
  if (/switchgear|switchboard|panel|mccb|cable|voltage|iec|busbar/.test(normalized)) return "Electrical";
  if (/valve|pipe|fitting|flange/.test(normalized)) return "Plumbing";
  return "MEP";
}

function parseQuantity(line) {
  const match = line.match(/\b(\d+(?:\.\d+)?)\s*(nos|no|pcs|set|sets|m|m2|m3|kg|tr|kw|lot)\b/i);
  if (!match) return { quantity: 1, unit: "lot" };
  return {
    quantity: Number(match[1]) || 1,
    unit: match[2].toLowerCase() === "no" ? "nos" : match[2].toLowerCase(),
  };
}

function parseDescription(line) {
  const segments = line
    .split(/\s+-\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length >= 2) {
    return segments[0];
  }

  return line
    .replace(/\b\d+(?:\.\d+)?\s*(nos|no|pcs|set|sets|lot)\b/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLine(line) {
  return line
    .replace(/^\s*(?:\d+[\).\-\s]+|[A-Z][\).\-\s]+)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deterministicParseBoq(text) {
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

function normalizeLineItems(value, fallbackText) {
  if (!Array.isArray(value)) return deterministicParseBoq(fallbackText);

  function normalizeConfidence(confidence) {
    const numeric = Number(confidence);
    if (!Number.isFinite(numeric)) return 80;
    const percent = numeric > 0 && numeric <= 1 ? numeric * 100 : numeric;
    return Math.round(Math.max(0, Math.min(100, percent)));
  }

  const items = value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const description =
        typeof item.description === "string" && item.description.trim()
          ? item.description.trim()
          : typeof item.item === "string"
            ? item.item.trim()
            : "";
      if (!description) return null;

      return {
        id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `boq-${String(index + 1).padStart(3, "0")}`,
        description,
        quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : Number(item.quantity) || 1,
        unit: typeof item.unit === "string" && item.unit.trim() ? item.unit.trim() : "lot",
        specification:
          typeof item.specification === "string" && item.specification.trim()
            ? item.specification.trim()
            : description,
        category:
          typeof item.category === "string" && item.category.trim()
            ? item.category.trim()
            : detectCategory(description),
        confidence: normalizeConfidence(item.confidence),
      };
    })
    .filter(Boolean);

  return items.length > 0 ? items : deterministicParseBoq(fallbackText);
}

function parseJsonObject(rawText) {
  if (!rawText) return null;
  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || rawText;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  try {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

function buildBoqPrompt({ text, fileName, mimeType, dataUrl }) {
  return `You are ProcureSource's BOQ parsing engine for MEP and industrial RFQs.

Return only valid JSON with this exact shape:
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
- Preserve metric or imperial units exactly as supplied.
- Keep quantity numeric and unit separate.
- Put certificates, standards, voltages, duty points, flow, head, TR, kW, IP rating, and material requirements in specification.
- Do not invent prices.
- If the input is incomplete, return the best line items and add notes.

File name: ${fileName || "not provided"}
MIME type: ${mimeType || "not provided"}
Document payload: ${dataUrl ? `${getDataUrlMimeType(dataUrl)} attached for server-side reading` : "not attached"}
BOQ text:
${text || "No text provided. Extract likely line items from the document content if available."}`;
}

function resolvePrimaryChatUrl() {
  const endpoint =
    process.env.PRIMARY_AI_API_ENDPOINT ||
    process.env.AI_API_ENDPOINT ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.AZURE_AI_ENDPOINT ||
    "";
  if (!endpoint.trim()) return "";

  const trimmed = endpoint.replace(/\/+$/, "");
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed;
  if (/\/openai\/v1$/i.test(trimmed)) return `${trimmed}/chat/completions`;
  if (/\/openai$/i.test(trimmed)) return `${trimmed}/v1/chat/completions`;
  if (/\.openai\.azure\.com|\.services\.ai\.azure\.com|cognitiveservices\.azure\.com/i.test(trimmed)) {
    return `${trimmed}/openai/v1/chat/completions`;
  }
  return `${trimmed}/v1/chat/completions`;
}

function resolvePrimaryResponsesUrl() {
  const endpoint =
    process.env.PRIMARY_AI_API_ENDPOINT ||
    process.env.AI_API_ENDPOINT ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.AZURE_AI_ENDPOINT ||
    "";
  if (!endpoint.trim()) return "";
  return `${normalizeResponsesBaseURL(endpoint)}/responses`;
}

function getPrimaryParserApiKey() {
  return process.env.PRIMARY_AI_API_KEY || process.env.AI_API_KEY || process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_AI_API_KEY || "";
}

async function parseWithPrimaryChatParser(input) {
  const apiKey = getPrimaryParserApiKey();
  const endpoint = resolvePrimaryChatUrl();
  const model = process.env.PRIMARY_AI_MODEL || process.env.AI_MODEL || process.env.AZURE_OPENAI_DEPLOYMENT || process.env.AZURE_AI_DEPLOYMENT;
  if (!apiKey || !endpoint || !model) return null;
  if (input.dataUrl && !isImageDataUrl(input.dataUrl)) return null;

  const userContent = input.dataUrl
    ? [
        { type: "text", text: buildBoqPrompt(input) },
        { type: "image_url", image_url: { url: input.dataUrl } },
      ]
    : buildBoqPrompt(input);

  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
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
        {
          role: "system",
          content:
            "You produce procurement-safe JSON for BOQ parsing. Return JSON only.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Primary parser failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  return parseJsonObject(Array.isArray(content) ? content.map((part) => part.text || "").join("\n") : content);
}

function normalizeResponsesBaseURL(endpoint) {
  const trimmed = endpoint.replace(/\/+$/, "");
  if (/\/v1$/i.test(trimmed)) return trimmed;
  if (/\/openai\/v1$/i.test(trimmed)) return trimmed;
  if (/\/openai$/i.test(trimmed)) return `${trimmed}/v1`;
  if (/api\.openai\.com$/i.test(trimmed)) return `${trimmed}/v1`;
  return `${trimmed}/openai/v1`;
}

function buildResponsesInput(input) {
  const content = [{ type: "input_text", text: buildBoqPrompt(input) }];
  if (input.dataUrl && isImageDataUrl(input.dataUrl)) {
    content.push({ type: "input_image", image_url: input.dataUrl });
  } else if (input.dataUrl && isPdfDataUrl(input.dataUrl)) {
    content.push({
      type: "input_file",
      filename: input.fileName || "boq.pdf",
      file_data: input.dataUrl,
    });
  }

  return [{ role: "user", content }];
}

async function parseWithPrimaryResponsesParser(input) {
  const apiKey = getPrimaryParserApiKey();
  const endpoint = resolvePrimaryResponsesUrl();
  const model = process.env.PRIMARY_AI_MODEL || process.env.AI_MODEL || process.env.AZURE_OPENAI_DEPLOYMENT || process.env.AZURE_AI_DEPLOYMENT;
  if (!apiKey || !endpoint || !model || !input.dataUrl) return null;

  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      input: buildResponsesInput(input),
    }),
  });

  if (!response.ok) {
    throw new Error(`Primary document parser failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  return parseJsonObject(payload?.output_text);
}

async function parseWithFallbackResponsesParser(input) {
  const endpoint = process.env.FALLBACK_AI_ENDPOINT?.trim();
  const apiKey = process.env.FALLBACK_AI_API_KEY;
  const deployment = (process.env.FALLBACK_AI_DEPLOYMENT || process.env.FALLBACK_AI_MODEL)?.trim();
  if (!endpoint || !apiKey || !deployment) return null;

  const response = await fetchWithTimeout(`${normalizeResponsesBaseURL(endpoint)}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      model: deployment,
      temperature: 0.1,
      input: buildResponsesInput(input),
    }),
  });

  if (!response.ok) {
    throw new Error(`Fallback parser failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  return parseJsonObject(payload?.output_text);
}

async function parseBoq(input) {
  const fallbackText = input.text || input.fileName || "";
  const preferredProvider = (process.env.AI_PROVIDER || "primary").toLowerCase();
  const primaryAttempts = input.dataUrl
    ? [parseWithPrimaryChatParser, parseWithPrimaryResponsesParser, parseWithFallbackResponsesParser]
    : [parseWithPrimaryChatParser, parseWithFallbackResponsesParser];
  const fallbackAttempts = input.dataUrl
    ? [parseWithFallbackResponsesParser, parseWithPrimaryResponsesParser, parseWithPrimaryChatParser]
    : [parseWithFallbackResponsesParser, parseWithPrimaryChatParser];
  const attempts = preferredProvider === "fallback" ? fallbackAttempts : primaryAttempts;

  const errors = [];
  for (const attempt of attempts) {
    try {
      const result = await attempt(input);
      if (result) {
        return {
          lineItems: normalizeLineItems(result.lineItems, fallbackText),
          notes: Array.isArray(result.notes) ? result.notes.filter((note) => typeof note === "string") : [],
        };
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    lineItems: deterministicParseBoq(fallbackText),
    notes: [],
  };
}

async function handleProductApi(req, res, requestUrl) {
  if (!productMode) {
    sendJson(req, res, 404, {
      ok: false,
      mode,
      message: "Product APIs are disabled in controlled mode.",
    });
    return;
  }

  if (!canAcceptStateChangingRequest(req)) {
    sendJson(req, res, 403, {
      ok: false,
      mode,
      message: "Request origin is not allowed.",
    });
    return;
  }

  if (req.method === "POST" && !hasProductClientHeader(req)) {
    sendJson(req, res, 403, {
      ok: false,
      mode,
      message: "Request client is not allowed.",
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/rfq/parse-boq") {
    assertJsonRequest(req);
    if (!takeRateLimit(`parse:${getClientKey(req)}`, parseRateMax, parseRateWindowMs)) {
      sendJson(req, res, 429, {
        ok: false,
        mode,
        message: "Too many parse requests. Try again shortly.",
      });
      return;
    }

    const body = await readJsonBody(req);
    const parsed = await parseBoq(normalizeParseInput(body));

    sendJson(req, res, 200, {
      ok: true,
      lineItems: parsed.lineItems,
      notes: parsed.notes,
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/rfq/quotes") {
    assertJsonRequest(req);
    await readJsonBody(req, 512 * 1024);
    sendJson(req, res, 410, {
      ok: false,
      message: "Use the RFQ quote endpoint for the selected RFQ.",
    });
    return;
  }

  sendJson(req, res, 404, {
    ok: false,
    message: "Product API route not found.",
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "OPTIONS") {
      sendNoContent(req, res);
      return;
    }

    if (requestUrl.pathname === "/" || requestUrl.pathname === "/health") {
      if (req.method !== "GET" && req.method !== "HEAD") {
        sendJson(req, res, 405, { ok: false, mode, message: "Method not allowed." });
        return;
      }

      sendJson(req, res, 200, {
        ok: true,
        service: serviceName,
        status: "healthy",
      });
      return;
    }

    if (requestUrl.pathname === "/status") {
      if (req.method !== "GET" && req.method !== "HEAD") {
        sendJson(req, res, 405, { ok: false, mode, message: "Method not allowed." });
        return;
      }

      sendJson(req, res, 200, {
        ok: true,
        service: serviceName,
        status: "ready",
      });
      return;
    }

    if (requestUrl.pathname.startsWith("/api/")) {
      await handleProductApi(req, res, requestUrl);
      return;
    }

    sendJson(req, res, 404, {
      ok: false,
      mode,
      message: "Route not found.",
    });
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error && Number(error.statusCode)
        ? Number(error.statusCode)
        : 500;
    if (statusCode >= 500) {
      console.error("Unhandled backend request error:", error instanceof Error ? error.message : "unknown error");
    }
    sendJson(req, res, statusCode, {
      ok: false,
      mode,
      message: statusCode >= 500 ? "Internal server error." : error instanceof Error ? error.message : "Request could not be processed.",
    });
  }
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port} in ${mode} mode`);
});

server.requestTimeout = Number(process.env.REQUEST_TIMEOUT_MS || 30_000);
server.headersTimeout = Number(process.env.HEADERS_TIMEOUT_MS || 10_000);
server.keepAliveTimeout = Number(process.env.KEEP_ALIVE_TIMEOUT_MS || 5_000);
server.maxHeadersCount = Number(process.env.MAX_HEADERS_COUNT || 80);
