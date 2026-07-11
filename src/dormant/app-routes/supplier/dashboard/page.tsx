"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from "@/components/page-layout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Building2, FileText, CheckCircle2,
  Clock, Globe, ArrowRight,
  ShieldCheck, ExternalLink, Send,
  FileSpreadsheet, TrendingUp, Eye,
  Calculator, Package, Zap, AlertTriangle,
  Plus, Trash2, XCircle, Loader2, Users, MessageSquare,
  BarChart3, Upload, Award, Download
} from "lucide-react";
import Link from 'next/link';

import QuoteBuilder from "@/components/supplier/quote-builder";
import SupplierAnalyticsTab from "@/components/supplier/analytics-tab";
import { friendlyError } from "@/lib/friendly-error";
import { getTagLabel } from "@/lib/tags";

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [availableRfqs, setAvailableRfqs] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [supplierProfile, setSupplierProfile] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myBrands, setMyBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rfqs' | 'quotes' | 'generator' | 'products' | 'brands' | 'analytics'>('overview');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  async function fetchData() {
    try {
      const [suppRes, subRes, rfqRes, docRes, prodRes, brandRes] = await Promise.all([
        fetch("/api/suppliers", { credentials: "same-origin" }),
        fetch("/api/rfq-submissions?mine=true", { credentials: "same-origin" }),
        fetch("/api/rfqs?status=open&limit=10", { credentials: "same-origin" }),
        fetch("/api/user-documents", { credentials: "same-origin" }),
        fetch("/api/supplier-products?mine=true", { credentials: "same-origin" }),
        fetch("/api/supplier/brands", { credentials: "same-origin" }),
      ]);

      if (suppRes.ok) {
        const suppData = await suppRes.json();
        setSupplierProfile(Array.isArray(suppData) ? suppData[0] : suppData);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubmissions(Array.isArray(subData) ? subData : []);
      }
      if (rfqRes.ok) {
        const rfqData = await rfqRes.json();
        setAvailableRfqs(Array.isArray(rfqData) ? rfqData : []);
      }
      if (docRes.ok) {
        const docData = await docRes.json();
        setDocs(Array.isArray(docData) ? docData : []);
      }
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setMyProducts(Array.isArray(prodData) ? prodData : []);
      }
      if (brandRes.ok) {
        const brandData = await brandRes.json();
        setMyBrands(Array.isArray(brandData) ? brandData : []);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">Loading Supplier Portal...</p>
        </div>
      </div>
    );
  }

  // Role verification - if user is NOT a supplier, show error
  if (user && user.role !== 'supplier') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center max-w-md p-8 bg-white rounded-[24px] shadow-lg">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-[24px] font-bold text-[#1d1d1f] mb-2">Access Denied</h1>
          <p className="text-[15px] text-[#86868b] mb-6">
            This dashboard is for Suppliers only. Your account role is: <strong>{user.role}</strong>
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066cc] text-white rounded-full font-semibold hover:bg-[#0077ed] transition-all"
          >
            Go to Your Dashboard
          </Link>
        </div>
      </div>
    );
  }

    return (
      <>
        <title>Supplier Dashboard | ProcureSource</title>
        <PageLayout
          title="Supplier Central"
          subtitle="Browse RFQs from Purchase Managers, submit competitive quotes, and grow your business"
          showBackButton={false}
        >
          {/* ========== SUPPLIER ROLE IDENTITY BANNER ========== */}
          <div className="mb-8">
            {/* HUGE ROLE INDICATOR */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-[24px] p-8 shadow-2xl text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative">
                {/* Role Label - VERY PROMINENT */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-4 py-1.5 bg-white text-emerald-700 rounded-full text-[11px] font-black uppercase tracking-widest">
                    {user?.tags && user.tags.length > 0
                      ? user.tags.map((t: string) => getTagLabel(t)).join(" & ")
                      : "Supplier Account"}
                  </div>
                  {(supplierProfile?.isVerified || supplierProfile?.is_verified) && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/50 rounded-full">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[11px] font-bold">VERIFIED</span>
                    </div>
                  )}
                </div>

                {/* Main Header */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-[36px] font-black tracking-tight">Supplier Dashboard</h1>
                    <p className="text-emerald-100 text-[16px] mt-1 max-w-xl">
                      You are a <strong>Supplier</strong>. Browse RFQs posted by Purchase Managers, submit quotes, and track your business.
                    </p>
                  </div>
                </div>

                {/* What Suppliers CAN and CANNOT do */}
                <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-2">✅ You CAN:</p>
                    <ul className="space-y-1 text-[13px] text-white/90">
                      <li>• Browse and respond to RFQs from Purchase Managers</li>
                      <li>• Submit competitive quotes using our Quote Builder</li>
                      <li>• Generate professional quotations with VAT</li>
                      <li>• Track your submissions and win rate</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-2">❌ You CANNOT:</p>
                    <ul className="space-y-1 text-[13px] text-white/70">
                      <li>• Create new RFQs (only Purchase Managers can)</li>
                      <li>• Access the Purchase Manager dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-[#d2d2d7]/30 pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'rfqs', label: 'Browse Open RFQs', icon: FileSpreadsheet, description: 'From Purchase Managers' },
          { id: 'quotes', label: 'My Quotes', icon: FileText },
          { id: 'brands', label: 'My Brands', icon: Award },
          { id: 'products', label: 'My Products', icon: Package },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'generator', label: 'Quotation Generator', icon: Calculator },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#d2d2d7]/30">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#f5f5f7] rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    <span className="text-[14px] font-medium">Public Listing</span>
                  </div>
                  {(supplierProfile?.isVerified || supplierProfile?.is_verified) ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f5f5f7] rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-[14px] font-medium">Verification</span>
                  </div>
                  <span className="text-[12px] text-[#86868b]">
                    {docs.filter(d => d.verifiedAt || d.verified_at).length}/2 Verified
                  </span>
                </div>
              </div>
              {!(supplierProfile?.isVerified || supplierProfile?.is_verified) && (
                <p className="mt-4 text-[12px] text-[#86868b] leading-relaxed">
                  Your profile will be listed publicly once Admin verifies your Trade License and VAT Certificate.
                </p>
              )}
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[24px] p-6 shadow-lg text-white">
              <h3 className="text-[17px] font-semibold mb-2">Total Submissions</h3>
              <p className="text-[48px] font-bold">{submissions.length}</p>
              <p className="text-white/70 text-[14px]">Quotes submitted to RFQs</p>
            </div>

            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#d2d2d7]/30">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Required Documents</h3>
              <div className="space-y-3">
                {['trade_license', 'vat_certificate'].map(type => {
                  const doc = docs.find(d => (d.documentType || d.document_type) === type);
                  return (
                    <div key={type} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#86868b]" />
                        <span className="text-[13px] capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      {(doc?.verifiedAt || doc?.verified_at) ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : doc ? (
                        <Clock className="w-4 h-4 text-orange-500" />
                      ) : (
                        <span className="text-[11px] text-red-500 font-medium">Missing</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Company Certifications Section */}
            <CompanyCertifications supplierProfile={supplierProfile} />
          </div>

          {/* Right Column: Quick Actions & Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* What Suppliers Can Do */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-[20px] p-6">
              <h3 className="text-[17px] font-bold text-emerald-800 mb-3">What You Can Do as a Supplier</h3>
              <ul className="space-y-2 text-[14px] text-emerald-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Browse RFQs posted by Purchase Managers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Submit competitive quotes for RFQs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Generate professional quotations with VAT calculation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Track your submission status and win rate
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('rfqs')}
                className="group bg-white rounded-[20px] p-6 border border-[#d2d2d7]/30 hover:border-emerald-400 hover:shadow-lg transition-all text-left"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Eye className="w-6 h-6 text-emerald-600 group-hover:text-white" />
                </div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">Browse RFQs</h3>
                <p className="text-[12px] text-[#86868b]">View open requests from Purchase Managers</p>
              </button>

              <button
                onClick={() => setActiveTab('generator')}
                className="group bg-white rounded-[20px] p-6 border border-[#d2d2d7]/30 hover:border-emerald-400 hover:shadow-lg transition-all text-left"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Calculator className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">Create Quotation</h3>
                <p className="text-[12px] text-[#86868b]">Generate professional quotes instantly</p>
              </button>

              <button
                onClick={() => setActiveTab('quotes')}
                className="group bg-white rounded-[20px] p-6 border border-[#d2d2d7]/30 hover:border-emerald-400 hover:shadow-lg transition-all text-left"
              >
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <FileText className="w-6 h-6 text-amber-600 group-hover:text-white" />
                </div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">My Quotes</h3>
                <p className="text-[12px] text-[#86868b]">Track all your submissions</p>
              </button>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-[#d2d2d7]/30 shadow-sm">
                <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">Total Quotes</p>
                <p className="text-[28px] font-bold text-[#1d1d1f]">{submissions.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#d2d2d7]/30 shadow-sm">
                <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">Accepted</p>
                <p className="text-[28px] font-bold text-green-600">
                  {submissions.filter(s => s.status === 'accepted').length}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#d2d2d7]/30 shadow-sm">
                <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">Success Rate</p>
                <p className="text-[28px] font-bold text-emerald-600">
                  {submissions.length > 0
                    ? Math.round((submissions.filter(s => s.status === 'accepted').length / submissions.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Recent RFQs Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-semibold text-[#1d1d1f]">Latest Open RFQs from Purchase Managers</h2>
                <button
                  onClick={() => setActiveTab('rfqs')}
                  className="text-emerald-600 text-[14px] hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {availableRfqs.length === 0 ? (
                <div className="bg-white rounded-[20px] p-8 border border-dashed border-[#d2d2d7] text-center">
                  <Package className="w-10 h-10 text-[#d2d2d7] mx-auto mb-3" />
                  <p className="text-[15px] text-[#86868b]">No open RFQs available at the moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableRfqs.slice(0, 3).map(rfq => (
                    <div key={rfq._id || rfq.id} className="bg-white rounded-[16px] p-4 border border-[#d2d2d7]/30 hover:border-emerald-400 transition-all flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-[15px] font-semibold text-[#1d1d1f]">{rfq.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="px-2 py-0.5 bg-[#f5f5f7] text-emerald-600 text-[10px] font-bold rounded-md uppercase">
                            {rfq.metricSystem || rfq.metric_system}
                          </span>
                          <span className="text-[12px] text-[#86868b]">
                            Deadline: {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'Open'}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/rfqs/${rfq.uniqueLink || rfq.unique_link}`}
                        className="px-4 py-2 bg-emerald-500 text-white text-[13px] font-semibold rounded-full hover:bg-emerald-600 transition-all"
                      >
                        Submit Quote
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rfqs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[24px] font-bold text-[#1d1d1f]">Open RFQs from Purchase Managers</h2>
              <p className="text-[15px] text-[#86868b] mt-1">Browse and respond to requests with your best quotes</p>
            </div>
            <Link href="/rfqs" className="text-emerald-600 text-[14px] hover:underline flex items-center gap-1">
              Browse Full Market <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {availableRfqs.length === 0 ? (
              <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-[#d2d2d7]">
                <Package className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
                <p className="text-[17px] text-[#1d1d1f] font-medium">No open RFQs at the moment</p>
                <p className="text-[14px] text-[#86868b] mt-1">Check back later for new opportunities from Purchase Managers</p>
              </div>
            ) : (
              availableRfqs.map(rfq => (
                <div key={rfq._id || rfq.id} className="bg-white rounded-[20px] p-6 border border-[#d2d2d7]/30 hover:border-emerald-400 transition-all shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-[19px] font-semibold text-[#1d1d1f]">{rfq.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg uppercase border border-emerald-200">
                          {rfq.metricSystem || rfq.metric_system} System Required
                        </span>
                        <span className="text-[13px] text-[#86868b]">
                          Posted: {new Date(rfq.createdAt || rfq.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/rfqs/${rfq.uniqueLink || rfq.unique_link}`}
                      className="p-2.5 bg-[#f5f5f7] rounded-full text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                      title="View & Submit Quote"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>
                  <p className="text-[14px] text-[#424245] line-clamp-2 mb-4">
                    {rfq.description || 'Technical specifications and requirements available upon viewing.'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#f5f5f7]">
                    <div className="flex items-center gap-2 text-[13px] text-[#86868b]">
                      <Clock className="w-4 h-4" />
                      <span>Deadline: {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'No deadline set'}</span>
                    </div>
                    <Link
                      href={`/rfqs/${rfq.uniqueLink || rfq.unique_link}`}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-full text-[14px] font-semibold hover:bg-emerald-600 transition-all"
                    >
                      <Send className="w-4 h-4" /> Submit Quote
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-[24px] font-bold text-[#1d1d1f]">My Submitted Quotes</h2>
            <p className="text-[15px] text-[#86868b] mt-1">Track all your quote submissions and their status</p>
          </div>

          <div className="bg-white rounded-[24px] overflow-hidden border border-[#d2d2d7]/30 shadow-sm">
            {submissions.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
                <p className="text-[17px] text-[#1d1d1f] font-medium">No quotes submitted yet</p>
                <p className="text-[14px] text-[#86868b] mt-1">Browse open RFQs from Purchase Managers and submit your first quote</p>
                <button
                  onClick={() => setActiveTab('rfqs')}
                  className="mt-6 px-6 py-2.5 bg-emerald-500 text-white rounded-full text-[14px] font-semibold hover:bg-emerald-600 transition-all"
                >
                  Browse Open RFQs
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f5f5f7] border-b border-[#d2d2d7]/30">
                    <tr>
                      <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Quote #</th>
                      <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">RFQ / Project</th>
                      <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f5f7]">
                    {submissions.map((sub) => {
                      const subId = sub._id || sub.id;
                      return (
                      <tr key={subId} className="hover:bg-[#fbfbfd] transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-[13px] font-mono font-bold text-emerald-600">
                            {sub.quote?.quoteNumber || sub.quotes?.quote_number || `QS-${String(subId).slice(0, 6).toUpperCase()}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[14px] font-semibold text-[#1d1d1f]">{sub.rfq?.title || sub.rfqs?.title || 'Direct Quote'}</p>
                          <p className="text-[12px] text-[#86868b]">{sub.rfq?.metricSystem || sub.rfqs?.metric_system || 'Standard'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[14px] font-bold text-[#1d1d1f]">
                            {sub.quote?.currency || sub.quotes?.currency || 'AED'} {(sub.quote?.totalAmount || sub.quotes?.total_amount)?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            sub.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            sub.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                            sub.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sub.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#86868b]">
                          {new Date(sub.createdAt || sub.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'brands' && (
        <SupplierBrandsTab
          myBrands={myBrands}
          setMyBrands={setMyBrands}
        />
      )}

      {activeTab === 'products' && (
        <SupplierProductsTab
          myProducts={myProducts}
          setMyProducts={setMyProducts}
          myBrands={myBrands}
        />
      )}

      {activeTab === 'analytics' && user && (
        <SupplierAnalyticsTab userId={user.id} />
      )}

      {activeTab === 'generator' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[24px] font-bold text-[#1d1d1f]">Professional Quotation Generator</h2>
              <p className="text-[15px] text-[#86868b] mt-1">Create high-standard quotes with VAT calculation, lead times, and professional formatting</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-[12px] font-bold text-emerald-700">Instant Generation</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#f5f5f7] to-white p-8 rounded-[32px] border border-[#d2d2d7]/30">
            <QuoteBuilder
              metricSystem="Metric"
              onSave={async (data) => {
                console.log("Quote Data:", data);
                toast.success("Quotation generated successfully! You can now download or send it.");
              }}
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-[20px] p-6">
            <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-2">Pro Tips for Winning Quotes</h3>
            <ul className="space-y-2 text-[13px] text-[#424245]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Always match the metric system required by the RFQ (Metric/Imperial)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Include detailed technical specifications for each line item
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Be competitive with pricing but maintain realistic lead times
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Set a reasonable validity period (typically 15-30 days)
              </li>
            </ul>
          </div>
        </div>
        )}
        </PageLayout>
      </>
    );
  }

// === Supplier Brands Tab Component ===
function SupplierBrandsTab({ myBrands, setMyBrands }: { myBrands: any[]; setMyBrands: (b: any[]) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "", description: "", logoUrl: "", websiteUrl: "" });
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const handleTemplate = async () => {
    try {
      const res = await fetch("/api/supplier/brands/template", { credentials: "same-origin" });
      if (!res.ok) { toast.error("Failed to download template"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "brands-products-template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded!");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/supplier/brands/export", { credentials: "same-origin" });
      if (!res.ok) { toast.error("Failed to export"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-brands-products.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported successfully!");
    } catch {
      toast.error("Failed to export");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/supplier/brands/import", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(friendlyError(data.error, "Failed to import"));
      } else {
        toast.success(`Imported ${data.brandsCreated} brands and ${data.productsCreated} products!`);
        // Refresh brands list
        const brandRes = await fetch("/api/supplier/brands", { credentials: "same-origin" });
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          setMyBrands(Array.isArray(brandData) ? brandData : []);
        }
      }
    } catch {
      toast.error("Failed to import");
    }
    setImporting(false);
    e.target.value = "";
  };

  const resetForm = () => {
    setForm({ name: "", category: "", description: "", logoUrl: "", websiteUrl: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", credentials: "same-origin", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, logoUrl: data.url || data.secure_url }));
        toast.success("Logo uploaded");
      } else {
        toast.error("Failed to upload logo");
      }
    } catch {
      toast.error("Failed to upload logo");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Brand name is required"); return; }
    setSaving(true);

    try {
      const url = editingId ? `/api/supplier/brands/${editingId}` : "/api/supplier/brands";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to save brand"));
      } else {
        const data = await res.json();
        if (editingId) {
          setMyBrands(myBrands.map(b => ((b._id || b.id) === editingId ? { ...b, ...data } : b)));
          toast.success("Brand updated!");
        } else {
          setMyBrands([data, ...myBrands]);
          toast.success("Brand created!");
        }
        resetForm();
      }
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to save brand"));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/supplier/brands/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to delete brand"));
        return;
      }
      setMyBrands(myBrands.filter(b => (b._id || b.id) !== id));
      toast.success("Brand deleted");
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to delete brand"));
    }
  };

  const startEdit = (brand: any) => {
    setEditingId(brand._id || brand.id);
    setForm({
      name: brand.name || "",
      category: brand.category || "",
      description: brand.description || "",
      logoUrl: brand.logoUrl || "",
      websiteUrl: brand.websiteUrl || "",
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#1d1d1f]">My Brands</h2>
          <p className="text-[15px] text-[#86868b] mt-1">Create and manage your product brands</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleTemplate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f7] text-[#424245] rounded-full text-[13px] font-semibold hover:bg-[#e8e8ed] transition-all">
            <FileSpreadsheet className="w-4 h-4" /> Template
          </button>
          <button onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f7] text-[#424245] rounded-full text-[13px] font-semibold hover:bg-[#e8e8ed] transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f7] text-[#424245] rounded-full text-[13px] font-semibold hover:bg-[#e8e8ed] transition-all cursor-pointer">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={() => { if (isAdding) resetForm(); else setIsAdding(true); }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-full text-[14px] font-bold hover:bg-emerald-600 transition-all"
          >
            {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Create Brand</>}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-[24px] p-6 border border-emerald-200 shadow-sm">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">
            {editingId ? "Edit Brand" : "Create New Brand"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Brand Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., AcmeCool" className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500">
                  <option value="">Select category...</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Brand description..." rows={3}
                className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Website URL</label>
                <input type="url" value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
                  placeholder="https://example.com" className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Brand Logo</label>
                <div className="flex items-center gap-3">
                  {form.logoUrl && (
                    <img src={form.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-[#d2d2d7]" />
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm text-center hover:bg-[#f5f5f7] transition-colors">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                        <span className="flex items-center justify-center gap-2 text-[#86868b]">
                          <Upload className="w-4 h-4" /> {form.logoUrl ? "Change Logo" : "Upload Logo"}
                        </span>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm text-[#86868b] hover:text-[#1d1d1f]">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving..." : editingId ? "Update Brand" : "Create Brand"}
              </button>
            </div>
          </form>
        </div>
      )}

      {myBrands.length === 0 && !isAdding ? (
        <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-[#d2d2d7]">
          <Award className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">No brands created yet</p>
          <p className="text-[14px] text-[#86868b] mt-1">Create your first brand and list products under it</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myBrands.map(brand => {
            const bid = brand._id || brand.id;
            return (
              <div key={bid} className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} className="w-14 h-14 rounded-2xl object-cover border border-[#d2d2d7]" />
                    ) : (
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <Award className="w-7 h-7 text-emerald-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{brand.name}</h3>
                        {brand.verified && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Verified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[12px] text-[#86868b]">
                        {brand.category && <span>Category: {brand.category}</span>}
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" /> {brand.productCount || 0} Products
                        </span>
                        {brand.websiteUrl && (
                          <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Website
                          </a>
                        )}
                      </div>
                      {brand.description && <p className="text-sm text-[#424245] mt-1 line-clamp-2">{brand.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(brand)} className="p-2 text-[#86868b] hover:bg-[#f5f5f7] rounded-lg">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(bid)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === Supplier Products Tab Component ===
const GCC_REGIONS = ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"];

const CERT_TYPES = ["AHRI", "UL", "FM", "ISO 9001", "ISO 14001", "OHSAS 18001"];

function SupplierProductsTab({ myProducts, setMyProducts, myBrands }: { myProducts: any[]; setMyProducts: (p: any[]) => void; myBrands: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [certRows, setCertRows] = useState<{ certification_type: string; certificate_number: string }[]>([]);
  const [form, setForm] = useState({
    name: "", brand: "", brand_id: "", category: "", model_number: "",
    description: "", price_range_min: "", price_range_max: "",
    currency: "AED", availability: "in_stock", service_regions: [] as string[],
    specs: [{ key: "", value: "" }],
  });

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const handleProductExport = async () => {
    try {
      const res = await fetch("/api/supplier/products/export", { credentials: "same-origin" });
      if (!res.ok) { toast.error("Failed to export"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-products.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Products exported!");
    } catch {
      toast.error("Failed to export");
    }
  };

  const handleProductTemplate = async () => {
    try {
      const res = await fetch("/api/supplier/products/template", { credentials: "same-origin" });
      if (!res.ok) { toast.error("Failed to download template"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product-import-template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded!");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleProductImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/supplier/products/import", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(friendlyError(data.error, "Failed to import"));
      } else {
        toast.success(`Imported ${data.created} products! (${data.skipped} skipped)`);
        // Refresh products
        const prodRes = await fetch("/api/supplier-products?mine=true", { credentials: "same-origin" });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setMyProducts(Array.isArray(prodData) ? prodData : []);
        }
      }
    } catch {
      toast.error("Failed to import");
    }
    setImporting(false);
    e.target.value = "";
  };

  const toggleRegion = (r: string) => {
    setForm(prev => ({
      ...prev,
      service_regions: prev.service_regions.includes(r)
        ? prev.service_regions.filter(x => x !== r)
        : [...prev.service_regions, r],
    }));
  };

  const updateSpec = (idx: number, field: "key" | "value", val: string) => {
    const specs = [...form.specs];
    specs[idx] = { ...specs[idx], [field]: val };
    setForm({ ...form, specs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    setSaving(true);

    const techSpecs: Record<string, string> = {};
    form.specs.filter(s => s.key && s.value).forEach(s => { techSpecs[s.key] = s.value; });

    try {
      const res = await fetch("/api/supplier-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: form.name,
          brand: form.brand || null,
          brand_id: form.brand_id || null,
          category: form.category || null,
          modelNumber: form.model_number || null,
          description: form.description || null,
          technicalSpecs: Object.keys(techSpecs).length > 0 ? techSpecs : null,
          priceRangeMin: form.price_range_min ? parseFloat(form.price_range_min) : null,
          priceRangeMax: form.price_range_max ? parseFloat(form.price_range_max) : null,
          currency: form.currency,
          availability: form.availability,
          serviceRegions: form.service_regions,
          certifications: certRows.filter(c => c.certification_type).map(c => ({
            certificationType: c.certification_type,
            certificateNumber: c.certificate_number,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to add product"));
      } else {
        const data = await res.json();
        toast.success("Product submitted for review!");
        setMyProducts([data, ...myProducts]);
        setIsAdding(false);
        setCertRows([]);
        setForm({ name: "", brand: "", brand_id: "", category: "", model_number: "", description: "", price_range_min: "", price_range_max: "", currency: "AED", availability: "in_stock", service_regions: [], specs: [{ key: "", value: "" }] });
      }
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to add product"));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/supplier-products/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to delete"));
        return;
      }
      setMyProducts(myProducts.filter(p => (p._id || p.id) !== id));
      toast.success("Product removed");
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to delete"));
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved": return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Approved</span>;
      case "rejected": return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">Rejected</span>;
      default: return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">Pending Review</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#1d1d1f]">My Product Catalog</h2>
          <p className="text-[15px] text-[#86868b] mt-1">Add your products for Purchase Managers to discover</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleProductTemplate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f7] text-[#424245] rounded-full text-[13px] font-semibold hover:bg-[#e8e8ed] transition-all">
            <FileSpreadsheet className="w-4 h-4" /> Template
          </button>
          <button onClick={handleProductExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f7] text-[#424245] rounded-full text-[13px] font-semibold hover:bg-[#e8e8ed] transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f7] text-[#424245] rounded-full text-[13px] font-semibold hover:bg-[#e8e8ed] transition-all cursor-pointer">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import
            <input type="file" accept=".xlsx,.xls" onChange={handleProductImport} className="hidden" />
          </label>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-full text-[14px] font-bold hover:bg-emerald-600 transition-all"
          >
            {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Add Product</>}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-[24px] p-6 border border-emerald-200 shadow-sm">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Add New Product</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Product Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., 19XR Centrifugal Chiller"
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Brand</label>
                {myBrands.length > 0 ? (
                  <select
                    value={form.brand_id}
                    onChange={e => {
                      const selected = myBrands.find((b: any) => (b._id || b.id) === e.target.value);
                      setForm({ ...form, brand_id: e.target.value, brand: selected?.name || "" });
                    }}
                    className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select brand...</option>
                    {myBrands.map((b: any) => (
                      <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g., Carrier (or create a brand in My Brands tab)"
                    className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500">
                  <option value="">Select category...</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Model Number</label>
                <input type="text" value={form.model_number} onChange={e => setForm({ ...form, model_number: e.target.value })}
                  placeholder="e.g., 19XR-500" className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Product description..." rows={3}
                className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500" />
            </div>

            {/* Technical Specs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#1d1d1f]">Technical Specifications</label>
                <button type="button" onClick={() => setForm({ ...form, specs: [...form.specs, { key: "", value: "" }] })}
                  className="text-emerald-600 text-xs font-medium hover:underline">+ Add Spec</button>
              </div>
              <div className="space-y-2">
                {form.specs.map((spec, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={spec.key} onChange={e => updateSpec(idx, "key", e.target.value)}
                      placeholder="Parameter (e.g., Capacity)" className="flex-1 px-3 py-2 border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                    <input type="text" value={spec.value} onChange={e => updateSpec(idx, "value", e.target.value)}
                      placeholder="Value (e.g., 500 TR)" className="flex-1 px-3 py-2 border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                    {form.specs.length > 1 && (
                      <button type="button" onClick={() => setForm({ ...form, specs: form.specs.filter((_, i) => i !== idx) })}
                        className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & Availability */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Min Price</label>
                <input type="number" step="0.01" value={form.price_range_min} onChange={e => setForm({ ...form, price_range_min: e.target.value })}
                  placeholder="0.00" className="w-full px-3 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Max Price</label>
                <input type="number" step="0.01" value={form.price_range_max} onChange={e => setForm({ ...form, price_range_max: e.target.value })}
                  placeholder="0.00" className="w-full px-3 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Currency</label>
                <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#d2d2d7] rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500">
                  <option value="AED">AED</option><option value="USD">USD</option><option value="SAR">SAR</option>
                  <option value="EUR">EUR</option><option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Availability</label>
                <select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#d2d2d7] rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-500">
                  <option value="in_stock">In Stock</option><option value="made_to_order">Made to Order</option><option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Service Regions */}
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Service Regions (GCC)</label>
              <div className="flex flex-wrap gap-2">
                {GCC_REGIONS.map(r => (
                  <button key={r} type="button" onClick={() => toggleRegion(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      form.service_regions.includes(r)
                        ? "bg-emerald-500 text-white"
                        : "bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]"
                    }`}>{r}</button>
                ))}
              </div>
            </div>

            {/* Product Certifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#1d1d1f]">Product Certifications (AHRI, UL, FM)</label>
                <button type="button" onClick={() => setCertRows([...certRows, { certification_type: "", certificate_number: "" }])}
                  className="text-emerald-600 text-xs font-medium hover:underline">+ Add Certification</button>
              </div>
              {certRows.length > 0 && (
                <div className="space-y-2">
                  {certRows.map((cert, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select value={cert.certification_type}
                        onChange={e => { const c = [...certRows]; c[idx] = { ...c[idx], certification_type: e.target.value }; setCertRows(c); }}
                        className="flex-1 px-3 py-2 border border-[#d2d2d7] rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500">
                        <option value="">Select type...</option>
                        {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="text" value={cert.certificate_number}
                        onChange={e => { const c = [...certRows]; c[idx] = { ...c[idx], certificate_number: e.target.value }; setCertRows(c); }}
                        placeholder="Certificate #" className="flex-1 px-3 py-2 border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                      <button type="button" onClick={() => setCertRows(certRows.filter((_, i) => i !== idx))}
                        className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
              {certRows.length === 0 && (
                <p className="text-xs text-[#86868b]">Add AHRI, UL, FM, or ISO certifications for this product</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-sm text-[#86868b] hover:text-[#1d1d1f]">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      {myProducts.length === 0 && !isAdding ? (
        <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-[#d2d2d7]">
          <Package className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">No products added yet</p>
          <p className="text-[14px] text-[#86868b] mt-1">Add your products so Purchase Managers can find you</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myProducts.map(product => {
            const pid = product._id || product.id;
            return (
            <div key={pid} className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{product.name}</h3>
                    {statusBadge(product.status)}
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-[#86868b] mt-1">
                    {product.brand && <span>Brand: {product.brand}</span>}
                    {product.category && <span>Category: {product.category}</span>}
                    {(product.modelNumber || product.model_number) && <span>Model: {product.modelNumber || product.model_number}</span>}
                  </div>
                  {product.description && <p className="text-sm text-[#424245] mt-2 line-clamp-2">{product.description}</p>}
                  {(product.priceRangeMin || product.price_range_min) && (
                    <p className="text-sm font-medium text-[#1d1d1f] mt-2">
                      {product.currency} {Number(product.priceRangeMin || product.price_range_min).toLocaleString()}
                      {(product.priceRangeMax || product.price_range_max) && ` - ${Number(product.priceRangeMax || product.price_range_max).toLocaleString()}`}
                    </p>
                  )}
                  {(product.serviceRegions || product.service_regions)?.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {(product.serviceRegions || product.service_regions).map((r: string) => (
                        <span key={r} className="px-2 py-0.5 bg-[#f5f5f7] text-[#86868b] text-[10px] rounded-full">{r}</span>
                      ))}
                    </div>
                  )}
                  {product.status === "rejected" && (product.rejectionReason || product.rejection_reason) && (
                    <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">Rejection reason: {product.rejectionReason || product.rejection_reason}</p>
                    </div>
                  )}
                </div>
                <button onClick={() => handleDelete(pid)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === Company Certifications Component (Overview Tab) ===
const ALL_COMPANY_CERTS = ["ISO 9001", "ISO 14001", "OHSAS 18001", "AHRI", "UL", "FM"];

function CompanyCertifications({ supplierProfile }: { supplierProfile: any }) {
  const [certs, setCerts] = useState<string[]>(supplierProfile?.certifications || []);
  const [saving, setSaving] = useState(false);

  const toggleCert = (cert: string) => {
    setCerts(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);
  };

  const saveCerts = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/suppliers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ certifications: certs }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to update certifications"));
      } else {
        toast.success("Certifications updated!");
      }
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to update certifications"));
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#d2d2d7]/30">
      <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
        <Award className="w-5 h-5 text-emerald-600" />
        Company Certifications
      </h3>
      <p className="text-[12px] text-[#86868b] mb-3">Select certifications your company holds</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_COMPANY_CERTS.map(cert => (
          <button
            key={cert}
            type="button"
            onClick={() => toggleCert(cert)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
              certs.includes(cert)
                ? "bg-emerald-500 text-white"
                : "bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]"
            }`}
          >
            {certs.includes(cert) ? "✓ " : ""}{cert}
          </button>
        ))}
      </div>
      <button
        onClick={saveCerts}
        disabled={saving}
        className="w-full px-4 py-2 bg-emerald-500 text-white rounded-xl text-[13px] font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
        {saving ? "Saving..." : "Save Certifications"}
      </button>
    </div>
  );
}
