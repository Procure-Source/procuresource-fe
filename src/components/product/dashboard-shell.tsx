import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  Bell,
  ChevronDown,
  FileCheck2,
  FileText,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  ShieldCheck,
  UploadCloud,
  UserRound,
} from "lucide-react";

import { ProcureSourceMark } from "@/components/launch/procuresource-mark";
import { ProductShell } from "@/components/product/product-shell";

type DashboardRole = "purchaser" | "supplier" | "admin";
type DashboardNavItem = { href: string; label: string; icon: LucideIcon };
type DashboardQuickAction = { href: string; label: string; icon: LucideIcon };

const roleLinks: Record<DashboardRole, DashboardNavItem[]> = {
  purchaser: [
    { href: "/pm/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/pm/dashboard/rfqs", label: "RFQs", icon: UploadCloud },
    { href: "/pm/dashboard/review", label: "Quote review", icon: ShieldCheck },
    { href: "/pm/dashboard/awards", label: "Awards", icon: Award },
    { href: "/pm/admin/dashboard", label: "Org admin", icon: KeyRound },
  ],
  supplier: [
    { href: "/supplier/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/supplier/dashboard/alerts", label: "RFQ alerts", icon: Bell },
    { href: "/supplier/dashboard/quotes", label: "Quotes", icon: FileCheck2 },
    { href: "/supplier/dashboard/readiness", label: "Documents", icon: BadgeCheck },
    { href: "/supplier/admin/dashboard", label: "Org admin", icon: KeyRound },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/dashboard/documents", label: "Documents", icon: FileText },
    { href: "/admin/dashboard/access", label: "Access control", icon: KeyRound },
    { href: "/admin/dashboard/review", label: "Review queue", icon: ListChecks },
  ],
};

const adminAccessLinks: DashboardNavItem[] = [
  { href: "/pm/dashboard", label: "Purchaser view", icon: UploadCloud },
  { href: "/pm/admin/dashboard", label: "Purchaser admin", icon: KeyRound },
  { href: "/supplier/dashboard", label: "Supplier view", icon: Bell },
  { href: "/supplier/admin/dashboard", label: "Supplier admin", icon: BadgeCheck },
  { href: "/admin/dashboard/access", label: "Access map", icon: KeyRound },
];

const quickActions: Record<DashboardRole, DashboardQuickAction> = {
  purchaser: { href: "/pm/dashboard/rfqs", label: "New RFQ", icon: UploadCloud },
  supplier: { href: "/supplier/dashboard/alerts", label: "Open alerts", icon: Bell },
  admin: { href: "/admin/dashboard/documents", label: "Review docs", icon: FileText },
};

