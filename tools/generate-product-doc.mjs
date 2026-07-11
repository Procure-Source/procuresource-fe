import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "output", "pdf");
const htmlPath = path.join(outputDir, "procuresource-product-documentation.html");
const pdfPath = path.join(outputDir, "procuresource-product-documentation.pdf");
const previewPath = path.join(outputDir, "procuresource-product-documentation-preview.png");

fs.mkdirSync(outputDir, { recursive: true });

function fontFace(family, weight, filePath) {
  const data = fs.readFileSync(path.join(root, filePath)).toString("base64");
  return `
    @font-face {
      font-family: "${family}";
      src: url("data:font/woff2;base64,${data}") format("woff2");
      font-weight: ${weight};
      font-style: normal;
      font-display: swap;
    }
  `;
}

const logo = fs.readFileSync(path.join(root, "public", "procuresource-logo.svg"), "utf8");

const css = `
  ${fontFace("DM Sans", 400, "node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2")}
  ${fontFace("DM Sans", 600, "node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2")}
  ${fontFace("DM Sans", 700, "node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2")}
  ${fontFace("Manrope", 500, "node_modules/@fontsource/manrope/files/manrope-latin-500-normal.woff2")}
  ${fontFace("Manrope", 700, "node_modules/@fontsource/manrope/files/manrope-latin-700-normal.woff2")}
  ${fontFace("Manrope", 800, "node_modules/@fontsource/manrope/files/manrope-latin-800-normal.woff2")}

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #f3f6fb; color: #111827; font-family: "DM Sans", sans-serif; }
  body { font-size: 10.5pt; line-height: 1.55; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 18mm 16mm; background: #fff; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3 { font-family: "Manrope", sans-serif; margin: 0; letter-spacing: 0; color: #07111f; }
  h1 { font-size: 34pt; line-height: 1.02; font-weight: 800; max-width: 150mm; }
  h2 { font-size: 20pt; line-height: 1.16; font-weight: 800; margin-bottom: 8mm; }
  h3 { font-size: 12.5pt; font-weight: 800; margin-bottom: 2.5mm; }
  p { margin: 0 0 4mm; }
  .hero { background: linear-gradient(135deg, #05070b, #0d2b48 58%, #003b5f); color: #f8fbff; position: relative; overflow: hidden; }
  .hero h1, .hero h2, .hero h3 { color: #fff; }
  .hero .sub { color: #c7d5e8; font-size: 13pt; max-width: 142mm; margin-top: 8mm; }
  .brand { display: flex; align-items: center; gap: 5mm; margin-bottom: 22mm; }
  .logo { width: 19mm; height: 19mm; border-radius: 5mm; overflow: hidden; }
  .brand-name { font-family: "Manrope"; font-weight: 800; font-size: 18pt; }
  .label { color: #2c8fff; font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3mm; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4.5mm; }
  .card { border: 1px solid #d8e0ea; border-radius: 4mm; padding: 5mm; background: #fbfdff; break-inside: avoid; }
  .dark-card { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16); color: #eaf3ff; }
  .metric { font-family: "Manrope"; font-size: 22pt; font-weight: 800; color: #0066cc; }
  .pill { display: inline-block; border-radius: 999px; padding: 1.6mm 3.2mm; font-size: 8.5pt; font-weight: 700; background: #e7f3ff; color: #0057b8; margin: 0 1.5mm 1.5mm 0; }
  .muted { color: #667085; }
  .hero .muted { color: #bed0e5; }
  ul { margin: 0; padding-left: 5mm; }
  li { margin-bottom: 2mm; }
  .section { margin-top: 8mm; }
  .table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  .table th { text-align: left; font-family: "Manrope"; background: #07111f; color: #fff; padding: 3mm; }
  .table td { border: 1px solid #d8e0ea; padding: 3mm; vertical-align: top; }
  .callout { border-left: 4px solid #0066cc; background: #eef6ff; padding: 4mm 5mm; border-radius: 2mm; }
  .footer { position: absolute; bottom: 9mm; left: 18mm; right: 18mm; display: flex; justify-content: space-between; color: #7a8699; font-size: 8pt; }
  .page { position: relative; }
  @page { size: A4; margin: 0; }
`;

