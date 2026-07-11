export type BoqMetricSystem = "Metric" | "Imperial" | "Mixed" | "Unspecified";

export type BoqInputFormat = "manual" | "json" | "csv" | "text";

export type BoqLineItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  specification: string;
  category: string;
  confidence: number;
  missingFields: string[];
  sourceRow?: number;
  rawText?: string;
};

export type BoqParseInput = {
  text?: string;
  csv?: string;
  json?: unknown;
  rows?: unknown[];
  lineItems?: unknown[];
  manualLineItems?: unknown[];
  fileName?: string;
  mimeType?: string;
  metricSystem?: string;
  projectName?: string;
  projectCode?: string;
  packageName?: string;
  scope?: string;
  deliveryLocation?: string;
  currency?: string;
  responseDeadlineDays?: number;
  buyerCompany?: string;
  notes?: string;
};

export type SuggestedRfqDraftFields = {
  title: string;
  projectName: string;
  projectCode: string;
  packageName: string;
  scopeSummary: string;
  metricSystem: BoqMetricSystem;
  currency: string;
  deliveryLocation: string;
  responseDeadlineDays: number;
  categories: string[];
  lineItemCount: number;
  requiredDocuments: string[];
  supplierResponseFields: string[];
  commercialTerms: string[];
  clarifications: string[];
};

export type BoqParseResult = {
  lineItems: BoqLineItem[];
  metricSystem: BoqMetricSystem;
  missingFields: string[];
  suggestedRfqDraftFields: SuggestedRfqDraftFields;
  notes: string[];
};

type ParsedItem = Omit<BoqLineItem, "id" | "confidence"> & {
  confidence?: number;
};

const maxTextChars = Number(process.env.BOQ_MAX_TEXT_CHARS || 80000);
const maxItems = Number(process.env.BOQ_MAX_LINE_ITEMS || 120);

const objectHeaderAliases = {
  description: [
    "description",
    "item",
    "item description",
    "item_description",
    "material",
    "material description",
    "equipment",
    "product",
    "scope",
    "name",
  ],
  quantity: ["quantity", "qty", "qnty", "count", "no", "nos"],
  unit: ["unit", "uom", "unit of measure", "measure", "u/m"],
  specification: [
    "specification",
    "spec",
    "technical specification",
    "technical_specification",
    "metric spec",
    "metric_spec",
    "remarks",
    "notes",
    "requirement",
    "details",
  ],
  category: ["category", "discipline", "trade", "system"],
};

const quantityUnits = [
  "m3/hr",
  "m3/h",
  "l/s",
  "lps",
  "lpm",
  "sq.m",
  "sqm",
  "m2",
  "m3",
  "nos",
  "pcs",
  "sets",
  "set",
  "lot",
  "lots",
  "each",
  "ea",
  "pair",
  "pairs",
  "roll",
  "rolls",
  "kg",
  "g",
  "kw",
  "kva",
  "tr",
  "gpm",
  "cfm",
  "hp",
  "bar",
  "psi",
  "mm",
  "cm",
  "m",
  "ft",
];

