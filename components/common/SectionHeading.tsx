import type { ReactNode } from "react";

/*
  Every section heading on the page, including the short accent rule that sits
  above it. One owner, so the three sections cannot drift apart.
*/
export default function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="max-w-[24ch] font-display text-h2 font-semibold leading-heading tracking-heading text-balance before:mb-5 before:block before:h-px before:w-10 before:bg-accent before:content-['']"
    >
      {children}
    </h2>
  );
}
