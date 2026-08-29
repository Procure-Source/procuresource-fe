"use client";

import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import ProcurementTransformationProgress from "@/components/ProcurementTransformationProgress";
import { FadeIn } from "@/components/common/FadeIn";

const mobileStages = [
  { label: "Fragmented", progress: 0 },
  { label: "Analyzed", progress: 0.42 },
  { label: "Related", progress: 0.78 },
  { label: "Structured", progress: 1 },
] as const;

const scrollSpeedMultiplier = 1.5;
const activeScrollViewports = 2.8 / scrollSpeedMultiplier;

function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, progress));
}

function TransformationIntro() {
  return (
    <FadeIn>
      <div className="mx-auto max-w-[44rem] text-center">
        <p className="text-micro tracking-eyebrow text-accent uppercase">
          Fragmented → Structured
        </p>
        <h2
          id="procurement-transformation-heading"
          className="mt-4 font-display text-h2 font-semibold leading-heading tracking-heading text-balance"
        >
          Watch scattered procurement information become a record.
        </h2>
        <p className="mx-auto mt-lead max-w-measure text-lead leading-body text-ink-muted">
          Procurement information rarely arrives in one place. ProcureSource
          brings the pieces together and turns them into a structured
          procurement record.
        </p>
      </div>
    </FadeIn>
  );
}

export default function ProcurementTransformationSection() {
  const storyRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeRange, setActiveRange] = useState({ end: 1, start: 0 });
  const [visualStatus, setVisualStatus] = useState("before focus");
  const prefersReducedMotion = useReducedMotion();
  const visibleMobileStages = prefersReducedMotion
    ? [{ label: "Structured", progress: 1 }]
    : mobileStages;
  const { scrollY } = useScroll();

  const measureActiveRange = useCallback(() => {
    const story = storyRef.current;
    const visual = visualRef.current;

    if (!story || !visual) return;

    const scrollTop = window.scrollY;
    const storyRect = story.getBoundingClientRect();
    const visualRect = visual.getBoundingClientRect();
    const storyTop = storyRect.top + scrollTop;
    const visualCenter = visualRect.top + visualRect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const centerDelta = Math.round(visualCenter - viewportCenter);
    const start = storyTop;
    const end = start + window.innerHeight * activeScrollViewports;
    const range = end - start;
    const nextProgress = range <= 0 ? 0 : clampProgress((scrollTop - start) / range);

    setActiveRange({ end, start });
    setScrollProgress(nextProgress);
    setVisualStatus(Math.abs(centerDelta) <= 24 ? "centered" : `${centerDelta}px from center`);
  }, []);

  useEffect(() => {
    measureActiveRange();
    window.addEventListener("resize", measureActiveRange);

    return () => window.removeEventListener("resize", measureActiveRange);
  }, [measureActiveRange]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const range = activeRange.end - activeRange.start;
    setScrollProgress(
      range <= 0 ? 0 : clampProgress((latest - activeRange.start) / range),
    );

    const visual = visualRef.current;

    if (visual) {
      const visualRect = visual.getBoundingClientRect();
      const visualCenter = visualRect.top + visualRect.height / 2;
      const centerDelta = Math.round(visualCenter - window.innerHeight / 2);

      setVisualStatus(Math.abs(centerDelta) <= 24 ? "centered" : `${centerDelta}px from center`);
    }
  });

  return (
    <section
      className="bg-paper py-strip split:pb-0"
      aria-labelledby="procurement-transformation-heading"
    >
      <div className="mx-auto w-full max-w-page px-gutter">
        <TransformationIntro />
      </div>

      <div
        ref={storyRef}
        className="relative mt-10 hidden min-h-[333svh] split:block"
      >
        <div className="sticky top-0 flex min-h-svh items-center px-gutter">
          <div className="mx-auto w-full max-w-page" ref={visualRef}>
            <ProcurementTransformationProgress
              className="mx-auto block h-auto w-full max-w-[960px]"
              progress={prefersReducedMotion ? 1 : scrollProgress}
              titleId="homepage-procurement-transformation-title"
            />
          </div>
        </div>

        {process.env.NODE_ENV !== "production" && !prefersReducedMotion && (
          <div className="fixed right-4 bottom-4 z-50 w-72 border border-rule bg-paper/95 p-3 text-small text-ink shadow-panel backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <span>scroll progress</span>
              <span className="tabular-nums">{scrollProgress.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-4 text-micro text-ink-muted">
              <span>visual position</span>
              <span>{visualStatus}</span>
            </div>
            <div className="mt-3 h-2 border border-rule bg-sunken">
              <div
                className="h-full bg-accent"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-micro text-ink-muted">
              <span>start</span>
              <span>current</span>
              <span>end</span>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-page px-gutter">
        <div className="mt-10 grid grid-cols-1 gap-10 split:hidden">
          {visibleMobileStages.map((stage) => (
            <FadeIn key={stage.label}>
              <div>
                <p className="mb-3 text-center text-micro tracking-eyebrow text-ink-muted uppercase">
                  {stage.label}
                </p>
                <ProcurementTransformationProgress
                  className="block h-auto w-full"
                  progress={stage.progress}
                  titleId={`mobile-procurement-transformation-${stage.label.toLowerCase()}-title`}
                />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