const unitPattern = quantityUnits
  .map((unit) => unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

export function normalizeBoqParseInput(payload: unknown): BoqParseInput {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const source = payload as Record<string, unknown>;
  const nestedBoq = source.boq && typeof source.boq === "object" && !Array.isArray(source.boq)
    ? (source.boq as Record<string, unknown>)
    : {};
  const nestedRfq = source.rfq && typeof source.rfq === "object" && !Array.isArray(source.rfq)
    ? (source.rfq as Record<string, unknown>)
    : {};
  const merged = { ...nestedBoq, ...nestedRfq, ...source };

  return {
    text: sanitizeString(firstString(merged.text, merged.boqText, merged.content, merged.rawText), maxTextChars),
    csv: sanitizeString(firstString(merged.csv, merged.csvText), maxTextChars),
    json: merged.json ?? merged.structured ?? null,
    rows: firstArray(merged.rows, merged.tableRows),
    lineItems: firstArray(merged.lineItems, merged.items, merged.boqItems),
    manualLineItems: firstArray(merged.manualLineItems, merged.manualItems),
    fileName: sanitizeString(firstString(merged.fileName, merged.filename), 180),
    mimeType: sanitizeString(firstString(merged.mimeType, merged.contentType), 120).toLowerCase(),
    metricSystem: sanitizeString(firstString(merged.metricSystem, merged.unitSystem, merged.metric_system), 40),
    projectName: sanitizeString(firstString(merged.projectName, merged.project, merged.project_name), 180),
    projectCode: sanitizeString(firstString(merged.projectCode, merged.project_code), 80),
    packageName: sanitizeString(firstString(merged.packageName, merged.package, merged.package_name, merged.title), 180),
    scope: sanitizeString(firstString(merged.scope, merged.scopeSummary, merged.description), 1200),
    deliveryLocation: sanitizeString(firstString(merged.deliveryLocation, merged.location, merged.delivery_location), 180),
    currency: normalizeCurrency(firstString(merged.currency, merged.quoteCurrency, merged.currencyCode)),
    responseDeadlineDays: normalizePositiveInteger(merged.responseDeadlineDays ?? merged.response_deadline_days),
    buyerCompany: sanitizeString(firstString(merged.buyerCompany, merged.companyName, merged.buyer_company), 180),
    notes: sanitizeString(firstString(merged.notes, merged.instructions), 1200),
  };
}

export function parseBoqLocally(input: BoqParseInput): BoqParseResult {
  const normalizedInput = normalizeBoqParseInput(input);
  const { lineItems } = extractLineItems(normalizedInput);

  return buildBoqParseResult(normalizedInput, lineItems);
}

export function normalizeConfiguredBoqResult(
  value: unknown,
  input: BoqParseInput,
  fallback: BoqParseResult,
): BoqParseResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const payload = value as Record<string, unknown>;
  const configuredInput = normalizeBoqParseInput({
    ...input,
    lineItems: firstArray(payload.lineItems, payload.items, payload.rows),
    metricSystem: firstString(payload.metricSystem, payload.unitSystem) || input.metricSystem,
  });
  const { lineItems } = extractLineItems(configuredInput);

  if (lineItems.length === 0) {
    return fallback;
  }

  const notes = normalizeStringArray(payload.notes, 6);

  return buildBoqParseResult(configuredInput, lineItems, { notes });
}

export function buildBoqParseResult(
  input: BoqParseInput,
  lineItems: BoqLineItem[],
  options: {
    notes?: string[];
  } = {},
): BoqParseResult {
  const metricSystem = detectMetricSystem(input, lineItems);
  const missingFields = buildMissingFields(input, lineItems, metricSystem);
  const suggestedRfqDraftFields = buildSuggestedRfqDraftFields(input, lineItems, metricSystem, missingFields);
  const notes = buildNotes(input, lineItems, metricSystem, options.notes || []);

  return {
    lineItems,
    metricSystem,
    missingFields,
    suggestedRfqDraftFields,
    notes,
  };
}

function extractLineItems(input: BoqParseInput): { lineItems: BoqLineItem[]; inputFormat: BoqInputFormat } {
  const manualRows = input.lineItems || input.manualLineItems || input.rows;
  if (manualRows && manualRows.length > 0) {
    return {
      lineItems: assignIds(parseRows(manualRows, "manual")),
      inputFormat: "manual",
    };
  }

  const jsonRows = rowsFromJson(input.json);
  if (jsonRows.length > 0) {
    return {
      lineItems: assignIds(parseRows(jsonRows, "json")),
      inputFormat: "json",
    };
  }

  const csvText = input.csv || (looksLikeCsv(input.text || "") ? input.text || "" : "");
  if (csvText) {
    const rows = parseDelimitedText(csvText);
    return {
      lineItems: assignIds(parseRows(rows, "csv")),
      inputFormat: "csv",
    };
  }

  if (input.text) {
    return {
      lineItems: assignIds(parseTextLines(input.text)),
      inputFormat: "text",
    };
  }

  return { lineItems: [], inputFormat: "manual" };
}

