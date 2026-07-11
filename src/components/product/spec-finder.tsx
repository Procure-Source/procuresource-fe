"use client";

import { useState } from "react";
import { FileSearch, Loader2, ShieldCheck } from "lucide-react";

type Requirement = {
  requirement: string;
  status: string;
  confidence: number;
  evidence: string;
};

type SpecResult = {
  category: string;
  parameters: Record<string, string>;
  requirements: Requirement[];
  regionFlags: string[];
  matches: Array<{ brand?: string; model?: string; score?: number }>;
};

export function SpecFinder() {
  const [specText, setSpecText] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<SpecResult | null>(null);

  async function checkSpec() {
    const cleanSpec = specText.trim();
    if (cleanSpec.length < 20) {
      setState("error");
      setMessage("Paste a longer specification before checking.");
      setResult(null);
      return;
    }

    setState("checking");
    setMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/spec-finder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ProcureSource-Client": "web-product",
        },
        body: JSON.stringify({ specText: cleanSpec }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string; result?: SpecResult };

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message || "Spec check could not run right now.");
      }

      setResult(payload.result);
      setState("ready");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Spec check could not run right now.");
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.8fr)]">
      <div className="ps-glass-blue rounded-[34px] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[#0066cc]">Free utility</p>
            <h2 className="mt-2 text-[30px] font-medium leading-tight text-[#352a24] sm:text-[38px]">
              Find what the specification asks for.
            </h2>
            <p className="mt-3 max-w-[520px] text-[13px] leading-5 text-[#5d5148]">
              Paste a short equipment specification. Review the requirements before raising an RFQ.
            </p>
          </div>
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white/78 px-3 text-[12px] font-semibold text-[#0066cc]">
            <ShieldCheck className="h-4 w-4" />
            Free check
          </span>
        </div>

        <textarea
          value={specText}
          onChange={(event) => setSpecText(event.target.value.slice(0, 8000))}
          placeholder="Paste equipment specification, capacity, duty point, certification, voltage, material, or authority notes."
          className="mt-5 min-h-[260px] w-full resize-y rounded-[26px] border border-white/70 bg-white/68 p-4 text-[14px] leading-6 text-[#352a24] outline-none focus:border-[#2997ff]"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-[#766b62]">{specText.length}/8000 characters</p>
          <button
            type="button"
            onClick={checkSpec}
            disabled={state === "checking"}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(0,102,204,0.18)] hover:bg-[#1677e8] disabled:cursor-wait disabled:opacity-70"
          >
            {state === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
            Find requirements
          </button>
        </div>

        {state === "error" && message && (
          <p className="mt-4 rounded-full bg-white/78 px-4 py-3 text-[13px] font-semibold text-[#a34116]">
            {message}
          </p>
        )}
      </div>

      <aside className="ps-glass-panel rounded-[34px] p-5 sm:p-6">
        {!result ? (
          <div className="flex min-h-[360px] flex-col justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#0066cc]">Result</p>
              <h3 className="mt-3 text-[28px] font-medium leading-tight text-[#352a24]">No check yet.</h3>
              <p className="mt-3 text-[13px] leading-5 text-[#5d5148]">
                Paste a specification and run the free check.
              </p>
            </div>
            <div className="grid gap-2">
              {["Category", "Requirements", "Region notes"].map((item) => (
                <div key={item} className="rounded-full bg-white/72 px-4 py-3 text-[13px] font-semibold text-[#5d5148]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[12px] font-semibold text-[#0066cc]">Result</p>
            <h3 className="mt-3 text-[30px] font-medium leading-tight text-[#352a24]">{result.category}</h3>

            <div className="mt-5 grid gap-2">
              {Object.entries(result.parameters).slice(0, 5).map(([label, value]) => (
                <div key={label} className="rounded-[20px] border border-white/70 bg-white/66 p-3">
                  <p className="text-[11px] font-semibold text-[#766b62]">{label}</p>
                  <p className="mt-1 text-[13px] font-semibold text-[#352a24]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-[12px] font-semibold text-[#0066cc]">Requirements</p>
              <div className="mt-2 grid gap-2">
                {result.requirements.slice(0, 5).map((item) => (
                  <article key={item.requirement} className="rounded-[20px] bg-white/66 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-[13px] font-semibold text-[#352a24]">{item.requirement}</h4>
                      <span className="rounded-full bg-[#eef7ff] px-2.5 py-1 text-[11px] font-semibold text-[#0066cc]">
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] leading-5 text-[#5d5148]">{item.evidence}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[22px] bg-[#eef7ff] p-4">
              <p className="text-[12px] font-semibold text-[#0066cc]">Verified matches</p>
              <p className="mt-2 text-[13px] leading-5 text-[#5d5148]">
                {result.matches.length > 0
                  ? `${result.matches.length} verified match${result.matches.length === 1 ? "" : "es"} found.`
                  : "No verified product match yet. Use the requirements to prepare the RFQ."}
              </p>
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}
