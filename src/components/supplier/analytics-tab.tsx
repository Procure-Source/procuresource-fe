"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Target, Package, Loader2 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

const COLORS = ["#0066cc", "#30d158", "#ff2d55", "#ff9500"];

export default function SupplierAnalyticsTab({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await fetch("/api/supplier/analytics", {
        credentials: "same-origin",
      });
      if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#f5f5f7] rounded-[24px] p-12 text-center">
        <p className="text-[17px] text-[#1d1d1f]">Unable to load analytics</p>
      </div>
    );
  }

  const pieData = [
    { name: "Accepted", value: data.quoteBreakdown.accepted },
    { name: "Pending", value: data.quoteBreakdown.pending },
    { name: "Rejected", value: data.quoteBreakdown.rejected },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[24px] font-bold text-[#1d1d1f]">Analytics & Insights</h2>
        <p className="text-[15px] text-[#86868b] mt-1">Track your performance and business growth</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><Target className="w-5 h-5 text-[#0066cc]" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Total Quotes</span>
          </div>
          <p className="text-[32px] font-bold text-[#1d1d1f]">{data.summary.totalQuotes}</p>
        </div>
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-[#30d158]" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Win Rate</span>
          </div>
          <p className="text-[32px] font-bold text-[#30d158]">{data.summary.winRate}%</p>
        </div>
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="text-[32px] font-bold text-[#1d1d1f]">${data.summary.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg"><Package className="w-5 h-5 text-amber-600" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Products</span>
          </div>
          <p className="text-[32px] font-bold text-[#1d1d1f]">{data.summary.totalProducts}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote Win Rate Over Time */}
        <div className="bg-white rounded-[20px] p-6 border border-[#d2d2d7]/30 shadow-sm">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Quote Activity</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.quoteHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#86868b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#86868b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e8e8ed", fontSize: 13 }}
                />
                <Bar dataKey="total" name="Total Quotes" fill="#0066cc" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accepted" name="Won" fill="#30d158" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-[20px] p-6 border border-[#d2d2d7]/30 shadow-sm">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Revenue Trend</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#86868b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#86868b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e8e8ed", fontSize: 13 }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#30d158" strokeWidth={2} dot={{ r: 4, fill: "#30d158" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quote Breakdown Pie */}
        <div className="bg-white rounded-[20px] p-6 border border-[#d2d2d7]/30 shadow-sm">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Quote Status Breakdown</h3>
          {pieData.length > 0 ? (
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e8e8ed", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#86868b] text-[14px]">No quote data yet</div>
          )}
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-[12px]"><div className="w-3 h-3 rounded-sm bg-[#0066cc]" />Accepted</div>
            <div className="flex items-center gap-2 text-[12px]"><div className="w-3 h-3 rounded-sm bg-[#30d158]" />Pending</div>
            <div className="flex items-center gap-2 text-[12px]"><div className="w-3 h-3 rounded-sm bg-[#ff2d55]" />Rejected</div>
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-white rounded-[20px] p-6 border border-[#d2d2d7]/30 shadow-sm">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Product Catalog Status</h3>
          <div className="space-y-4 mt-6">
            {[
              { label: "Approved", value: data.productStatus.approved, color: "#30d158", bg: "bg-green-50" },
              { label: "Pending Review", value: data.productStatus.pending, color: "#ff9500", bg: "bg-amber-50" },
              { label: "Rejected", value: data.productStatus.rejected, color: "#ff2d55", bg: "bg-red-50" },
            ].map((item) => {
              const total = data.summary.totalProducts || 1;
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-[#424245] font-medium">{item.label}</span>
                    <span className="text-[#86868b]">{item.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
