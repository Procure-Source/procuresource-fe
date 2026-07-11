import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Bell, Building2, KeyRound, ShieldCheck, UserRound } from "lucide-react";

import { ProductShell } from "@/components/product/product-shell";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Account settings for ProcureSource dashboard users.",
};

const sections = [
  {
    icon: UserRound,
    title: "Profile",
    body: "Name, work email, company role, and contact details used inside the product.",
    status: "Current",
  },
  {
    icon: Building2,
    title: "Company",
    body: "Company name, procurement role, supplier category, and region details.",
    status: "Review",
  },
  {
    icon: Bell,
    title: "Notifications",
    body: "RFQ alerts, quote updates, award notes, and document reminders.",
    status: "Active",
  },
  {
    icon: KeyRound,
    title: "Security",
    body: "Password, session handling, and production access controls.",
    status: "Protected",
  },
];

export default function SettingsPage() {
  return (
    <ProductShell showHeader={false} showFooter={false}>
      <main className="min-h-screen bg-[#e8e6df] p-3 text-[#352a24] sm:p-4">
        <section className="mx-auto min-h-[calc(100vh-32px)] max-w-[1100px] rounded-[42px] border border-white/80 bg-[#fbfbf7] p-5 shadow-[0_24px_70px_rgba(61,48,40,0.08)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/pm/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#ded8cf] bg-white px-4 text-[13px] font-semibold text-[#352a24] hover:bg-[#eef7ff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <span className="inline-flex h-11 items-center gap-2 rounded-full bg-[#eef7ff] px-4 text-[13px] font-semibold text-[#0066cc]">
              <ShieldCheck className="h-4 w-4" />
              Settings
            </span>
          </div>

          <div className="mt-10 max-w-[760px]">
            <p className="text-[12px] font-semibold text-[#0066cc]">Account settings</p>
            <h1 className="mt-3 text-[38px] font-medium leading-tight text-[#352a24] sm:text-[52px]">
              Keep account details, alerts, and security controls in one place.
            </h1>
            <p className="mt-4 text-[14px] leading-7 text-[#5d5148]">
              Manage profile details, company information, notification preferences, and security controls for the account.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <article key={section.title} className="rounded-[30px] border border-[#e1ddd5] bg-white p-5 shadow-[0_14px_36px_rgba(61,48,40,0.06)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef7ff] text-[#0066cc]">
                    <section.icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-[#fbfbf7] px-3 py-1.5 text-[11px] font-semibold text-[#0066cc]">{section.status}</span>
                </div>
                <h2 className="mt-5 text-[20px] font-semibold text-[#352a24]">{section.title}</h2>
                <p className="mt-2 text-[13px] leading-6 text-[#6c6258]">{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </ProductShell>
  );
}
