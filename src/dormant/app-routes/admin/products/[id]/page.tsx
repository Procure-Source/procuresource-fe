"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
}

interface EquipmentType {
  id: string;
  name: string;
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [form, setForm] = useState({
    name: "",
    brand_id: "",
    equipment_type_id: "",
    model_number: "",
    capacity: "",
    description: "",
    is_certified: false,
    certification_type: "",
  });

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (brands.length > 0 && equipmentTypes.length > 0 && !isNew) {
      loadProduct();
    } else if (isNew && brands.length > 0 && equipmentTypes.length > 0) {
      setIsLoading(false);
    }
  }, [brands, equipmentTypes, isNew, params.id]);

    const loadDropdownData = async () => {
      try {
        const [brandsRes, typesRes] = await Promise.all([
          fetch("/api/admin/brands", { credentials: "include" }),
          fetch("/api/admin/equipment-types", { credentials: "include" }),
        ]);

      
      if (brandsRes.ok) setBrands(await brandsRes.json());
      if (typesRes.ok) setEquipmentTypes(await typesRes.json());
    } catch (error) {
      console.error("Failed to load dropdown data:", error);
    }
  };

    const loadProduct = async () => {
      try {
        const res = await fetch("/api/admin/products", { credentials: "include" });
        if (res.ok) {
          const products = await res.json();

        const product = products.find((p: { id: string }) => p.id === params.id);
        if (product) {
          setForm({
            name: product.name || "",
            brand_id: product.brand_id || "",
            equipment_type_id: product.equipment_type_id || "",
            model_number: product.model_number || "",
            capacity: product.capacity || "",
            description: product.description || "",
            is_certified: product.is_certified || false,
            certification_type: product.certification_type || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
      try {
        const res = await fetch("/api/admin/products", {
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
          <span className="text-[17px] text-[#1d1d1f]">{isNew ? "New Product" : "Edit Product"}</span>
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
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Brand *</label>
                <select
                  value={form.brand_id}
                  onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                  required
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Equipment Type *</label>
                <select
                  value={form.equipment_type_id}
                  onChange={(e) => setForm({ ...form, equipment_type_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                  required
                >
                  <option value="">Select type</option>
                  {equipmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Model Number</label>
                <input
                  type="text"
                  value={form.model_number}
                  onChange={(e) => setForm({ ...form, model_number: e.target.value })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Capacity</label>
                <input
                  type="text"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                  placeholder="e.g., 350-2000 TR"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px] min-h-[100px]"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="certified"
                checked={form.is_certified}
                onChange={(e) => setForm({ ...form, is_certified: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="certified" className="text-[14px] text-[#1d1d1f]">Certified Product</label>
            </div>
            
            {form.is_certified && (
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">Certification Type</label>
                <select
                  value={form.certification_type}
                  onChange={(e) => setForm({ ...form, certification_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                >
                  <option value="">Select certification</option>
                  <option value="AHRI">AHRI</option>
                  <option value="UL">UL</option>
                  <option value="FM Global">FM Global</option>
                  <option value="Eurovent">Eurovent</option>
                </select>
              </div>
            )}
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#0066cc] text-white px-6 py-3 rounded-full text-[15px] font-medium hover:bg-[#0055b3] transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Product"}
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
