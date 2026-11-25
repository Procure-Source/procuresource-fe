import {
  cleanSource,
  onboardingFields,
  onboardingValidators,
} from "@/lib/onboarding";

/* Server side of the supplier form: validate, then append a row to the Google
   Sheet through its Apps Script web app (see docs/onboarding-sheet.gs). */

const SHEET_URL = process.env.ONBOARDING_SHEET_URL;
const SHEET_SECRET = process.env.ONBOARDING_SHEET_SECRET;

/* Best-effort per-IP limit. Memory is per serverless instance, so this slows
   floods rather than stopping them. The cap is generous because an expo venue
   shares one IP across many phones. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const fail = (error: string, status: number) =>
  Response.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  if (!SHEET_URL || !SHEET_SECRET) {
    console.error("[onboarding] ONBOARDING_SHEET_URL / _SECRET not set");
    return fail("not configured", 500);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (limited(ip)) return fail("too many requests", 429);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("invalid json", 400);
  }

  /* Honeypot: pretend success, store nothing. */
  if (typeof body.website === "string" && body.website) {
    return Response.json({ ok: true });
  }

  const row: Record<string, string> = {};
  for (const { name } of onboardingFields) {
    const raw = body[name];
    const value = typeof raw === "string" ? raw.trim().slice(0, 2000) : "";
    if (onboardingValidators[name](value)) return fail(`invalid ${name}`, 400);
    row[name] = value;
  }

  try {
    const response = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        secret: SHEET_SECRET,
        type: "supplier",
        source: cleanSource(typeof body.source === "string" ? body.source : null),
        created_at: new Date().toISOString(),
        ...row,
      }),
      redirect: "follow",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) {
      console.error("[onboarding] sheet rejected", response.status, result);
      return fail("storage failed", 502);
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[onboarding] sheet request failed", error);
    return fail("storage failed", 502);
  }
}
