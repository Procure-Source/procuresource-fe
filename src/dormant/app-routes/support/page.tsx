"use client";
import PageLayout from "@/components/page-layout";

export default function SupportPage() {
  return (
    <PageLayout title="Help Center" subtitle="Get support and find answers">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Getting Started", desc: "Learn how to use ProcureSource", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
          { title: "Manufacturers", desc: "Finding and connecting with brands", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
          { title: "Products & Specs", desc: "Searching and comparing products", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
          { title: "Certifications", desc: "Understanding certification verification", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map((item) => (
          <div key={item.title} className="bg-[#fbfbfd] rounded-[18px] p-6 hover:bg-[#f5f5f7] transition-colors cursor-pointer">
            <svg className="w-8 h-8 text-[#0066cc] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1">{item.title}</h3>
            <p className="text-[14px] text-[#86868b]">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 p-8 bg-[#f5f5f7] rounded-[18px] text-center">
        <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2">Need more help?</h3>
        <p className="text-[14px] text-[#86868b] mb-4">Contact our support team</p>
        <p className="text-[17px] text-[#0066cc]">support@procuresource.co</p>
      </div>
    </PageLayout>
  );
}
