"use client";

import { useState } from "react";
import { Flag, X, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

const reasons = [
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "spam", label: "Spam" },
  { value: "misleading", label: "Misleading Information" },
  { value: "offensive", label: "Offensive" },
  { value: "other", label: "Other" },
];

export default function FlagButton({ contentType, contentId }: { contentType: string; contentId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { toast.error("Please select a reason"); return; }
    if (!user) { toast.error("Please log in to report content"); return; }
    setSubmitting(true);

    const res = await fetch("/api/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ content_type: contentType, content_id: contentId, reason, description }),
    });

    if (res.ok) {
      toast.success("Content reported. Our team will review it.");
      setFlagged(true);
      setOpen(false);
    } else if (res.status === 409) {
      toast.info("You have already reported this content");
      setFlagged(true);
      setOpen(false);
    } else {
      toast.error(friendlyError(null, "Failed to report content"));
    }
    setSubmitting(false);
  };

  if (flagged) {
    return (
      <button disabled className="p-2 rounded-full text-[#86868b] opacity-50 cursor-not-allowed" title="Reported">
        <Flag className="w-4 h-4 fill-current" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full text-[#86868b] hover:text-[#ff2d55] hover:bg-red-50 transition-colors"
        title="Report content"
      >
        <Flag className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-[16px] border border-[#e8e8ed] shadow-xl z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[14px] font-semibold text-[#1d1d1f]">Report Content</h4>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-[#f5f5f7] rounded-full">
              <X className="w-4 h-4 text-[#86868b]" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-[#86868b] mb-1 block">Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-[#d2d2d7] rounded-xl text-[13px] focus:outline-none focus:border-[#ff2d55]"
              >
                <option value="">Select reason...</option>
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] text-[#86868b] mb-1 block">Details (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more details..."
                rows={2}
                className="w-full px-3 py-2 border border-[#d2d2d7] rounded-xl text-[13px] resize-none focus:outline-none focus:border-[#ff2d55]"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full px-4 py-2 bg-[#ff2d55] text-white rounded-full text-[13px] font-medium hover:bg-[#ff1744] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
