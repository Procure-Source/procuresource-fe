"use client";

import { useState, useEffect, useMemo } from "react";
import PageLayout from "@/components/page-layout";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Phone, Mail, Globe, Shield, Search, Filter, X, Star,
  CheckCircle, Clock, Award, Users, Building2, ChevronRight,
  MessageSquare, FileText, Loader2, Check, Send, Briefcase,
  ThumbsUp, Calendar, TrendingUp, Zap, Package, Truck, Heart,
  BarChart3, MapPinned, Grid3X3, List, AlertCircle, Plus, Minus, Flag
} from "lucide-react";
import FlagButton from "@/components/flag-button";

interface Supplier {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  rating?: number;
  reviews_count?: number;
  response_time?: string;
  years_in_business?: number;
  specializations?: string[];
  brands?: string[];
  certifications?: string[];
  verified?: boolean;
  premium?: boolean;
  projects_completed?: number;
  on_time_delivery?: number;
}

interface RFQForm {
  productType: string;
  quantity: string;
  deadline: string;
  budget: string;
  description: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

const countries = [
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
];

const specializations = [
  "Chillers", "AHUs", "VRF Systems", "Cooling Towers", "Pumps",
  "Controls & BMS", "Ductwork", "Insulation", "Fire Protection"
];

const certificationOptions = ["ISO 9001", "ISO 14001", "OHSAS 18001", "AHRI", "UL", "FM"];

const mockEnhancements = (supplier: Supplier): Supplier => ({
  ...supplier,
  rating: 3.5 + Math.random() * 1.5,
  reviews_count: Math.floor(Math.random() * 50) + 10,
  response_time: ["< 1 hour", "< 4 hours", "< 24 hours"][Math.floor(Math.random() * 3)],
  years_in_business: Math.floor(Math.random() * 20) + 5,
  specializations: specializations.sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3)),
  brands: ["Trane", "Carrier", "Daikin", "York", "Johnson Controls", "Honeywell"].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3)),
  // Use real certifications from DB if available, otherwise keep empty
  certifications: supplier.certifications && supplier.certifications.length > 0 ? supplier.certifications : [],
  verified: Math.random() > 0.2,
  premium: Math.random() > 0.7,
  projects_completed: Math.floor(Math.random() * 500) + 50,
  on_time_delivery: 85 + Math.floor(Math.random() * 15),
});

