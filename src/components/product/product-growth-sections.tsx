import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  FileSearch,
  MessageSquareText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const highlights = [
  {
    title: "BOQ reader",
    body: "Turn messy BOQs into clear quote lines.",
    icon: FileSearch,
    href: "/product",
    image: "/assets/product/feature-boq-reader.png",
    rows: ["Line items", "Unit basis", "Missing details"],
  },
  {
    title: "Supplier RFQ feed",
    body: "Show scope, deadline, and quote link.",
    icon: MessageSquareText,
    href: "/supplier/dashboard",
    image: "/assets/product/feature-supplier-feed.png",
    rows: ["RFQ raised alert", "Quote deadline", "Supplier response"],
  },
  {
    title: "Documents and proof",
    body: "Keep supplier proof beside the quote.",
    icon: ShieldCheck,
    href: "/status",
    image: "/assets/product/feature-verification-monitor.png",
    rows: ["Trade license", "VAT certificate", "Agency letter"],
  },
  {
    title: "Award summary",
    body: "Export price, proof, and award reason.",
    icon: BadgeCheck,
    href: "/rfqs",
    image: "/assets/product/feature-award-justification.png",
    rows: ["Price", "Compliance", "Lead time"],
  },
];

const helpfulChecks = [
  {
    icon: TrendingUp,
    title: "Price range check",
    body: "Flags unusual quote values.",
  },
  {
    icon: FileSearch,
    title: "Missing detail check",
    body: "Finds vague BOQ lines.",
  },
  {
    icon: BadgeCheck,
    title: "Supplier history view",
    body: "Shows response and document history.",
  },
  {
    icon: FileText,
    title: "Award note draft",
    body: "Drafts the award note.",
  },
  {
    icon: MessageSquareText,
    title: "Scope change message",
    body: "Sends scope updates clearly.",
  },
];

const metrics = [
  {
    value: "4-step",
    label: "buyer and supplier loop",
  },
  {
    value: "5 assists",
    label: "checks for price, proof, notes, and scope",
  },
  {
    value: "1 lane",
    label: "focused before expanding",
  },
];

