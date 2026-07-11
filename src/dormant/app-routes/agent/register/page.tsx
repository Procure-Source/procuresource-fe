"use client";
import PageLayout from "@/components/page-layout";
export default function Page() { return <PageLayout title="Join Agent Network" subtitle="Become an authorized distributor"><div className="max-w-lg mx-auto space-y-6">
  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Company Name</label><input type="text" className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px]" /></div>
  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Country</label><select className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px]"><option>UAE</option><option>Saudi Arabia</option><option>Qatar</option><option>Kuwait</option><option>Bahrain</option><option>Oman</option></select></div>
  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Contact Email</label><input type="email" className="w-full h-[44px] px-4 border border-[#d2d2d7] rounded-[8px] text-[14px]" /></div>
  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Brands Represented</label><textarea rows={3} className="w-full p-4 border border-[#d2d2d7] rounded-[8px] text-[14px]" /></div>
  <button className="w-full h-[44px] bg-[#0066cc] text-white rounded-full text-[17px] hover:bg-[#0077ed]">Submit Application</button>
</div></PageLayout>; }
