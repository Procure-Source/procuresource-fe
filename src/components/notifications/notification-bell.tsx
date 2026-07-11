"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import NotificationDropdown from "./notification-dropdown";

export default function NotificationBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications/count", {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count || 0);
      }
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-[#1d1d1f] opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Notifications"
      >
        <Bell className="w-[20px] h-[20px]" strokeWidth={1.8} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#ff3b30] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          onClose={() => setOpen(false)}
          onCountChange={setCount}
        />
      )}
    </div>
  );
}
