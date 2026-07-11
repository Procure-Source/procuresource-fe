import Link from "next/link";

import { LaunchFooter } from "@/components/launch/launch-footer";
import { LaunchNav } from "@/components/launch/launch-nav";
import { LaunchSubscribe } from "@/components/launch/launch-subscribe";
import { faqs, launchNotes, standSections } from "@/lib/launch-content";

export default function Home() {
  return (
    <main className="stand-site">
      <LaunchNav />

      <section className="stand-hero" aria-labelledby="stand-title">
        <div className="stand-grain" aria-hidden="true" />
        <div className="stand-glow" aria-hidden="true" />

        <h1 id="stand-title" className="stand-title">
          <span>ProcureSource</span>
          <span>Private RFQ</span>
          <span>2026</span>
        </h1>

        <p className="stand-intro">
          A coming-soon procurement platform for contractors and consultants who
          need cleaner MEP buying records in the UAE. Public accounts stay closed
          while the private build is prepared.
        </p>

        <div className="stand-place" aria-label="Dubai UAE">
          DXB<span>.</span>UAE
        </div>

        <a className="stand-arrow" href="#private-launch" aria-label="Scroll to private launch">
          <span aria-hidden="true">&#8595;</span>
        </a>
      </section>

      <section id="private-launch" className="stand-notice" aria-labelledby="notice-title">
        <div className="stand-notice-shell">
          <div className="stand-notice-card">
            <h2 id="notice-title">ProcureSource public accounts are not open yet.</h2>
            <div>
              <p>
                We are opening the product carefully, with the first release focused on
                UAE MEP procurement teams.
              </p>
              <ul>
                <li>If you buy or specify MEP packages in the UAE, request access.</li>
                <li>If you support regional project procurement, send a specific note.</li>
                <li>If you are evaluating the market, the public launch target is 2026.</li>
                <li>The detailed product workflow, accounts, and APIs remain private.</li>
              </ul>
              <div className="stand-notice-actions" aria-label="Next actions">
                <a className="stand-button stand-button--primary" href="#launch-updates">
                  Join launch list
                </a>
                <Link className="stand-button" href="/status">
                  View status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LaunchSubscribe />

      <section className="stand-ledger" aria-label="ProcureSource launch notes">
        <div className="stand-ledger-label">Launch notes</div>
        <div className="stand-ledger-list">
          {standSections.map((section) => (
            <article key={section.id} id={section.id} className="stand-ledger-row">
              <p>{section.eyebrow}</p>
              <div>
                <h2>{section.title}</h2>
                <span>{section.body}</span>
                <Link href={section.href}>Read {section.eyebrow.toLowerCase()}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stand-notes" aria-labelledby="notes-title">
        <div>
          <p>Public posture</p>
          <h2 id="notes-title">Enough to understand the direction. Not enough to copy the system.</h2>
        </div>
        <div className="stand-note-grid">
          {launchNotes.map((note) => (
            <article key={note.label}>
              <p>{note.label}</p>
              <h3>{note.value}</h3>
              <span>{note.detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="stand-faq" aria-labelledby="faq-title">
        <div>
          <p>/FAQ</p>
          <h2 id="faq-title">Plain answers.</h2>
        </div>

        <div className="stand-faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                <span>{faq.question}</span>
                <b aria-hidden="true">+</b>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <LaunchFooter />
    </main>
  );
}
