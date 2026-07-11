import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export type DashboardActionItem = {
  icon: LucideIcon;
  title: string;
  body?: string;
  href?: string;
  status?: string;
};

export type DashboardListItem = {
  title: string;
  meta?: string;
  status: string;
};

export function DashboardActionGrid({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: DashboardActionItem[];
}) {
  return (
    <section className="ps-glass-panel rounded-[30px] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold text-[#0066cc]">{eyebrow}</p>
          <h2 className="mt-2 text-[24px] font-medium leading-tight text-[#352a24]">{title}</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.slice(0, 4).map((item) => (
          <DashboardActionCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}

export function DashboardActionCard({ icon: Icon, title, href, status }: DashboardActionItem) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0066cc] text-white">
          <Icon className="h-5 w-5" />
        </span>
        {status && <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0066cc]">{status}</span>}
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-[#352a24]">{title}</h3>
      {href && (
        <span className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-[#eef7ff] px-3 text-[12px] font-semibold text-[#0066cc]">
          Open
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="ps-glass-card block rounded-[22px] p-4 transition-colors hover:border-[#b9ddff]">
        {content}
      </Link>
    );
  }

  return <article className="ps-glass-card rounded-[22px] p-4">{content}</article>;
}

export function DashboardListPanel({
  eyebrow,
  title,
  items,
  emptyText = "Nothing to review yet.",
}: {
  eyebrow: string;
  title: string;
  items: DashboardListItem[];
  emptyText?: string;
}) {
  return (
    <aside className="ps-glass-panel rounded-[30px] p-4 sm:p-5">
      <p className="text-[12px] font-semibold text-[#0066cc]">{eyebrow}</p>
      <h2 className="mt-2 text-[22px] font-medium leading-tight text-[#352a24]">{title}</h2>
      <div className="mt-4 space-y-2.5">
        {items.length === 0 ? (
          <div className="ps-glass-card rounded-[20px] p-4">
            <p className="text-[13px] font-semibold text-[#352a24]">{emptyText}</p>
          </div>
        ) : (
          items.map((item) => (
            <article key={item.title} className="ps-glass-card rounded-[20px] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-semibold text-[#352a24]">{item.title}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0066cc]">
                  {item.status}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}

export function DashboardTablePanel({
  eyebrow,
  title,
  headers,
  rows,
  emptyText = "No records yet.",
}: {
  eyebrow: string;
  title: string;
  headers: string[];
  rows: string[][];
  emptyText?: string;
}) {
  return (
    <section className="ps-glass-panel overflow-hidden rounded-[30px] p-4 sm:p-5">
      <p className="text-[12px] font-semibold text-[#0066cc]">{eyebrow}</p>
      <h2 className="mt-2 text-[24px] font-medium leading-tight text-[#352a24]">{title}</h2>
      {rows.length === 0 ? (
        <div className="ps-glass-card mt-4 rounded-[22px] p-4">
          <p className="text-[13px] font-semibold text-[#352a24]">{emptyText}</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[22px] border border-white/70 bg-white/48 backdrop-blur-xl">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
            <thead className="bg-white/58 text-[#6c6258]">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e4dc]">
              {rows.slice(0, 5).map((row) => (
                <tr key={row.join("-")} className="bg-white/52">
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`} className={`px-4 py-3 ${index === 0 ? "font-semibold text-[#352a24]" : "text-[#5d5148]"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function DashboardCompletionCard({
  title,
  items,
}: {
  title: string;
  body?: string;
  items: string[];
}) {
  return (
    <section className="ps-glass-blue rounded-[30px] p-4 sm:p-5">
      <h2 className="text-[22px] font-medium leading-tight text-[#352a24]">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {items.slice(0, 4).map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-full bg-white px-3 py-2 text-[13px] font-semibold text-[#5d5148]">
            <CheckCircle2 className="h-4 w-4 text-[#0066cc]" />
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
