"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { launchNavItems } from "@/lib/launch-content";
import { ProcureSourceMark } from "./procuresource-mark";

export function LaunchNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`stand-nav${scrolled ? " stand-nav--scrolled" : ""}`}
      aria-label="Primary navigation"
    >
      <Link className="stand-mark" href="/" aria-label="ProcureSource home">
        <ProcureSourceMark />
      </Link>

      <div className="stand-nav-pill">
        {launchNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
