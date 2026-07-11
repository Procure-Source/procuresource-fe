"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Building2, CalendarClock, MapPin, PackageCheck, type LucideIcon } from "lucide-react";

import {
  ALERT_UPDATED_EVENT,
  fetchSupplierFeed,
  getStoredSupplierAlerts,
} from "@/lib/alerts-client";
import type { SupplierAlertItem } from "@/lib/alerts";
import { RFQ_UPDATED_EVENT } from "@/lib/rfq-client";

export function SupplierFeed() {
  const [alerts, setAlerts] = useState<SupplierAlertItem[]>([]);

  useEffect(() => {
    function refreshFeed() {
      setAlerts(getStoredSupplierAlerts());
      fetchSupplierFeed()
        .then(setAlerts)
        .catch(() => setAlerts(getStoredSupplierAlerts()));
    }

    const handle = window.requestAnimationFrame(refreshFeed);
    const interval = window.setInterval(refreshFeed, 15000);
    window.addEventListener(ALERT_UPDATED_EVENT, refreshFeed);
    window.addEventListener(RFQ_UPDATED_EVENT, refreshFeed);
    window.addEventListener("storage", refreshFeed);
    window.addEventListener("focus", refreshFeed);

    return () => {
      window.cancelAnimationFrame(handle);
      window.clearInterval(interval);
      window.removeEventListener(ALERT_UPDATED_EVENT, refreshFeed);
      window.removeEventListener(RFQ_UPDATED_EVENT, refreshFeed);
      window.removeEventListener("storage", refreshFeed);
      window.removeEventListener("focus", refreshFeed);
    };
  }, []);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <article className="ps-glass-panel rounded-[30px] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef7ff]">
                <Bell className="h-6 w-6 text-[#0066cc]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#0066cc]">RFQ alerts</p>
                <h2 className="mt-2 text-[24px] font-semibold text-[#352a24]">No RFQs yet</h2>
              </div>
            </div>
          </article>
        ) : (
          alerts.map((alert) => (
            <article key={alert.id} className="ps-glass-panel rounded-[30px] p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0066cc]">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold text-[#0066cc]">{alert.label}</p>
                    <span className="rounded-full bg-[#f2f7fb] px-2 py-1 text-[11px] text-[#6c6258]">
                      {formatCreatedAt(alert.createdAt)}
                    </span>
                    <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-[11px] text-[#16803b]">{alert.metricSystem}</span>
                  </div>
                  <h2 className="mt-2 text-[24px] font-semibold text-[#352a24]">{alert.title}</h2>
                  <p className="mt-2 text-[13px] leading-5 text-[#6c6258]">
                    {alert.projectName}. {alert.lineItemCount} line items.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <FeedMetric icon={PackageCheck} label="Category" value={alert.category} />
                    <FeedMetric icon={MapPin} label="Region" value={alert.region} />
                    <FeedMetric icon={CalendarClock} label="Due" value={formatDueDate(alert.dueDate)} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={alert.actionHref}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-[#0066cc] px-4 text-[14px] font-semibold text-white hover:bg-[#1677e8]"
                    >
                      {alert.actionLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <aside className="ps-glass-panel rounded-[30px] p-4 lg:self-start">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef7ff]">
            <Building2 className="h-5 w-5 text-[#0066cc]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#352a24]">Supplier response center</p>
            <p className="text-[12px] text-[#766b62]">Live RFQ feed</p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          <SideStat label="Open alerts" value={String(alerts.length)} />
          <SideStat label="Next due" value={formatNextDueDate(alerts)} />
          <SideStat label="Action" value={alerts.length > 0 ? "Open RFQ" : "No action"} />
        </div>

      </aside>
    </div>
  );
}

function FeedMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="ps-glass-card rounded-[18px] p-3">
      <Icon className="h-4 w-4 text-[#0066cc]" />
      <p className="mt-2 text-[11px] font-semibold text-[#766b62]">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-[#352a24]">{value}</p>
    </div>
  );
}

function SideStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ps-glass-card rounded-[18px] p-3">
      <p className="text-[11px] font-semibold text-[#766b62]">{label}</p>
      <p className="mt-1 text-[18px] font-semibold text-[#352a24]">{value}</p>
    </div>
  );
}

function formatDueDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "48h";

  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCreatedAt(value: string) {
  const createdAt = new Date(value).getTime();
  if (!Number.isFinite(createdAt)) return "New";

  const minutes = Math.max(0, Math.round((Date.now() - createdAt) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

function formatNextDueDate(alerts: SupplierAlertItem[]) {
  const next = alerts
    .map((alert) => alert.dueDate)
    .filter((dueDate) => Number.isFinite(new Date(dueDate).getTime()))
    .sort((a, b) => Date.parse(a) - Date.parse(b))[0];

  return next ? formatDueDate(next) : "No due date";
}