function parseRows(rows: unknown[], inputFormat: BoqInputFormat): ParsedItem[] {
  const normalizedRows = rows.slice(0, maxItems + 1);
  const tableRows = normalizedRows.map((row) => Array.isArray(row) ? row.map(cellToString) : null);
  const firstTableRow = tableRows.find((row): row is string[] => Boolean(row));
  const headerRow = firstTableRow && looksLikeHeader(firstTableRow) ? firstTableRow : null;
  const headerMap = headerRow ? buildHeaderMap(headerRow) : {};

  return normalizedRows
    .map((row, index) => {
      if (Array.isArray(row)) {
        if (headerRow && index === tableRows.findIndex((candidate) => candidate === headerRow)) {
          return null;
        }
        return parseArrayRow(row.map(cellToString), index + 1, headerMap, Boolean(headerRow));
      }

      if (row && typeof row === "object") {
        return parseObjectRow(row as Record<string, unknown>, index + 1);
      }

      if (typeof row === "string") {
        return parseTextLine(row, index + 1);
      }

      return null;
    })
    .filter((item): item is ParsedItem => Boolean(item))
    .filter((item) => hasMeaningfulItemData(item, inputFormat))
    .slice(0, maxItems);
}

function parseObjectRow(row: Record<string, unknown>, sourceRow: number): ParsedItem | null {
  const description = firstMappedString(row, objectHeaderAliases.description);
  const quantityValue = firstMappedValue(row, objectHeaderAliases.quantity);
  const unit = normalizeUnit(firstMappedString(row, objectHeaderAliases.unit));
  const specification = firstMappedString(row, objectHeaderAliases.specification);
  const category = firstMappedString(row, objectHeaderAliases.category);
  const quantity = normalizeQuantity(quantityValue);
  const fallbackText = [description, specification].filter(Boolean).join(" - ");

  if (!fallbackText && quantity === null && !unit) {
    return null;
  }

  return buildParsedItem({
    description: description || specification || fallbackText,
    quantity,
    unit,
    specification,
    category,
    rawText: fallbackText,
    sourceRow,
    confidenceBase: 88,
  });
}

function parseArrayRow(
  cells: string[],
  sourceRow: number,
  headerMap: Record<string, number>,
  headerAlreadyHandled = false,
): ParsedItem | null {
  const nonEmptyCells = cells.map((cell) => cell.trim()).filter(Boolean);
  if (nonEmptyCells.length === 0 || (!headerAlreadyHandled && looksLikeHeader(cells))) {
    return null;
  }

  if (Object.keys(headerMap).length > 0) {
    const description = getMappedCell(cells, headerMap.description);
    const quantityCell = getMappedCell(cells, headerMap.quantity);
    const unit = normalizeUnit(getMappedCell(cells, headerMap.unit));
    const specification = getMappedCell(cells, headerMap.specification);
    const category = getMappedCell(cells, headerMap.category);

    return buildParsedItem({
      description: description || specification,
      quantity: normalizeQuantity(quantityCell),
      unit,
      specification,
      category,
      rawText: nonEmptyCells.join(" | "),
      sourceRow,
      confidenceBase: 86,
    });
  }

  const withoutSerial = removeSerialCell(nonEmptyCells);
  const quantityIndex = withoutSerial.findIndex((cell) => normalizeQuantity(cell) !== null);
  const unitIndex = withoutSerial.findIndex((cell, index) => index !== quantityIndex && Boolean(extractKnownUnit(cell)));
  const descriptionIndex = withoutSerial.findIndex((_, index) => index !== quantityIndex && index !== unitIndex);
  const description = descriptionIndex >= 0 ? withoutSerial[descriptionIndex] : "";
  const quantity = quantityIndex >= 0 ? normalizeQuantity(withoutSerial[quantityIndex]) : null;
  const unit = unitIndex >= 0
    ? extractKnownUnit(withoutSerial[unitIndex])
    : quantityIndex >= 0
      ? extractKnownUnit(withoutSerial[quantityIndex])
      : "";
  const specification = withoutSerial
    .filter((_, index) => index !== descriptionIndex && index !== quantityIndex && index !== unitIndex)
    .join(" - ");

  return buildParsedItem({
    description,
    quantity,
    unit,
    specification,
    rawText: nonEmptyCells.join(" | "),
    sourceRow,
    confidenceBase: 78,
  });
}

function parseTextLines(text: string): ParsedItem[] {
  return text
    .split(/\r?\n/)
    .map((line, index) => parseTextLine(line, index + 1))
    .filter((item): item is ParsedItem => Boolean(item))
    .slice(0, maxItems);
}

