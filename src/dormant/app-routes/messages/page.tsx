"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { useAuth } from "@/lib/auth-context";
import { MessageSquare } from "lucide-react";
import ConversationList from "@/components/messaging/conversation-list";
import MessageThread from "@/components/messaging/message-thread";
import MessageInput from "@/components/messaging/message-input";

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

interface Message {
  id: string;
  senderId: string;
  content: string;
  contentType: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  // Poll for new conversations every 30s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [user, fetchConversations]);

  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages?limit=50`, {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
      // Mark as read
      fetch(`/api/conversations/${convId}/read`, {
        method: "PUT",
        credentials: "same-origin",
      }).catch(() => {});
    } catch {
      // silent
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      // Poll for new messages every 5s when active
      const interval = setInterval(() => fetchMessages(activeConvId), 5000);
      return () => clearInterval(interval);
    }
  }, [activeConvId, fetchMessages]);

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    // Update unread count locally
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = async (
    content: string,
    contentType?: string,
    fileUrl?: string,
    fileName?: string
  ) => {
    if (!activeConvId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, contentType, fileUrl, fileName }),
        credentials: "same-origin",
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        // Update conversation preview
        const preview = content.length > 80 ? content.substring(0, 80) + "..." : content;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? { ...c, lastMessagePreview: preview, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
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

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeName = activeConv
    ? activeConv.title || activeConv.participants.map((p) => p.companyName || p.fullName).join(", ")
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-grow pt-[100px] pb-4 px-4">
        <div className="max-w-[1100px] mx-auto h-[calc(100vh-140px)]">
          <div className="bg-white rounded-[24px] border border-[#d2d2d7]/30 shadow-sm overflow-hidden flex h-full">
            {/* Sidebar */}
            <div className="w-[320px] border-r border-[#f0f0f5] flex flex-col flex-shrink-0 hidden sm:flex">
              <div className="px-4 py-4 border-b border-[#f5f5f7]">
                <h2 className="text-[17px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#0066cc]" />
                  Messages
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  conversations={conversations}
                  activeId={activeConvId}
                  onSelect={handleSelectConversation}
                  loading={loadingConvs}
                />
              </div>
            </div>

            {/* Main thread area */}
            <div className="flex-1 flex flex-col min-w-0">
              {activeConvId ? (
                <>
                  {/* Thread header */}
                  <div className="px-4 sm:px-6 py-4 border-b border-[#f5f5f7] flex items-center gap-3">
                    {/* Mobile back button */}
                    <button
                      onClick={() => setActiveConvId(null)}
                      className="sm:hidden text-[#0066cc] text-[14px] font-medium"
                    >
                      Back
                    </button>
                    <div className="w-9 h-9 rounded-full bg-[#0066cc]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[13px] font-bold text-[#0066cc]">
                        {(activeName || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-[#1d1d1f] truncate">
                        {activeName}
                      </p>
                      {activeConv?.type !== "direct" && (
                        <p className="text-[11px] text-[#86868b]">
                          {activeConv?.type === "rfq" ? "RFQ Conversation" : "Contract Conversation"}
                        </p>
                      )}
                    </div>
                  </div>
                  <MessageThread
                    messages={messages}
                    currentUserId={user.id}
                    loading={loadingMessages}
                  />
                  <MessageInput onSend={handleSendMessage} disabled={sending} />
                </>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Mobile conversation list */}
                  <div className="sm:hidden flex-1 overflow-y-auto">
                    <div className="px-4 py-4 border-b border-[#f5f5f7]">
                      <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Messages</h2>
                    </div>
                    <ConversationList
                      conversations={conversations}
                      activeId={null}
                      onSelect={handleSelectConversation}
                      loading={loadingConvs}
                    />
                  </div>
                  {/* Desktop empty state */}
                  <div className="hidden sm:flex flex-1 items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-[#d2d2d7] mx-auto mb-3" />
                      <p className="text-[15px] text-[#86868b]">
                        Select a conversation to start messaging
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
