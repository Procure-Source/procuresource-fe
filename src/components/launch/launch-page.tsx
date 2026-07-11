import { launchPages, type LaunchPageKey } from "@/lib/launch-content";
import { ProductSection, ProductShell } from "@/components/product/product-shell";

type LaunchPageProps = {
  pageKey: LaunchPageKey;
};

export function LaunchPage({ pageKey }: LaunchPageProps) {
  const page = launchPages[pageKey];
  const isPolicyPage = pageKey === "privacy" || pageKey === "terms";

  return (
    <ProductShell>
      <ProductSection className="pb-4 pt-12 sm:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-[#d8d2c8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0066cc]">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 max-w-[900px] text-[40px] font-medium leading-[0.98] text-[#352a24] sm:text-[64px]">
              {page.title}
            </h1>
            <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-[#5d5148]">{page.intro}</p>
          </div>
          <div className="rounded-[28px] border border-[#ded8cf] bg-[#eef7ff] p-5 text-right">
            <p className="text-[12px] font-semibold text-[#0066cc]">Reference</p>
            <p className="mt-5 text-[36px] font-medium leading-none text-[#352a24]">{page.location}</p>
          </div>
        </div>
      </ProductSection>

      <ProductSection className="pt-4">
        <section
          className={`rounded-[32px] border border-[#ded8cf] bg-white p-4 shadow-[0_22px_70px_rgba(61,48,40,0.08)] sm:p-6 ${
            isPolicyPage ? "lg:p-8" : ""
          }`}
          aria-label={`${page.eyebrow} notes`}
        >
          <div className="grid gap-4">
            {page.rows.map((row) => (
              <article
                key={`${page.href}-${row.label}-${row.title}`}
                className="grid gap-4 rounded-[24px] border border-[#e1ddd5] bg-[#fbfbf7] p-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:p-5"
              >
                <p className="text-[12px] font-semibold text-[#0066cc]">{row.label}</p>
                <div>
                  <h2 className="text-[20px] font-medium leading-tight text-[#352a24] sm:text-[24px]">{row.title}</h2>
                  <p className="mt-3 text-[14px] leading-7 text-[#5d5148]">{row.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </ProductSection>

      <ProductSection className="pt-2">
        <div className="rounded-[28px] border border-[#b9ddff] bg-[#eef7ff] p-5">
          <p className="max-w-[900px] text-[22px] font-medium leading-snug text-[#352a24] sm:text-[30px]">
            {page.closing}
          </p>
        </div>
      </ProductSection>
    </ProductShell>
  );
}
