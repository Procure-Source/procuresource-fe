/*
  The lockup: badge mark + name. Redrawn as SVG rather than shipped as an
  image so it stays sharp at any size and takes its colours from the tokens —
  the badge is the accent green, the wrench is the paper colour, so the mark
  follows the palette instead of hardcoding the original navy.

  Typography (family, size, weight, tracking) belongs to whatever wraps this,
  which is why there is none here.
*/

export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} flex-none`}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="24" height="24" rx="7" className="fill-accent" />
      {/*
        The jaw is a disc and the handle is a hairline, so centring the badge
        on the wrench's own axis leaves it visibly high and right. These
        coordinates centre the *painted* bounding box — strokes included — on
        (12, 12): it spans 4.3 to 19.7 on both axes.

        The stroke is heavy on purpose. At this weight the wrench reads as a
        solid glyph with one clean counter rather than as line art, which is
        what holds up at 24px in the header.
      */}
      <g
        className="stroke-paper"
        fill="none"
        strokeWidth="3.4"
        strokeLinecap="round"
      >
        {/* Open jaw: a 250° arc, leaving the gap facing up and to the right. */}
        <path d="M17.94 10.46A3.8 3.8 0 1 1 13.54 6.06" />
        {/* Handle, running down-left from the jaw at 45°. */}
        <path d="M11.51 12.49 6 18" />
      </g>
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span>ProcureSource</span>
    </span>
  );
}
