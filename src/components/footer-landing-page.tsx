import Link from "next/link";
import PageLayout from "@/components/page-layout";
import type { FooterLandingPage } from "@/lib/footer-pages";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";

export default function FooterLandingPage({ page }: { page: FooterLandingPage }) {
  return (
    <PageLayout title={page.title} subtitle={page.subtitle} showBackButton={true}>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="rounded-[22px] border border-[#d2d2d7] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e8f4ff] px-3 py-1.5 text-[12px] font-semibold text-[#0066cc]">
            <MapPin className="h-4 w-4" />
            {page.primaryHub}
          </div>
          <p className="text-[17px] leading-8 text-[#424245]">{page.summary}</p>
          <Link
            href={page.ctaHref}
            className="mt-7 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#0077ed]"
          >
            {page.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[22px] border border-[#d2d2d7] bg-[#fbfbfd] p-6 sm:p-8">
          <h2 className="mb-5 text-[21px] font-bold text-[#1d1d1f]">What this page covers</h2>
          <ul className="space-y-4">
            {page.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-[15px] leading-6 text-[#424245]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0066cc]" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageLayout>
  );
}
