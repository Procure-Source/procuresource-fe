export type StandardAliasResult = {
  normalizedText: string;
  notes: string[];
};

export function normalizeStandardAliases(input: string): StandardAliasResult {
  const notes: string[] = [];
  let normalizedText = input;

  const ariStandardPattern = /\bARI\s*(?:standard\s*)?550(?:\/590)?\b/gi;
  const ariConditionsPattern = /\bARI\s+conditions\b/gi;

  if (ariStandardPattern.test(input) || ariConditionsPattern.test(input)) {
    notes.push("Older ARI wording detected; searching and matching with current AHRI 550/590 naming.");
    normalizedText = normalizedText
      .replace(ariStandardPattern, "AHRI 550/590")
      .replace(ariConditionsPattern, "AHRI conditions");
  }

  return {
    normalizedText,
    notes,
  };
}

export function normalizeModelSearchText(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function buildModelSearchTokens(input: string) {
  const normalized = input.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const compact = normalizeModelSearchText(input);
  const spacedTokens = normalized.split(/\s+/).filter(Boolean);
  const compactTokens = compact.match(/\d+[a-z]+|[a-z]+\d+[a-z]*|[a-z]+|\d+/g) || [];

  return Array.from(new Set([...spacedTokens, ...compactTokens])).filter((token) => token.length > 1);
}
