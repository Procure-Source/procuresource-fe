"use client";

import React, { useState, useEffect, Suspense } from 'react';
import PageLayout from "@/components/page-layout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Plus, FileText, CheckCircle2,
  Clock, AlertCircle, Share2, Clipboard, ChevronRight,
  Trash2, Briefcase, ShieldCheck, BarChart3, Users, AlertTriangle,
  FolderOpen, MapPin, Search, Globe, X
} from "lucide-react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { friendlyError } from "@/lib/friendly-error";

export default function PMDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-12 h-12 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PMDashboardContent />
    </Suspense>
  );
}

function PMDashboardContent() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newRfq, setNewRfq] = useState({
    title: '',
    description: '',
    metric_system: 'Metric',
    deadline: '',
    lead_time: '',
    currency: 'AED',
    project_id: '',
    visibility: 'public'
  });

  useEffect(() => {
    if (authLoading || !user) return;

    async function loadDashboardData() {
      // Load RFQs via API route (bypasses RLS issues)
      try {
        const rfqRes = await fetch('/api/rfqs', {
          credentials: "same-origin",
        });
        if (rfqRes.ok) {
          const rfqData = await rfqRes.json();
          setRfqs(rfqData || []);
        }
      } catch {
        console.error("Failed to load RFQs");
      }

      // Load Docs
      try {
        const docRes = await fetch('/api/auth/documents', {
          credentials: "same-origin",
        });
        if (docRes.ok) {
          const docData = await docRes.json();
          setDocs(docData || []);
        }
      } catch {
        console.error("Failed to load documents");
      }

      // Load Projects
      try {
        const projectRes = await fetch('/api/projects', {
          credentials: "same-origin",
        });
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProjects(projectData || []);
        }
      } catch {
        console.error("Failed to load projects");
      }

      // Load verified suppliers for targeted RFQ
      try {
        const supplierRes = await fetch('/api/suppliers', {
          credentials: "same-origin",
        });
        if (supplierRes.ok) {
          const supplierData = await supplierRes.json();
          setAllSuppliers(supplierData || []);
        }
      } catch {
        console.error("Failed to load suppliers");
      }

      // If coming from a project page, pre-fill project_id and open RFQ form
      const projectId = searchParams.get('project_id');
      if (projectId) {
        setNewRfq(prev => ({ ...prev, project_id: projectId }));
        setIsCreating(true);
      }

      setLoading(false);
    }

    loadDashboardData();
  }, [searchParams, authLoading, user]);

  const [rfqItems, setRfqItems] = useState([{ description: '', quantity: 1, metric_spec: '' }]);
  const [rfqFile, setRfqFile] = useState<File | null>(null);
  const [targetedSuppliers, setTargetedSuppliers] = useState<string[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const [supplierSearch, setSupplierSearch] = useState('');

  const addRfqItem = () => setRfqItems([...rfqItems, { description: '', quantity: 1, metric_spec: '' }]);
  const removeRfqItem = (index: number) => setRfqItems(rfqItems.filter((_, i) => i !== index));
  const updateRfqItem = (index: number, field: string, value: any) => {
    const updated = [...rfqItems];
    updated[index] = { ...updated[index], [field]: value };
    setRfqItems(updated);
  };

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRfq.title) return;

    try {
      // Upload file if provided
      let fileUrl = null;
      if (rfqFile) {
        const formData = new FormData();
        formData.append("file", rfqFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          credentials: "same-origin",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          fileUrl = uploadData.url;
        }
      }

      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "same-origin",
        body: JSON.stringify({
          title: newRfq.title,
          description: newRfq.description,
          metric_system: newRfq.metric_system,
          deadline: newRfq.deadline || null,
          lead_time: newRfq.lead_time || null,
          currency: newRfq.currency,
          project_id: newRfq.project_id || null,
          visibility: newRfq.visibility,
          items: rfqItems,
          targeted_suppliers: targetedSuppliers,
          file_url: fileUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create RFQ");

      toast.success("RFQ Created successfully!");
      setRfqs([data, ...rfqs]);
      setIsCreating(false);
      setNewRfq({ title: '', description: '', metric_system: 'Metric', deadline: '', lead_time: '', currency: 'AED', project_id: '', visibility: 'public' });
      setTargetedSuppliers([]);
      setSupplierSearch('');
      setRfqItems([{ description: '', quantity: 1, metric_spec: '' }]);
      setRfqFile(null);
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to create RFQ"));
    }
  };

  const copyLink = (link: string) => {
    const fullLink = `${window.location.origin}/rfqs/${link}`;
    navigator.clipboard.writeText(fullLink);
    toast.success("Link copied to clipboard!");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">Loading Purchase Manager Hub...</p>
        </div>
      </div>
    );
  }

  // Role verification - if user is NOT a purchase_manager, show error
  if (user && user.role !== 'purchase_manager') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center max-w-md p-8 bg-white rounded-[24px] shadow-lg">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-[24px] font-bold text-[#1d1d1f] mb-2">Access Denied</h1>
          <p className="text-[15px] text-[#86868b] mb-6">
            This dashboard is for Purchase Managers only. Your account role is: <strong>{user.role}</strong>
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
        <title>Purchase Manager Dashboard | ProcureSource</title>
        <PageLayout
          title="Purchase Manager Hub"
          subtitle="Create RFQs, share with suppliers, and compare quotes"
          showBackButton={false}
        >
          {/* ========== PURCHASE MANAGER ROLE IDENTITY BANNER ========== */}
          <div className="mb-8">
            {/* HUGE ROLE INDICATOR */}
            <div className="bg-gradient-to-br from-[#0066cc] via-[#0077ed] to-[#4da3ff] rounded-[24px] p-8 shadow-2xl text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative">
                {/* Role Label - VERY PROMINENT */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-4 py-1.5 bg-white text-[#0066cc] rounded-full text-[11px] font-black uppercase tracking-widest">
                    Purchase Manager
                  </div>
                </div>

                {/* Main Header */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30">
                    <Briefcase className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-[36px] font-black tracking-tight">Purchase Manager Hub</h1>
                    <p className="text-blue-100 text-[16px] mt-1 max-w-xl">
                      You are a <strong>Purchase Manager</strong>. Create RFQs, share links with suppliers, and compare quotes to select the best offers.
                    </p>
                  </div>
                </div>

                {/* What PMs CAN and CANNOT do */}
                <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-2">You CAN:</p>
                    <ul className="space-y-1 text-[13px] text-white/90">
                      <li>Create and publish RFQs (Request for Quotations)</li>
                      <li>Generate unique shareable links for suppliers</li>
                      <li>Receive and compare quotes from multiple suppliers</li>
                      <li>Select winning suppliers and manage procurement</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-2">You CANNOT:</p>
                    <ul className="space-y-1 text-[13px] text-white/70">
                      <li>Submit quotes to RFQs (only Suppliers can)</li>
                      <li>Access the Supplier dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Stats & Docs */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#d2d2d7]/30">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Verification Status</h3>
            <div className="space-y-3">
              {['trade_license', 'vat_certificate'].map(type => {
                const doc = docs.find(d => d.document_type === type);
                return (
                  <div key={type} className="flex items-center justify-between p-3 bg-[#f5f5f7] rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#86868b]" />
                      <span className="text-[14px] font-medium capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    {doc?.verified_at ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0066cc] to-[#0077ed] rounded-[24px] p-6 shadow-lg text-white">
            <h3 className="text-[17px] font-semibold mb-2">Total RFQs Created</h3>
            <p className="text-[48px] font-bold">{rfqs.length}</p>
            <p className="text-white/80 text-[14px]">Active requests in the market</p>
          </div>

          {/* Projects Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#d2d2d7]/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Projects</h3>
              <Link href="/pm/projects" className="text-[#0066cc] text-[13px] font-medium hover:underline">View All</Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#0066cc]/10 rounded-2xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-[#0066cc]" />
              </div>
              <div>
                <p className="text-[28px] font-bold text-[#1d1d1f]">{projects.length}</p>
                <p className="text-[13px] text-[#86868b]">Active projects</p>
              </div>
            </div>
            {projects.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/pm/projects/${p.id}`} className="flex items-center gap-2 py-2 text-sm text-[#1d1d1f] hover:text-[#0066cc] transition-colors">
                <Briefcase className="w-4 h-4 text-[#86868b]" />
                <span className="truncate">{p.name}</span>
                {p.location && <span className="text-[#86868b] text-xs flex items-center gap-0.5 ml-auto"><MapPin className="w-3 h-3" />{p.location}</span>}
              </Link>
            ))}
            <Link
              href="/pm/projects"
              className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f7] text-[#0066cc] rounded-xl text-sm font-medium hover:bg-[#e8e8ed] transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </div>
        </div>

        {/* Right Column: RFQ Management */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Templates for PM */}
          <div className="bg-white rounded-[24px] p-6 border border-[#d2d2d7]/30 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Fast RFQ Templates</h3>
              <span className="text-[12px] px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-bold">PRO FEATURE</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'HVAC Package', icon: '❄️', specs: '50Hz / 60Hz' },
                { title: 'Pumping Station', icon: '💧', specs: 'Cast Iron' },
                { title: 'Electrical Panel', icon: '⚡', specs: 'IP65 Rated' },
                { title: 'Fire Fighting', icon: '🔥', specs: 'UL/FM Listed' },
              ].map((temp, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setNewRfq({
                      ...newRfq,
                      title: `${temp.title} - ${new Date().getFullYear()} Project`,
                      description: `Seeking comprehensive quotes for ${temp.title}. Must meet ${temp.specs} standards.`
                    });
                    setIsCreating(true);
                  }}
                  className="flex flex-col items-center p-4 bg-[#f5f5f7] rounded-2xl hover:bg-[#e8e8ed] transition-all border border-transparent hover:border-[#0066cc]/20 group"
                >
                  <span className="text-[24px] mb-2 group-hover:scale-110 transition-transform">{temp.icon}</span>
                  <span className="text-[13px] font-bold text-[#1d1d1f] text-center">{temp.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Your RFQs</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0066cc] text-white rounded-full text-[14px] font-bold hover:bg-[#0077ed] transition-all shadow-lg shadow-[#0066cc]/10"
              >
                {isCreating ? 'Cancel' : <><Plus className="w-4 h-4" /> Create New RFQ</>}
              </button>
            </div>
          </div>

          {isCreating && (
            <div className="bg-white rounded-[24px] p-8 shadow-xl border border-[#0066cc]/20 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-[19px] font-semibold mb-6">Instant RFQ Generator</h3>
              <form onSubmit={handleCreateRFQ} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">RFQ Title</label>
                    <input
                      type="text"
                      value={newRfq.title}
                      onChange={e => setNewRfq({...newRfq, title: e.target.value})}
                      placeholder="e.g., Supply of AHU Units for Dubai Project"
                      className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-xl text-[15px] focus:outline-none focus:border-[#0066cc]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Deadline (Optional)</label>
                    <input
                      type="date"
                      value={newRfq.deadline}
                      onChange={e => setNewRfq({...newRfq, deadline: e.target.value})}
                      className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-xl text-[15px] focus:outline-none focus:border-[#0066cc]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Lead Time</label>
                    <input
                      type="text"
                      value={newRfq.lead_time}
                      onChange={e => setNewRfq({...newRfq, lead_time: e.target.value})}
                      placeholder="e.g., 2-3 Weeks Ex-Stock"
                      className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-xl text-[15px] focus:outline-none focus:border-[#0066cc]"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Currency</label>
                    <select
                      value={newRfq.currency}
                      onChange={e => setNewRfq({...newRfq, currency: e.target.value})}
                      className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-xl text-[15px] focus:outline-none focus:border-[#0066cc] bg-white"
                    >
                      <option value="AED">AED - UAE Dirham</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="SAR">SAR - Saudi Riyal</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Detailed Requirements</label>
                  <textarea
                    value={newRfq.description}
                    onChange={e => setNewRfq({...newRfq, description: e.target.value})}
                    placeholder="Mention specific technical requirements..."
                    className="w-full h-[120px] p-4 border border-[#d2d2d7] rounded-xl text-[15px] focus:outline-none focus:border-[#0066cc] resize-none"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-[#f5f5f7]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[16px] font-semibold text-[#1d1d1f]">Structured Item List</h4>
                    <button
                      type="button"
                      onClick={addRfqItem}
                      className="text-[#0066cc] text-[13px] font-medium hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {rfqItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-3 p-4 bg-[#f5f5f7] rounded-xl relative group">
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={item.description}
                            onChange={e => updateRfqItem(idx, 'description', e.target.value)}
                            placeholder="Item Description (e.g. 50kW AHU)"
                            className="w-full h-[40px] px-3 bg-white border border-[#d2d2d7] rounded-lg text-[14px] focus:outline-none focus:border-[#0066cc]"
                          />
                        </div>
                        <div className="w-full md:w-[100px]">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => updateRfqItem(idx, 'quantity', parseInt(e.target.value))}
                            placeholder="Qty"
                            className="w-full h-[40px] px-3 bg-white border border-[#d2d2d7] rounded-lg text-[14px] focus:outline-none focus:border-[#0066cc]"
                          />
                        </div>
                        <div className="w-full md:w-[150px]">
                          <input
                            type="text"
                            value={item.metric_spec}
                            onChange={e => updateRfqItem(idx, 'metric_spec', e.target.value)}
                            placeholder="Spec (e.g. 50mm)"
                            className="w-full h-[40px] px-3 bg-white border border-[#d2d2d7] rounded-lg text-[14px] focus:outline-none focus:border-[#0066cc]"
                          />
                        </div>
                        {rfqItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRfqItem(idx)}
                            className="absolute -right-2 -top-2 bg-white text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#f5f5f7]">
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Metric System</label>
                    <select
                      value={newRfq.metric_system}
                      onChange={e => setNewRfq({...newRfq, metric_system: e.target.value})}
                      className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-xl text-[15px] focus:outline-none focus:border-[#0066cc] bg-white"
                    >
                      <option>Metric</option>
                      <option>Imperial</option>
                      <option>Custom Engineering Units</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Link to Project (Optional)</label>
                    <select
                      value={newRfq.project_id}
                      onChange={e => setNewRfq({...newRfq, project_id: e.target.value})}
                      className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-xl text-[15px] focus:outline-none focus:border-[#0066cc] bg-white"
                    >
                      <option value="">No project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">Upload RFQ Document (Optional)</label>
                    <input
                      type="file"
                      onChange={e => setRfqFile(e.target.files?.[0] || null)}
                      className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-xl text-[15px] focus:outline-none focus:border-[#0066cc] py-2"
                    />
                  </div>
                </div>

                {/* Visibility & Targeting */}
                <div className="pt-4 border-t border-[#f5f5f7]">
                  <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">RFQ Visibility</label>
                  <div className="flex gap-2 mb-3">
                    <button type="button" onClick={() => setNewRfq({...newRfq, visibility: 'public'})}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        newRfq.visibility === 'public' ? 'bg-[#0066cc] text-white' : 'bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]'
                      }`}>
                      <Globe className="w-4 h-4" /> Public — All Suppliers
                    </button>
                    <button type="button" onClick={() => setNewRfq({...newRfq, visibility: 'targeted'})}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        newRfq.visibility === 'targeted' ? 'bg-[#0066cc] text-white' : 'bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]'
                      }`}>
                      <Users className="w-4 h-4" /> Targeted — Invite Only
                    </button>
                  </div>
                  {newRfq.visibility === 'targeted' && (
                    <div className="space-y-3 p-4 bg-[#f5f5f7] rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                          <input type="text" value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)}
                            placeholder="Search verified suppliers..."
                            className="w-full pl-9 pr-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-[#0066cc] bg-white" />
                        </div>
                        {newRfq.project_id && (
                          <button type="button" onClick={() => {
                            const project = projects.find(p => p.id === newRfq.project_id);
                            const pSupplierIds = project?.project_suppliers?.map((ps: any) => ps.supplier_id).filter(Boolean) || [];
                            setTargetedSuppliers(prev => [...new Set([...prev, ...pSupplierIds])]);
                          }}
                            className="px-4 py-2.5 bg-white text-[#0066cc] rounded-xl text-sm font-medium hover:bg-[#e8e8ed] whitespace-nowrap border border-[#d2d2d7]">
                            + Project Suppliers
                          </button>
                        )}
                      </div>
                      {targetedSuppliers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {targetedSuppliers.map(sid => {
                            const s = allSuppliers.find((sup: any) => sup.user_id === sid);
                            return s ? (
                              <span key={sid} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-[#0066cc] rounded-full text-xs font-medium border border-[#0066cc]/20">
                                {s.name}
                                <button type="button" onClick={() => setTargetedSuppliers(prev => prev.filter(id => id !== sid))} className="hover:text-red-500">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                      {supplierSearch && (
                        <div className="max-h-48 overflow-y-auto bg-white border border-[#d2d2d7] rounded-xl divide-y divide-[#f5f5f7]">
                          {allSuppliers
                            .filter((s: any) => s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || s.country?.toLowerCase().includes(supplierSearch.toLowerCase()))
                            .slice(0, 10)
                            .map((s: any) => (
                              <button key={s.user_id} type="button"
                                onClick={() => {
                                  if (!targetedSuppliers.includes(s.user_id)) setTargetedSuppliers(prev => [...prev, s.user_id]);
                                  setSupplierSearch('');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f5f5f7] transition-colors">
                                <div className="w-8 h-8 bg-[#0066cc] rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {s.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#1d1d1f] truncate">{s.name}</p>
                                  <p className="text-xs text-[#86868b]">{s.city ? `${s.city}, ` : ''}{s.country}</p>
                                </div>
                                {targetedSuppliers.includes(s.user_id) && <CheckCircle2 className="w-4 h-4 text-[#0066cc] shrink-0" />}
                              </button>
                            ))}
                          {allSuppliers.filter((s: any) => s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || s.country?.toLowerCase().includes(supplierSearch.toLowerCase())).length === 0 && (
                            <p className="px-4 py-3 text-sm text-[#86868b]">No suppliers found</p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-[#86868b]">Only invited suppliers can see and respond to this RFQ. {targetedSuppliers.length} supplier{targetedSuppliers.length !== 1 ? 's' : ''} selected.</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-[52px] bg-[#0066cc] text-white rounded-full text-[16px] font-semibold hover:bg-[#0077ed] transition-all"
                >
                  Generate & Publish RFQ
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {rfqs.length === 0 && !isCreating ? (
              <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-[#d2d2d7]">
                <AlertCircle className="w-12 h-12 text-[#86868b] mx-auto mb-4" />
                <p className="text-[17px] text-[#1d1d1f] font-medium">No RFQs created yet</p>
                <p className="text-[14px] text-[#86868b] mt-1">Start by creating your first request for suppliers to respond to.</p>
              </div>
            ) : (
              rfqs.map(rfq => (
                <div key={rfq.id} className="group bg-white rounded-[24px] p-6 shadow-sm border border-[#d2d2d7]/30 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${rfq.status === 'open' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">{rfq.status}</span>
                        <span className="text-[12px] text-[#d2d2d7]">•</span>
                        <span className="text-[12px] text-[#86868b]">{rfq.metric_system} System</span>
                      </div>
                      <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-2 group-hover:text-[#0066cc] transition-colors">{rfq.title}</h3>
                      <p className="text-[14px] text-[#424245] line-clamp-2 mb-4">{rfq.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyLink(rfq.unique_link)}
                        className="p-2 bg-[#f5f5f7] rounded-full text-[#86868b] hover:bg-[#0066cc] hover:text-white transition-all"
                        title="Copy shareable link for suppliers"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this RFQ? This cannot be undone.")) return;
                          try {
                            const res = await fetch(`/api/rfqs/${rfq.id}`, {
                              method: 'DELETE',
                              credentials: "same-origin",
                            });
                            if (res.ok) {
                              setRfqs(rfqs.filter(r => r.id !== rfq.id));
                              toast.success("RFQ deleted");
                            } else {
                              const data = await res.json();
                              toast.error(friendlyError(data.error, "Failed to delete RFQ"));
                            }
                          } catch {
                            toast.error("Failed to delete RFQ");
                          }
                        }}
                        className="p-2 bg-[#f5f5f7] rounded-full text-[#86868b] hover:bg-red-50 hover:text-red-500 transition-all"
                        title="Delete RFQ"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[#f5f5f7]">
                    <div className="flex items-center gap-4 text-[13px] text-[#86868b]">
                      <span className="flex items-center gap-1"><Clipboard className="w-4 h-4" /> {rfq.submission_count || 0} Submission{rfq.submission_count === 1 ? '' : 's'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Created {new Date(rfq.created_at).toLocaleDateString()}</span>
                    </div>
                    <Link
                      href={`/pm/rfqs/${rfq.id}`}
                      className="text-[#0066cc] text-[14px] font-medium flex items-center gap-1 hover:underline"
                    >
                      View & Compare Quotes <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
        </PageLayout>
      </>
    );
  }
