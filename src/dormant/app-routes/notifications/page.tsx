"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { useAuth } from "@/lib/auth-context";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import NotificationItem from "@/components/notifications/notification-item";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (filter === "unread") params.set("unread", "true");

      const res = await fetch(`/api/notifications?${params}`, {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setTotalPages(data.pages || 1);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PUT",
      credentials: "same-origin",
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      credentials: "same-origin",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClick = (n: Notification) => {
    if (!n.isRead) handleMarkRead(n.id);
    if (n.link) router.push(n.link);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-8 h-8 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-grow pt-[120px] pb-20 px-4">
        <div className="max-w-[700px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0066cc]/10 rounded-2xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#0066cc]" />
              </div>
              <h1 className="text-[28px] font-bold text-[#1d1d1f]">Notifications</h1>
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-[#0066cc] hover:bg-[#0066cc]/5 rounded-full transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                  filter === f
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-white text-[#424245] border border-[#d2d2d7] hover:border-[#0066cc]"
                }`}
              >
                {f === "all" ? "All" : "Unread"}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="bg-white rounded-[24px] border border-[#d2d2d7]/30 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center">
                <Bell className="w-10 h-10 text-[#d2d2d7] mx-auto mb-3" />
                <p className="text-[15px] text-[#86868b]">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f5f5f7]">
                {notifications.map((n) => (
                  <div key={n.id} className="group relative">
                    <NotificationItem
                      notification={n}
                      onClick={() => handleClick(n)}
                      onMarkRead={() => handleMarkRead(n.id)}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-[#86868b] hover:text-[#ff3b30] transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-[13px] font-medium transition-all ${
                    page === p
                      ? "bg-[#0066cc] text-white"
                      : "bg-white text-[#424245] border border-[#d2d2d7] hover:border-[#0066cc]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
