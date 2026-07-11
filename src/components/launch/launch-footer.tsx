import Link from "next/link";
import { Mail } from "lucide-react";

import { footerColumns } from "@/lib/launch-content";

export function LaunchFooter() {
  return (
    <footer id="contact" className="stand-footer">
      <div className="stand-footer-main">
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

        <div className="stand-footer-contact-panel">
          <p>Say hello</p>
          <a className="stand-footer-email" href="mailto:hello@procuresource.co">
            hello@procuresource.co
          </a>
          <div className="stand-footer-actions">
            <a className="stand-footer-icon" href="mailto:hello@procuresource.co" aria-label="Email ProcureSource">
              <Mail size={16} />
            </a>
            <Link href="/access">Request access</Link>
            <Link href="/advertise">Advertise</Link>
          </div>
          <div className="stand-footer-legal">
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms</Link>
            <span>Copyright 2026</span>
          </div>
        </div>

        <div className="stand-footer-wordmark" aria-hidden="true">
          <span>ProcureSource</span>
        </div>
      </div>
    </footer>
  );
}
