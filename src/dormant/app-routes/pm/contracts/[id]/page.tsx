"use client";

import React, { useState, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import DeliveryTimeline from "@/components/delivery/delivery-timeline";
import { Truck, MessageSquare } from "lucide-react";
import { friendlyError } from "@/lib/friendly-error";
import { useRouter } from "next/navigation";

const DELIVERY_STATUSES = ["pending", "ordered", "in_production", "in_transit", "customs_clearance", "delivered", "installed"];

export default function PMContractDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");

  useEffect(() => { fetchContract(); }, []);

  async function fetchContract() {
    const res = await fetch(`/api/contracts/${id}`, { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setContract(data);
    }
    setLoading(false);
  }

  async function addNote() {
    if (!noteText.trim()) return;
    const delivery = contract?.deliveries?.[0];
    if (!delivery) return;

    const res = await fetch(`/api/deliveries/${delivery._id || delivery.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        event_type: "note",
        title: "PM Note",
        description: noteText,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(friendlyError(err.error, "Failed to add note"));
      return;
    }
    toast.success("Note added");
    setNoteText("");
    fetchContract();
  }

  if (loading || !contract) {
    return <PageLayout title="Contract" subtitle=""><div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin" /></div></PageLayout>;
  }

  const delivery = contract.deliveries?.[0];
  const currentIdx = delivery ? DELIVERY_STATUSES.indexOf(delivery.status) : 0;

  return (
    <PageLayout title={contract.title} subtitle={`Contract ${contract.contractNumber}`} backButtonHref="/pm/contracts">
      <div className="space-y-6">
        {/* Contract Summary */}
        <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold text-[#86868b] uppercase">Contract #</p>
              <p className="text-sm font-mono font-bold text-[#0066cc]">{contract.contractNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#86868b] uppercase">Value</p>
              <p className="text-sm font-bold text-[#1d1d1f]">{contract.currency} {Number(contract.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#86868b] uppercase">Supplier</p>
              <p className="text-sm text-[#1d1d1f]">{contract.supplierInfo?.companyName || contract.supplierInfo?.fullName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#86868b] uppercase">Status</p>
              <p className="text-sm font-medium capitalize text-[#1d1d1f]">{contract.status}</p>
            </div>
          </div>
          {contract.terms && <div className="mt-4 pt-4 border-t border-[#d2d2d7]/30"><p className="text-[10px] font-bold text-[#86868b] uppercase mb-1">Terms</p><p className="text-sm text-[#424245]">{contract.terms}</p></div>}
          {contract.paymentTerms && <div className="mt-2"><p className="text-[10px] font-bold text-[#86868b] uppercase mb-1">Payment Terms</p><p className="text-sm text-[#424245]">{contract.paymentTerms}</p></div>}
          {contract.supplierId && (
            <div className="mt-4 pt-4 border-t border-[#d2d2d7]/30">
              <button
                onClick={async () => {
                  const res = await fetch("/api/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({ recipientId: contract.supplierId, type: "contract", contractId: id, title: `Contract ${contract.contractNumber}` }),
                  });
                  if (res.ok) { const data = await res.json(); router.push(`/messages/${data.id}`); }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0055b3] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Message Supplier
              </button>
            </div>
          )}
        </div>

        {/* Delivery Progress */}
        {delivery && (
          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-[#0066cc]" /> Delivery Tracking</h3>

            {/* Progress Bar */}
            <div className="flex items-center gap-1 mb-6">
              {DELIVERY_STATUSES.map((s, i) => (
                <div key={s} className="flex-1">
                  <div className={`h-2 rounded-full ${i <= currentIdx ? "bg-[#0066cc]" : "bg-[#d2d2d7]/30"}`} />
                  <p className={`text-[9px] mt-1 text-center capitalize ${i <= currentIdx ? "text-[#0066cc] font-bold" : "text-[#86868b]"}`}>
                    {s.replace(/_/g, " ")}
                  </p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <DeliveryTimeline events={delivery.events || delivery.delivery_events || []} />

            {/* Add Note */}
            <div className="mt-4 pt-4 border-t border-[#d2d2d7]/30">
              <div className="flex gap-2">
                <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note..." className="flex-1 px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-[#0066cc]" />
                <button onClick={addNote} className="px-5 py-2.5 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0055b3]">Add Note</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
