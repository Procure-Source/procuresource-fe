"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Logo from "@/components/common/Logo";
import { buttonClass } from "@/components/ui/button";

/* Collapse breakpoint — must match --breakpoint-nav in globals.css. */
const NAV_EXPANDED = "(min-width: 641px)";

/* The in-page sections the nav tracks, in document order. Request-access is
   deliberately absent — the CTA button already points there. */
const SECTIONS = [
  { id: "how-it-works", label: "How it works" },
  { id: "faq", label: "FAQ" },
] as const;

const rootHash = (hash: string) => ({ pathname: "/", hash });

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState("");

  /* Once off the top the bar goes translucent and casts a shadow, so content
     scrolling under it reads as underneath rather than colliding with it. */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Which section you are in. The bottom margin means a section only counts
     as current once it occupies the upper part of the viewport, so the
     highlight changes at roughly the point it feels like it should. */
  const visibleIds = useRef(new Set<string>());
  useEffect(() => {
    const elements = SECTIONS.map(({ id }) => document.getElementById(id));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleIds.current.add(entry.target.id);
          else visibleIds.current.delete(entry.target.id);
        }
        const current = SECTIONS.find(({ id }) => visibleIds.current.has(id));
        setActiveId(current ? current.id : "");
      },
      { rootMargin: "-80px 0px -55% 0px" },
    );

    for (const element of elements) {
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  /* The header CTA is only useful when no better one is on screen: the hero
     has its own button, and the request-access section has the actual form.
     It starts hidden because the page opens on the hero — which does mean a
     desktop visitor with no JavaScript never sees it, an acceptable trade
     when the form it points at needs JavaScript to submit anyway. */
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  useEffect(() => {
    const suppressors = ["top", "request-access"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const onScreen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target.id);
          else onScreen.delete(entry.target.id);
        }
        setIsCtaVisible(onScreen.size === 0);
      },
      /* Measured from below the bar, so a section counts as on screen only
         once it clears the header itself. */
      { rootMargin: "-72px 0px 0px 0px" },
    );

    for (const element of suppressors) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  /* While the mobile panel is open: Escape closes it, and so does growing the
     viewport past the breakpoint — otherwise the panel state would linger
     invisibly behind the desktop row. */
  useEffect(() => {
    if (!isMenuOpen) return;

    const close = () => setIsMenuOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const expanded = window.matchMedia(NAV_EXPANDED);
    const onBreakpointChange = () => {
      if (expanded.matches) close();
    };

    window.addEventListener("keydown", onKeyDown);
    expanded.addEventListener("change", onBreakpointChange);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      expanded.removeEventListener("change", onBreakpointChange);
    };
  }, [isMenuOpen]);

  /* Active and resting states are exclusive strings rather than overrides:
     nothing here merges conflicting utilities, so each property is set once.
     The sliding rule is a desktop affordance — in the stacked panel a
     full-width underline would read as a divider. */
  const linkClass = (isActive: boolean) =>
    [
      "relative py-3 text-body no-underline transition-colors duration-140 nav:py-0 nav:text-small",
      isActive ? "text-ink" : "text-ink-muted hover:text-ink",
      "nav:after:absolute nav:after:inset-x-0 nav:after:-bottom-1.5 nav:after:h-px nav:after:origin-left nav:after:bg-accent nav:after:transition-[scale] nav:after:duration-200 nav:after:ease-standard nav:after:content-['']",
      isActive
        ? "nav:after:scale-x-100"
        : "nav:after:scale-x-0 nav:hover:after:scale-x-100",
    ].join(" ");

  return (
    <header
      className={`sticky top-0 z-20 border-b border-rule transition-[background-color,box-shadow] duration-200 ease-standard ${
        isScrolled ? "bg-paper/85 shadow-card backdrop-blur-md" : "bg-paper"
      }`}
    >
      <div className="mx-auto flex min-h-16 w-full max-w-page items-center justify-between gap-4 px-gutter xs:min-h-18">
        <Link
          className="font-display text-body font-semibold tracking-wordmark whitespace-nowrap no-underline transition-colors duration-140 hover:text-accent xs:text-wordmark"
          href={rootHash("top")}
        >
          <Logo />
        </Link>

        {/* 44px hit target. `group` lets the bars react to aria-expanded. */}
        <button
          type="button"
          className="group inline-flex size-11 cursor-pointer items-center justify-center nav:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="site-nav"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {/* Three hairlines: this span plus its two pseudo-elements. The
              18px/1.5px icon metrics are off the spacing scale by nature. */}
          <span
            className="relative block h-[1.5px] w-[18px] bg-ink transition-colors duration-160 before:absolute before:left-0 before:h-[1.5px] before:w-[18px] before:-translate-y-1.5 before:bg-ink before:transition-[rotate,translate] before:duration-160 before:ease-standard after:absolute after:left-0 after:h-[1.5px] after:w-[18px] after:translate-y-1.5 after:bg-ink after:transition-[rotate,translate] after:duration-160 after:ease-standard after:content-[''] before:content-[''] group-aria-expanded:bg-transparent group-aria-expanded:before:translate-y-0 group-aria-expanded:before:rotate-45 group-aria-expanded:after:translate-y-0 group-aria-expanded:after:-rotate-45"
            aria-hidden="true"
          />
        </button>

        {/* Below `nav` this is a panel dropping out of the header; from `nav`
            up it is the inline row. */}
        <nav
          id="site-nav"
          className={`absolute top-full right-0 left-0 flex-col items-stretch gap-2 border-b border-rule bg-paper px-gutter pt-1 pb-5 nav:static nav:flex nav:flex-row nav:items-center nav:gap-inline-gap nav:border-0 nav:bg-transparent nav:p-0 ${
            isMenuOpen ? "flex" : "hidden"
          }`}
          aria-label="Primary"
        >
          {SECTIONS.map((section) => {
            const isActive = activeId === section.id;
            return (
              <Link
                key={section.id}
                className={linkClass(isActive)}
                href={rootHash(section.id)}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {section.label}
              </Link>
            );
          })}

          {/* The fade is desktop-only: in the collapsed panel this is the
              main action and must always be there. `visibility` rather than
              `hidden` keeps the row's width stable so nothing shifts, and
              takes the link out of the tab order while it is faded out.
              The transition itself lives in buttonClass. */}
          <Link
            className={buttonClass(
              "primary",
              "md",
              `w-full nav:w-auto nav:px-4.25 nav:py-2.5 ${
                isCtaVisible
                  ? "nav:visible nav:opacity-100"
                  : "nav:invisible nav:opacity-0"
              }`,
            )}
            href={rootHash("request-access")}
            onClick={() => setIsMenuOpen(false)}
          >
            Request access
          </Link>
        </nav>
      </div>
    </header>
  );
}
