"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import PageLayout from "@/components/page-layout";
import { toast } from "sonner";
import {
  Shield, CheckCircle2, XCircle, FileText,
  Users, ExternalLink, Clock, Search,
  Loader2, ChevronDown, ChevronRight, ShieldCheck, ShieldOff,
  FolderTree, Plus, Trash2, Pencil, GripVertical, Package, Eye, LogOut,
  Flag, BarChart3, UserCog, AlertTriangle, TrendingUp
} from "lucide-react";
import { friendlyError } from "@/lib/friendly-error";
import { getTagLabel, getTagsForRole, isSupplySideRole, PLATFORM_TAGS, USER_ROLES } from "@/lib/tags";

type TabId = 'users' | 'products' | 'categories' | 'flags' | 'analytics' | 'team';

interface AdminProfile {
  type: "jwt" | "legacy";
  tags: string[];
  username?: string;
  id?: string;
  email?: string;
  fullName?: string;
}

const ALL_TABS: { id: TabId; label: string; icon: React.ComponentType<any>; requiredTags: string[] }[] = [
  { id: 'users', label: 'Users & Verification', icon: Users, requiredTags: ["super_admin", "verification_team", "support_team"] },
  { id: 'products', label: 'Supplier Products', icon: Package, requiredTags: ["super_admin", "verification_team", "category_manager"] },
  { id: 'categories', label: 'Categories', icon: FolderTree, requiredTags: ["super_admin", "category_manager"] },
  { id: 'flags', label: 'Flagged Content', icon: Flag, requiredTags: ["super_admin", "support_team"] },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, requiredTags: ["super_admin", "sales_team", "finance_team"] },
  { id: 'team', label: 'Platform Team', icon: UserCog, requiredTags: ["super_admin"] },
];