export function DashboardShell({
  role,
  currentHref,
  eyebrow,
  title,
  children,
}: {
  role: DashboardRole;
  currentHref?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const primaryLinks = roleLinks[role];
  const accessLinks = role === "admin" ? adminAccessLinks : [];
  const quickAction = quickActions[role];
  const roleLabel = role === "purchaser" ? "Purchaser" : role === "supplier" ? "Supplier" : "Verification";
  const roleAccountLabel = role === "admin" ? "all-access account" : `${role} account`;

  return (
    <ProductShell showFooter={false} showHeader={false}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_18%_10%,rgba(185,221,255,0.68),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.92),transparent_26%),linear-gradient(135deg,#fbfbf7_0%,#ece8df_50%,#eef7ff_100%)] p-2 text-[#352a24] sm:p-4">
        <div className="mx-auto grid min-h-[calc(100vh-16px)] max-w-[1520px] gap-3 sm:min-h-[calc(100vh-32px)] sm:gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="ps-glass-panel hidden flex-col rounded-[34px] p-4 lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-32px)]">
            <Link href="/" className="flex h-14 items-center gap-3 rounded-full border border-[#d8d2c8] bg-[#fbfbf7] pl-2 pr-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72)]">
              <ProcureSourceMark className="h-9 w-9" />
              <div>
                <p className="text-[15px] font-semibold text-[#352a24]">ProcureSource</p>
                <p className="text-[11px] text-[#766b62]">{roleAccountLabel}</p>
              </div>
            </Link>

            <nav className="mt-6 grid gap-5" aria-label={`${role} dashboard navigation`}>
              <DashboardNavSection title="Workspace" items={primaryLinks} currentHref={currentHref} />
              {accessLinks.length > 0 && <DashboardNavSection title="Role views" items={accessLinks} currentHref={currentHref} />}
            </nav>

            <div className="mt-auto hidden pt-8 lg:block">
              <Link
                href="/login"
                className="flex h-11 items-center gap-3 rounded-full border border-[#ded8cf] px-3 text-[13px] font-semibold text-[#352a24] hover:bg-[#fbfbf7]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f3ed]">
                  <LogOut className="h-4 w-4" />
                </span>
                Sign out
              </Link>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-3 grid gap-2 lg:hidden">
              <div className="ps-glass-panel flex min-h-14 items-center justify-between gap-3 rounded-full p-2">
                <Link href="/" className="flex min-w-0 items-center gap-2 rounded-full bg-[#fbfbf7] py-1 pl-1 pr-3">
                  <ProcureSourceMark className="h-9 w-9 shrink-0" />
                  <span className="truncate text-[14px] font-semibold text-[#352a24]">ProcureSource</span>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={quickAction.href}
                    className="hidden h-10 items-center gap-2 rounded-full bg-[#0066cc] px-3 text-[12px] font-semibold text-white min-[440px]:inline-flex"
                  >
                    <quickAction.icon className="h-4 w-4" />
                    {quickAction.label}
                  </Link>
                  <Link
                    href="/settings"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ded8cf] bg-white text-[#352a24]"
                    aria-label="Account settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ded8cf] bg-white text-[#352a24]"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <nav
                className="ps-glass-panel flex gap-2 overflow-x-auto rounded-full p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label={`${role} dashboard navigation`}
              >
                {[...primaryLinks, ...accessLinks].map((item) => {
                  const isActive = currentHref === item.href;

                  return (
                    <Link
                      key={`mobile-${item.href}-${item.label}`}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-[12px] font-semibold transition-colors ${
                        isActive
                          ? "bg-[#0066cc] text-white shadow-[0_10px_24px_rgba(0,102,204,0.18)]"
                          : "text-[#5d5148] hover:bg-[#eef7ff] hover:text-[#0066cc]"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="ps-glass-panel flex min-h-14 items-center gap-1 rounded-full p-1">
                <span className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[13px] font-semibold text-white">
                  <LayoutDashboard className="h-4 w-4" />
                  {roleLabel} dashboard
                </span>
                <Link href={quickAction.href} className="hidden h-11 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-[#0066cc] hover:bg-[#eef7ff] sm:inline-flex">
                  <quickAction.icon className="h-4 w-4" />
                  {quickAction.label}
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/settings"
                  className="ps-glass-card flex h-12 w-12 items-center justify-center rounded-full text-[#352a24]"
                  aria-label="Account settings"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <div className="ps-glass-card flex h-12 items-center gap-3 rounded-full pl-2 pr-2 sm:pr-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef7ff] text-[#0066cc]">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div className="hidden sm:block">
                    <p className="text-[13px] font-semibold text-[#352a24]">{roleLabel} workspace</p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-[#766b62] sm:block" />
                </div>
              </div>
            </div>

            <div className="ps-glass-panel rounded-[30px] p-4 shadow-[0_24px_80px_rgba(61,48,40,0.08)] sm:rounded-[38px] sm:p-6">
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold text-[#0066cc]">{eyebrow}</p>
                  <h1 className="mt-3 max-w-[620px] text-[28px] font-medium leading-[1.06] text-[#352a24] sm:text-[36px]">
                    {title}
                  </h1>
                </div>
              </header>

              <div className="mt-6">{children}</div>
            </div>
          </section>
        </div>
      </main>
    </ProductShell>
  );
}

function DashboardNavSection({
  title,
  items,
  currentHref,
}: {
  title: string;
  items: DashboardNavItem[];
  currentHref?: string;
}) {
  return (
    <div>
      <p className="px-3 text-[11px] font-semibold text-[#766b62]">{title}</p>
      <div className="mt-2 grid gap-1.5">
        {items.map((item) => {
          const isActive = currentHref === item.href;

          return (
            <Link
              key={`${title}-${item.href}-${item.label}`}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex h-12 items-center gap-3 rounded-full px-3 text-[13px] font-semibold transition-colors ${
                isActive
                  ? "bg-white text-[#0066cc] shadow-[0_12px_28px_rgba(61,48,40,0.08)]"
                  : "text-[#5d5148] hover:bg-white hover:text-[#0066cc] hover:shadow-[0_12px_28px_rgba(61,48,40,0.06)]"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[#0066cc] ${
                  isActive ? "bg-[#eef7ff]" : "bg-[#f4f3ed] group-hover:bg-[#eef7ff]"
                }`}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardMetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  period?: string;
}) {
  return (
    <article className="ps-glass-card flex min-h-[112px] flex-col rounded-[24px] p-4 sm:min-h-[122px] sm:rounded-[26px]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/78 text-[#0066cc] shadow-[inset_0_0_0_1px_rgba(216,210,200,0.62)]">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <h2 className="mt-4 max-w-[220px] text-[14px] font-semibold leading-tight text-[#352a24]">{label}</h2>

      <p className="mt-auto pt-4 text-[30px] font-semibold leading-none text-[#111827]">{value}</p>
    </article>
  );
}