const pages = [
  `
  <section class="page hero">
    <div class="brand"><div class="logo">${logo}</div><div><div class="brand-name">ProcureSource</div><div class="muted">Built from Dubai to the world.</div></div></div>
    <div class="label">Product Documentation</div>
    <h1>Industrial procurement intelligence with a defensible verification core.</h1>
    <p class="sub">ProcureSource is a Next.js platform for MEP and industrial procurement across the GCC, focused on verified supplier records, technical product data, RFQs, certifications, submittals, contracts, deliveries, messaging, and role-based operations.</p>
    <div class="grid3 section">
      <div class="card dark-card"><div class="metric">66</div><p>application pages currently present</p></div>
      <div class="card dark-card"><div class="metric">77</div><p>API route files currently present</p></div>
      <div class="card dark-card"><div class="metric">126</div><p>static/dynamic routes generated in the latest build</p></div>
    </div>
    <div class="footer"><span>ProcureSource Product Documentation</span><span>2026-07-07</span></div>
  </section>`,
  `
  <section class="page">
    <div class="label">Executive Summary</div>
    <h2>What This Product Is</h2>
    <p>ProcureSource is positioned as a technical procurement operating system for industrial and MEP equipment. It connects purchase managers, suppliers, manufacturers, agents, and admins around verified product records, RFQs, quotes, contracts, documents, delivery tracking, and technical compliance.</p>
    <div class="grid section">
      <div class="card"><h3>Primary Users</h3><ul><li>Purchase managers creating projects and RFQs.</li><li>Suppliers managing products, brands, quotes and invitations.</li><li>Admins reviewing users, products, suppliers and documents.</li><li>Public users browsing products, manufacturers, RFQs and certifications.</li></ul></div>
      <div class="card"><h3>Core Differentiator</h3><p>The latest work moves the product beyond a generic marketplace by adding a manual trust layer: verification trails, agent authorization mapping, mismatch alerts, response-time evidence, lead-time reality checks, and honest spec confidence.</p></div>
    </div>
    <div class="section callout"><strong>Strategic wedge:</strong> v1 should stay narrow around verified chiller intelligence and UAE/GCC agent authorization before broad marketplace expansion.</div>
    <div class="footer"><span>ProcureSource</span><span>02</span></div>
  </section>`,
  `
  <section class="page">
    <div class="label">Current Feature Inventory</div>
    <h2>Major Product Areas Built</h2>
    <div class="grid">
      <div class="card"><h3>Public Discovery</h3><p>Homepage, manufacturers, agents, products, product detail, compare, RFQs, search, certifications, support, legal and static company pages.</p></div>
      <div class="card"><h3>Authentication</h3><p>Email/password login, registration, email verification, password reset, document upload hooks, role-based dashboard redirect.</p></div>
      <div class="card"><h3>Purchase Manager Workflows</h3><p>PM dashboard, projects, project details, RFQ detail, contracts, project documents, supplier selection and spec analysis route.</p></div>
      <div class="card"><h3>Supplier Workflows</h3><p>Supplier dashboard, brand/product management, import/export templates, RFQ invitations, quote building, contracts and analytics.</p></div>
      <div class="card"><h3>Admin Workflows</h3><p>Admin auth, supplier/product/category/brand/equipment management, document review, analytics, user/team oversight and flags.</p></div>
      <div class="card"><h3>Collaboration</h3><p>Messaging, conversations, unread counts, notifications, deliveries, delivery events, contracts and connection requests.</p></div>
    </div>
    <div class="footer"><span>Feature Inventory</span><span>03</span></div>
  </section>`,
  `
  <section class="page">
    <div class="label">Architecture</div>
    <h2>How The App Is Structured</h2>
    <table class="table">
      <tr><th>Layer</th><th>Current Implementation</th></tr>
      <tr><td>Frontend</td><td>Next.js 15 App Router, React 19, Tailwind CSS 4, Framer Motion, Lucide icons, local DM Sans and Manrope fonts.</td></tr>
      <tr><td>Backend</td><td>Next.js API routes under src/app/api with MongoDB/Mongoose models, JWT auth cookies, Cloudinary uploads, Nodemailer email flows.</td></tr>
      <tr><td>Data Models</td><td>User, Supplier, SupplierProduct, Brand, Product, RFQ, Quote, Contract, Delivery, Project, ProjectSpecMatch, Message, Notification, ConnectionRequest, UserDocument and VerificationRecord.</td></tr>
      <tr><td>Document Intelligence</td><td>Server-side parsing is wired through provider-neutral secret stores, JSON normalization, and deterministic local fallback.</td></tr>
      <tr><td>SEO/GEO</td><td>Root metadata, canonical rules, robots.txt, sitemap.xml, PWA manifest, structured JSON-LD, GCC market pages and global landing pages.</td></tr>
    </table>
    <div class="section"><span class="pill">Next.js 15</span><span class="pill">MongoDB</span><span class="pill">Server-side parsing</span><span class="pill">DM Sans</span><span class="pill">Manrope</span><span class="pill">ProcureSource</span></div>
    <div class="footer"><span>Architecture</span><span>04</span></div>
  </section>`,
  `
  <section class="page">
    <div class="label">Verification Core</div>
    <h2>Trust Layer Added In This Pass</h2>
    <div class="grid">
      <div class="card"><h3>Verification Trail</h3><p>Certificate records now support verified-on dates, next review dates, evidence methods, outcomes and sources.</p></div>
      <div class="card"><h3>Mismatch Alerts</h3><p>Lookup can show not-found or mismatch states instead of falsely displaying a generic verified badge.</p></div>
      <div class="card"><h3>Agent Authorization Map</h3><p>Records include agent name, region, status, confirmation method, response-time history and introduction contact path.</p></div>
      <div class="card"><h3>Lead Time Reality Check</h3><p>Records distinguish claimed lead time from observed project delivery data when verified delivery observations exist.</p></div>
      <div class="card"><h3>Spec Confidence</h3><p>Spec matcher now returns requirement-level status, confidence and evidence, plus region-aware flags.</p></div>
      <div class="card"><h3>Data Model</h3><p>VerificationRecord model added for real Mongo-backed trust data. Empty states are shown until verified records are connected.</p></div>
    </div>
    <div class="footer"><span>Verification Core</span><span>05</span></div>
  </section>`,
  `
  <section class="page">
    <div class="label">Design And Brand</div>
    <h2>Visual System Updates</h2>
    <div class="grid">
      <div class="card"><h3>Logo</h3><p>A new original geometric source mark was created and wired into the navbar, favicon assets, app icons, manifest and structured data.</p></div>
      <div class="card"><h3>Typography</h3><p>The application and documentation use local DM Sans and Manrope only, removing external Google Fonts runtime dependency.</p></div>
      <div class="card"><h3>Auth Screens</h3><p>Login and registration now use a responsive split-screen shell on desktop and compact trust context cards on mobile.</p></div>
      <div class="card"><h3>Responsive QA</h3><p>Mobile audit covers homepage, products, RFQs, AI tools, auth, dashboard shells, and new market/global pages across 360px, 375px and 390px widths.</p></div>
    </div>
    <div class="section callout">Brand attribution is now standardized as Built from Dubai to the world.</div>
    <div class="footer"><span>Design And Brand</span><span>06</span></div>
  </section>`,
  `
  <section class="page">
    <div class="label">Verification Results</div>
    <h2>What Was Tested</h2>
    <table class="table">
      <tr><th>Check</th><th>Result</th></tr>
      <tr><td>Production build</td><td>Passed. Next.js generated 126 routes.</td></tr>
      <tr><td>Mobile audit</td><td>Passed. 36 checks across 12 routes and 3 phone widths.</td></tr>
      <tr><td>Public routes</td><td>Homepage, login, register, certification lookup, market/global pages, robots, sitemap, manifest and favicon assets returned 200.</td></tr>
      <tr><td>AI routes</td><td>Spec analysis returns category, matches, requirement confidence and region flags. Submittal route returns document list and highlights.</td></tr>
      <tr><td>Certificate lookup</td><td>Verified and mismatch records return deterministic evidence-based responses.</td></tr>
      <tr><td>Auth resilience</td><td>Local sandbox cannot reach MongoDB SRV, so auth now returns clean 503 service-unavailable handling instead of leaking database internals.</td></tr>
    </table>
    <div class="section callout"><strong>Deployment note:</strong> real login/signup requires reachable MongoDB, SMTP and Cloudinary environment variables in Vercel.</div>
    <div class="footer"><span>Verification Results</span><span>07</span></div>
  </section>`,
  `
  <section class="page">
    <div class="label">Next Actions</div>
    <h2>Recommended Roadmap</h2>
    <div class="grid">
      <div class="card"><h3>Phase 0</h3><p>Lock v1 to UAE chillers, build the manufacturer, agent, and certificate registry, and import only verified manual evidence.</p></div>
      <div class="card"><h3>Phase 1</h3><p>Expose the public certification lookup and verified agent introduction flow to a small group of real consultants.</p></div>
      <div class="card"><h3>Phase 2</h3><p>Only after real usage, expand admin tooling for manufacturer self-updates, verification review queues and quarterly re-check cadence.</p></div>
      <div class="card"><h3>Do Not Rush</h3><p>Do not expand categories, payment workflows, complex RFQ automation, BIM integration or mobile apps before the trust dataset has density.</p></div>
    </div>
    <div class="footer"><span>Next Actions</span><span>08</span></div>
  </section>`,
];

const html = `<!doctype html><html><head><meta charset="utf-8"><title>ProcureSource Product Documentation</title><style>${css}</style></head><body>${pages.join("")}</body></html>`;

fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({ path: previewPath, fullPage: false });
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();

console.log(JSON.stringify({ htmlPath, pdfPath, previewPath }, null, 2));
