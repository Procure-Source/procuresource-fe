"use client";

import React, { useState, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import DeliveryTimeline from "@/components/delivery/delivery-timeline";
import { Truck, Loader2, MessageSquare } from "lucide-react";
import { friendlyError } from "@/lib/friendly-error";
import { useRouter } from "next/navigation";

const DELIVERY_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "ordered", label: "Ordered" },
  { value: "in_production", label: "In Production" },
  { value: "in_transit", label: "In Transit" },
  { value: "customs_clearance", label: "Customs Clearance" },
  { value: "delivered", label: "Delivered" },
  { value: "installed", label: "Installed" },
];

export default function SupplierContractDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [noteText, setNoteText] = useState("");

  useEffect(() => { fetchContract(); }, []);

  async function fetchContract() {
    const res = await fetch(`/api/contracts/${id}`, { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setContract(data);
      if (data?.deliveries?.[0]) {
        setNewStatus(data.deliveries[0].status);
        setTrackingNumber(data.deliveries[0].trackingNumber || "");
        setShippingMethod(data.deliveries[0].shippingMethod || "");
      }
    }
    setLoading(false);
  }

  async function handleUpdateDelivery() {
    const delivery = contract?.deliveries?.[0];
    if (!delivery) return;
    setUpdating(true);

    // Update delivery tracking info
    await fetch(`/api/deliveries/${delivery._id || delivery.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        trackingNumber: trackingNumber || null,
        shippingMethod: shippingMethod || null,
      }),
    });

    // If status changed, create event and update status
    if (newStatus !== delivery.status) {
      await fetch(`/api/deliveries/${delivery._id || delivery.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          event_type: "status_change",
          title: `Status updated to ${newStatus.replace(/_/g, " ")}`,
          old_status: delivery.status,
          new_status: newStatus,
        }),
      });

      await fetch(`/api/deliveries/${delivery._id || delivery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "delivered" ? { actualDeliveryDate: new Date().toISOString() } : {}),
        }),
      });
    }

    toast.success("Delivery updated");
    fetchContract();
    setUpdating(false);
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
        title: "Supplier Note",
        description: noteText,
      }),
    });
    if (res.ok) {
      toast.success("Note added");
      setNoteText("");
      fetchContract();
    } else {
      toast.error("Failed to add note");
    }
  }

  if (loading || !contract) {
    return <PageLayout title="Contract" subtitle=""><div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div></PageLayout>;
  }

  const delivery = contract.deliveries?.[0];
  const currentIdx = DELIVERY_STATUSES.findIndex(s => s.value === delivery?.status);

  return (
    <PageLayout title={contract.title} subtitle={`Contract ${contract.contractNumber}`} backButtonHref="/supplier/dashboard">
      <div className="space-y-6">
        {/* Contract Summary */}
        <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-[10px] font-bold text-[#86868b] uppercase">Contract #</p><p className="text-sm font-mono font-bold text-emerald-600">{contract.contractNumber}</p></div>
            <div><p className="text-[10px] font-bold text-[#86868b] uppercase">Value</p><p className="text-sm font-bold text-[#1d1d1f]">{contract.currency} {Number(contract.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
            <div><p className="text-[10px] font-bold text-[#86868b] uppercase">Client</p><p className="text-sm text-[#1d1d1f]">{contract.pmInfo?.companyName || contract.pmInfo?.fullName}</p></div>
            <div><p className="text-[10px] font-bold text-[#86868b] uppercase">RFQ</p><p className="text-sm text-[#1d1d1f]">{contract.rfq?.title}</p></div>
          </div>
          {contract.paymentTerms && <div className="mt-4 pt-4 border-t border-[#d2d2d7]/30"><p className="text-[10px] font-bold text-[#86868b] uppercase mb-1">Payment Terms</p><p className="text-sm text-[#424245]">{contract.paymentTerms}</p></div>}
          {contract.pmId && (
            <div className="mt-4 pt-4 border-t border-[#d2d2d7]/30">
              <button
                onClick={async () => {
                  const res = await fetch("/api/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({ recipientId: contract.pmId, type: "contract", contractId: id, title: `Contract ${contract.contractNumber}` }),
                  });
                  if (res.ok) { const data = await res.json(); router.push(`/messages/${data.id}`); }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Message Client
              </button>
            </div>
          )}
        </div>

        {/* Delivery Management */}
        {delivery && (
          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-emerald-600" /> Delivery Management</h3>

            {/* Progress */}
            <div className="flex items-center gap-1 mb-6">
              {DELIVERY_STATUSES.map((s, i) => (
                <div key={s.value} className="flex-1">
                  <div className={`h-2 rounded-full ${i <= currentIdx ? "bg-emerald-500" : "bg-[#d2d2d7]/30"}`} />
                  <p className={`text-[9px] mt-1 text-center ${i <= currentIdx ? "text-emerald-600 font-bold" : "text-[#86868b]"}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500">
                  {DELIVERY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Tracking Number</label>
                <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number" className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Shipping Method</label>
                <input type="text" value={shippingMethod} onChange={e => setShippingMethod(e.target.value)}
                  placeholder="e.g., Air freight, Sea freight" className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <button onClick={handleUpdateDelivery} disabled={updating}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2">
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
              {updating ? "Updating..." : "Update Delivery"}
            </button>

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t border-[#d2d2d7]/30">
              <h4 className="text-sm font-semibold text-[#1d1d1f] mb-4">Delivery Timeline</h4>
              <DeliveryTimeline events={delivery.events || delivery.delivery_events || []} />
            </div>

            {/* Add Note */}
            <div className="mt-4 pt-4 border-t border-[#d2d2d7]/30">
              <div className="flex gap-2">
                <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note..." className="flex-1 px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                <button onClick={addNote} className="px-5 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600">Add Note</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
