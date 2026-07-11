import Link from "next/link";

import { launchNavItems } from "@/lib/launch-content";
import { ProcureSourceMark } from "./procuresource-mark";

export function LaunchNav() {
  return (
    <nav className="stand-nav" aria-label="Primary navigation">
      <Link className="stand-mark" href="/" aria-label="ProcureSource home">
        <ProcureSourceMark />
        <span>ProcureSource</span>
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
