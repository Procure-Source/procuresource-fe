"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type ReporterProps = {
  error?: Error & { digest?: string };
  reset?: () => void;
};

export default function ErrorReporter({ error, reset }: ReporterProps) {
  const lastOverlayMsg = useRef("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const inIframe = window.parent !== window;
    const shouldReportToParent = process.env.NODE_ENV === "development" && inIframe;
    if (!shouldReportToParent) return;

    const send = (payload: unknown) => window.parent.postMessage(payload, window.location.origin);

    const onError = (event: ErrorEvent) =>
      send({
        type: "ERROR_CAPTURED",
        error: {
          message: event.message,
          stack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          source: "window.onerror",
        },
        timestamp: Date.now(),
      });

    const onReject = (event: PromiseRejectionEvent) =>
      send({
        type: "ERROR_CAPTURED",
        error: {
          message: event.reason?.message ?? String(event.reason),
          stack: event.reason?.stack,
          source: "unhandledrejection",
        },
        timestamp: Date.now(),
      });

    const pollOverlay = () => {
      const overlay = document.querySelector("[data-nextjs-dialog-overlay]");
      const node = overlay?.querySelector("h1, h2, .error-message, [data-nextjs-dialog-body]") ?? null;
      const text = node?.textContent ?? "";

      if (text && text !== lastOverlayMsg.current) {
        lastOverlayMsg.current = text;
        send({
          type: "ERROR_CAPTURED",
          error: { message: text, source: "nextjs-dev-overlay" },
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    pollRef.current = setInterval(pollOverlay, 1000);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    if (process.env.NODE_ENV !== "development" || window.parent === window) return;

    window.parent.postMessage(
      {
        type: "global-error-reset",
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          name: error.name,
        },
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      },
      window.location.origin,
    );
  }, [error]);

  if (!error) return null;

  const developmentDetails = [error.message, error.stack, error.digest ? `Digest: ${error.digest}` : ""]
    .filter(Boolean)
    .join("\n\n");

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f4f3ed] p-4 text-[#352a24] antialiased">
        <main className="flex min-h-[calc(100vh-32px)] items-center justify-center">
          <section className="w-full max-w-[720px] rounded-[40px] border border-[#e1ddd5] bg-white p-6 text-center shadow-[0_24px_70px_rgba(61,48,40,0.08)] sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4ed] text-[#b54708]">
              <span className="text-[28px] leading-none">!</span>
            </div>
            <p className="mt-5 text-[13px] font-semibold text-[#0066cc]">ProcureSource recovery</p>
            <h1 className="mt-3 text-[34px] font-semibold leading-tight sm:text-[46px]">This screen could not load.</h1>
            <p className="mx-auto mt-4 max-w-[540px] text-[15px] leading-7 text-[#5d5148]">
              Try again, or return to the product flow and reopen the right purchaser, supplier, or verification step.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {reset && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-11 items-center rounded-full bg-[#0066cc] px-5 text-[14px] font-semibold text-white hover:bg-[#1677e8]"
                >
                  Try again
                </button>
              )}
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-full border border-[#d8d2c8] bg-white px-5 text-[14px] font-semibold text-[#352a24] hover:bg-[#eef7ff]"
              >
                Go home
              </Link>
              <Link
                href="/flows"
                className="inline-flex h-11 items-center rounded-full border border-[#b9ddff] bg-[#eef7ff] px-5 text-[14px] font-semibold text-[#0066cc] hover:bg-white"
              >
                View flow map
              </Link>
            </div>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 rounded-[22px] border border-[#e1ddd5] bg-[#fbfbf7] p-4 text-left">
                <summary className="cursor-pointer text-[13px] font-semibold text-[#5d5148]">Error details</summary>
                <pre className="mt-3 max-h-[260px] overflow-auto rounded-[16px] bg-white p-3 text-[12px] leading-5 text-[#5d5148]">
                  {developmentDetails}
                </pre>
              </details>
            )}
          </section>
        </main>
      </body>
    </html>
  );
}
