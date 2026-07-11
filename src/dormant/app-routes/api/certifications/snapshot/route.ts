import { findCertificateRecord } from "@/lib/certification-records";
import { buildArabicSummary, buildWhatsAppWorkflow } from "@/lib/gcc-workflows";
import { statusLabel } from "@/lib/verification-data";
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
  getExpiryCountdown,
  inferViewerMarketFromHeaders,
  type ViewerMarket,
} from "@/lib/trust-primitives";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function pdfEscape(value: string | number | undefined | null) {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfText(value: string, maxLength = 92) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function buildPdf(record: NonNullable<Awaited<ReturnType<typeof findCertificateRecord>>>, viewerMarket?: ViewerMarket) {
  const generatedOn = new Date().toISOString().slice(0, 10);
  const status = statusLabel(record.status);
  const agentStatus = statusLabel(record.agentAuthorization.authorizationStatus);
  const leadDelta = record.leadTime.observedAvgWeeks - record.leadTime.claimedWeeks;
  const fingerprint = buildConfidenceFingerprint(record)
    .map((item) => `${item.label}: ${item.value}`)
    .join(" | ");
  const evidenceBadges = buildEvidenceBadges(record)
    .map((item) => `${item.label}: ${item.value}`)
    .join(" | ");
  const currencyDisplay = buildCurrencyDisplay(record, viewerMarket);
  const noAgentNote = buildAgentGapNote(record);
  const rows = [
    `ProcureSource Compliance Snapshot`,
    `${record.manufacturer} ${record.model}`,
    `Generated: ${generatedOn}`,
    `Status: ${status}`,
    `Certificate: ${record.certificateNumber}`,
    `Standard: ${record.standard}`,
    `Authority: ${record.authority}`,
    `Verified on: ${record.verifiedOn || "Not verified"}`,
    `Expiry: ${getExpiryCountdown(record)}`,
    `Next review: ${record.nextReviewOn || "Not scheduled"}`,
    `Last human checked: ${buildLastHumanCheckedLine(record)}`,
    `Spec line: ${buildSpecLine(record)}`,
    `Unit display: ${buildUnitDisplay(record)}`,
    `Price estimate: ${currencyDisplay.primary}${currencyDisplay.secondary ? ` (${currencyDisplay.secondary})` : ""}`,
    `Evidence badges: ${evidenceBadges}`,
    `Confidence fingerprint: ${fingerprint}`,
    `Also verified by: ${buildSourceCrossReferences(record)
      .map((source) => `${source.label} on ${source.checkedOn}`)
      .join(" | ")}`,
    record.mismatchNote ? `Mismatch alert: ${record.mismatchNote}` : "",
    ...(record.corrections || []).map(
      (correction) =>
        `Manual correction: ${correction.originalClaim}; ${correction.correctedTo} after verification on ${correction.date}.`
    ),
    `Agent: ${record.agentAuthorization.agentName} (${agentStatus}, ${record.agentAuthorization.region})`,
    noAgentNote ? `Agent gap: ${noAgentNote}` : "",
    `Ask-the-agent response score: ${record.agentAuthorization.avgResponseHours} hours average from ${record.agentAuthorization.responseSampleSize} request(s)`,
    record.leadTime.sampleSize > 0
      ? `Lead time reality check: claimed ${record.leadTime.claimedWeeks} weeks | observed ${record.leadTime.observedAvgWeeks} weeks (${leadDelta >= 0 ? "+" : ""}${leadDelta} weeks) from ${record.leadTime.sampleSize} project report(s)`
      : `Lead time reality check: claimed ${record.leadTime.claimedWeeks} weeks | not enough observed project data yet`,
    `Similar-project signal: shortlisted for ${record.projectSignal.shortlistedCount} ${record.projectSignal.region} project(s) ${record.projectSignal.period}`,
    `Region-aware flags: ${record.regionFlags.join(" ") || "No extra regional flags recorded."}`,
    `BIM resources: ${record.bimResources.map((resource) => `${resource.name} (${statusLabel(resource.status)})`).join("; ")}`,
    `Spare parts: ${record.spareParts.authorizedSupplier}; common parts: ${record.spareParts.commonParts.join(", ")}`,
    `Sustainability / ESG: ${record.sustainability.leedCredits.length > 0 ? record.sustainability.leedCredits.join(", ") : "No claim until evidence is attached"}`,
    `Compliance clause: ${record.contractClause}`,
    `Evidence retention: ${record.disputeDocumentation.retentionPolicy}`,
    buildLastUpdatedFooter(record),
  ].filter(Boolean);

  const textCommands: string[] = [];
  let y = 770;

  const writeLine = (text: string, size = 10, font = "F1") => {
    if (y < 58) {
      return;
    }
    textCommands.push(`/${font} ${size} Tf 44 ${y} Td (${pdfEscape(text)}) Tj`);
    y -= size + 7;
  };

  textCommands.push("BT");
  writeLine("ProcureSource", 12, "F2");
  y -= 8;
  for (const [index, row] of rows.entries()) {
    const isTitle = index < 2;
    for (const line of wrapPdfText(row, isTitle ? 64 : 96)) {
      writeLine(line, isTitle ? (index === 0 ? 18 : 15) : 9.5, isTitle ? "F2" : "F1");
    }
    y -= index < 2 ? 6 : 2;
  }

  y -= 6;
  writeLine("Requirement confidence", 12, "F2");
  for (const requirement of record.requirements.slice(0, 5)) {
    for (const line of wrapPdfText(`${requirement.confidence}% ${requirement.status}: ${requirement.requirement} - ${requirement.evidence}`, 96)) {
      writeLine(line, 9);
    }
  }
  textCommands.push("ET");

  const stream = textCommands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "ascii");
}

