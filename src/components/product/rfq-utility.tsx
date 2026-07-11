"use client";

import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Clipboard,
  Download,
  FileSearch,
  FileUp,
  Loader2,
  Send,
} from "lucide-react";

import {
  buildAwardSummary,
  buildEmptyRfq,
  formatMoney,
  rfqFlowSteps,
  type BoqLineItem,
  type RfqRecord,
  type SupplierQuote,
} from "@/lib/rfq-flow";
import { createRfqFromLineItems, parseBoq, upsertRfq } from "@/lib/rfq-client";

const maxUploadBytes = 5 * 1024 * 1024;
const textFileTypes = new Set(["text/plain", "text/csv"]);

type UploadedBoqFile = {
  fileName: string;
  mimeType: string;
  dataUrl?: string;
};

function getBestQuote(quotes: SupplierQuote[]) {
  if (quotes.length === 0) return null;
  return [...quotes].sort((a, b) => {
    const scoreA = a.complianceScore * 1000 - a.total / 1000 - a.leadTimeDays * 75;
    const scoreB = b.complianceScore * 1000 - b.total / 1000 - b.leadTimeDays * 75;
    return scoreB - scoreA;
  })[0];
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsText(file);
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read the selected document."));
    reader.readAsDataURL(file);
  });
}

function inferMimeType(file: File) {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) return "text/csv";
  if (name.endsWith(".txt")) return "text/plain";
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

