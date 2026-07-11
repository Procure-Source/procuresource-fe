"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCheck, ExternalLink } from "lucide-react";
import NotificationItem from "./notification-item";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  onClose: () => void;
  onCountChange: (count: number) => void;
}

export default function NotificationDropdown({ onClose, onCountChange }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=10", {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        credentials: "same-origin",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      onCountChange(
        notifications.filter((n) => !n.isRead && n.id !== id).length
      );
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        credentials: "same-origin",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onCountChange(0);
    } catch {
      // silent
    }
  };

  const handleClick = (n: Notification) => {
    if (!n.isRead) handleMarkRead(n.id);
    if (n.link) {
      router.push(n.link);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-[18px] shadow-xl border border-[#d2d2d7]/40 overflow-hidden z-[100]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f5f5f7]">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-[12px] font-medium text-[#0066cc] hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[14px] text-[#86868b]">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onClick={() => handleClick(n)}
              onMarkRead={() => handleMarkRead(n.id)}
            />
          ))
        )}
      </div>

      <div className="border-t border-[#f5f5f7] px-5 py-3">
        <button
          onClick={() => {
            router.push("/notifications");
            onClose();
          }}
          className="w-full text-center text-[13px] font-medium text-[#0066cc] hover:underline flex items-center justify-center gap-1"
        >
          View all notifications
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
