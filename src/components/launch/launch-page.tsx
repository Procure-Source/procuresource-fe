import { launchPages, type LaunchPageKey } from "@/lib/launch-content";
import { LaunchFooter } from "./launch-footer";
import { LaunchNav } from "./launch-nav";
import { LaunchSubscribe } from "./launch-subscribe";

type LaunchPageProps = {
  pageKey: LaunchPageKey;
};

export function LaunchPage({ pageKey }: LaunchPageProps) {
  const page = launchPages[pageKey];
  const showSubscribe = !["privacy", "terms", "status"].includes(pageKey);

  return (
    <main className="stand-site stand-inner-site">
      <LaunchNav />

      <section className="stand-subhero" aria-labelledby="stand-subtitle">
        <div className="stand-grain" aria-hidden="true" />
        <div className="stand-subglow" aria-hidden="true" />
        <p className="stand-kicker">{page.eyebrow}</p>
        <h1 id="stand-subtitle">{page.title}</h1>
        <p>{page.intro}</p>
        <div className="stand-subplace">{page.location}</div>
      </section>

      <section className="stand-ledger stand-ledger--inner" aria-label={`${page.eyebrow} notes`}>
        <div className="stand-ledger-label">{page.eyebrow}</div>
        <div className="stand-ledger-list">
          {page.rows.map((row) => (
            <article key={`${page.href}-${row.label}-${row.title}`} className="stand-ledger-row">
              <p>{row.label}</p>
              <div>
                <h2>{row.title}</h2>
                <span>{row.body}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showSubscribe ? <LaunchSubscribe compact /> : null}

      <LaunchFooter />
    </main>
  );
}
