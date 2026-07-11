"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/sections/navbar";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft } from "lucide-react";
import MessageThread from "@/components/messaging/message-thread";
import MessageInput from "@/components/messaging/message-input";

interface Message {
  id: string;
  senderId: string;
  content: string;
  contentType: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
}

interface Participant {
  id: string;
  fullName: string;
  companyName: string | null;
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [convTitle, setConvTitle] = useState("");
  const [convType, setConvType] = useState("direct");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch conversation details
  useEffect(() => {
    if (!user || !conversationId) return;
    fetch("/api/conversations", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((convs) => {
        const conv = convs.find((c: any) => c.id === conversationId);
        if (conv) {
          setConvTitle(
            conv.title ||
              conv.participants
                .map((p: Participant) => p.companyName || p.fullName)
                .join(", ")
          );
          setConvType(conv.type);
        }
      })
      .catch(() => {});
  }, [user, conversationId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages?limit=50`,
        { credentials: "same-origin" }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
      // Mark as read
      fetch(`/api/conversations/${conversationId}/read`, {
        method: "PUT",
        credentials: "same-origin",
      }).catch(() => {});
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (user && conversationId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [user, conversationId, fetchMessages]);

  const handleSend = async (
    content: string,
    contentType?: string,
    fileUrl?: string,
    fileName?: string
  ) => {
    setSending(true);
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, contentType, fileUrl, fileName }),
          credentials: "same-origin",
        }
      );
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
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
      <main className="flex-grow pt-[100px] pb-4 px-4">
        <div className="max-w-[800px] mx-auto h-[calc(100vh-140px)]">
          <div className="bg-white rounded-[24px] border border-[#d2d2d7]/30 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-[#f5f5f7] flex items-center gap-3">
              <button
                onClick={() => router.push("/messages")}
                className="p-1 text-[#0066cc] hover:bg-[#0066cc]/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-[#0066cc]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[13px] font-bold text-[#0066cc]">
                  {(convTitle || "?").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-[#1d1d1f] truncate">
                  {convTitle || "Conversation"}
                </p>
                {convType !== "direct" && (
                  <p className="text-[11px] text-[#86868b]">
                    {convType === "rfq" ? "RFQ Conversation" : "Contract Conversation"}
                  </p>
                )}
              </div>
            </div>
            <MessageThread
              messages={messages}
              currentUserId={user.id}
              loading={loading}
            />
            <MessageInput onSend={handleSend} disabled={sending} />
          </div>
        </div>
      </main>
    </div>
  );
}