function hasAccess(adminTags: string[], requiredTags: string[]): boolean {
  if (adminTags.includes("super_admin")) return true;
  return requiredTags.some(t => adminTags.includes(t));
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Fetch admin profile for tag-based tab filtering
        const meRes = await fetch("/api/admin/me", { credentials: "include" });
        if (!meRes.ok) { router.push("/admin"); return; }
        const profile = await meRes.json();
        setAdminProfile(profile);

        // Load users data
        const usersRes = await fetch("/api/admin/users", { credentials: "include" });
        if (usersRes.ok) {
          setAuthed(true);
          setUsers(await usersRes.json());
          setIsLoading(false);
        } else {
          router.push("/admin");
        }
      } catch {
        router.push("/admin");
      }
    }
    checkAuth();
  }, [router]);

  // Filter tabs based on admin's tags
  const adminTags = adminProfile?.tags || [];
  const visibleTabs = ALL_TABS.filter(tab => hasAccess(adminTags, tab.requiredTags));

  // If active tab is not visible, switch to first visible tab
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find(t => t.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" });
      if (res.ok) {
        setUsers(await res.json());
      } else if (res.status === 401) {
        router.push("/admin");
        return;
      } else {
        toast.error("Failed to load users");
      }
    } catch {
      toast.error("Failed to load users");
    }
    setIsLoading(false);
  }

  // Refetch when filters change
  useEffect(() => {
    if (!authed) return;
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, authed]);

  const handleVerify = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, action: "verify" }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to verify user"));
      } else {
        toast.success("User verified");
        setUsers(users.map(u => u.id === userId ? {
          ...u,
          isVerified: true,
          documents: u.documents.map((d: any) => ({ ...d, verifiedAt: d.verifiedAt || new Date().toISOString() })),
        } : u));
      }
    } catch {
      toast.error("Failed to verify user");
    }
    setActionLoading(null);
  };

  const handleUnverify = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, action: "unverify" }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to unverify user"));
      } else {
        toast.success("User unverified");
        setUsers(users.map(u => u.id === userId ? {
          ...u,
          isVerified: false,
          documents: u.documents.map((d: any) => ({ ...d, verifiedAt: null })),
        } : u));
      }
    } catch {
      toast.error("Failed to unverify user");
    }
    setActionLoading(null);
  };

  const handleDocVerify = async (userId: string, docId: string, currentlyVerified: boolean) => {
    setActionLoading(docId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          documentId: docId,
          action: currentlyVerified ? "unverify_document" : "verify_document",
        }),
      });
      if (!res.ok) {
        toast.error("Failed to update document");
      } else {
        toast.success(currentlyVerified ? "Document unverified" : "Document verified");
        setUsers(users.map(u => u.id === userId ? {
          ...u,
          documents: u.documents.map((d: any) =>
            d.id === docId
              ? { ...d, verifiedAt: currentlyVerified ? null : new Date().toISOString() }
              : d
          ),
        } : u));
      }
    } catch {
      toast.error("Failed to update document");
    }
    setActionLoading(null);
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case "supplier": return { text: "Supplier", bg: "bg-emerald-100", color: "text-emerald-700" };
      case "manufacturer": return { text: "Manufacturer", bg: "bg-sky-100", color: "text-sky-700" };
      case "agent": return { text: "Agent", bg: "bg-cyan-100", color: "text-cyan-700" };
      case "purchase_manager": return { text: "PM", bg: "bg-blue-100", color: "text-blue-700" };
      case "consultant": return { text: "Consultant", bg: "bg-indigo-100", color: "text-indigo-700" };
      case "admin": return { text: "Admin", bg: "bg-purple-100", color: "text-purple-700" };
      default: return { text: role, bg: "bg-gray-100", color: "text-gray-700" };
    }
  };

  const stats = {
    total: users.length,
    verified: users.filter(u => u.isVerified).length,
    suppliers: users.filter(u => isSupplySideRole(u.role)).length,
    pms: users.filter(u => u.role === "purchase_manager" || u.role === "consultant").length,
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
      </div>
    );
  }

  return (
    <PageLayout title="Admin Control Center" subtitle="Manage users, categories, and verification" showBackButton={false}>
      {/* Tab Navigation */}
      <div className="mb-8 flex items-center gap-2 border-b border-[#d2d2d7]/30 pb-4 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0066cc] text-white shadow-lg shadow-[#0066cc]/20'
                : 'bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
        <button
          onClick={async () => {
            await fetch("/api/admin/auth", { method: "DELETE", credentials: "include" });
            router.push("/admin");
          }}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {activeTab === 'users' && (<>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg"><Users className="w-4 h-4 text-[#0066cc]" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Total Users</span>
          </div>
          <p className="text-[28px] font-bold text-[#1d1d1f]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-green-50 rounded-lg"><ShieldCheck className="w-4 h-4 text-green-600" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Verified</span>
          </div>
          <p className="text-[28px] font-bold text-green-600">{stats.verified}</p>
        </div>
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-emerald-50 rounded-lg"><Shield className="w-4 h-4 text-emerald-600" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Suppliers</span>
          </div>
          <p className="text-[28px] font-bold text-[#1d1d1f]">{stats.suppliers}</p>
        </div>
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg"><FileText className="w-4 h-4 text-blue-600" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">PMs</span>
          </div>
          <p className="text-[28px] font-bold text-[#1d1d1f]">{stats.pms}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#86868b] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full pl-11 pr-4 py-3 border border-[#d2d2d7] rounded-xl text-[14px] focus:outline-none focus:border-[#0066cc] bg-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-3 border border-[#d2d2d7] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#0066cc] min-w-[160px]"
        >
          <option value="">All Roles</option>
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role).text}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-[#f5f5f7] rounded-[24px] p-12 text-center border border-dashed border-[#d2d2d7]">
          <Users className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">No users found</p>
          <p className="text-[14px] text-[#86868b] mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] overflow-hidden border border-[#d2d2d7]/30 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#f5f5f7] border-b border-[#d2d2d7]/30">
              <tr>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider w-8"></th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Tags</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider text-center">Docs</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {users.map(user => {
                const isExpanded = expandedUser === user.id;
                const role = roleLabel(user.role);
                return (
                  <React.Fragment key={user.id}>
                    <tr className="hover:bg-[#fbfbfd] transition-colors">
                      <td className="pl-6 py-4">
                        <button
                          onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                          className="p-1 hover:bg-[#f5f5f7] rounded-md transition-colors"
                          title={user.documents.length > 0 ? "Show documents" : "No documents"}
                        >
                          {user.documents.length > 0 ? (
                            isExpanded ? <ChevronDown className="w-4 h-4 text-[#86868b]" /> : <ChevronRight className="w-4 h-4 text-[#86868b]" />
                          ) : (
                            <span className="w-4 h-4 block" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-semibold text-[#1d1d1f]">{user.fullName || "\u2014"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] text-[#424245]">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] text-[#424245]">{user.companyName || "\u2014"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${role.bg} ${role.color}`}>
                          {role.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(user.tags || []).length > 0 ? (
                            (user.tags || []).map((tag: string) => (
                              <span key={tag} className="px-2 py-0.5 bg-[#f5f5f7] text-[#424245] text-[10px] font-medium rounded-full">
                                {getTagLabel(tag)}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#86868b]">{"\u2014"}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[13px] font-medium text-[#1d1d1f]">{user.documents.length}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                            <Clock className="w-3 h-3" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {actionLoading === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#0066cc]" />
                        ) : user.isVerified ? (
                          <button
                            onClick={() => handleUnverify(user.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-full text-[12px] font-semibold hover:bg-red-100 transition-all"
                          >
                            <ShieldOff className="w-3.5 h-3.5" /> Unverify
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(user.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0066cc] text-white rounded-full text-[12px] font-semibold hover:bg-[#0077ed] transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                          </button>
                        )}
                      </td>
                    </tr>
                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 bg-[#fbfbfd]">
                          <div className="ml-8 space-y-4">
                            {/* Tag Editor */}
                            <div>
                              <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                                User Tags
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {getTagsForRole(user.role).map((tag) => {
                                  const isActive = (user.tags || []).includes(tag);
                                  return (
                                    <button
                                      key={tag}
                                      onClick={async () => {
                                        const newTags = isActive
                                          ? (user.tags || []).filter((t: string) => t !== tag)
                                          : [...(user.tags || []), tag];
                                        try {
                                          const res = await fetch("/api/admin/users", {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            credentials: "include",
                                            body: JSON.stringify({ userId: user.id, action: "update_tags", tags: newTags }),
                                          });
                                          if (res.ok) {
                                            setUsers(users.map((u: any) => u.id === user.id ? { ...u, tags: newTags } : u));
                                            toast.success("Tags updated");
                                          } else {
                                            toast.error("Failed to update tags");
                                          }
                                        } catch {
                                          toast.error("Failed to update tags");
                                        }
                                      }}
                                      className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                                        isActive
                                          ? "bg-[#0066cc] text-white border-[#0066cc]"
                                          : "bg-white text-[#424245] border-[#d2d2d7] hover:border-[#0066cc]"
                                      }`}
                                    >
                                      {getTagLabel(tag)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Documents */}
                            {user.documents.length > 0 && (
                              <div>
                                <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                                  Uploaded Documents ({user.documents.length})
                                </p>
                                <div className="space-y-2">
                                  {user.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#d2d2d7]/30">
                                      <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-[#86868b]" />
                                        <div>
                                          <p className="text-[13px] font-medium text-[#1d1d1f]">
                                            {(doc.documentType || "").replace(/_/g, " ").toUpperCase()}
                                          </p>
                                          <p className="text-[11px] text-[#86868b]">
                                            {doc.fileName} {"\u2014"} Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {doc.verifiedAt ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] text-green-700 font-semibold">
                                            <CheckCircle2 className="w-3 h-3" /> Verified {new Date(doc.verifiedAt).toLocaleDateString()}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                                            <Clock className="w-3 h-3" /> Pending
                                          </span>
                                        )}
                                        <button
                                          onClick={() => handleDocVerify(user.id, doc.id, !!doc.verifiedAt)}
                                          disabled={actionLoading === doc.id}
                                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all disabled:opacity-50 ${
                                            doc.verifiedAt
                                              ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                              : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"
                                          }`}
                                        >
                                          {actionLoading === doc.id ? "..." : doc.verifiedAt ? "Unverify" : "Verify"}
                                        </button>
                                        <a
                                          href={doc.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f5f5f7] text-[#1d1d1f] rounded-lg text-[11px] font-medium hover:bg-[#e8e8ed] transition-all"
                                        >
                                          View <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </>)}

      {activeTab === 'products' && <AdminSupplierProductsSection />}
      {activeTab === 'categories' && <AdminCategoriesSection />}
      {activeTab === 'flags' && <AdminFlaggedContentSection />}
      {activeTab === 'analytics' && <AdminAnalyticsSection />}
      {activeTab === 'team' && <AdminTeamSection />}
    </PageLayout>
  );
}

// === Supplier Products Review ===
function AdminSupplierProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/supplier-products?status=${statusFilter}`, { credentials: "include" });
      if (res.ok) {
        setProducts(await res.json());
      } else {
        toast.error("Failed to load products");
      }
    } catch {
      toast.error("Failed to load products");
    }
    setLoading(false);
  }

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/supplier-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, action, rejection_reason: rejectionReason || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, `Failed to ${action} product`));
      } else {
        toast.success(`Product ${action}d!`);
        setProducts(products.filter(p => (p._id || p.id) !== id));
        setExpandedProduct(null);
        setRejectionReason("");
      }
    } catch {
      toast.error(`Failed to ${action} product`);
    }
    setActionLoading(null);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved": return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Approved</span>;
      case "rejected": return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">Rejected</span>;
      default: return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#1d1d1f]">Supplier Products</h2>
          <p className="text-[15px] text-[#86868b] mt-1">Review and approve supplier product listings</p>
        </div>
        <div className="flex gap-2">
          {["pending", "approved", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold capitalize transition-all ${
                statusFilter === s
                  ? "bg-[#0066cc] text-white shadow-lg shadow-[#0066cc]/20"
                  : "bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-[#d2d2d7]">
          <Package className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">No {statusFilter} products</p>
          <p className="text-[14px] text-[#86868b] mt-1">
            {statusFilter === "pending" ? "All caught up! No products awaiting review." : `No ${statusFilter} products found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => {
            const pid = product._id || product.id;
            const isExpanded = expandedProduct === pid;
            const supplier = product.supplierId;
            return (
              <div key={pid} className="bg-white rounded-[20px] border border-[#d2d2d7]/30 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{product.name}</h3>
                        {statusBadge(product.status)}
                      </div>
                      <div className="flex items-center gap-3 text-[12px] text-[#86868b] mt-1">
                        {supplier?.name && <span>By: {supplier.name}</span>}
                        {supplier?.email && <span>({supplier.email})</span>}
                        {product.brand && <span>Brand: {product.brand}</span>}
                        {product.category && <span>Category: {product.category}</span>}
                        {product.productType && <span>Type: {product.productType}</span>}
                      </div>
                      {product.description && <p className="text-sm text-[#424245] mt-2 line-clamp-2">{product.description}</p>}
                      {product.certifications?.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-[#86868b] font-medium">Certifications:</span>
                          {product.certifications.map((cert: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full">
                              {cert.certificationType}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedProduct(isExpanded ? null : pid)}
                        className="p-2 text-[#86868b] hover:bg-[#f5f5f7] rounded-lg"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {statusFilter === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(pid, "approve")}
                            disabled={actionLoading === pid}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-full text-[12px] font-semibold hover:bg-green-100 transition-all disabled:opacity-50"
                          >
                            {actionLoading === pid ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => setExpandedProduct(isExpanded ? null : pid)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-full text-[12px] font-semibold hover:bg-red-100 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-[#f5f5f7]">
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
                      <div><span className="text-[#86868b]">Model:</span> <span className="font-medium">{product.modelNumber || "\u2014"}</span></div>
                      <div><span className="text-[#86868b]">Currency:</span> <span className="font-medium">{product.currency || "AED"}</span></div>
                      <div><span className="text-[#86868b]">Price:</span> <span className="font-medium">
                        {product.priceRangeMin ? `${product.priceRangeMin}${product.priceRangeMax ? ` - ${product.priceRangeMax}` : ""}` : "\u2014"}
                      </span></div>
                      <div><span className="text-[#86868b]">Availability:</span> <span className="font-medium capitalize">{(product.availability || "").replace(/_/g, " ")}</span></div>
                    </div>
                    {product.serviceRegions?.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[12px] text-[#86868b]">Regions:</span>
                        {product.serviceRegions.map((r: string) => (
                          <span key={r} className="px-2 py-0.5 bg-[#f5f5f7] text-[#424245] text-[10px] font-medium rounded-full">{r}</span>
                        ))}
                      </div>
                    )}
                    {product.certifications?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[12px] text-[#86868b] font-semibold mb-2">Certifications Detail:</p>
                        <div className="space-y-1">
                          {product.certifications.map((cert: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 text-[12px] p-2 bg-[#f5f5f7] rounded-lg">
                              <span className="font-semibold text-[#1d1d1f]">{cert.certificationType}</span>
                              {cert.standard && <span className="text-[#86868b]">Standard: {cert.standard}</span>}
                              {cert.issuingAuthority && <span className="text-[#86868b]">Issuer: {cert.issuingAuthority}</span>}
                              {cert.mandatory && <span className="text-[#86868b]">Mandatory: {cert.mandatory}</span>}
                              {cert.appliesIn && <span className="text-[#86868b]">Applies In: {cert.appliesIn}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {statusFilter === "pending" && (
                      <div className="mt-4 flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Rejection Reason (optional)</label>
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="w-full px-3 py-2 border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:border-[#0066cc]"
                          />
                        </div>
                        <button
                          onClick={() => handleAction(pid, "reject")}
                          disabled={actionLoading === pid}
                          className="px-5 py-2 bg-red-500 text-white rounded-full text-[13px] font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                        >
                          {actionLoading === pid && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Reject Product
                        </button>
                      </div>
                    )}
                    {product.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[12px] text-red-600">Rejection reason: {product.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === Product Categories Management ===
function AdminCategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", parentId: "", displayOrder: 0 });
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", { credentials: "include" });
      if (res.ok) {
        setCategories(await res.json());
      } else {
        toast.error("Failed to load categories");
      }
    } catch {
      toast.error("Failed to load categories");
    }
    setLoading(false);
  }

  const resetForm = () => {
    setForm({ name: "", description: "", parentId: "", displayOrder: 0 });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Category name is required"); return; }
    setSaving(true);

    try {
      if (editingId) {
        const res = await fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: editingId,
            name: form.name.trim(),
            description: form.description || null,
            parentId: form.parentId || null,
            displayOrder: form.displayOrder,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(friendlyError(err.error, "Failed to update category"));
        } else {
          const updated = await res.json();
          setCategories(categories.map(c => (c._id || c.id) === editingId ? updated : c));
          toast.success("Category updated!");
          resetForm();
        }
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description || null,
            parentId: form.parentId || null,
            displayOrder: form.displayOrder,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(friendlyError(err.error, "Failed to create category"));
        } else {
          const created = await res.json();
          setCategories([...categories, created]);
          toast.success("Category created!");
          resetForm();
        }
      }
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to save category"));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    // Check if any categories have this as parent
    const children = categories.filter(c => (c.parentId || c.parent_id)?.toString() === id);
    if (children.length > 0) {
      toast.error("Cannot delete: this category has sub-categories. Remove them first.");
      return;
    }

    setDeleteLoading(id);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(friendlyError(err.error, "Failed to delete category"));
      } else {
        setCategories(categories.filter(c => (c._id || c.id) !== id));
        toast.success("Category deleted");
      }
    } catch {
      toast.error("Failed to delete category");
    }
    setDeleteLoading(null);
  };

  const startEdit = (cat: any) => {
    const catId = cat._id || cat.id;
    setEditingId(catId);
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      parentId: (cat.parentId || cat.parent_id || "")?.toString() || "",
      displayOrder: cat.displayOrder ?? cat.display_order ?? 0,
    });
    setIsAdding(true);
  };

  // Build a tree for display
  const topLevel = categories.filter(c => !c.parentId && !c.parent_id);
  const getChildren = (parentId: string) =>
    categories.filter(c => (c.parentId || c.parent_id)?.toString() === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#1d1d1f]">Product Categories</h2>
          <p className="text-[15px] text-[#86868b] mt-1">Manage categories for products and supplier listings</p>
        </div>
        <button
          onClick={() => { if (isAdding) resetForm(); else setIsAdding(true); }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0066cc] text-white rounded-full text-[14px] font-bold hover:bg-[#0077ed] transition-all"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Add Category</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg"><FolderTree className="w-4 h-4 text-[#0066cc]" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Total</span>
          </div>
          <p className="text-[28px] font-bold text-[#1d1d1f]">{categories.length}</p>
        </div>
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-green-50 rounded-lg"><FolderTree className="w-4 h-4 text-green-600" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Top-Level</span>
          </div>
          <p className="text-[28px] font-bold text-green-600">{topLevel.length}</p>
        </div>
        <div className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-purple-50 rounded-lg"><FolderTree className="w-4 h-4 text-purple-600" /></div>
            <span className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider">Sub-Categories</span>
          </div>
          <p className="text-[28px] font-bold text-purple-600">{categories.length - topLevel.length}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white rounded-[24px] p-6 border border-[#0066cc]/20 shadow-sm">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">
            {editingId ? "Edit Category" : "Add New Category"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Category Name *</label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Chillers"
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-[#0066cc]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={e => setForm({ ...form, parentId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0066cc]"
                >
                  <option value="">None (Top-Level)</option>
                  {categories
                    .filter(c => (c._id || c.id) !== editingId)
                    .map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
                className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm resize-none focus:outline-none focus:border-[#0066cc]"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1">Display Order</label>
              <input
                type="number" value={form.displayOrder}
                onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-[#d2d2d7] rounded-xl text-sm focus:outline-none focus:border-[#0066cc]"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={resetForm}
                className="px-5 py-2.5 text-sm text-[#86868b] hover:text-[#1d1d1f]">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-[#0066cc] text-white rounded-full text-sm font-medium hover:bg-[#0077ed] disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      ) : categories.length === 0 && !isAdding ? (
        <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-[#d2d2d7]">
          <FolderTree className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">No categories yet</p>
          <p className="text-[14px] text-[#86868b] mt-1">Add your first product category</p>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] overflow-hidden border border-[#d2d2d7]/30 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#f5f5f7] border-b border-[#d2d2d7]/30">
              <tr>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Parent</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {categories.map(cat => {
                const catId = cat._id || cat.id;
                const parentCat = cat.parentId
                  ? categories.find(c => (c._id || c.id)?.toString() === cat.parentId?.toString())
                  : null;
                const childCount = getChildren(catId).length;
                return (
                  <tr key={catId} className="hover:bg-[#fbfbfd] transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[13px] text-[#86868b]">
                        <GripVertical className="w-3 h-3" />
                        {cat.displayOrder ?? cat.display_order ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {parentCat && <span className="text-[#d2d2d7]">{"\u2514"}</span>}
                        <span className="text-[14px] font-semibold text-[#1d1d1f]">{cat.name}</span>
                        {childCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full">
                            {childCount} sub
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-[#86868b] font-mono">{cat.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-[#424245]">{parentCat?.name || "\u2014"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-[#86868b] line-clamp-1">{cat.description || "\u2014"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-2 text-[#86868b] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(catId)}
                          disabled={deleteLoading === catId}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === catId
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// === Flagged Content Section ===
function AdminFlaggedContentSection() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);

  useEffect(() => {
    fetchFlags();
  }, [statusFilter]);

  async function fetchFlags() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/flags?status=${statusFilter}`, { credentials: "include" });
      if (res.ok) {
        setFlags(await res.json());
      } else {
        toast.error("Failed to load flagged content");
      }
    } catch {
      toast.error("Failed to load flagged content");
    }
    setLoading(false);
  }

  const handleAction = async (id: string, action: "dismiss" | "take_action") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, action, review_note: reviewNote || undefined }),
      });
      if (res.ok) {
        toast.success(action === "dismiss" ? "Flag dismissed" : "Action taken");
        setFlags(flags.filter(f => (f._id || f.id) !== id));
        setExpandedFlag(null);
        setReviewNote("");
      } else {
        toast.error("Failed to update flag");
      }
    } catch {
      toast.error("Failed to update flag");
    }
    setActionLoading(null);
  };

  const contentTypeLabel = (type: string) => {
    switch (type) {
      case "supplier_product": return { text: "Product", bg: "bg-blue-100", color: "text-blue-700" };
      case "supplier_profile": return { text: "Supplier", bg: "bg-emerald-100", color: "text-emerald-700" };
      case "rfq": return { text: "RFQ", bg: "bg-purple-100", color: "text-purple-700" };
      default: return { text: type, bg: "bg-gray-100", color: "text-gray-700" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#1d1d1f]">Flagged Content</h2>
          <p className="text-[15px] text-[#86868b] mt-1">Review content flagged by users</p>
        </div>
        <div className="flex gap-2">
          {["pending", "dismissed", "action_taken"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold capitalize transition-all ${
                statusFilter === s
                  ? "bg-[#0066cc] text-white shadow-lg shadow-[#0066cc]/20"
                  : "bg-[#f5f5f7] text-[#424245] hover:bg-[#e8e8ed]"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      ) : flags.length === 0 ? (
        <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-[#d2d2d7]">
          <Flag className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">No {statusFilter.replace(/_/g, " ")} flags</p>
          <p className="text-[14px] text-[#86868b] mt-1">
            {statusFilter === "pending" ? "All clear! No content awaiting review." : `No ${statusFilter.replace(/_/g, " ")} flags found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map(flag => {
            const fid = flag._id || flag.id;
            const isExpanded = expandedFlag === fid;
            const ct = contentTypeLabel(flag.contentType);
            return (
              <div key={fid} className="bg-white rounded-[20px] border border-[#d2d2d7]/30 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ct.bg} ${ct.color}`}>{ct.text}</span>
                        <span className="text-[14px] font-semibold text-[#1d1d1f]">{flag.reason}</span>
                      </div>
                      {flag.contentPreview && (
                        <p className="text-[13px] text-[#424245] mt-1">Content: {flag.contentPreview}</p>
                      )}
                      {flag.description && (
                        <p className="text-[13px] text-[#86868b] mt-1">{flag.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-[#86868b] mt-2">
                        <span>Flagged by: {flag.flaggedBy?.fullName || "Unknown"}</span>
                        <span>{new Date(flag.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusFilter === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(fid, "dismiss")}
                            disabled={actionLoading === fid}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f5f5f7] text-[#424245] rounded-full text-[12px] font-semibold hover:bg-[#e8e8ed] transition-all disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => setExpandedFlag(isExpanded ? null : fid)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-full text-[12px] font-semibold hover:bg-red-100 transition-all"
                          >
                            <Flag className="w-3.5 h-3.5" /> Take Action
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && statusFilter === "pending" && (
                  <div className="px-5 pb-5 border-t border-[#f5f5f7]">
                    <div className="mt-4 flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Review Note (optional)</label>
                        <input
                          type="text"
                          value={reviewNote}
                          onChange={e => setReviewNote(e.target.value)}
                          placeholder="Add a note about the action taken..."
                          className="w-full px-3 py-2 border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:border-[#0066cc]"
                        />
                      </div>
                      <button
                        onClick={() => handleAction(fid, "take_action")}
                        disabled={actionLoading === fid}
                        className="px-5 py-2 bg-red-500 text-white rounded-full text-[13px] font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === fid && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Confirm Action
                      </button>
                    </div>
                  </div>
                )}

                {flag.reviewNote && (
                  <div className="px-5 pb-4 border-t border-[#f5f5f7]">
                    <p className="text-[12px] text-[#86868b] mt-3">
                      <span className="font-semibold">Review note:</span> {flag.reviewNote}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === Analytics Section ===
function AdminAnalyticsSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics", { credentials: "include" });
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error("Failed to load analytics");
        }
      } catch {
        toast.error("Failed to load analytics");
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
      </div>
    );
  }

  if (!data) return null;

  const maxUserGrowth = Math.max(...data.userGrowth.map((d: any) => d.count), 1);
  const maxRfqVolume = Math.max(...data.rfqVolume.map((d: any) => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-bold text-[#1d1d1f]">Platform Analytics</h2>
        <p className="text-[15px] text-[#86868b] mt-1">Key metrics and growth trends</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Users", value: data.totals.users, icon: Users, color: "text-[#0066cc]", bg: "bg-blue-50" },
          { label: "Suppliers", value: data.totals.suppliers, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Verified", value: data.totals.verifiedSuppliers, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
          { label: "RFQs", value: data.totals.rfqs, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Products", value: data.totals.products, icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Contracts", value: data.totals.contracts, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-[20px] p-5 border border-[#d2d2d7]/30 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 ${item.bg} rounded-lg`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <span className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="text-[24px] font-bold text-[#1d1d1f]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-[24px] p-6 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#0066cc]" />
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">User Growth</h3>
          </div>
          <div className="flex items-end gap-1 h-40">
            {data.userGrowth.map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-[#86868b] font-medium">{d.count || ""}</span>
                <div
                  className="w-full bg-[#0066cc]/20 rounded-t-md min-h-[2px] transition-all"
                  style={{ height: `${(d.count / maxUserGrowth) * 100}%` }}
                >
                  <div
                    className="w-full bg-[#0066cc] rounded-t-md h-full"
                  />
                </div>
                <span className="text-[9px] text-[#86868b] -rotate-45 origin-top-left whitespace-nowrap">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RFQ Volume */}
        <div className="bg-white rounded-[24px] p-6 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">RFQ Volume</h3>
          </div>
          <div className="flex items-end gap-1 h-40">
            {data.rfqVolume.map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-[#86868b] font-medium">{d.count || ""}</span>
                <div
                  className="w-full bg-purple-200 rounded-t-md min-h-[2px] transition-all"
                  style={{ height: `${(d.count / maxRfqVolume) * 100}%` }}
                >
                  <div className="w-full bg-purple-500 rounded-t-md h-full" />
                </div>
                <span className="text-[9px] text-[#86868b] -rotate-45 origin-top-left whitespace-nowrap">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quote Conversion */}
        <div className="bg-white rounded-[24px] p-6 border border-[#d2d2d7]/30 shadow-sm">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Quote Conversion</h3>
          <div className="space-y-3">
            {[
              { label: "Pending", value: data.quoteConversion.pending, color: "bg-amber-500" },
              { label: "Accepted", value: data.quoteConversion.accepted, color: "bg-green-500" },
              { label: "Rejected", value: data.quoteConversion.rejected, color: "bg-red-500" },
            ].map(item => {
              const total = data.quoteConversion.pending + data.quoteConversion.accepted + data.quoteConversion.rejected;
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-[#424245]">{item.label}</span>
                    <span className="text-[13px] font-bold text-[#1d1d1f]">{item.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-white rounded-[24px] p-6 border border-[#d2d2d7]/30 shadow-sm">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">Product Status</h3>
          <div className="space-y-3">
            {[
              { label: "Approved", value: data.productStatus.approved, color: "bg-green-500" },
              { label: "Pending", value: data.productStatus.pending, color: "bg-amber-500" },
              { label: "Rejected", value: data.productStatus.rejected, color: "bg-red-500" },
            ].map(item => {
              const total = data.productStatus.approved + data.productStatus.pending + data.productStatus.rejected;
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-[#424245]">{item.label}</span>
                    <span className="text-[13px] font-bold text-[#1d1d1f]">{item.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// === Platform Team Section ===
function AdminTeamSection() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team", { credentials: "include" });
      if (res.ok) {
        setTeam(await res.json());
      } else {
        toast.error("Failed to load team");
      }
    } catch {
      toast.error("Failed to load team");
    }
    setLoading(false);
  }

  const toggleTag = async (userId: string, tag: string) => {
    const member = team.find(m => m.id === userId);
    if (!member) return;
    setActionLoading(`${userId}-${tag}`);

    const currentTags = member.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];

    try {
      const res = await fetch("/api/admin/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, tags: newTags }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTeam(team.map(m => m.id === userId ? { ...m, tags: updated.tags } : m));
        toast.success("Tags updated");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update tags");
      }
    } catch {
      toast.error("Failed to update tags");
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-bold text-[#1d1d1f]">Platform Team</h2>
        <p className="text-[15px] text-[#86868b] mt-1">Manage admin accounts and assign platform tags</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0066cc]" />
        </div>
      ) : team.length === 0 ? (
        <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-[#d2d2d7]">
          <UserCog className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">No admin team members</p>
          <p className="text-[14px] text-[#86868b] mt-1">Register users with the admin role to manage them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {team.map(member => (
            <div key={member.id} className="bg-white rounded-[20px] border border-[#d2d2d7]/30 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{member.fullName || member.email}</h3>
                  <p className="text-[13px] text-[#86868b] mt-0.5">{member.email}</p>
                  <p className="text-[11px] text-[#86868b] mt-1">
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase">
                  Admin
                </span>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">Platform Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORM_TAGS.map(tag => {
                    const isActive = (member.tags || []).includes(tag);
                    const isLoading = actionLoading === `${member.id}-${tag}`;
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(member.id, tag)}
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all disabled:opacity-50 ${
                          isActive
                            ? "bg-[#0066cc] text-white border-[#0066cc]"
                            : "bg-white text-[#424245] border-[#d2d2d7] hover:border-[#0066cc]"
                        }`}
                      >
                        {getTagLabel(tag)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
