"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function SupplierEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    country: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    website_url: "",
    rating: 0,
    authorized_brand_count: 0,
  });

  useEffect(() => {
    if (!isNew) {
      loadSupplier();
    }
  }, [isNew, params.id]);

    const loadSupplier = async () => {
      try {
        const res = await fetch("/api/admin/suppliers", { credentials: "include" });
        if (res.ok) {
          const suppliers = await res.json();

        const supplier = suppliers.find((s: { id: string }) => s.id === params.id);
        if (supplier) {
          setForm({
            name: supplier.name || "",
            country: supplier.country || "",
            city: supplier.city || "",
            address: supplier.address || "",
            phone: supplier.phone || "",
            email: supplier.email || "",
            website_url: supplier.website_url || "",
            rating: supplier.rating || 0,
            authorized_brand_count: supplier.authorized_brand_count || 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load supplier:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
      try {
        const res = await fetch("/api/admin/suppliers", {
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
          <span className="text-[17px] text-[#1d1d1f]">{isNew ? "New Supplier" : "Edit Supplier"}</span>
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
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Country *</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                  required
                >
                  <option value="">Select country</option>
                  <option value="UAE">UAE</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Kuwait">Kuwait</option>
                  <option value="Bahrain">Bahrain</option>
                  <option value="Oman">Oman</option>
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px] min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Website URL</label>
              <input
                type="url"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                placeholder="https://"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Rating (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Authorized Brand Count</label>
                <input
                  type="number"
                  value={form.authorized_brand_count}
                  onChange={(e) => setForm({ ...form, authorized_brand_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#0066cc] text-white px-6 py-3 rounded-full text-[15px] font-medium hover:bg-[#0055b3] transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Supplier"}
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
