"use client";

import { useState, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import Link from "next/link";
import { 
  Snowflake, Wind, Thermometer, Gauge, Settings, Zap, 
  Droplets, Building2, Waves, Shield, Wrench, Filter,
  Sun, Flame, Activity, Box, CircuitBoard, Pipette,
  ChevronRight, Search, Loader2
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface EquipmentType {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "air-conditioning": <Snowflake className="w-6 h-6" />,
  "hvac": <Wind className="w-6 h-6" />,
  "refrigeration": <Thermometer className="w-6 h-6" />,
  "compressors": <Gauge className="w-6 h-6" />,
  "controls-automation": <Settings className="w-6 h-6" />,
  "motors-drives": <Zap className="w-6 h-6" />,
  "pumps": <Droplets className="w-6 h-6" />,
  "cooling-towers": <Building2 className="w-6 h-6" />,
  "ventilation": <Waves className="w-6 h-6" />,
  "insulation-materials": <Shield className="w-6 h-6" />,
  "tools-equipment": <Wrench className="w-6 h-6" />,
  "filters": <Filter className="w-6 h-6" />,
  "heat-exchangers": <Flame className="w-6 h-6" />,
  "district-cooling": <Building2 className="w-6 h-6" />,
  "ductwork": <Box className="w-6 h-6" />,
  "valves": <Pipette className="w-6 h-6" />,
  "building-automation": <CircuitBoard className="w-6 h-6" />,
  "heating": <Sun className="w-6 h-6" />,
  "air-quality": <Activity className="w-6 h-6" />,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/equipment-types').then(res => res.json()),
    ])
      .then(([catData, eqData]) => {
        setCategories(catData.categories || catData || []);
        setEquipmentTypes(eqData.equipmentTypes || eqData || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getEquipmentTypesForCategory = (categoryId: string) => {
    return equipmentTypes.filter(et => et.category_id === categoryId);
  };

  if (loading) {
    return (
      <PageLayout title="Categories" subtitle="Loading...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Product Categories" 
      subtitle={`${categories.length} categories • ${equipmentTypes.length} equipment types`}
    >
      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[15px]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
          <p className="text-[28px] font-bold text-[#1d1d1f]">{categories.length}</p>
          <p className="text-[13px] text-[#86868b]">Categories</p>
        </div>
        <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
          <p className="text-[28px] font-bold text-[#1d1d1f]">{equipmentTypes.length}</p>
          <p className="text-[13px] text-[#86868b]">Equipment Types</p>
        </div>
        <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
          <p className="text-[28px] font-bold text-[#0066cc]">74</p>
          <p className="text-[13px] text-[#86868b]">Products</p>
        </div>
        <div className="bg-[#f5f5f7] rounded-[14px] p-4 text-center">
          <p className="text-[28px] font-bold text-[#30d158]">44</p>
          <p className="text-[13px] text-[#86868b]">Brands</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const types = getEquipmentTypesForCategory(category.id);
          const isExpanded = selectedCategory === category.id;
          
          return (
            <div 
              key={category.id}
              className="bg-white rounded-[18px] border border-[#e8e8ed] overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div 
                className="p-5 cursor-pointer"
                onClick={() => setSelectedCategory(isExpanded ? null : category.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[12px] bg-[#e8f4ff] flex items-center justify-center text-[#0066cc]">
                    {categoryIcons[category.slug] || <Box className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1">{category.name}</h3>
                    <p className="text-[13px] text-[#86868b] line-clamp-2">{category.description}</p>
                    <p className="text-[12px] text-[#0066cc] mt-2">{types.length} equipment types</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-[#86868b] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>
              
              {/* Expanded Equipment Types */}
              {isExpanded && types.length > 0 && (
                <div className="border-t border-[#e8e8ed] p-4 bg-[#f5f5f7]">
                  <p className="text-[12px] text-[#86868b] mb-3">Equipment Types ({types.length})</p>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                    {types.slice(0, 20).map((type) => (
                      <Link
                        key={type.id}
                        href={`/products?type=${type.slug}`}
                        className="text-[12px] bg-white px-3 py-1.5 rounded-full text-[#424245] hover:text-[#0066cc] hover:bg-[#e8f4ff] transition-colors"
                      >
                        {type.name}
                      </Link>
                    ))}
                    {types.length > 20 && (
                      <span className="text-[12px] text-[#86868b] px-2 py-1.5">
                        +{types.length - 20} more
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-[13px] text-[#0066cc] hover:underline"
                  >
                    View all products <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-[#86868b]">
          No categories found matching &quot;{search}&quot;
        </div>
      )}
    </PageLayout>
  );
}
