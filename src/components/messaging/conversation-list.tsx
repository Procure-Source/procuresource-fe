"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

interface Participant {
  id: string;
  fullName: string;
  companyName: string | null;
}

interface Conversation {
  id: string;
  type: string;
  title: string | null;
  participants: Participant[];
  lastMessageAt: string;
  lastMessagePreview: string | null;
  unreadCount: number;
}

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ConversationList({ conversations, activeId, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <MessageSquare className="w-10 h-10 text-[#d2d2d7] mx-auto mb-3" />
        <p className="text-[14px] text-[#86868b]">No conversations yet</p>
        <p className="text-[12px] text-[#86868b]/70 mt-1">
          Start a conversation from a supplier or contract page
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#f5f5f7]">
      {conversations.map((c) => {
        const displayName = c.title || c.participants.map((p) => p.companyName || p.fullName).join(", ");
        const isActive = c.id === activeId;

        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${
              isActive ? "bg-[#0066cc]/[0.06]" : "hover:bg-[#f5f5f7]/60"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[14px] font-bold text-[#0066cc]">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-[14px] truncate ${c.unreadCount > 0 ? "font-semibold text-[#1d1d1f]" : "font-medium text-[#424245]"}`}>
                  {displayName}
                </p>
                <span className="text-[11px] text-[#86868b] flex-shrink-0">
                  {timeAgo(c.lastMessageAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-[12px] text-[#86868b] truncate">
                  {c.lastMessagePreview || "No messages yet"}
                </p>
                {c.unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-[#0066cc] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 flex-shrink-0">
                    {c.unreadCount > 99 ? "99+" : c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
