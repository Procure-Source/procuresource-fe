/*
  The former .btn / .btn--primary / .btn--quiet / .btn--sm / .btn--block
  variants, in one place. Four call sites render this look — three as links,
  one as a real <button> — so the class list is owned here rather than copied.

  Deliberately a plain function: cva + clsx + tailwind-merge would be three
  dependencies for two variants. Because nothing merges conflicts, each
  combination below sets every property exactly once — no two returned
  utilities may target the same CSS property. That applies to `extra` as well:
  opacity and visibility are in the base transition because the header's CTA
  fades, and a second transition-[…] at the call site would silently replace
  this one rather than add to it.
*/

type Variant = "primary" | "quiet";
type Size = "md" | "sm";

/* The press is a 1px nudge, not a scale — it reads as the button taking the
   click without moving anything around it. */
const base =
  "inline-flex cursor-pointer items-center justify-center rounded-btn border border-transparent text-small font-medium leading-none no-underline transition-[color,background-color,box-shadow,translate,opacity,visibility] duration-200 ease-standard hover:-translate-y-0.5 active:translate-y-px disabled:cursor-default disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:translate-y-0";

const appearance: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-card hover:bg-accent-press hover:shadow-card-hover",
  quiet: "bg-transparent text-ink underline-offset-[5px] hover:underline",
};

const padding: Record<Variant, Record<Size, string>> = {
  primary: { md: "px-6 py-3.75", sm: "px-4.25 py-2.5" },
  /* The quiet variant keeps the block padding but pulls its inline padding
     in, so it reads as a link sitting next to the primary button. */
  quiet: { md: "px-1 py-3.75", sm: "px-1 py-2.5" },
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  extra?: string,
) {
  return [base, appearance[variant], padding[variant][size], extra]
    .filter(Boolean)
    .join(" ");
}
