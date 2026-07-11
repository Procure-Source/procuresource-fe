"use client";

import React from "react";
import {
  FileText,
  Award,
  Truck,
  ShieldCheck,
  Package,
  UserPlus,
  UserCheck,
  MessageSquare,
  Bell,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  quote_received: <FileText className="w-4 h-4" />,
  contract_awarded: <Award className="w-4 h-4" />,
  delivery_update: <Truck className="w-4 h-4" />,
  delivery_shipped: <Truck className="w-4 h-4" />,
  delivery_delivered: <Package className="w-4 h-4" />,
  user_verified: <ShieldCheck className="w-4 h-4" />,
  product_approved: <Package className="w-4 h-4" />,
  product_rejected: <Package className="w-4 h-4" />,
  connection_request: <UserPlus className="w-4 h-4" />,
  connection_accepted: <UserCheck className="w-4 h-4" />,
  connection_declined: <UserCheck className="w-4 h-4" />,
  new_message: <MessageSquare className="w-4 h-4" />,
  system: <Bell className="w-4 h-4" />,
};

const COLOR_MAP: Record<string, string> = {
  quote_received: "bg-blue-50 text-blue-600",
  contract_awarded: "bg-green-50 text-green-600",
  delivery_update: "bg-orange-50 text-orange-600",
  delivery_shipped: "bg-orange-50 text-orange-600",
  delivery_delivered: "bg-green-50 text-green-600",
  user_verified: "bg-green-50 text-green-600",
  product_approved: "bg-green-50 text-green-600",
  product_rejected: "bg-red-50 text-red-600",
  connection_request: "bg-purple-50 text-purple-600",
  connection_accepted: "bg-green-50 text-green-600",
  connection_declined: "bg-red-50 text-red-600",
  new_message: "bg-blue-50 text-blue-600",
  system: "bg-gray-50 text-gray-600",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface Props {
  notification: Notification;
  onClick: () => void;
  onMarkRead: () => void;
  compact?: boolean;
}

export default function NotificationItem({
  notification,
  onClick,
  onMarkRead,
  compact = false,
}: Props) {
  const icon = ICON_MAP[notification.type] || <Bell className="w-4 h-4" />;
  const colorClass = COLOR_MAP[notification.type] || "bg-gray-50 text-gray-600";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-[#f5f5f7]/60 transition-colors ${
        !notification.isRead ? "bg-[#0066cc]/[0.03]" : ""
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[13px] leading-snug ${
              !notification.isRead
                ? "font-semibold text-[#1d1d1f]"
                : "font-medium text-[#424245]"
            }`}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="w-2 h-2 bg-[#0066cc] rounded-full flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-[12px] text-[#86868b] leading-snug mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[11px] text-[#86868b]/70 mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}
