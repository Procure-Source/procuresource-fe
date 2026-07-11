"use client";

import { Clock, Package, Truck, CheckCircle2, Shield, Wrench } from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  pending: { color: "text-gray-500", bg: "bg-gray-100", icon: <Clock className="w-4 h-4" /> },
  ordered: { color: "text-blue-600", bg: "bg-blue-100", icon: <Package className="w-4 h-4" /> },
  in_production: { color: "text-indigo-600", bg: "bg-indigo-100", icon: <Wrench className="w-4 h-4" /> },
  in_transit: { color: "text-amber-600", bg: "bg-amber-100", icon: <Truck className="w-4 h-4" /> },
  customs_clearance: { color: "text-orange-600", bg: "bg-orange-100", icon: <Shield className="w-4 h-4" /> },
  delivered: { color: "text-green-600", bg: "bg-green-100", icon: <CheckCircle2 className="w-4 h-4" /> },
  installed: { color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 className="w-4 h-4" /> },
};

interface DeliveryEvent {
  id: string;
  event_type: string;
  title: string;
  description?: string;
  old_status?: string;
  new_status?: string;
  created_at: string;
  creator?: { full_name: string };
}

export default function DeliveryTimeline({ events }: { events: DeliveryEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-[#86868b] text-sm">
        No delivery events yet.
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-[#d2d2d7]/50" />

      <div className="space-y-4">
        {sorted.map((event) => {
          const statusCfg = event.new_status ? STATUS_CONFIG[event.new_status] : null;

          return (
            <div key={event.id} className="relative flex gap-4 pl-1">
              {/* Dot */}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                statusCfg ? statusCfg.bg : "bg-[#f5f5f7]"
              }`}>
                <span className={statusCfg?.color || "text-[#86868b]"}>
                  {statusCfg?.icon || <Clock className="w-4 h-4" />}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white rounded-2xl p-4 border border-[#d2d2d7]/30 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f]">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-[#86868b] mt-1">{event.description}</p>
                    )}
                    {event.new_status && (
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        statusCfg?.bg || "bg-gray-100"
                      } ${statusCfg?.color || "text-gray-600"}`}>
                        {event.new_status.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[11px] text-[#86868b]">{new Date(event.created_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-[#d2d2d7]">{new Date(event.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                {event.creator?.full_name && (
                  <p className="text-[10px] text-[#86868b] mt-2">by {event.creator.full_name}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
