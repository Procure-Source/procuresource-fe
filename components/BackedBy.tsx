import Image from "next/image";

import { FadeIn } from "@/components/common/FadeIn";
import { backers } from "@/lib/content";

/*
  The backer strip: one continuous loop, never pausing.

  The track holds two identical halves and travels exactly -50%, so the moment
  it resets is the moment it looks unchanged — no seam, no jump. Each half
  repeats the backer list enough times to fill a wide viewport; with only a
  couple of logos a single pass would leave visible gaps mid-cycle.
*/

const HALF_REPEATS = 2;

/* A lookup, not a template string — Tailwind only sees class names that
   appear complete in the source. */
const LOGO_SIZE = {
  /* Untrimmed artwork: the supplied file carries its own padding, so only
     part of this height is actually ink. */
  base: "h-10 xs:h-12",
  /* Artwork trimmed to its ink. The whole height is the logo, so it needs a
     smaller box to sit optically level with the padded ones. */
  tight: "h-7 xs:h-8",
} as const;

export default function BackedBy() {
  const half = Array.from({ length: HALF_REPEATS }, () => backers).flat();

  return (
    <section className="py-strip" aria-labelledby="backed-by-label">
      <FadeIn>
        <p
          id="backed-by-label"
          className="text-center text-micro tracking-eyebrow text-ink-muted uppercase"
        >
          Backed by
        </p>
      </FadeIn>

      {/* The visible strip repeats each logo, so it is hidden from assistive
          tech and the real list is announced once, here. */}
      <ul className="sr-only">
        {backers.map((backer) => (
          <li key={backer.name}>{backer.name}</li>
        ))}
      </ul>

      {/* Held to the page container so the logos sit as a centred band rather
          than running the full bleed of the viewport. The mask stops at 25%
          alpha instead of 0, so the outermost logo softens at the edge without
          disappearing. */}
      <div className="mx-auto w-full max-w-page px-gutter">
        <div
          aria-hidden="true"
          className="mt-8 overflow-hidden [mask-image:linear-gradient(to_right,rgb(0_0_0/0.25),black_10%,black_90%,rgb(0_0_0/0.25))]"
        >
          <div className="flex w-max animate-marquee items-center">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
              {half.map((backer, index) => (
                <span
                  key={`${backer.name}-${index}`}
                  className="px-8 xs:px-12"
                >
                  <Image
                    src={backer.src}
                    alt={backer.name}
                    width={backer.width}
                    height={backer.height}
                    /* Greyscale so no single mark shouts louder than the
                       others; the artwork itself is transparent. */
                    className={`w-auto object-contain opacity-70 grayscale ${
                      LOGO_SIZE[backer.size ?? "base"]
                    }`}
                  />
                </span>
              ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
