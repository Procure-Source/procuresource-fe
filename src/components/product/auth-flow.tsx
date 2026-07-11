"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ArrowRight, Building2, KeyRound, LockKeyhole, Mail, ShieldCheck, ShoppingBag, Truck, UserRound } from "lucide-react";

import { saveSession, type ProductSession } from "@/lib/rfq-client";

const roles = [
  {
    id: "purchase_manager",
    label: "Purchaser",
    title: "Are you a purchaser?",
    icon: ShoppingBag,
    dashboard: "/pm/dashboard",
    description: "Raise RFQs and award cleanly.",
  },
  {
    id: "purchaser_admin",
    label: "Purchaser admin",
    title: "Purchaser admin?",
    icon: ShieldCheck,
    dashboard: "/pm/admin/dashboard",
    description: "Manage buyer users, limits, and approvals.",
  },
  {
    id: "supplier",
    label: "Supplier",
    title: "Are you a supplier?",
    icon: Truck,
    dashboard: "/supplier/dashboard",
    description: "Quote RFQs and track status.",
  },
  {
    id: "supplier_admin",
    label: "Supplier admin",
    title: "Supplier admin?",
    icon: Building2,
    dashboard: "/supplier/admin/dashboard",
    description: "Manage supplier users, proof, and quote controls.",
  },
] as const;

type AuthMode = "login" | "register";

export function ProductAuthFlow({ mode }: { mode: AuthMode }) {
  return (
    <Suspense>
      <ProductAuthFlowContent mode={mode} />
    </Suspense>
  );
}

