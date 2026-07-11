import Link from "next/link";

import { footerColumns } from "@/lib/launch-content";
import { ProcureSourceMark } from "./procuresource-mark";

export function LaunchFooter() {
  return (
    <footer id="contact" className="stand-footer">
      <div className="stand-footer-main">
        <div>
          <div className="stand-footer-brand">
            <ProcureSourceMark />
            <b>ProcureSource</b>
          </div>
          <p>
            A UAE-first MEP RFQ platform is being built in private. If you
            should be in the first access group, send a short note.
          </p>
          <p className="stand-footer-origin">
            Built from Dubai to the world.
          </p>
          <p className="stand-footer-company">
            Grow Technology Services FZ LLC
          </p>
          <div className="stand-footer-contact">
            <a href="mailto:hello@procuresource.co">hello@procuresource.co</a>
            <a href="mailto:support@procuresource.co">support@procuresource.co</a>
          </div>
        </div>

        <div className="stand-footer-links">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