export function RfqUtility() {
  const [boqText, setBoqText] = useState("");
  const [lineItems, setLineItems] = useState<BoqLineItem[]>([]);
  const [rfq, setRfq] = useState<RfqRecord>(() => buildEmptyRfq([]));
  const [activeStep, setActiveStep] = useState("upload");
  const [parseState, setParseState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [parseNote, setParseNote] = useState("Paste or upload a BOQ to begin.");
  const [uploadedFile, setUploadedFile] = useState<UploadedBoqFile | null>(null);
  const [awardedQuoteId, setAwardedQuoteId] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return rfq.shareUrl || "/rfqs";
    const path = rfq.shareUrl || `/rfqs?link=${rfq.id}`;
    return `${window.location.origin}${path}`;
  }, [rfq.id, rfq.shareUrl]);

  const bestQuote = getBestQuote(rfq.quotes);
  const awardedQuote = rfq.quotes.find((quote) => quote.id === awardedQuoteId) || null;

  async function handleFileSelected(file: File) {
    const mimeType = inferMimeType(file);
    const isTextLike = textFileTypes.has(mimeType) || /\.(txt|csv)$/i.test(file.name);
    const isDocumentLike = /^(application\/pdf|image\/png|image\/jpeg|image\/jpg)$/i.test(mimeType) || /\.(pdf|png|jpe?g)$/i.test(file.name);

    setParseState("idle");

    if (!isTextLike && !isDocumentLike) {
      setUploadedFile(null);
      setParseNote("Use a TXT, CSV, PDF, PNG, or JPG BOQ file.");
      return;
    }

    if (file.size > maxUploadBytes) {
      setUploadedFile(null);
      setParseNote("File is too large. Use a file under 5 MB.");
      return;
    }

    try {
      if (isTextLike) {
        const text = await readFileAsText(file);
        setBoqText(text.slice(0, 60000));
        setUploadedFile({ fileName: file.name, mimeType: mimeType || "text/plain" });
        setParseNote(`${file.name} loaded. Review the text, then read the BOQ.`);
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);
      setBoqText("");
      setUploadedFile({ fileName: file.name, mimeType, dataUrl });
      setParseNote(`${file.name} selected.`);
    } catch (error) {
      setUploadedFile(null);
      setParseNote(error instanceof Error ? error.message : "Could not read the selected file.");
    }
  }

  async function handleParse() {
    if (!boqText.trim() && !uploadedFile?.dataUrl) {
      setParseState("error");
      setParseNote("Add BOQ text or upload a file first.");
      return;
    }

    setParseState("loading");
    setParseNote("Reading the BOQ and making the line items easier to quote...");

    try {
      const result = await parseBoq({
        text: boqText,
        fileName: uploadedFile?.fileName,
        mimeType: uploadedFile?.mimeType || "text/plain",
        dataUrl: uploadedFile?.dataUrl,
      });
      const parsedItems = result.lineItems?.length ? result.lineItems : [];
      if (parsedItems.length === 0) {
        setLineItems([]);
        setParseState("error");
        setParseNote("No quoteable line items were found. Add more detail and try again.");
        return;
      }

      const nextRfq = createRfqFromLineItems(parsedItems, {
        title: inferRfqTitle(uploadedFile?.fileName),
        projectName: "",
        metricSystem: "Metric",
        status: "shared",
      });

      setLineItems(parsedItems);
      setRfq(nextRfq);
      setActiveStep("share");
      setParseState("ready");
      setParseNote(`${parsedItems.length} line items are ready to share.`);
    } catch (error) {
      setLineItems([]);
      setParseState("error");
      setParseNote(error instanceof Error ? error.message : "Could not read the BOQ. Review the source and try again.");
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => undefined);
    setActiveStep("compare");
    setParseNote("RFQ link copied. Suppliers can register and quote through it.");
  }

  function handleAward(quote: SupplierQuote) {
    const updated = {
      ...rfq,
      status: "awarded" as const,
      awardedQuoteId: quote.id,
    };
    setAwardedQuoteId(quote.id);
    setRfq(updated);
    upsertRfq(updated);
    setActiveStep("award");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="ps-glass-panel rounded-[30px] p-4 lg:sticky lg:top-24 lg:self-start">
        <p className="text-[11px] font-semibold text-[#0066cc]">Flow</p>
        <h2 className="mt-2 text-[24px] font-semibold leading-tight text-[#352a24]">RFQ loop</h2>
        <div className="mt-4 divide-y divide-[#e8e4dc]">
          {rfqFlowSteps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`grid w-full grid-cols-[42px_1fr] gap-3 py-3 text-left transition-colors ${
                activeStep === step.id ? "text-[#0066cc]" : "text-[#5d5148] hover:text-[#0066cc]"
              }`}
            >
              <span className="text-[20px] font-semibold">{step.number}</span>
              <span>
                <span className="block text-[16px] font-semibold">{step.title}</span>
                <span className="mt-1 block text-[12px] leading-4 text-[#766b62]">{step.detail}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-5">
        <div className="ps-glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[30px] p-3">
          <div className="rounded-full bg-[#eef7ff] px-3 py-2 text-[13px] font-semibold text-[#0066cc]">
            Purchaser RFQ workspace
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#766b62]">
            <FileSearch className="h-4 w-4 text-[#0066cc]" />
            BOQ reader and quote link ready
          </div>
        </div>

        {activeStep === "upload" && (
          <section className="ps-glass-panel rounded-[30px] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold text-[#0066cc]">Step 1</p>
                <h3 className="mt-2 text-[24px] font-semibold text-[#352a24]">Upload BOQ</h3>
                <p className="mt-2 max-w-xl text-[13px] leading-5 text-[#6c6258]">Paste text or upload a BOQ file.</p>
              </div>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#d8d2c8] px-3 text-[13px] font-semibold text-[#352a24] hover:bg-[#f2f7fb]">
                <FileUp className="h-4 w-4" />
                Upload file
                <input
                  type="file"
                  className="sr-only"
                  accept=".txt,.csv,.pdf,.png,.jpg,.jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void handleFileSelected(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            <textarea
              value={boqText}
              onChange={(event) => setBoqText(event.target.value)}
              placeholder="Paste BOQ text or upload a file."
              className="mt-4 min-h-[180px] w-full resize-y rounded-[24px] border border-white/70 bg-white/62 p-4 text-[14px] leading-6 text-[#352a24] outline-none backdrop-blur-xl focus:border-[#2997ff]"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13px] text-[#766b62]">{parseNote}</p>
                {uploadedFile && (
                  <p className="mt-1 text-[12px] font-semibold text-[#0066cc]">
                    Selected file: {uploadedFile.fileName}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleParse}
                disabled={parseState === "loading"}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white hover:bg-[#1677e8] disabled:cursor-wait disabled:opacity-70"
              >
                {parseState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
                Read BOQ
              </button>
            </div>
          </section>
        )}

        {activeStep === "share" && (
          <section className="ps-glass-panel rounded-[30px] p-5">
            <p className="text-[12px] font-semibold text-[#0066cc]">Step 2</p>
            <h3 className="mt-2 text-[24px] font-semibold text-[#352a24]">Share a link</h3>
            <p className="mt-2 text-[13px] leading-5 text-[#6c6258]">One controlled RFQ link for suppliers.</p>
            <div className="ps-glass-card mt-4 rounded-[26px] p-4">
              <p className="text-[12px] font-semibold text-[#6c6258]">RFQ link</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <code className="min-h-11 flex-1 rounded-[18px] border border-white/70 bg-white/62 px-3 py-3 text-[13px] text-[#5d5148]">
                  {shareUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white hover:bg-[#1677e8]"
                >
                  <Clipboard className="h-4 w-4" />
                  Copy link
                </button>
              </div>
            </div>
            <LineItemTable lineItems={lineItems} />
          </section>
        )}

        {activeStep === "compare" && (
          <section className="ps-glass-panel rounded-[30px] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold text-[#0066cc]">Step 3</p>
                <h3 className="mt-2 text-[24px] font-semibold text-[#352a24]">Compare quotes</h3>
                <p className="mt-2 text-[13px] leading-5 text-[#6c6258]">Price, compliance, lead time, exceptions.</p>
              </div>
            </div>

            <QuoteComparison quotes={rfq.quotes} bestQuoteId={bestQuote?.id} onAward={handleAward} />
          </section>
        )}

        {activeStep === "award" && (
          <section className="ps-glass-panel rounded-[30px] p-5">
            <p className="text-[12px] font-semibold text-[#0066cc]">Step 4</p>
            <h3 className="mt-2 text-[24px] font-semibold text-[#352a24]">Award and export</h3>
            {awardedQuote ? (
              <div className="mt-5 rounded-[26px] border border-[#23c55e]/30 bg-[#ecfdf3]/72 p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[#16a34a]" />
                  <div>
                    <p className="text-[18px] font-semibold text-[#352a24]">{awardedQuote.supplierName} selected</p>
                    <p className="mt-1 text-[13px] leading-5 text-[#6c6258]">Export the award record.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadText(`${rfq.id}-award-summary.txt`, buildAwardSummary(rfq, awardedQuote))}
                  className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white hover:bg-[#1677e8]"
                >
                  <Download className="h-4 w-4" />
                  Export award summary
                </button>
              </div>
            ) : (
              <div className="ps-glass-card mt-5 rounded-[26px] p-4 text-[14px] text-[#6c6258]">
                Select a quote to prepare the award.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function LineItemTable({ lineItems }: { lineItems: BoqLineItem[] }) {
  if (lineItems.length === 0) {
    return (
      <div className="ps-glass-card mt-5 rounded-[24px] p-4">
        <p className="text-[13px] font-semibold text-[#352a24]">No line items yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-x-auto rounded-[24px] border border-white/70 bg-white/48 backdrop-blur-xl">
      <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
        <thead className="bg-white/58 text-[#6c6258]">
          <tr>
            <th className="px-4 py-3 font-semibold">Item</th>
            <th className="px-4 py-3 font-semibold">Qty</th>
            <th className="px-4 py-3 font-semibold">Unit</th>
            <th className="px-4 py-3 font-semibold">Specification</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e8e4dc]">
          {lineItems.map((item) => (
            <tr key={item.id} className="bg-white/52">
              <td className="px-4 py-3 font-medium text-[#352a24]">{item.description}</td>
              <td className="px-4 py-3 text-[#5d5148]">{item.quantity}</td>
              <td className="px-4 py-3 text-[#5d5148]">{item.unit}</td>
              <td className="px-4 py-3 text-[#6c6258]">{item.specification}</td>
              <td className="px-4 py-3 text-[#0066cc]">{item.confidence >= 80 ? "Ready" : "Review"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function inferRfqTitle(fileName?: string) {
  if (!fileName) return "New RFQ";
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().slice(0, 80) || "New RFQ";
}

function QuoteComparison({
  quotes,
  bestQuoteId,
  onAward,
}: {
  quotes: SupplierQuote[];
  bestQuoteId?: string;
  onAward: (quote: SupplierQuote) => void;
}) {
  if (quotes.length === 0) {
    return (
      <div className="ps-glass-card mt-5 rounded-[26px] p-6 text-center">
        <Send className="mx-auto h-8 w-8 text-[#0066cc]" />
        <p className="mt-3 text-[15px] font-semibold text-[#352a24]">No supplier quotes yet</p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-2">
      {quotes.map((quote) => (
        <article
          key={quote.id}
          className={`rounded-[26px] border p-4 backdrop-blur-xl ${
            quote.id === bestQuoteId ? "border-[#2997ff] bg-[#eff7ff]/78" : "border-white/70 bg-white/58"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[18px] font-semibold text-[#352a24]">{quote.supplierName}</p>
              <p className="mt-1 text-[13px] text-[#766b62]">{quote.contactName} - {quote.email}</p>
            </div>
            {quote.id === bestQuoteId && (
              <span className="rounded-full bg-[#dff0ff] px-3 py-1 text-[11px] font-semibold text-[#0066cc]">
                Best fit
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniMetric label="Total" value={formatMoney(quote.total, quote.currency)} />
            <MiniMetric label="Lead time" value={`${quote.leadTimeDays}d`} />
            <MiniMetric label="Compliance" value={`${quote.complianceScore}%`} />
          </div>

          <p className="mt-4 text-[13px] leading-5 text-[#6c6258]">{quote.notes}</p>
          <button
            type="button"
            onClick={() => onAward(quote)}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-[#0066cc] px-3 text-[13px] font-semibold text-white hover:bg-[#1677e8]"
          >
            <Award className="h-4 w-4" />
            Award supplier
          </button>
        </article>
      ))}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/70 bg-white/58 p-3">
      <p className="text-[10px] font-semibold text-[#766b62]">{label}</p>
      <p className="mt-1 text-[16px] font-semibold text-[#352a24]">{value}</p>
    </div>
  );
}
