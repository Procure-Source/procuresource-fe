"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function UnreadBadge() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/messages/unread-count", {
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

  if (!user) return null;

  return (
    <Link
      href="/messages"
      className="relative p-2 text-[#1d1d1f] opacity-80 hover:opacity-100 transition-opacity"
      aria-label="Messages"
    >
      <MessageSquare className="w-[20px] h-[20px]" strokeWidth={1.8} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#0066cc] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
