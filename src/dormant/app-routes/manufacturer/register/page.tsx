"use client";
import PageLayout from "@/components/page-layout";
export default function Page() { return <PageLayout title="List Your Brand" subtitle="Partner with ProcureSource"><div className="max-w-lg mx-auto space-y-6">
  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Company Name</label><input type="text" className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px]" /></div>
  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Website</label><input type="url" className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px]" /></div>
  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Contact Email</label><input type="email" className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px]" /></div>
  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Product Categories</label><select className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px]"><option>HVAC</option><option>Electrical</option><option>Plumbing</option><option>Fire Protection</option></select></div>
  <button className="w-full h-[44px] bg-[#0066cc] text-white rounded-full text-[17px] hover:bg-[#0077ed]">Submit Application</button>
</div></PageLayout>; }