function buildHtml(record: Awaited<ReturnType<typeof findCertificateRecord>>, viewerMarket?: ViewerMarket) {
  if (!record) {
    return "";
  }

  const generatedOn = new Date().toISOString().slice(0, 10);
  const status = statusLabel(record.status);
  const agentStatus = statusLabel(record.agentAuthorization.authorizationStatus);
  const arabicSummary = buildArabicSummary(record);
  const whatsappSnapshot = buildWhatsAppWorkflow(record, "snapshot");
  const whatsappIntro = buildWhatsAppWorkflow(record, "introduction");
  const fingerprint = buildConfidenceFingerprint(record);
  const evidenceBadges = buildEvidenceBadges(record);
  const sourceCrossReferences = buildSourceCrossReferences(record);
  const currencyDisplay = buildCurrencyDisplay(record, viewerMarket);
  const noAgentNote = buildAgentGapNote(record);
  const lastUpdatedFooter = buildLastUpdatedFooter(record);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(record.manufacturer)} Compliance Snapshot</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #e9eef5;
      color: #111827;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }
    .sheet {
      width: min(100%, 920px);
      margin: 0 auto;
      background: #fff;
      min-height: 100vh;
      padding: 40px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 1px solid #d8e0ea;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { width: 40px; height: 40px; }
    .brand strong, h1, h2, h3 { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; letter-spacing: 0; }
    h1 { margin: 0; font-size: 34px; line-height: 1.05; }
    h2 { margin: 0 0 14px; font-size: 20px; }
    h3 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; color: #526071; }
    p { margin: 0; line-height: 1.55; }
    .muted { color: #667085; }
    .badge {
      display: inline-flex;
      border-radius: 999px;
      padding: 8px 12px;
      background: #e7f3ff;
      color: #0057b8;
      font-weight: 700;
      font-size: 13px;
    }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .signals { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
    .signal {
      border: 1px solid #d8e0ea;
      border-radius: 12px;
      padding: 12px;
      background: #fff;
    }
    .card {
      border: 1px solid #d8e0ea;
      border-radius: 16px;
      padding: 18px;
      background: #fbfdff;
      break-inside: avoid;
    }
    .full { grid-column: 1 / -1; }
    .kv { display: grid; grid-template-columns: 160px 1fr; gap: 10px; margin-top: 10px; font-size: 14px; }
    .kv span:first-child { color: #667085; font-weight: 700; }
    .warn { border-color: #fecaca; background: #fff7f7; color: #991b1b; }
    .arabic { direction: rtl; text-align: right; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
    .button {
      display: inline-flex;
      min-height: 42px;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: #0066cc;
      color: #fff;
      padding: 0 18px;
      text-decoration: none;
      font-weight: 700;
    }
    .button.secondary { background: #f1f5f9; color: #111827; }
    @media print {
      body { background: #fff; }
      .sheet { width: 100%; padding: 22mm; }
      .actions { display: none; }
      .card { border-radius: 0; }
      .header { break-inside: avoid; }
    }
    @media (max-width: 720px) {
      .sheet { padding: 24px; }
      .header, .grid, .signals { grid-template-columns: 1fr; display: grid; }
      h1 { font-size: 28px; }
      .kv { grid-template-columns: 1fr; gap: 2px; }
    }
  </style>
</head>
<body>
  <main class="sheet">
    <header class="header">
      <div class="brand">
        <img src="/procuresource-logo-mark.svg" alt="ProcureSource" />
        <div>
          <strong>ProcureSource</strong>
          <p class="muted">Built from Dubai to the world / Grow Technology Services FZ LLC</p>
        </div>
      </div>
      <span class="badge">${escapeHtml(status)}</span>
    </header>

    <section style="margin-bottom: 28px;">
      <p class="muted">Compliance Snapshot - generated ${escapeHtml(generatedOn)}</p>
      <h1>${escapeHtml(record.manufacturer)} ${escapeHtml(record.model)}</h1>
      <p class="muted">A bilingual evidence packet for certificate status, agent authorization, lead-time reality, sustainability notes, and dispute documentation.</p>
    </section>

    <section class="grid">
      <article class="card">
        <h2>English Evidence</h2>
        <div class="kv"><span>Certificate</span><span>${escapeHtml(record.certificateNumber)}</span></div>
        <div class="kv"><span>Standard</span><span>${escapeHtml(record.standard)}</span></div>
        <div class="kv"><span>Authority</span><span>${escapeHtml(record.authority)}</span></div>
        <div class="kv"><span>Verified on</span><span>${escapeHtml(record.verifiedOn || "Not verified")}</span></div>
        <div class="kv"><span>Expiry</span><span>${escapeHtml(getExpiryCountdown(record))}</span></div>
        <div class="kv"><span>Next review</span><span>${escapeHtml(record.nextReviewOn || "Not scheduled")}</span></div>
        <div class="kv"><span>Human check</span><span>${escapeHtml(buildLastHumanCheckedLine(record))}</span></div>
        <div class="kv"><span>Spec line</span><span>${escapeHtml(buildSpecLine(record))}</span></div>
        <div class="kv"><span>Capacity</span><span>${escapeHtml(buildUnitDisplay(record))}</span></div>
        <div class="kv"><span>Price estimate</span><span>${escapeHtml(currencyDisplay.primary)}${currencyDisplay.secondary ? ` (${escapeHtml(currencyDisplay.secondary)})` : ""}</span></div>
      </article>

      <article class="card arabic">
        <h2>${escapeHtml(arabicSummary.title)}</h2>
        <p>${escapeHtml(arabicSummary.status)}</p>
        <p>${escapeHtml(arabicSummary.agent)}</p>
        <p>${escapeHtml(arabicSummary.leadTime)}</p>
        <p>${escapeHtml(arabicSummary.note)}</p>
      </article>

      ${
        record.mismatchNote
          ? `<article class="card warn full"><h2>Mismatch Alert</h2><p>${escapeHtml(record.mismatchNote)}</p></article>`
          : ""
      }

      ${
        record.corrections && record.corrections.length > 0
          ? `<article class="card warn full"><h2>Manual Override Visible</h2>${record.corrections
              .map(
                (correction) =>
                  `<p>${escapeHtml(correction.originalClaim)}; ${escapeHtml(correction.correctedTo)} after verification on ${escapeHtml(correction.date)}. ${escapeHtml(correction.reason)}</p>`
              )
              .join("")}</article>`
          : ""
      }

      <article class="card full">
        <h2>Evidence Badges</h2>
        <div class="signals">
          ${evidenceBadges
            .map(
              (item) =>
                `<div class="signal"><h3>${escapeHtml(item.label)}</h3><p><strong>${escapeHtml(item.value)}</strong></p><p class="muted">${escapeHtml(item.detail)}</p></div>`
            )
            .join("")}
        </div>
      </article>

      <article class="card full">
        <h2>Also Verified By</h2>
        <div class="signals">
          ${sourceCrossReferences
            .map(
              (source) =>
                `<div class="signal"><h3>${escapeHtml(source.label)}</h3><p><strong>${escapeHtml(statusLabel(source.status))}</strong></p><p class="muted">${escapeHtml(source.evidence)} Checked ${escapeHtml(source.checkedOn)}.</p></div>`
            )
            .join("")}
        </div>
      </article>

      <article class="card full">
        <h2>Confidence Fingerprint</h2>
        <div class="signals">
          ${fingerprint
            .map(
              (item) =>
                `<div class="signal"><h3>${escapeHtml(item.label)}</h3><p><strong>${escapeHtml(item.value)}</strong></p><p class="muted">${escapeHtml(item.detail)}</p></div>`
            )
            .join("")}
        </div>
      </article>

      <article class="card">
        <h2>Agent Authorization</h2>
        <div class="kv"><span>Agent</span><span>${escapeHtml(record.agentAuthorization.agentName)}</span></div>
        <div class="kv"><span>Region</span><span>${escapeHtml(record.agentAuthorization.region)}</span></div>
        <div class="kv"><span>Status</span><span>${escapeHtml(agentStatus)}</span></div>
        <div class="kv"><span>Response time</span><span>${escapeHtml(record.agentAuthorization.avgResponseHours)} hours average from ${escapeHtml(record.agentAuthorization.responseSampleSize)} request(s)</span></div>
        ${noAgentNote ? `<p class="muted" style="margin-top: 10px;">${escapeHtml(noAgentNote)}</p>` : ""}
      </article>

      <article class="card">
        <h2>Lead Time And Market Signal</h2>
        <div class="kv"><span>Claimed lead time</span><span>${escapeHtml(record.leadTime.claimedWeeks)} weeks</span></div>
        <div class="kv"><span>Observed lead time</span><span>${record.leadTime.sampleSize > 0 ? `${escapeHtml(record.leadTime.observedAvgWeeks)} weeks` : "Not enough project data yet"}</span></div>
        <div class="kv"><span>Shortlists</span><span>${escapeHtml(record.projectSignal.shortlistedCount)} in ${escapeHtml(record.projectSignal.region)} ${escapeHtml(record.projectSignal.period)}</span></div>
        <div class="kv"><span>Selections</span><span>${escapeHtml(record.projectSignal.selectedCount || 0)}</span></div>
      </article>

      <article class="card full">
        <h2>Risk Transfer Clause</h2>
        <p>${escapeHtml(record.contractClause)}</p>
      </article>

      <article class="card">
        <h2>Sustainability / ESG</h2>
        <p>${escapeHtml(record.sustainability.efficiencyNote)}</p>
        <p class="muted">${escapeHtml(record.sustainability.leedCredits.length > 0 ? `LEED contribution candidates: ${record.sustainability.leedCredits.join(", ")}` : "No LEED contribution should be claimed until evidence is attached.")}</p>
        <p class="muted">${escapeHtml(record.sustainability.refrigerantNote)}</p>
      </article>

      <article class="card">
        <h2>Dispute Documentation</h2>
        <p>${escapeHtml(record.disputeDocumentation.evidencePack)}</p>
        <p class="muted">${escapeHtml(record.disputeDocumentation.retentionPolicy)}</p>
      </article>

      <article class="card">
        <h2>BIM Object Library</h2>
        ${record.bimResources
          .map(
            (resource) =>
              `<div class="kv"><span>${escapeHtml(resource.format)}</span><span>${escapeHtml(resource.name)} - ${escapeHtml(statusLabel(resource.status))}, updated ${escapeHtml(resource.updatedOn)}</span></div>`
          )
          .join("")}
      </article>

      <article class="card">
        <h2>Spare Parts / Post-install</h2>
        <div class="kv"><span>Supplier</span><span>${escapeHtml(record.spareParts.authorizedSupplier)}</span></div>
        <div class="kv"><span>Confirmed</span><span>${escapeHtml(record.spareParts.lastConfirmedOn)}</span></div>
        <p class="muted">${escapeHtml(record.spareParts.commonParts.join(", "))}</p>
      </article>
    </section>

    <div class="actions">
      <a class="button" href="javascript:window.print()">Print or save PDF</a>
      <a class="button secondary" href="${escapeHtml(whatsappSnapshot.deepLink)}" target="_blank" rel="noreferrer">Send snapshot via WhatsApp</a>
      <a class="button secondary" href="${escapeHtml(whatsappIntro.deepLink)}" target="_blank" rel="noreferrer">Request agent intro</a>
      <a class="button secondary" href="/api/agents/contact-card?certificate=${encodeURIComponent(record.certificateNumber)}">Download .vcf contact</a>
    </div>
    <p class="muted" style="margin-top: 20px; font-size: 12px;">${escapeHtml(lastUpdatedFooter)}</p>
  </main>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("certificate") || "";
  const format = searchParams.get("format") || "html";

  if (!query.trim()) {
    return NextResponse.json({ error: "Certificate, manufacturer, or model query is required" }, { status: 400 });
  }

  const record = await findCertificateRecord(query);

  if (!record) {
    return NextResponse.json({ error: "No matching verification record was found" }, { status: 404 });
  }

  const viewerMarket = inferViewerMarketFromHeaders(request.headers);
  const html = buildHtml(record, viewerMarket);
  const filename = `${record.manufacturer}-${record.model}-compliance-snapshot`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (format === "pdf") {
    return new NextResponse(buildPdf(record, viewerMarket), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}.pdf"`,
        "x-procuresource-document": "one-page-compliance-snapshot-pdf",
      },
    });
  }

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": `inline; filename="${filename}.html"`,
      "x-procuresource-document": "bilingual-compliance-snapshot",
    },
  });
}
