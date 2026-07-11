import { findCertificateRecord } from "@/lib/certification-records";
import { buildComplianceSnapshot } from "@/lib/verification-data";
import { normalizeStandardAliases } from "@/lib/standard-aliases";
import {
  buildAgentGapNote,
  buildConfidenceFingerprint,
  buildCurrencyDisplay,
  buildEvidenceBadges,
  buildLastHumanCheckedLine,
  buildLastUpdatedFooter,
  buildSourceCrossReferences,
  buildSpecLine,
  buildUnitDisplay,
  buildViewedSnapshot,
  findInProgressVerifications,
  getExpiryCountdown,
  inferViewerMarketFromHeaders,
} from "@/lib/trust-primitives";
import { NextRequest, NextResponse } from "next/server";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

async function buildLookupResponse(query: string, headers: Headers) {
  const aliasResult = normalizeStandardAliases(query);
  const record = await findCertificateRecord(aliasResult.normalizedText);
  const viewerMarket = inferViewerMarketFromHeaders(headers);

  if (!record) {
    return NextResponse.json({
      found: false,
      query,
      normalizedQuery: aliasResult.normalizedText,
      standardNotes: aliasResult.notes,
      checkedOn: new Date().toISOString().slice(0, 10),
      message:
        "No matching manual verification record was found. Treat this as not verified until ProcureSource records direct evidence.",
      inProgress: findInProgressVerifications(aliasResult.normalizedText),
    }, { headers: jsonHeaders });
  }

  return NextResponse.json({
    found: true,
    query,
    normalizedQuery: aliasResult.normalizedText,
    standardNotes: aliasResult.notes,
    checkedOn: new Date().toISOString().slice(0, 10),
    certificate: record,
    snapshot: buildComplianceSnapshot(record),
    trust: {
      evidenceBadges: buildEvidenceBadges(record),
      fingerprint: buildConfidenceFingerprint(record),
      sourceCrossReferences: buildSourceCrossReferences(record),
      lastHumanChecked: buildLastHumanCheckedLine(record),
      specLine: buildSpecLine(record),
      expiryCountdown: getExpiryCountdown(record),
      currencyDisplay: buildCurrencyDisplay(record, viewerMarket),
      unitDisplay: buildUnitDisplay(record),
      noAgentNote: buildAgentGapNote(record),
      contactCardUrl: `/api/agents/contact-card?certificate=${encodeURIComponent(record.certificateNumber)}`,
      lastUpdatedFooter: buildLastUpdatedFooter(record),
      viewedSnapshot: buildViewedSnapshot(record),
    },
  }, { headers: jsonHeaders });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("certificate") || "";

  if (!query.trim()) {
    return NextResponse.json(
      { error: "Certificate, manufacturer, or model query is required" },
      { status: 400, headers: jsonHeaders },
    );
  }

  return buildLookupResponse(query, request.headers);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const query = String(body.query || body.certificate || "");

  if (!query.trim()) {
    return NextResponse.json(
      { error: "Certificate, manufacturer, or model query is required" },
      { status: 400, headers: jsonHeaders },
    );
  }

  return buildLookupResponse(query, request.headers);
}
