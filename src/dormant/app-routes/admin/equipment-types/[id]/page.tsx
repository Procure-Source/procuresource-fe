"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EquipmentTypeEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!isNew) {
      loadEquipmentType();
    }
  }, [isNew, params.id]);

    const loadEquipmentType = async () => {
      try {
        const res = await fetch("/api/admin/equipment-types", { credentials: "include" });
        if (res.ok) {
          const types = await res.json();

        const type = types.find((t: { id: string }) => t.id === params.id);
        if (type) {
          setForm({
            name: type.name || "",
            description: type.description || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to load equipment type:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
      try {
        const res = await fetch("/api/admin/equipment-types", {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isNew ? form : { id: params.id, ...form }),
          credentials: "include",
        });

      
      if (res.ok) {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-[#86868b]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="bg-white border-b border-[#d2d2d7]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-[#0066cc] text-[14px] hover:underline">
            Back
          </Link>
          <span className="text-[#86868b]">/</span>
          <span className="text-[17px] text-[#1d1d1f]">{isNew ? "New Equipment Type" : "Edit Equipment Type"}</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-[18px] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                required
                placeholder="e.g., Chillers, AHUs, Pumps"
              />
            </div>
            
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px] min-h-[100px]"
                placeholder="Brief description of this equipment type"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#0066cc] text-white px-6 py-3 rounded-full text-[15px] font-medium hover:bg-[#0055b3] transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Equipment Type"}
              </button>
              <Link
                href="/admin"
                className="px-6 py-3 rounded-full text-[15px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
