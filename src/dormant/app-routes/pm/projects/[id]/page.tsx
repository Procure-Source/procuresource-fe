"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageLayout from "@/components/page-layout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Upload, FileText, Users, Briefcase, Zap,
  Trash2, Plus, Search, CheckCircle2, XCircle, Clock,
  MapPin, Building2, Shield, Star, ChevronRight, Loader2,
  Copy, ExternalLink
} from "lucide-react";
import { friendlyError } from "@/lib/friendly-error";

type Tab = "overview" | "documents" | "matcher" | "suppliers" | "rfqs";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Document upload state
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("spec");

  // AI Matcher state
  const [specText, setSpecText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);

  // Supplier search state
  const [supplierSearch, setSupplierSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingSuppliers, setSearchingSuppliers] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", location: "", project_type: "", description: "" });

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, { credentials: "same-origin" });
      if (!res.ok) {
        toast.error("Project not found");
        router.push("/pm/projects");
        return;
      }
      const data = await res.json();
      setProject(data);
      setEditForm({
        name: data.name,
        location: data.location || "",
        project_type: data.projectType || data.project_type || "",
        description: data.description || "",
      });

      if (data.projectSpecMatches?.length > 0 || data.project_spec_matches?.length > 0) {
        setMatchResults(data.projectSpecMatches || data.project_spec_matches || []);
      }
    } catch {
      toast.error("Failed to load project");
      router.push("/pm/projects");
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // --- Document Upload ---
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      // Upload file to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", credentials: "same-origin", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();

      // Save document record
      const res = await fetch(`/api/projects/${id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          fileName: file.name,
          fileUrl: uploadData.url,
          documentType: docType,
        }),
      });
      if (!res.ok) throw new Error("Failed to save document");
      toast.success("Document uploaded");
      fetchProject();
    } catch {
      toast.error(friendlyError(null, "Upload failed"));
    }
    setUploading(false);
  }

  async function handleDeleteDoc(docId: string) {
    try {
      const res = await fetch(`/api/projects/${id}/documents?docId=${docId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to delete document"));
      } else {
        toast.success("Document removed");
        fetchProject();
      }
    } catch {
      toast.error("Failed to delete document");
    }
  }

  // --- AI Spec Matcher ---
  async function handleAnalyze() {
    if (!specText.trim()) {
      toast.error("Please enter specification text");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/projects/${id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ spec_text: specText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMatchResults((prev) => [data, ...prev]);
      setSpecText("");
      toast.success("Analysis complete");
      fetchProject();
    } catch {
      toast.error(friendlyError(null, "Analysis failed"));
    }
    setAnalyzing(false);
  }

  // --- Supplier Management ---
  async function searchSuppliers() {
    if (!supplierSearch.trim()) return;
    setSearchingSuppliers(true);
    try {
      const res = await fetch(`/api/suppliers?search=${encodeURIComponent(supplierSearch)}`, { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      }
    } catch {
      setSearchResults([]);
    }
    setSearchingSuppliers(false);
  }

  async function addSupplier(supplierId: string, source = "manual") {
    try {
      const res = await fetch(`/api/projects/${id}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ supplierId, source }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to add supplier"));
      } else {
        toast.success("Supplier added to project");
        fetchProject();
      }
    } catch {
      toast.error("Failed to add supplier");
    }
  }

  async function removeSupplier(supplierId: string) {
    try {
      const res = await fetch(`/api/projects/${id}/suppliers?supplierId=${supplierId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to remove supplier"));
      } else {
        toast.success("Supplier removed");
        fetchProject();
      }
    } catch {
      toast.error("Failed to remove supplier");
    }
  }

  // --- Edit Project ---
  async function handleSaveEdit() {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: editForm.name,
          location: editForm.location || null,
          projectType: editForm.project_type || null,
          description: editForm.description || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to update project"));
      } else {
        toast.success("Project updated");
        setEditing(false);
        fetchProject();
      }
    } catch {
      toast.error("Failed to update project");
    }
  }

  if (loading || !project) {
    return (
      <PageLayout title="Project" subtitle="">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  const projectDocs = project.projectDocuments || project.project_documents || [];
  const projectSuppliers = project.projectSuppliers || project.project_suppliers || [];
  const projectSpecMatches = project.projectSpecMatches || project.project_spec_matches || [];
  const projectRfqs = project.rfqs || [];

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <Briefcase className="w-4 h-4" /> },
    { id: "documents", label: "Documents", icon: <FileText className="w-4 h-4" />, count: projectDocs.length },
    { id: "matcher", label: "AI Matcher", icon: <Zap className="w-4 h-4" />, count: projectSpecMatches.length },
    { id: "suppliers", label: "Suppliers", icon: <Users className="w-4 h-4" />, count: projectSuppliers.length },
    { id: "rfqs", label: "RFQs", icon: <FileText className="w-4 h-4" />, count: projectRfqs.length },
  ];

  return (
    <PageLayout title={project.name} subtitle={project.location || "Project Details"} backButtonHref="/pm/projects">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-[#f5f5f7] rounded-2xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-[#1d1d1f] shadow-sm"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-[#0066cc]/10 text-[#0066cc] rounded-full font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* === OVERVIEW TAB === */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
            {editing ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1d1d1f]">Edit Project</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Location</label>
                    <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Type</label>
                    <select value={editForm.project_type} onChange={(e) => setEditForm({ ...editForm, project_type: e.target.value })} className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc]">
                      <option value="">Select type...</option>
                      <option value="commercial">Commercial</option>
                      <option value="residential">Residential</option>
                      <option value="industrial">Industrial</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="healthcare">Healthcare</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc]" />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-[#86868b] hover:text-[#1d1d1f]">Cancel</button>
                  <button onClick={handleSaveEdit} className="px-5 py-2 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0055b3]">Save</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#1d1d1f]">{project.name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-[#86868b]">
                      {project.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project.location}</span>}
                      {(project.projectType || project.project_type) && <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {project.projectType || project.project_type}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(project.createdAt || project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => setEditing(true)} className="px-4 py-2 text-sm font-medium text-[#0066cc] hover:bg-[#0066cc]/5 rounded-xl transition-colors">Edit</button>
                </div>
                {project.description && <p className="text-[#1d1d1f] text-sm">{project.description}</p>}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-[#f5f5f7] rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#1d1d1f]">{projectDocs.length}</p>
                    <p className="text-xs text-[#86868b] mt-1">Documents</p>
                  </div>
                  <div className="bg-[#f5f5f7] rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#1d1d1f]">{projectSuppliers.length}</p>
                    <p className="text-xs text-[#86868b] mt-1">Suppliers</p>
                  </div>
                  <div className="bg-[#f5f5f7] rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#1d1d1f]">{projectRfqs.length}</p>
                    <p className="text-xs text-[#86868b] mt-1">RFQs</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === DOCUMENTS TAB === */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Upload Document</h3>
              <div className="flex items-center gap-4">
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20">
                  <option value="boq">Bill of Quantities (BOQ)</option>
                  <option value="spec">Technical Specification</option>
                  <option value="drawing">Drawing</option>
                  <option value="other">Other</option>
                </select>
                <label className="flex-1 relative">
                  <div className={`flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-dashed border-[#d2d2d7] rounded-xl cursor-pointer hover:border-[#0066cc] transition-colors ${uploading ? "opacity-50" : ""}`}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-[#86868b]" />}
                    <span className="text-sm text-[#86868b]">{uploading ? "Uploading..." : "Choose file"}</span>
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            {projectDocs.length > 0 ? (
              <div className="bg-white rounded-3xl border border-[#d2d2d7]/30 shadow-sm divide-y divide-[#d2d2d7]/30">
                {projectDocs.map((doc: any) => (
                  <div key={doc._id || doc.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#0066cc]" />
                      <div>
                        <p className="text-sm font-medium text-[#1d1d1f]">{doc.fileName || doc.file_name}</p>
                        <p className="text-xs text-[#86868b] capitalize">{doc.documentType || doc.document_type} &middot; {new Date(doc.createdAt || doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={doc.fileUrl || doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-[#0066cc] hover:bg-[#0066cc]/5 rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleDeleteDoc(doc._id || doc.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#d2d2d7]/30">
                <FileText className="w-10 h-10 text-[#86868b] mx-auto mb-2" />
                <p className="text-[#86868b] text-sm">No documents uploaded yet</p>
              </div>
            )}
          </div>
        )}

        {/* === AI MATCHER TAB === */}
        {activeTab === "matcher" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">AI Specification Matcher</h3>
              <p className="text-sm text-[#86868b] mb-4">Paste your technical specifications and our AI will find matching products and suppliers.</p>
              <textarea value={specText} onChange={(e) => setSpecText(e.target.value)} placeholder="Paste technical specifications here..." rows={5} className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc]" />
              <button onClick={handleAnalyze} disabled={analyzing || !specText.trim()} className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0055b3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {analyzing ? "Analyzing..." : "Analyze Specifications"}
              </button>
            </div>

            {matchResults.map((result: any, idx: number) => {
              const data = result.match_results || result.matchResults || result;
              return (
                <div key={result._id || result.id || idx} className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[#1d1d1f]">{data.category || "Analysis Result"}</h4>
                    <span className="text-xs text-[#86868b]">{result.createdAt || result.created_at ? new Date(result.createdAt || result.created_at).toLocaleString() : "Just now"}</span>
                  </div>
                  {data.parameters && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {Object.entries(data.parameters).map(([key, value]) => (
                        <div key={key} className="bg-[#f5f5f7] rounded-xl px-3 py-2">
                          <p className="text-[10px] text-[#86868b] uppercase font-bold">{key}</p>
                          <p className="text-sm text-[#1d1d1f] font-medium">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {data.matches && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#86868b] mb-2">Matching Products</p>
                      {data.matches.map((match: any, mIdx: number) => (
                        <div key={mIdx} className="flex items-center justify-between bg-[#f5f5f7] rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 flex items-center justify-center text-sm font-bold text-[#0066cc]">{match.score}</div>
                            <div>
                              <p className="text-sm font-medium text-[#1d1d1f]">{match.model}</p>
                              <p className="text-xs text-[#86868b]">{match.brand} &middot; {match.capacity}</p>
                            </div>
                          </div>
                          {match.certified && (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium"><Shield className="w-3 h-3" /> Certified</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {matchResults.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#d2d2d7]/30">
                <Zap className="w-10 h-10 text-[#86868b] mx-auto mb-2" />
                <p className="text-[#86868b] text-sm">No analyses yet. Paste your specs above to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* === SUPPLIERS TAB === */}
        {activeTab === "suppliers" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#d2d2d7]/30 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Add Suppliers</h3>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                  <input type="text" value={supplierSearch} onChange={(e) => setSupplierSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchSuppliers()} placeholder="Search suppliers by name, country, or city..." className="w-full pl-10 pr-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc]" />
                </div>
                <button onClick={searchSuppliers} disabled={searchingSuppliers} className="px-5 py-2.5 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0055b3] disabled:opacity-50">
                  {searchingSuppliers ? "Searching..." : "Search"}
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((supplier) => {
                    const alreadyAdded = projectSuppliers.some((ps: any) => (ps.supplierId || ps.supplier_id) === (supplier.userId || supplier.user_id || supplier._id));
                    return (
                      <div key={supplier._id || supplier.id} className="flex items-center justify-between bg-[#f5f5f7] rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-[#0066cc]" />
                          <div>
                            <p className="text-sm font-medium text-[#1d1d1f]">{supplier.name}</p>
                            <p className="text-xs text-[#86868b]">{supplier.city}, {supplier.country}</p>
                          </div>
                          {(supplier.isVerified || supplier.is_verified) && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                          )}
                        </div>
                        <button onClick={() => addSupplier(supplier.userId || supplier.user_id || supplier._id)} disabled={alreadyAdded} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${alreadyAdded ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#0066cc] text-white hover:bg-[#0055b3]"}`}>
                          {alreadyAdded ? "Added" : "Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="bg-white rounded-3xl border border-[#d2d2d7]/30 shadow-sm">
              <div className="p-4 border-b border-[#d2d2d7]/30">
                <h3 className="font-semibold text-[#1d1d1f]">Shortlisted Suppliers ({projectSuppliers.length})</h3>
              </div>
              {projectSuppliers.length > 0 ? (
                <div className="divide-y divide-[#d2d2d7]/30">
                  {projectSuppliers.map((ps: any) => {
                    const s = ps.suppliers || ps.supplier || {};
                    return (
                      <div key={ps._id || ps.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-[#0066cc]" />
                          <div>
                            <p className="text-sm font-medium text-[#1d1d1f]">{s.name || "Supplier"}</p>
                            <p className="text-xs text-[#86868b]">{s.city && `${s.city}, `}{s.country || ""}{ps.source !== "manual" && ` \u00b7 via ${ps.source}`}</p>
                          </div>
                          {(s.isVerified || s.is_verified) && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                          )}
                        </div>
                        <button onClick={() => removeSupplier(ps.supplierId || ps.supplier_id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8"><Users className="w-8 h-8 text-[#86868b] mx-auto mb-2" /><p className="text-sm text-[#86868b]">No suppliers shortlisted yet</p></div>
              )}
            </div>
            {projectSuppliers.length > 0 && (
              <div className="flex justify-end">
                <Link href={`/pm/dashboard?project_id=${project._id || project.id}`} className="flex items-center gap-2 px-6 py-3 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0055b3] transition-colors">
                  Raise RFQ for Selected Suppliers <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* === RFQS TAB === */}
        {activeTab === "rfqs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#1d1d1f]">Project RFQs</h3>
              <Link href={`/pm/dashboard?project_id=${project._id || project.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0055b3]">
                <Plus className="w-4 h-4" /> Create RFQ
              </Link>
            </div>
            {projectRfqs.length > 0 ? (
              <div className="bg-white rounded-3xl border border-[#d2d2d7]/30 shadow-sm divide-y divide-[#d2d2d7]/30">
                {projectRfqs.map((rfq: any) => (
                  <Link key={rfq._id || rfq.id} href={`/pm/rfqs/${rfq._id || rfq.id}`} className="flex items-center justify-between p-4 hover:bg-[#f5f5f7] transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-[#1d1d1f] group-hover:text-[#0066cc]">{rfq.title}</p>
                      <p className="text-xs text-[#86868b]">
                        {new Date(rfq.createdAt || rfq.created_at).toLocaleDateString()} &middot;{" "}
                        <span className={rfq.status === "open" ? "text-green-600" : "text-[#86868b]"}>{rfq.status}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#d2d2d7] group-hover:text-[#0066cc]" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#d2d2d7]/30">
                <FileText className="w-10 h-10 text-[#86868b] mx-auto mb-2" />
                <p className="text-[#86868b] text-sm">No RFQs created for this project yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