function parseTextLine(rawLine: string, sourceRow: number): ParsedItem | null {
  const line = cleanLine(rawLine);
  if (!line || shouldSkipTextLine(line)) {
    return null;
  }

  if (looksLikeCsv(line)) {
    const parsed = parseDelimitedText(line);
    if (parsed.length > 0) {
      return parseArrayRow(parsed[0], sourceRow, {});
    }
  }

  const quantityMatch = line.match(new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*(${unitPattern})\\b`, "i"));
  const quantity = quantityMatch ? normalizeQuantity(quantityMatch[1]) : null;
  const unit = quantityMatch ? normalizeUnit(quantityMatch[2]) : "";
  const lineWithoutSerial = line.replace(/^\s*(?:\d+|[A-Z])[\).\-\s]+/, "").trim();
  const lineWithoutQuantity = quantityMatch
    ? lineWithoutSerial.replace(quantityMatch[0], "").replace(/\s{2,}/g, " ").trim()
    : lineWithoutSerial;
  const sections = lineWithoutQuantity
    .split(/\s+\|\s+|\s+-\s+|\t+/)
    .map((section) => section.trim())
    .filter(Boolean);
  const description = sections[0] || lineWithoutQuantity;
  const specification = sections.length > 1 ? sections.slice(1).join("; ") : lineWithoutSerial;

  return buildParsedItem({
    description,
    quantity,
    unit,
    specification,
    rawText: rawLine.trim(),
    sourceRow,
    confidenceBase: 72,
  });
}

function buildParsedItem(args: {
  description: string;
  quantity: number | null;
  unit: string;
  specification: string;
  category?: string;
  rawText?: string;
  sourceRow?: number;
  confidenceBase: number;
}): ParsedItem | null {
  const description = cleanValue(args.description);
  const specification = cleanValue(args.specification);
  const unit = normalizeUnit(args.unit);
  const quantity = args.quantity && args.quantity > 0 ? args.quantity : 1;
  const missingFields: string[] = [];

  if (!description) missingFields.push("description");
  if (!args.quantity || args.quantity <= 0) missingFields.push("quantity");
  if (!unit) missingFields.push("unit");
  if (!specification || specification === description) missingFields.push("specification");

  const bestDescription = description || specification;
  if (!bestDescription) {
    return null;
  }

  const bestSpecification = specification || bestDescription;
  const category = cleanValue(args.category) || detectCategory(`${bestDescription} ${bestSpecification}`);
  const confidence = Math.max(35, Math.min(96, args.confidenceBase - missingFields.length * 8));

  return {
    description: bestDescription,
    quantity,
    unit: unit || "lot",
    specification: bestSpecification,
    category,
    confidence,
    missingFields,
    rawText: args.rawText,
    sourceRow: args.sourceRow,
  };
}

function assignIds(items: ParsedItem[]): BoqLineItem[] {
  return items.map((item, index) => ({
    id: `boq-${String(index + 1).padStart(3, "0")}`,
    confidence: normalizeConfidence(item.confidence),
    ...item,
  }));
}

function buildMissingFields(input: BoqParseInput, lineItems: BoqLineItem[], metricSystem: BoqMetricSystem) {
  const missing = new Set<string>();

  if (lineItems.length === 0) missing.add("lineItems");
  if (!input.projectName) missing.add("projectName");
  if (!input.deliveryLocation) missing.add("deliveryLocation");
  if (!input.packageName && !input.scope) missing.add("packageName");
  if (!input.responseDeadlineDays) missing.add("responseDeadlineDays");
  if (metricSystem === "Unspecified" || metricSystem === "Mixed") missing.add("metricSystem");

  for (const item of lineItems) {
    for (const field of item.missingFields) {
      missing.add(`lineItems.${field}`);
    }
  }

  return Array.from(missing);
}

function buildSuggestedRfqDraftFields(
  input: BoqParseInput,
  lineItems: BoqLineItem[],
  metricSystem: BoqMetricSystem,
  missingFields: string[],
): SuggestedRfqDraftFields {
  const categories = Array.from(new Set(lineItems.map((item) => item.category).filter(Boolean)));
  const packageName = input.packageName || inferPackageName(categories);
  const projectName = input.projectName || "";
  const titleParts = [projectName, packageName].filter(Boolean);
  const title = titleParts.length > 0 ? `${titleParts.join(" - ")} RFQ` : "BOQ RFQ draft";
  const scopeSummary = buildScopeSummary(input.scope, lineItems, categories);
  const responseDeadlineDays = input.responseDeadlineDays || 7;

  return {
    title,
    projectName,
    projectCode: input.projectCode || "",
    packageName,
    scopeSummary,
    metricSystem,
    currency: input.currency || "AED",
    deliveryLocation: input.deliveryLocation || "",
    responseDeadlineDays,
    categories,
    lineItemCount: lineItems.length,
    requiredDocuments: buildRequiredDocuments(categories),
    supplierResponseFields: [
      "Unit price",
      "Total price",
      "Lead time",
      "Country of origin",
      "Technical compliance",
      "Exceptions or deviations",
      "Certificate evidence",
      "Warranty",
    ],
    commercialTerms: [
      "Confirm quotation validity.",
      "Confirm delivery basis and delivery location.",
      "Quote each BOQ line item separately.",
      "State exclusions and optional items clearly.",
    ],
    clarifications: missingFields.map(formatMissingField),
  };
}

function buildNotes(
  input: BoqParseInput,
  lineItems: BoqLineItem[],
  metricSystem: BoqMetricSystem,
  existingNotes: string[],
) {
  const notes = new Set(existingNotes.map(cleanValue).filter(Boolean));

  if (lineItems.length === 0) {
    notes.add("No BOQ line items were found. Add rows or text before issuing the RFQ.");
  }

  if (metricSystem === "Mixed") {
    notes.add("Mixed unit signals were found. Confirm one quote basis before sharing the RFQ.");
  }

  if (metricSystem === "Unspecified") {
    notes.add("Metric system was not clear from the BOQ data.");
  }

  if (input.notes) {
    notes.add(input.notes);
  }

  return Array.from(notes).slice(0, 8);
}

function detectMetricSystem(input: BoqParseInput, lineItems: BoqLineItem[]): BoqMetricSystem {
  const explicit = normalizeMetricSystemName(input.metricSystem);
  if (explicit) {
    return explicit;
  }

  const combinedText = [
    input.text,
    input.csv,
    input.scope,
    ...lineItems.flatMap((item) => [item.unit, item.description, item.specification]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hasMetric = /\b(mm|cm|meter|metre|kg|l\/s|lps|lpm|m3\/h|m3\/hr|kw|kva|bar|celsius)\b/.test(combinedText) ||
    /\b\d+(?:\.\d+)?\s*m\b/.test(combinedText);
  const hasImperial = /\b(gpm|cfm|psi|btu|mbh|inch|inches|feet|foot|ft|lb|lbs|fahrenheit)\b/.test(combinedText);

  if (hasMetric && hasImperial) return "Mixed";
  if (hasMetric) return "Metric";
  if (hasImperial) return "Imperial";
  return "Unspecified";
}

function normalizeMetricSystemName(value?: string): BoqMetricSystem | null {
  const normalized = cleanValue(value).toLowerCase();
  if (!normalized) return null;
  if (normalized === "metric" || normalized === "si") return "Metric";
  if (normalized === "imperial" || normalized === "ip" || normalized === "us customary") return "Imperial";
  if (normalized === "mixed") return "Mixed";
  if (normalized === "unspecified" || normalized === "unknown") return "Unspecified";
  return null;
}

function rowsFromJson(value: unknown): unknown[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return rowsFromJson(parsed);
    } catch {
      return [];
    }
  }
  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    return firstArray(objectValue.lineItems, objectValue.items, objectValue.rows, objectValue.boqItems) || [];
  }
  return [];
}

function parseDelimitedText(text: string): string[][] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !shouldSkipTextLine(line));
  const delimiter = detectDelimiter(lines);

  return lines.map((line) => parseDelimitedLine(line, delimiter));
}

function parseDelimitedLine(line: string, delimiter: string): string[] {
  if (delimiter === "\t" || delimiter === "|") {
    return line.split(delimiter).map(cleanValue);
  }

  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      cells.push(cleanValue(current));
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(cleanValue(current));
  return cells;
}

function detectDelimiter(lines: string[]) {
  const linePreview = lines.slice(0, 5).join("\n");
  const candidates = ["\t", "|", ",", ";"];
  let best = ",";
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = (linePreview.match(new RegExp(candidate === "|" ? "\\|" : candidate, "g")) || []).length;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}

function looksLikeCsv(text: string) {
  const firstLines = text.split(/\r?\n/).filter(Boolean).slice(0, 4);
  if (firstLines.length === 0) return false;
  return firstLines.some((line) => {
    const commaCount = (line.match(/,/g) || []).length;
    const pipeCount = (line.match(/\|/g) || []).length;
    const tabCount = (line.match(/\t/g) || []).length;
    return commaCount >= 2 || pipeCount >= 2 || tabCount >= 2;
  });
}

function looksLikeHeader(cells: string[]) {
  const normalized = cells.map((cell) => normalizeHeader(cell));
  const knownHeaders = Object.values(objectHeaderAliases).flat().map(normalizeHeader);
  const matchCount = normalized.filter((cell) => knownHeaders.includes(cell)).length;
  return matchCount >= 2 || /description|quantity|qty|unit|specification|uom/i.test(cells.join(" "));
}

function buildHeaderMap(headers: string[]) {
  const map: Record<string, number> = {};
  const normalizedHeaders = headers.map(normalizeHeader);

  for (const [field, aliases] of Object.entries(objectHeaderAliases)) {
    for (const alias of aliases) {
      const index = normalizedHeaders.findIndex((header) => header === normalizeHeader(alias));
      if (index >= 0) {
        map[field] = index;
        break;
      }
    }
  }

  return map;
}

function getMappedCell(cells: string[], index?: number) {
  if (index === undefined || index < 0 || index >= cells.length) return "";
  return cleanValue(cells[index]);
}

function removeSerialCell(cells: string[]) {
  if (cells.length <= 1) return cells;
  const first = cells[0].trim();
  if (/^(?:\d+|[A-Z])[\).\-\s]*$/i.test(first) || /^item\s*\d+$/i.test(first)) {
    return cells.slice(1);
  }
  return cells;
}

function normalizeHeader(value: string) {
  return cleanValue(value).toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function firstMappedString(row: Record<string, unknown>, aliases: string[]) {
  const value = firstMappedValue(row, aliases);
  return sanitizeString(value, 1200);
}

function firstMappedValue(row: Record<string, unknown>, aliases: string[]) {
  const entries = Object.entries(row).map(([key, value]) => ({
    key: normalizeHeader(key),
    value,
  }));

  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const match = entries.find((entry) => entry.key === normalizedAlias);
    if (match) {
      return match.value;
    }
  }

  return undefined;
}


function normalizeQuantity(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  const text = sanitizeString(value, 80);
  if (!text) return null;

  const match = text.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const quantity = Number(match[0]);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : null;
}

function normalizeUnit(value: unknown) {
  const raw = sanitizeString(value, 80).toLowerCase().replace(/\.$/, "");
  if (!raw) return "";
  if (/^(no|nos|number|numbers|each|ea|pc|pcs|piece|pieces)$/i.test(raw)) return "nos";
  if (/^(set|sets)$/i.test(raw)) return "set";
  if (/^(lot|lots)$/i.test(raw)) return "lot";
  if (/^(meter|metre|meters|metres)$/i.test(raw)) return "m";
  if (/^(sq\.?\s*m|sqm|m2)$/i.test(raw)) return "m2";
  if (/^(cu\.?\s*m|m3)$/i.test(raw)) return "m3";
  return raw;
}

function extractKnownUnit(value: unknown) {
  const raw = sanitizeString(value, 80).toLowerCase();
  if (!raw) return "";

  const exact = raw.match(new RegExp(`^(${unitPattern})$`, "i"));
  if (exact) return normalizeUnit(exact[1]);

  const quantityUnit = raw.match(new RegExp(`\\b\\d+(?:\\.\\d+)?\\s*(${unitPattern})\\b`, "i"));
  return quantityUnit ? normalizeUnit(quantityUnit[1]) : "";
}

function normalizeConfidence(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 72;
  const percent = numeric > 0 && numeric <= 1 ? numeric * 100 : numeric;
  return Math.round(Math.max(0, Math.min(100, percent)));
}

function normalizeCurrency(value: unknown) {
  const currency = sanitizeString(value, 12).toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : "";
}

function normalizePositiveInteger(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return undefined;
  return Math.round(Math.min(number, 180));
}

function cleanLine(value: string) {
  return value.replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
}

function shouldSkipTextLine(line: string) {
  const normalized = line.toLowerCase();
  if (normalized.length < 3) return true;
  if (/^(total|subtotal|grand total|amount|page \d+|bill of quantities|boq)$/i.test(normalized)) return true;
  if (/^[-_=]+$/.test(normalized)) return true;
  return false;
}

function hasMeaningfulItemData(item: ParsedItem, inputFormat: BoqInputFormat) {
  if (!item.description || item.description.length < 2) return false;
  if (inputFormat === "text" && item.description.split(/\s+/).length < 2 && item.specification.length < 8) {
    return false;
  }
  return true;
}

function detectCategory(text: string) {
  const normalized = text.toLowerCase();
  if (/chiller|ahu|fcu|fan coil|cooling|hvac|refrigerant|condenser|diffuser|duct|package unit/.test(normalized)) {
    return "HVAC";
  }
  if (/pump|booster|flow|head|pressurization|pressurisation/.test(normalized)) return "Pumps";
  if (/switchgear|switchboard|panel|mccb|mdb|smdb|db\b|cable|tray|busbar|transformer|ups|voltage|iec/.test(normalized)) {
    return "Electrical";
  }
  if (/valve|pipe|fitting|flange|water heater|drainage|sanitary/.test(normalized)) return "Plumbing";
  if (/fire|sprinkler|hydrant|hose reel|fm200|suppression|alarm/.test(normalized)) return "Fire Fighting";
  if (/bms|control|sensor|thermostat|actuator/.test(normalized)) return "Controls";
  return "MEP";
}

function inferPackageName(categories: string[]) {
  if (categories.length === 1) return `${categories[0]} package`;
  if (categories.length > 1) return "MEP package";
  return "";
}

function buildScopeSummary(scope: string | undefined, lineItems: BoqLineItem[], categories: string[]) {
  if (scope) return scope;
  if (lineItems.length === 0) return "Add BOQ line items before issuing the RFQ.";

  const categoryText = categories.length > 0 ? ` covering ${categories.join(", ")}` : "";
  return `Quote ${lineItems.length} BOQ line item${lineItems.length === 1 ? "" : "s"}${categoryText}.`;
}

function buildRequiredDocuments(categories: string[]) {
  const documents = new Set([
    "Commercial offer",
    "Technical datasheet",
    "Compliance statement",
    "Delivery schedule",
  ]);

  if (categories.some((category) => ["HVAC", "Pumps", "Electrical", "Fire Fighting"].includes(category))) {
    documents.add("Applicable certificate evidence");
  }

  if (categories.includes("Electrical")) {
    documents.add("Type test or compliance report where applicable");
  }

  if (categories.includes("Fire Fighting")) {
    documents.add("Authority approval evidence where applicable");
  }

  return Array.from(documents);
}

function formatMissingField(field: string) {
  const labels: Record<string, string> = {
    lineItems: "Add at least one BOQ line item.",
    projectName: "Add the project name.",
    deliveryLocation: "Add the delivery location.",
    packageName: "Add the RFQ package name or scope.",
    responseDeadlineDays: "Add the supplier response deadline.",
    metricSystem: "Confirm Metric or Imperial as the quote basis.",
    "lineItems.description": "Review BOQ rows with missing descriptions.",
    "lineItems.quantity": "Review BOQ rows with missing quantities.",
    "lineItems.unit": "Review BOQ rows with missing units.",
    "lineItems.specification": "Review BOQ rows with missing technical specifications.",
  };

  return labels[field] || `Review ${field}.`;
}

function firstArray(...values: unknown[]): unknown[] | undefined {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return undefined;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function cellToString(value: unknown) {
  return sanitizeString(value, 1200);
}

function sanitizeString(value: unknown, maxLength: number) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function cleanValue(value: unknown) {
  return sanitizeString(value, 1200).replace(/\s+/g, " ").trim();
}

function normalizeStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, limit);
}