function ProductAuthFlowContent({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params.get("role");
  const initialRole =
    roleParam === "supplier"
      ? "supplier"
      : roleParam === "supplier_admin"
        ? "supplier_admin"
        : roleParam === "purchaser_admin"
          ? "purchaser_admin"
          : "purchase_manager";
  const [role, setRole] = useState<ProductSession["role"]>(initialRole);
  const [form, setForm] = useState({
    contactName: "",
    email: "",
    companyName: "",
    password: "",
  });
  const [error, setError] = useState("");

  const selectedRole = useMemo(() => roles.find((item) => item.id === role) || roles[0], [role]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const contactName = form.contactName.trim();
    const companyName = form.companyName.trim();
    const email = form.email.trim();
    const password = form.password.trim();

    if ((mode === "register" && !contactName) || !companyName || !email || !password) {
      setError("Add your details before continuing.");
      return;
    }

    setError("");
    saveSession({
      role,
      contactName,
      companyName,
      email,
    });
    router.push(selectedRole.dashboard);
  }

  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#f4f3ed] p-3 sm:p-4">
      <div className="grid min-h-[calc(100vh-120px)] gap-4 lg:grid-cols-[minmax(420px,0.92fr)_minmax(0,1.08fr)]">
        <section className="flex items-center justify-center rounded-[44px] border border-white/80 bg-white/74 px-4 py-8 shadow-[0_24px_70px_rgba(61,48,40,0.08)] backdrop-blur-xl sm:px-7">
          <div className="w-full max-w-[560px]">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="inline-flex h-12 items-center rounded-full border border-[#d8d2c8] bg-[#fbfbf7] px-4 text-[15px] font-semibold text-[#352a24]">
                ProcureSource
              </Link>
              <Link
                href={mode === "login" ? "/register" : "/login"}
                className="inline-flex h-12 items-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[13px] font-semibold text-[#352a24] hover:bg-[#eef7ff]"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </Link>
            </div>

            <div className="mt-12">
              <p className="text-[13px] font-semibold text-[#0066cc]">
                {mode === "login" ? "Sign in" : "Create account"}
              </p>
              <h1 className="mt-3 text-[42px] font-medium leading-[1.02] text-[#111827]">
                {mode === "login" ? "Log in" : "Sign up"}
              </h1>
              <p className="mt-3 max-w-[380px] text-[13px] leading-5 text-[#5d6675]">Choose your role first.</p>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {roles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`flex min-h-[56px] items-center gap-3 rounded-full border px-3 py-2 text-left transition-colors ${
                    role === item.id
                      ? "border-[#0066cc] bg-[#eff7ff] shadow-[0_12px_28px_rgba(0,102,204,0.10)]"
                      : "border-[#d8dee9] bg-white hover:border-[#8bbdec]"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#0066cc]">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold text-[#111827]">{item.title}</span>
                    <span className="block text-[11px] leading-4 text-[#667085]">{item.label} access</span>
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-3">
              {mode === "register" && (
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-[#344054]">Contact name</span>
                  <span className="relative block">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0066cc]" />
                    <input
                      value={form.contactName}
                      onChange={(event) => setForm((value) => ({ ...value, contactName: event.target.value }))}
                      className="h-[52px] w-full rounded-full border border-[#d8dee9] bg-white pl-11 pr-4 text-[14px] outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                      placeholder="Full name"
                    />
                  </span>
                </label>
              )}
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-[#344054]">Work email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0066cc]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
                    className="h-[52px] w-full rounded-full border border-[#d8dee9] bg-white pl-11 pr-4 text-[14px] outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                    placeholder="name@company.com"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-[#344054]">Company</span>
                <span className="relative block">
                  <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0066cc]" />
                  <input
                    value={form.companyName}
                    onChange={(event) => setForm((value) => ({ ...value, companyName: event.target.value }))}
                    className="h-[52px] w-full rounded-full border border-[#d8dee9] bg-white pl-11 pr-4 text-[14px] outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                    placeholder={role.startsWith("supplier") ? "Supplier company" : "Purchasing company"}
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-[#344054]">Password</span>
                <span className="relative block">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0066cc]" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
                    className="h-[52px] w-full rounded-full border border-[#d8dee9] bg-white pl-11 pr-4 text-[14px] outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                      placeholder="Account password"
                  />
                </span>
              </label>

              <button
                type="submit"
                className="inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] text-[14px] font-semibold text-white shadow-[0_16px_36px_rgba(0,102,204,0.22)] hover:bg-[#1677e8]"
              >
                <LockKeyhole className="h-4 w-4" />
                {mode === "login" ? `Enter as ${selectedRole.label}` : `Create ${selectedRole.label} account`}
              </button>
              {error && (
                <p className="rounded-full bg-[#fff7ed] px-4 py-3 text-center text-[13px] font-semibold text-[#a34116]">
                  {error}
                </p>
              )}
            </form>

            <p className="mt-6 text-center text-[13px] text-[#667085]">
              {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
              <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-[#0066cc] hover:underline">
                {mode === "login" ? "Create one" : "Sign in"}
              </Link>
            </p>
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white p-5 shadow-[0_24px_70px_rgba(61,48,40,0.08)] sm:rounded-[44px] sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.34)_0,rgba(255,255,255,0.34)_1px,transparent_1px,transparent_24px),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(185,221,255,0.46)_42%,rgba(0,102,204,0.88)_100%)]" />
          <div
            className="pointer-events-none absolute right-6 top-24 hidden h-36 w-48 opacity-80 sm:block"
            aria-hidden="true"
            style={{
              backgroundImage: "radial-gradient(circle, #0066cc 2px, transparent 2.4px)",
              backgroundSize: "15px 15px",
            }}
          />

          <div className="relative flex min-h-[500px] flex-col justify-between sm:min-h-[560px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div>
                <p className="text-[13px] font-semibold text-[#0066cc]">ProcureSource account</p>
                <h2 className="mt-4 max-w-[520px] text-[36px] font-medium leading-[1.02] text-[#352a24] sm:text-[52px]">
                  One RFQ link, two clear paths.
                </h2>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:mt-0 lg:grid-cols-[230px_minmax(0,1fr)]">
              <div className="rounded-[30px] border border-[#d8dee9] bg-[#f7fbff]/92 p-5 shadow-[0_18px_46px_rgba(61,48,40,0.08)] backdrop-blur sm:rounded-[34px] sm:p-6">
                <p className="text-[46px] font-medium leading-none text-[#111827] sm:text-[58px]">RFQ</p>
                <p className="mt-1 text-[40px] font-medium leading-none text-[#9aa4b2] sm:text-[52px]">2026</p>
                <p className="mt-8 text-[13px] leading-5 text-[#5d6675] sm:mt-10">
                  Upload BOQ. Share link. Compare quotes. Export award.
                </p>
              </div>

              <div className="rounded-[30px] border border-[#d8dee9] bg-white/88 p-5 shadow-[0_18px_46px_rgba(61,48,40,0.08)] sm:rounded-[34px]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#eef7ff] px-3 py-1.5 text-[12px] font-semibold text-[#0066cc]">
                    {selectedRole.label} access
                  </span>
                  <ArrowRight className="h-5 w-5 text-[#0066cc]" />
                </div>
                <div className="mt-6 space-y-3 sm:mt-10">
                  {[
                    "Choose purchaser, supplier, or admin",
                    "Every quote stays tied to the RFQ",
                    "Documents stay attached",
                  ].map((item) => (
                    <div key={item} className="rounded-full border border-[#e1ddd5] bg-[#fbfbf7] px-4 py-3 text-[13px] font-semibold text-[#5d5148]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