export function ProductHighlightsSection() {
  return (
    <section className="bg-[#f7f7f1] text-[#111827]">
      <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:py-16">
        <div className="max-w-[620px]">
          <h2 className="text-[28px] font-semibold leading-tight sm:text-[38px]">What ProcureSource does</h2>
          <p className="mt-3 text-[13px] leading-5 text-[#667085]">Read BOQ. Invite suppliers. Compare replies. Keep the record.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <article key={item.title}>
              <div className="ps-glass-panel overflow-hidden rounded-[30px]">
                <div className="relative aspect-[1.08] overflow-hidden bg-[#eef7ff]">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#0066cc] text-white shadow-[0_12px_28px_rgba(0,102,204,0.24)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#0066cc] shadow-[0_12px_28px_rgba(61,48,40,0.12)]">
                    Live
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  {item.rows.map((row) => (
                    <div key={row} className="ps-glass-card rounded-[18px] px-3 py-2">
                      <span className="text-[12px] font-semibold text-[#5d5148]">{row}</span>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="mt-5 text-[18px] font-semibold text-[#111827]">{item.title}</h3>
              <p className="mt-2 min-h-[42px] text-[13px] leading-5 text-[#667085]">{item.body}</p>
              <Link href={item.href} className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#344054] hover:text-[#0066cc]">
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductHelpfulChecksSection() {
  return (
    <section className="bg-[#eef7ff] text-[#352a24]">
      <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div>
            <p className="text-[12px] font-semibold text-[#0066cc]">Helpful checks for every RFQ</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight sm:text-[36px]">
              Small checks. Clearer RFQs.
            </h2>
            <p className="mt-3 text-[13px] leading-5 text-[#5d5148]">Catch missing details before award.</p>
          </div>

          <div className="grid gap-3">
            {helpfulChecks.map((item) => (
              <article key={item.title} className="ps-glass-card grid gap-4 rounded-[26px] p-4 sm:grid-cols-[44px_minmax(0,1fr)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0066cc]">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#352a24]">{item.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-[#5d5148]">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductOutcomeMetricsSection() {
  return (
    <section className="bg-[#f7f7f1] text-[#111827]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1fr)] lg:py-16">
        <div>
          <h2 className="max-w-[680px] text-[25px] font-semibold leading-[1.18] sm:text-[34px]">
            The tool is simple. The records it creates are what matter.
          </h2>
          <p className="mt-5 max-w-[620px] text-[18px] font-semibold leading-[1.25] text-[#111827] sm:text-[24px]">
            Who quoted. What changed. Why the award happened.
          </p>
        </div>

        <div className="border-t border-[#d8d8d2]">
          {metrics.map((item) => (
            <div key={item.value} className="grid gap-4 border-b border-[#d8d8d2] py-7 sm:grid-cols-[minmax(170px,0.55fr)_minmax(0,1fr)] sm:items-start">
              <p className="whitespace-nowrap text-[42px] font-medium leading-none tracking-normal text-[#111827] sm:text-[58px]">{item.value}</p>
              <p className="text-[13px] leading-5 text-[#667085] sm:pt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductVisionSection() {
  return (
    <section className="bg-[#fbfbf7] text-[#111827]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.55fr)] lg:py-16">
        <div>
          <h2 className="text-[28px] font-semibold leading-tight sm:text-[36px]">Our vision</h2>
          <div className="mt-10 max-w-[340px] border-l border-[#111827]/20 pl-5">
            <ShieldCheck className="h-8 w-8 text-[#0066cc]" />
            <p className="mt-5 text-[14px] font-semibold text-[#111827]">ProcureSource principle</p>
            <p className="mt-1 text-[13px] leading-5 text-[#667085]">
              Verification should earn trust, not decorate a table.
            </p>
          </div>
        </div>

        <div>
          <div className="grid gap-8 md:grid-cols-2">
            <p className="text-[14px] leading-6 text-[#344054]">Procurement teams bring judgment. ProcureSource keeps the proof together.</p>
            <p className="text-[14px] leading-6 text-[#344054]">Start focused. Expand only when the basics are reliable.</p>
          </div>
          <div className="ps-glass-panel mt-10 overflow-hidden rounded-[30px]">
            <div className="relative aspect-[16/7] min-h-[220px] bg-[#eef7ff]">
              <Image
                src="/assets/product/vision-procurement-ops.png"
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <div className="grid gap-3 md:grid-cols-3">
                {["Supplier identity checked", "Quotes side by side", "Award history"].map((item) => (
                  <div key={item} className="ps-glass-card rounded-[22px] p-4">
                    <ShieldCheck className="h-5 w-5 text-[#0066cc]" />
                    <p className="mt-4 text-[13px] font-semibold leading-5 text-[#352a24]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="ps-glass-blue mt-5 rounded-[24px] p-4">
                <p className="text-[12px] font-semibold text-[#0066cc]">RFQ record quality</p>
                <div className="mt-4 grid gap-2">
                  {["BOQ clarity", "Supplier response quality", "Lead-time accuracy", "Compliance proof"].map((item, index) => (
                    <div key={item} className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3">
                      <span className="text-[12px] font-semibold text-[#5d5148]">{item}</span>
                      <span className="h-2 rounded-full bg-white">
                        <span
                          className="block h-2 rounded-full bg-[#0066cc]"
                          style={{ width: `${92 - index * 12}%` }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductCtaSection() {
  return (
    <section className="bg-[#f7f7f1] px-4 py-12 text-[#111827] sm:px-6 lg:py-16">
      <div className="ps-glass-blue mx-auto grid max-w-[1080px] gap-6 rounded-[34px] p-5 text-[#352a24] md:grid-cols-[minmax(0,0.9fr)_minmax(340px,1fr)]">
        <div className="flex min-h-[340px] flex-col justify-between px-2 py-4 sm:px-5">
          <div>
            <h2 className="max-w-[500px] text-[28px] font-semibold leading-tight sm:text-[38px]">
              Try the RFQ flow.
            </h2>
            <p className="mt-4 max-w-[360px] text-[13px] leading-5 text-[#5d5148]">Read BOQ, send link, compare replies, export award.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/product"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-semibold text-[#111827] hover:bg-[#eaf4ff]"
            >
              Open workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[#b9ddff] bg-white/60 px-4 text-[14px] font-semibold text-[#0066cc] hover:bg-white"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="ps-glass-panel min-h-[300px] rounded-[30px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-[#0066cc]">RFQ workspace</p>
              <h3 className="mt-1 text-[24px] font-semibold leading-tight text-[#352a24]">Start with a real BOQ.</h3>
            </div>
            <span className="rounded-full bg-[#eef7ff] px-3 py-1.5 text-[11px] font-semibold text-[#0066cc]">Ready</span>
          </div>

          <div className="mt-5 grid gap-3">
            {[
              ["1", "Upload BOQ"],
              ["2", "Share supplier link"],
              ["3", "Compare replies"],
              ["4", "Export award record"],
            ].map(([label, value]) => (
              <div key={value} className="ps-glass-card flex items-center gap-3 rounded-full px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0066cc] text-[12px] font-semibold text-white">
                  {label}
                </span>
                <p className="text-[13px] font-semibold text-[#352a24]">{value}</p>
              </div>
            ))}
          </div>

          <div className="ps-glass-blue mt-5 rounded-[22px] p-4">
            <p className="text-[12px] font-semibold text-[#0066cc]">Award note</p>
            <p className="mt-2 text-[13px] leading-5 text-[#5d5148]">Shortlist, keep exceptions visible, export.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
