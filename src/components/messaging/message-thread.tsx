"use client";

import React, { useEffect, useRef } from "react";
import { FileText } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  content: string;
  contentType: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
}

interface Props {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
  }

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageThread({ messages, currentUserId, loading }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[14px] text-[#86868b]">
          No messages yet. Send the first message!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
      {messages.map((msg) => {
        const isMine = msg.senderId === currentUserId;
        const isSystem = msg.contentType === "system";

        if (isSystem) {
          return (
            <div key={msg.id} className="text-center py-2">
              <p className="text-[12px] text-[#86868b] bg-[#f5f5f7] inline-block px-3 py-1 rounded-full">
                {msg.content}
              </p>
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-[18px] px-4 py-2.5 ${
                isMine
                  ? "bg-[#0066cc] text-white"
                  : "bg-[#f0f0f5] text-[#1d1d1f]"
              }`}
            >
              {msg.contentType === "file" && msg.fileUrl ? (
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-[14px] ${
                    isMine ? "text-white/90 hover:text-white" : "text-[#0066cc] hover:underline"
                  }`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  {msg.fileName || "File"}
                </a>
              ) : (
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              )}
              <p
                className={`text-[10px] mt-1 ${
                  isMine ? "text-white/60" : "text-[#86868b]"
                }`}
              >
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
