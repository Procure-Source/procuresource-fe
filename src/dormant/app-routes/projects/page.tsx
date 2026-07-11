"use client";

import PageLayout from "@/components/page-layout";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <PageLayout 
      title="Projects" 
      subtitle="Manage your MEP procurement projects"
      showCTA
      ctaText="Create Project"
      ctaHref="/projects/new"
    >
      <div className="bg-[#f5f5f7] rounded-[18px] p-12 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2">No projects yet</h3>
        <p className="text-[14px] text-[#86868b] mb-6 max-w-md mx-auto">
          Create your first project to start managing approved vendor lists, submittals, and RFQs.
        </p>
        <Link 
          href="/login"
          className="inline-flex h-[37px] items-center justify-center rounded-full bg-[#0066cc] px-[21px] text-[17px] font-normal text-white hover:bg-[#0077ed] transition-colors"
        >
          Sign in to get started
        </Link>
      </div>
    </PageLayout>
  );
}
