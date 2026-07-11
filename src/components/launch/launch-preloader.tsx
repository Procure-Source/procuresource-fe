"use client";

import { useEffect, useState } from "react";

import { ProcureSourceMark } from "./procuresource-mark";

type PreloaderPhase = "hidden" | "visible" | "leaving";

export function LaunchPreloader() {
  const [phase, setPhase] = useState<PreloaderPhase>("visible");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const holdDuration = prefersReducedMotion ? 220 : 980;
    const exitDuration = prefersReducedMotion ? 120 : 520;

    const exitTimer = window.setTimeout(() => {
      setPhase("leaving");
    }, holdDuration);

    const removeTimer = window.setTimeout(() => {
      setPhase("hidden");
    }, holdDuration + exitDuration);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (phase === "hidden") {
    return null;
  }

  return (
    <div
      className="stand-preloader"
      data-state={phase}
      role="status"
      aria-label="Loading ProcureSource"
      aria-live="polite"
    >
      <div className="stand-preloader-grid" aria-hidden="true" />
      <div className="stand-preloader-core">
        <ProcureSourceMark className="stand-preloader-mark" title="ProcureSource" />
        <div className="stand-preloader-copy">
          <p>ProcureSource</p>
          <span>Private RFQ / DXB.UAE</span>
        </div>
        <div className="stand-preloader-rail" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
