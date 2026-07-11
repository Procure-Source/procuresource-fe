import {
  buildBoqParseResult,
  normalizeBoqParseInput,
  normalizeConfiguredBoqResult,
  parseBoqLocally,
  type BoqParseInput,
  type BoqParseResult,
} from "@/lib/boq";

type ParserConfig = {
  endpoint: string;
  apiKey: string;
  authHeader: string;
  authScheme: string;
  timeoutMs: number;
};

const defaultTimeoutMs = 25000;

export function isConfiguredBoqParserAvailable() {
  return Boolean(getParserConfig());
}

export async function parseBoq(input: BoqParseInput): Promise<BoqParseResult> {
  const normalizedInput = normalizeBoqParseInput(input);
  const localResult = parseBoqLocally(normalizedInput);
  const config = getParserConfig();

  if (!config) {
    return localResult;
  }

  try {
    const configuredResult = await callConfiguredParser(config, normalizedInput);
    return normalizeConfiguredBoqResult(configuredResult, normalizedInput, localResult);
  } catch {
    return buildBoqParseResult(normalizedInput, localResult.lineItems, { notes: localResult.notes });
  }
}

function getParserConfig(): ParserConfig | null {
  if (process.env.BOQ_PARSER_ENABLED === "false") {
    return null;
  }

  const endpoint = (process.env.BOQ_PARSER_ENDPOINT || "").trim();
  if (!endpoint) {
    return null;
  }

  const timeoutMs = Number(process.env.BOQ_PARSER_TIMEOUT_MS || defaultTimeoutMs);
  const authHeader = normalizeHeaderName(process.env.BOQ_PARSER_AUTH_HEADER || "Authorization");

  return {
    endpoint,
    apiKey: (process.env.BOQ_PARSER_API_KEY || "").trim(),
    authHeader,
    authScheme: (process.env.BOQ_PARSER_AUTH_SCHEME || "Bearer").trim(),
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.min(timeoutMs, 60000) : defaultTimeoutMs,
  };
}

async function callConfiguredParser(config: ParserConfig, input: BoqParseInput) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: buildHeaders(config),
      body: JSON.stringify({
        task: "boq.parse",
        input: {
          text: input.text || input.csv || "",
          structured: input.lineItems || input.manualLineItems || input.rows || input.json || null,
          fileName: input.fileName || "",
          mimeType: input.mimeType || "",
          metricSystem: input.metricSystem || "",
          projectName: input.projectName || "",
          packageName: input.packageName || "",
          scope: input.scope || "",
          deliveryLocation: input.deliveryLocation || "",
          currency: input.currency || "",
          responseDeadlineDays: input.responseDeadlineDays || null,
        },
        output: {
          lineItems: [
            {
              description: "string",
              quantity: 1,
              unit: "string",
              specification: "string",
              category: "string",
              confidence: 0,
            },
          ],
          metricSystem: "Metric | Imperial | Mixed | Unspecified",
          notes: ["string"],
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Configured parser request failed.");
    }

    const payload = await response.json();
    return payload?.result || payload;
  } finally {
    clearTimeout(timeout);
  }
}

function buildHeaders(config: ParserConfig) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (config.apiKey) {
    headers[config.authHeader] = config.authScheme
      ? `${config.authScheme} ${config.apiKey}`
      : config.apiKey;
  }

  return headers;
}

function normalizeHeaderName(value: string) {
  const header = value.trim();
  return /^[A-Za-z0-9-]+$/.test(header) ? header : "Authorization";
}