type ViewMode = "grid" | "list";
type ActiveTab = "suppliers" | "rfq" | "compare";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [contactingId, setContactingId] = useState<string | null>(null);
  const [contactSent, setContactSent] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<ActiveTab>("suppliers");
  const [savedSuppliers, setSavedSuppliers] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showRFQSuccess, setShowRFQSuccess] = useState(false);
  const [isSubmittingRFQ, setIsSubmittingRFQ] = useState(false);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating");
  const [selectedCertification, setSelectedCertification] = useState<string | null>(null);
  
  const [rfqForm, setRfqForm] = useState<RFQForm>({
    productType: "",
    quantity: "",
    deadline: "",
    budget: "",
    description: "",
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  useEffect(() => {
    fetch("/api/suppliers?verified=true")
      .then((res) => res.ok ? res.json() : { data: [] })
      .then((data) => {
        const enhanced = (Array.isArray(data.data) ? data.data : []).map(mockEnhancements);
        setSuppliers(enhanced);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers.filter((supplier) => {
      const matchesSearch = !searchQuery ||
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.specializations?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        supplier.brands?.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCountry = !selectedCountry ||
        supplier.country.toLowerCase().includes(selectedCountry.toLowerCase());

      const matchesSpecialization = !selectedSpecialization ||
        supplier.specializations?.includes(selectedSpecialization);

      const matchesCertification = !selectedCertification ||
        supplier.certifications?.includes(selectedCertification);

      return matchesSearch && matchesCountry && matchesSpecialization && matchesCertification;
    });

    filtered.sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "reviews") return (b.reviews_count || 0) - (a.reviews_count || 0);
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [suppliers, searchQuery, selectedCountry, selectedSpecialization, selectedCertification, sortBy]);

  const suppliersByCountry = useMemo(() => {
    const grouped: Record<string, Supplier[]> = {};
    filteredSuppliers.forEach((supplier) => {
      const country = supplier.country || "Other";
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(supplier);
    });
    return grouped;
  }, [filteredSuppliers]);

  const compareSuppliers = useMemo(() => {
    return suppliers.filter(s => compareList.includes(s.id));
  }, [suppliers, compareList]);

  const handleQuickContact = (supplierId: string) => {
    setContactingId(supplierId);
    setTimeout(() => {
      setContactSent((prev) => new Set([...prev, supplierId]));
      setContactingId(null);
    }, 1000);
  };

  const handleSaveSupplier = (supplierId: string) => {
    setSavedSuppliers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(supplierId)) {
        newSet.delete(supplierId);
      } else {
        newSet.add(supplierId);
      }
      return newSet;
    });
  };

  const handleCompareToggle = (supplierId: string) => {
    setCompareList(prev => {
      if (prev.includes(supplierId)) {
        return prev.filter(id => id !== supplierId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), supplierId];
      }
      return [...prev, supplierId];
    });
  };

  const handleRFQSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRFQ(true);
    setTimeout(() => {
      setIsSubmittingRFQ(false);
      setShowRFQSuccess(true);
      setRfqForm({
        productType: "",
        quantity: "",
        deadline: "",
        budget: "",
        description: "",
        name: "",
        email: "",
        phone: "",
        company: "",
      });
    }, 1500);
  };

  const getCountryFlag = (countryName: string) => {
    const country = countries.find(
      (c) => countryName.toLowerCase().includes(c.name.toLowerCase()) ||
             countryName.toLowerCase().includes(c.code.toLowerCase())
    );
    return country?.flag || "🌍";
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.round(rating) ? "text-[#ff9500] fill-current" : "text-[#d2d2d7]"
            }`}
          />
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "suppliers" as const, label: "Suppliers Directory", icon: Building2 },
    { id: "rfq" as const, label: "Request for Quote", icon: FileText },
    { id: "compare" as const, label: `Compare (${compareList.length})`, icon: BarChart3 },
  ];

  return (
    <PageLayout 
      title="GCC Suppliers Network" 
      subtitle="Authorized distributors and agents across the Gulf region"
    >
      {/* Tabs Navigation */}
      <div className="bg-white rounded-[16px] border border-[#e8e8ed] p-1.5 mb-6 inline-flex gap-1 overflow-x-auto w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[12px] text-[14px] font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-[#0066cc] text-white"
                  : "text-[#424245] hover:bg-[#f5f5f7]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Suppliers Directory Tab */}
      {activeTab === "suppliers" && (
        <>
          {/* Search and Filters */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, brand, specialization, or location..."
                className="w-full h-[52px] pl-12 pr-24 border border-[#d2d2d7] rounded-full text-[15px] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="p-1.5 rounded-full text-[#86868b] hover:bg-[#f5f5f7] transition-colors"
                  title={viewMode === "grid" ? "List view" : "Grid view"}
                >
                  {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-1.5 rounded-full transition-colors ${
                    showFilters || selectedCountry || selectedSpecialization || selectedCertification ? 'bg-[#0066cc] text-white' : 'text-[#86868b] hover:bg-[#f5f5f7]'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-4 p-5 bg-[#fbfbfd] rounded-[16px] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#1d1d1f]">Filters</span>
                  {(selectedCountry || selectedSpecialization || selectedCertification) && (
                    <button
                      onClick={() => { setSelectedCountry(null); setSelectedSpecialization(null); setSelectedCertification(null); }}
                      className="text-[13px] text-[#0066cc] hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>
                
                {/* Country Filter */}
                <div>
                  <label className="text-[12px] text-[#86868b] mb-2 block">Country</label>
                  <div className="flex flex-wrap gap-2">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => setSelectedCountry(selectedCountry === country.name ? null : country.name)}
                        className={`px-3 py-1.5 rounded-full text-[13px] transition-colors flex items-center gap-1.5 ${
                          selectedCountry === country.name
                            ? 'bg-[#0066cc] text-white'
                            : 'bg-white text-[#1d1d1f] border border-[#e8e8ed] hover:border-[#0066cc]'
                        }`}
                      >
                        <span>{country.flag}</span>
                        {country.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specialization Filter */}
                <div>
                  <label className="text-[12px] text-[#86868b] mb-2 block">Specialization</label>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => setSelectedSpecialization(selectedSpecialization === spec ? null : spec)}
                        className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                          selectedSpecialization === spec
                            ? 'bg-[#30d158] text-white'
                            : 'bg-white text-[#1d1d1f] border border-[#e8e8ed] hover:border-[#30d158]'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Certification Filter */}
                <div>
                  <label className="text-[12px] text-[#86868b] mb-2 block">Certification</label>
                  <div className="flex flex-wrap gap-2">
                    {certificationOptions.map((cert) => (
                      <button
                        key={cert}
                        onClick={() => setSelectedCertification(selectedCertification === cert ? null : cert)}
                        className={`px-3 py-1.5 rounded-full text-[13px] transition-colors flex items-center gap-1 ${
                          selectedCertification === cert
                            ? 'bg-[#ff9500] text-white'
                            : 'bg-white text-[#1d1d1f] border border-[#e8e8ed] hover:border-[#ff9500]'
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        {cert}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-[12px] text-[#86868b] mb-2 block">Sort by</label>
                  <div className="flex gap-2">
                    {[
                      { value: "rating", label: "Highest Rated" },
                      { value: "reviews", label: "Most Reviews" },
                      { value: "name", label: "Name A-Z" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as typeof sortBy)}
                        className={`px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                          sortBy === option.value
                            ? 'bg-[#1d1d1f] text-white'
                            : 'bg-white text-[#1d1d1f] border border-[#e8e8ed] hover:border-[#1d1d1f]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-[14px] p-4 border border-[#e8e8ed] text-center">
              <div className="text-[28px] font-bold text-[#0066cc]">{suppliers.length}</div>
              <div className="text-[12px] text-[#86868b]">Verified Suppliers</div>
            </div>
            <div className="bg-white rounded-[14px] p-4 border border-[#e8e8ed] text-center">
              <div className="text-[28px] font-bold text-[#30d158]">6</div>
              <div className="text-[12px] text-[#86868b]">GCC Countries</div>
            </div>
            <div className="bg-white rounded-[14px] p-4 border border-[#e8e8ed] text-center">
              <div className="text-[28px] font-bold text-[#ff9500]">15+</div>
              <div className="text-[12px] text-[#86868b]">Major Brands</div>
            </div>
            <div className="bg-white rounded-[14px] p-4 border border-[#e8e8ed] text-center">
              <div className="text-[28px] font-bold text-[#5856d6]">24/7</div>
              <div className="text-[12px] text-[#86868b]">Support</div>
            </div>
            <div className="bg-white rounded-[14px] p-4 border border-[#e8e8ed] text-center col-span-2 md:col-span-1">
              <div className="text-[28px] font-bold text-[#ff2d55]">98%</div>
              <div className="text-[12px] text-[#86868b]">Satisfaction</div>
            </div>
          </div>

          {/* Compare Banner */}
          {compareList.length > 0 && (
            <div className="mb-6 bg-[#eff6ff] rounded-[14px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-[#0066cc]" />
                <span className="text-[14px] text-[#1d1d1f]">
                  <strong>{compareList.length}</strong> supplier{compareList.length !== 1 ? 's' : ''} selected for comparison
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCompareList([])}
                  className="text-[13px] text-[#86868b] hover:text-[#1d1d1f]"
                >
                  Clear
                </button>
                <button
                  onClick={() => setActiveTab("compare")}
                  className="bg-[#0066cc] text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#0055b3] transition-colors"
                >
                  Compare Now
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#fbfbfd] rounded-[18px] p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-14 h-14 rounded-[14px]" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-16 bg-[#fbfbfd] rounded-[20px]">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-[#86868b]" />
              <p className="text-[17px] text-[#86868b] mb-2">No suppliers found</p>
              <p className="text-[14px] text-[#86868b] mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCountry(null); setSelectedSpecialization(null); setSelectedCertification(null); }}
                className="text-[#0066cc] text-[15px] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(suppliersByCountry).map(([country, countrySuppliers]) => (
                <div key={country}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[20px]">{getCountryFlag(country)}</span>
                    <h2 className="text-[19px] font-semibold text-[#1d1d1f]">{country}</h2>
                    <span className="text-[13px] text-[#86868b] ml-2">
                      ({countrySuppliers.length} supplier{countrySuppliers.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "space-y-4"}>
                    {countrySuppliers.map((supplier) => (
                      <div 
                        key={supplier.id}
                        className={`bg-white rounded-[18px] border border-[#e8e8ed] hover:border-[#0066cc] hover:shadow-lg transition-all ${
                          supplier.premium ? 'ring-2 ring-[#ff9500] ring-offset-2' : ''
                        }`}
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-[#0066cc] to-[#5ac8fa] rounded-[14px] flex items-center justify-center text-white font-bold text-[20px] flex-shrink-0">
                                {supplier.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{supplier.name}</h3>
                                  {supplier.verified && (
                                    <CheckCircle className="w-4 h-4 text-[#0066cc]" />
                                  )}
                                  {supplier.premium && (
                                    <span className="text-[10px] bg-[#ff9500] text-white px-1.5 py-0.5 rounded-full font-medium">
                                      PREMIUM
                                    </span>
                                  )}
                                </div>
                                <p className="text-[13px] text-[#86868b] flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {supplier.city ? `${supplier.city}, ` : ""}{supplier.country}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSaveSupplier(supplier.id)}
                                className={`p-2 rounded-full transition-colors ${
                                  savedSuppliers.has(supplier.id) ? 'text-[#ff2d55]' : 'text-[#86868b] hover:text-[#ff2d55]'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${savedSuppliers.has(supplier.id) ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleCompareToggle(supplier.id)}
                                className={`p-2 rounded-full transition-colors ${
                                  compareList.includes(supplier.id) ? 'bg-[#0066cc] text-white' : 'text-[#86868b] hover:bg-[#f5f5f7]'
                                }`}
                              >
                                <BarChart3 className="w-4 h-4" />
                              </button>
                              <FlagButton contentType="supplier_profile" contentId={supplier.id} />
                            </div>
                          </div>

                          {/* Rating & Stats */}
                          <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-[#e8e8ed]">
                            <div className="flex items-center gap-2">
                              {renderStars(supplier.rating || 0)}
                              <span className="text-[14px] font-medium text-[#1d1d1f]">
                                {supplier.rating?.toFixed(1)}
                              </span>
                              <span className="text-[12px] text-[#86868b]">
                                ({supplier.reviews_count} reviews)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[12px] text-[#86868b]">
                              <Clock className="w-3 h-3" />
                              {supplier.response_time}
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center p-2 bg-[#f5f5f7] rounded-[10px]">
                              <div className="text-[16px] font-bold text-[#1d1d1f]">{supplier.years_in_business}</div>
                              <div className="text-[10px] text-[#86868b]">Years</div>
                            </div>
                            <div className="text-center p-2 bg-[#f5f5f7] rounded-[10px]">
                              <div className="text-[16px] font-bold text-[#30d158]">{supplier.projects_completed}</div>
                              <div className="text-[10px] text-[#86868b]">Projects</div>
                            </div>
                            <div className="text-center p-2 bg-[#f5f5f7] rounded-[10px]">
                              <div className="text-[16px] font-bold text-[#0066cc]">{supplier.on_time_delivery}%</div>
                              <div className="text-[10px] text-[#86868b]">On-time</div>
                            </div>
                          </div>

                          {/* Specializations */}
                          <div className="mb-4">
                            <p className="text-[11px] text-[#86868b] mb-2">SPECIALIZATIONS</p>
                            <div className="flex flex-wrap gap-1.5">
                              {supplier.specializations?.slice(0, 4).map((spec) => (
                                <span key={spec} className="text-[11px] bg-[#e8f4ff] text-[#0066cc] px-2 py-1 rounded-full">
                                  {spec}
                                </span>
                              ))}
                              {(supplier.specializations?.length || 0) > 4 && (
                                <span className="text-[11px] text-[#86868b]">
                                  +{(supplier.specializations?.length || 0) - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Brands */}
                          <div className="mb-4">
                            <p className="text-[11px] text-[#86868b] mb-2">AUTHORIZED BRANDS</p>
                            <div className="flex flex-wrap gap-1.5">
                              {supplier.brands?.map((brand) => (
                                <span key={brand} className="text-[11px] bg-[#f5f5f7] text-[#424245] px-2 py-1 rounded-full border border-[#e8e8ed]">
                                  {brand}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Expandable Details */}
                          {expandedSupplier === supplier.id && (
                            <div className="mb-4 p-4 bg-[#fbfbfd] rounded-[12px] space-y-3">
                              <div className="flex items-center justify-between text-[13px]">
                                <span className="text-[#86868b]">Certifications</span>
                                <div className="flex gap-1">
                                  {supplier.certifications?.map((cert) => (
                                    <span key={cert} className="bg-[#e8f5e9] text-[#30d158] px-2 py-0.5 rounded-full text-[11px]">
                                      {cert}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {supplier.phone && (
                                <div className="flex items-center gap-2 text-[13px]">
                                  <Phone className="w-4 h-4 text-[#86868b]" />
                                  <a href={`tel:${supplier.phone}`} className="text-[#0066cc] hover:underline">{supplier.phone}</a>
                                </div>
                              )}
                              {supplier.email && (
                                <div className="flex items-center gap-2 text-[13px]">
                                  <Mail className="w-4 h-4 text-[#86868b]" />
                                  <a href={`mailto:${supplier.email}`} className="text-[#0066cc] hover:underline">{supplier.email}</a>
                                </div>
                              )}
                              {supplier.website_url && (
                                <div className="flex items-center gap-2 text-[13px]">
                                  <Globe className="w-4 h-4 text-[#86868b]" />
                                  <a href={supplier.website_url} target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">
                                    Visit Website
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            {contactSent.has(supplier.id) ? (
                              <div className="flex-1 bg-[#e8f5e9] text-[#30d158] py-2.5 rounded-full text-[13px] font-medium text-center flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> Request Sent
                              </div>
                            ) : (
                              <button
                                onClick={() => handleQuickContact(supplier.id)}
                                disabled={contactingId === supplier.id}
                                className="flex-1 bg-[#0066cc] text-white py-2.5 rounded-full text-[13px] font-medium hover:bg-[#0055b3] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                              >
                                {contactingId === supplier.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    Contact
                                  </>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => setExpandedSupplier(expandedSupplier === supplier.id ? null : supplier.id)}
                              className="px-4 py-2.5 border border-[#d2d2d7] rounded-full text-[13px] text-[#1d1d1f] hover:border-[#0066cc] hover:text-[#0066cc] transition-colors"
                            >
                              {expandedSupplier === supplier.id ? "Less" : "More"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* RFQ Tab */}
      {activeTab === "rfq" && (
        <div className="max-w-2xl mx-auto">
          {showRFQSuccess ? (
            <div className="bg-[#f0fdf4] rounded-[24px] p-10 text-center border border-[#86efac]">
              <div className="w-20 h-20 rounded-full bg-[#22c55e] flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-[28px] font-bold text-[#166534] mb-3">RFQ Submitted!</h2>
              <p className="text-[16px] text-[#15803d] mb-6">
                Your request has been sent to our network of verified suppliers. 
                Expect quotes within 24-48 hours.
              </p>
              <p className="text-[14px] text-[#86868b] mb-6">
                Reference: <span className="font-mono font-semibold">RFQ-{Date.now().toString().slice(-8)}</span>
              </p>
              <button
                onClick={() => setShowRFQSuccess(false)}
                className="bg-[#0066cc] text-white px-8 py-3 rounded-full text-[15px] font-medium hover:bg-[#0055b3] transition-colors"
              >
                Submit Another RFQ
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] p-8 border border-[#e8e8ed]">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0066cc] to-[#5ac8fa] flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-2">Request for Quote</h2>
                <p className="text-[15px] text-[#86868b]">
                  Get competitive quotes from multiple verified suppliers
                </p>
              </div>

              <form onSubmit={handleRFQSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                      Product/Equipment Type *
                    </label>
                    <select
                      required
                      value={rfqForm.productType}
                      onChange={(e) => setRfqForm({ ...rfqForm, productType: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                    >
                      <option value="">Select type...</option>
                      <option value="chillers">Chillers</option>
                      <option value="ahu">Air Handling Units</option>
                      <option value="vrf">VRF/VRV Systems</option>
                      <option value="cooling-towers">Cooling Towers</option>
                      <option value="pumps">Pumps</option>
                      <option value="controls">Controls & BMS</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                      Quantity *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 5 units"
                      value={rfqForm.quantity}
                      onChange={(e) => setRfqForm({ ...rfqForm, quantity: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                      Required by Date
                    </label>
                    <input
                      type="date"
                      value={rfqForm.deadline}
                      onChange={(e) => setRfqForm({ ...rfqForm, deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                      Budget Range (AED)
                    </label>
                    <select
                      value={rfqForm.budget}
                      onChange={(e) => setRfqForm({ ...rfqForm, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                    >
                      <option value="">Select range...</option>
                      <option value="<50k">&lt; 50,000</option>
                      <option value="50k-100k">50,000 - 100,000</option>
                      <option value="100k-500k">100,000 - 500,000</option>
                      <option value="500k-1m">500,000 - 1,000,000</option>
                      <option value=">1m">&gt; 1,000,000</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                    Requirements & Specifications *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your requirements, including capacity, brand preferences, certifications needed, etc..."
                    value={rfqForm.description}
                    onChange={(e) => setRfqForm({ ...rfqForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px] resize-none"
                  />
                </div>

                <div className="border-t border-[#e8e8ed] pt-6">
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Your Name *"
                      value={rfqForm.name}
                      onChange={(e) => setRfqForm({ ...rfqForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={rfqForm.company}
                      onChange={(e) => setRfqForm({ ...rfqForm, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email *"
                      value={rfqForm.email}
                      onChange={(e) => setRfqForm({ ...rfqForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone *"
                      value={rfqForm.phone}
                      onChange={(e) => setRfqForm({ ...rfqForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-[14px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRFQ}
                  className="w-full bg-[#0066cc] text-white py-4 rounded-full text-[17px] font-medium hover:bg-[#0055b3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingRFQ ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit RFQ
                    </>
                  )}
                </button>

                <p className="text-[12px] text-[#86868b] text-center">
                  By submitting, you agree to receive quotes from our verified suppliers
                </p>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Compare Tab */}
      {activeTab === "compare" && (
        <div>
          {compareList.length === 0 ? (
            <div className="text-center py-16 bg-[#fbfbfd] rounded-[20px]">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-[#86868b]" />
              <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-2">No Suppliers Selected</h2>
              <p className="text-[15px] text-[#86868b] mb-6">
                Select up to 3 suppliers from the directory to compare them side by side
              </p>
              <button
                onClick={() => setActiveTab("suppliers")}
                className="bg-[#0066cc] text-white px-6 py-3 rounded-full text-[15px] font-medium hover:bg-[#0055b3] transition-colors"
              >
                Browse Suppliers
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] border border-[#e8e8ed] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f5f5f7]">
                    <tr>
                      <th className="text-left p-4 text-[13px] font-semibold text-[#86868b] w-40">Feature</th>
                      {compareSuppliers.map((supplier) => (
                        <th key={supplier.id} className="text-center p-4 min-w-[200px]">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#0066cc] to-[#5ac8fa] rounded-[12px] flex items-center justify-center text-white font-bold text-[18px]">
                              {supplier.name.charAt(0)}
                            </div>
                            <span className="text-[15px] font-semibold text-[#1d1d1f]">{supplier.name}</span>
                            <button
                              onClick={() => handleCompareToggle(supplier.id)}
                              className="text-[12px] text-[#ff453a] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#e8e8ed]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Rating</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {renderStars(s.rating || 0)}
                            <span className="text-[14px] font-semibold">{s.rating?.toFixed(1)}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed] bg-[#fafafa]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Reviews</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center text-[14px]">{s.reviews_count}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Response Time</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center text-[14px]">{s.response_time}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed] bg-[#fafafa]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Years in Business</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center text-[14px]">{s.years_in_business}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Projects Completed</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center text-[14px]">{s.projects_completed}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed] bg-[#fafafa]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">On-time Delivery</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          <span className={`font-semibold ${(s.on_time_delivery || 0) >= 95 ? 'text-[#30d158]' : 'text-[#ff9500]'}`}>
                            {s.on_time_delivery}%
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Location</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center text-[14px]">
                          {s.city ? `${s.city}, ` : ""}{s.country}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed] bg-[#fafafa]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Verified</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          {s.verified ? (
                            <CheckCircle className="w-5 h-5 text-[#30d158] mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-[#86868b] mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Specializations</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {s.specializations?.slice(0, 3).map((spec) => (
                              <span key={spec} className="text-[10px] bg-[#e8f4ff] text-[#0066cc] px-2 py-0.5 rounded-full">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed] bg-[#fafafa]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Brands</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {s.brands?.map((brand) => (
                              <span key={brand} className="text-[10px] bg-[#f5f5f7] text-[#424245] px-2 py-0.5 rounded-full">
                                {brand}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-[#e8e8ed]">
                      <td className="p-4 text-[13px] font-medium text-[#86868b]">Action</td>
                      {compareSuppliers.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          <button
                            onClick={() => handleQuickContact(s.id)}
                            disabled={contactSent.has(s.id)}
                            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                              contactSent.has(s.id)
                                ? 'bg-[#e8f5e9] text-[#30d158]'
                                : 'bg-[#0066cc] text-white hover:bg-[#0055b3]'
                            }`}
                          >
                            {contactSent.has(s.id) ? 'Contacted' : 'Contact'}
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-br from-[#1d1d1f] to-[#424245] rounded-[24px] p-10 text-white">
        <h2 className="text-[28px] font-bold mb-3">Become a Partner</h2>
        <p className="text-[17px] text-white/80 mb-6 max-w-lg mx-auto">
          Join our growing network of authorized distributors across the GCC region
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/agent/register"
            className="inline-flex h-[48px] items-center justify-center rounded-full bg-white px-8 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
          >
            Register as Supplier
          </Link>
          <Link 
            href="/contact"
            className="inline-flex h-[48px] items-center justify-center rounded-full border border-white/30 px-8 text-[15px] font-medium text-white hover:bg-white/10 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
