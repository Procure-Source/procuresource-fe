"use client";

import { useState } from "react";

import ProcurementTransformationProgress from "@/components/ProcurementTransformationProgress";

type TransformationState = "fragmented" | "structured";

const endpointLabels: Record<TransformationState, string> = {
  fragmented: "Fragmented",
  structured: "Structured",
};

function stateFromProgress(progress: number): TransformationState {
  return progress === 1 ? "structured" : "fragmented";
}

export default function ProcurementTransformationInspector() {
  const [progress, setProgress] = useState(0);
  const state = stateFromProgress(progress);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 xs:flex-row xs:items-end xs:justify-between">
        <div>
          <p className="text-micro tracking-eyebrow text-ink-muted uppercase">
            Static SVG prototype
          </p>
          <h1 className="mt-2 font-display text-h2 font-semibold leading-heading tracking-heading">
            {endpointLabels[state]} procurement information
          </h1>
        </div>

        <div className="w-full max-w-[28rem]">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div
              className="inline-flex w-fit border border-rule bg-paper p-1"
              aria-label="Procurement transformation endpoint"
            >
              {(["fragmented", "structured"] as const).map((candidate) => (
                <button
                  className={`px-4 py-2 text-small ${
                    state === candidate
                      ? "bg-accent text-paper"
                      : "text-ink-muted hover:text-ink"
                  }`}
                  type="button"
                  key={candidate}
                  aria-pressed={state === candidate}
                  onClick={() => setProgress(candidate === "fragmented" ? 0 : 1)}
                >
                  {endpointLabels[candidate]}
                </button>
              ))}
            </div>

            <p className="text-small tabular-nums text-ink-muted">
              {progress.toFixed(2)}
            </p>
          </div>

          <label className="sr-only" htmlFor="transformation-progress">
            Transformation progress
          </label>
          <input
            id="transformation-progress"
            className="block w-full accent-accent"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={progress}
            onChange={(event) => setProgress(Number(event.currentTarget.value))}
          />
        </div>
      </div>

      <div className="space-y-10">
        <section aria-label="Desktop inspection width">
          <p className="mb-3 text-small text-ink-muted">Desktop width</p>
          <div className="border border-rule bg-paper">
            <ProcurementTransformationProgress
              className="block h-auto w-full"
              progress={progress}
              titleId="procurement-transformation-progress-desktop-title"
            />
          </div>
        </section>

        <section aria-label="Mobile inspection width">
          <p className="mb-3 text-small text-ink-muted">Mobile width</p>
          <div className="max-w-[390px] border border-rule bg-paper">
            <ProcurementTransformationProgress
              className="block h-auto w-full"
              progress={progress}
              titleId="procurement-transformation-progress-mobile-title"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
