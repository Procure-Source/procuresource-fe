"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  ShieldX,
  ChevronDown,
  ChevronRight,
  FileText,
  ExternalLink,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { USER_ROLES } from "@/lib/tags";

interface UserDoc {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  verifiedAt: string | null;
  createdAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  role: string;
  phone: string;
  isVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
  documents: UserDoc[];
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [verifyingUser, setVerifyingUser] = useState<string | null>(null);

  const loadUsers = useCallback(async (search = "", role = "") => {
    setIsDataLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
    setIsDataLoading(false);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });
        if (res.ok) {
          router.push("/admin/dashboard");
          return;
        }
      } catch {
        // Not authenticated
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers(searchQuery, roleFilter);
    }
  }, [isAuthenticated, loadUsers]);

  const handleSearch = () => {
    loadUsers(searchQuery, roleFilter);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (res.ok) {
        router.push("/admin/dashboard");
        return;
      } else {
        setLoginError("Invalid credentials");
      }
    } catch {
      setLoginError("Login failed");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", {
      method: "DELETE",
      credentials: "include",
    });
    setIsAuthenticated(false);
    router.refresh();
  };

  const handleVerifyToggle = async (
    userId: string,
    currentlyVerified: boolean,
  ) => {
    setVerifyingUser(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: currentlyVerified ? "unverify" : "verify",
        }),
        credentials: "include",
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  isVerified: !currentlyVerified,
                  documents: u.documents.map((d) => ({
                    ...d,
                    verifiedAt: !currentlyVerified
                      ? new Date().toISOString()
                      : null,
                  })),
                }
              : u,
          ),
        );
      }
    } catch (error) {
      console.error("Verify toggle failed:", error);
    }
    setVerifyingUser(null);
  };

  const handleDocVerify = async (userId: string, docId: string, currentlyVerified: boolean) => {
    setVerifyingUser(docId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          action: currentlyVerified ? "unverify_document" : "verify_document",
        }),
        credentials: "include",
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  documents: u.documents.map((d) =>
                    d.id === docId
                      ? { ...d, verifiedAt: currentlyVerified ? null : new Date().toISOString() }
                      : d
                  ),
                }
              : u
          )
        );
      }
    } catch (error) {
      console.error("Document verify toggle failed:", error);
    }
    setVerifyingUser(null);
  };

  const roleLabels: Record<string, string> = {
      supplier: "Supplier",
      manufacturer: "Manufacturer",
      agent: "Agent",
      purchase_manager: "Purchase Manager",
      consultant: "Consultant",
      admin: "Admin",
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      supplier: "bg-blue-50 text-blue-700 border-blue-100",
      manufacturer: "bg-sky-50 text-sky-700 border-sky-100",
      agent: "bg-cyan-50 text-cyan-700 border-cyan-100",
      purchase_manager: "bg-purple-50 text-purple-700 border-purple-100",
      consultant: "bg-indigo-50 text-indigo-700 border-indigo-100",
      admin: "bg-red-50 text-red-700 border-red-100",
    };
    return (
      <span
        className={`text-[12px] px-2.5 py-1 rounded-full font-semibold border ${styles[role] || "bg-gray-50 text-gray-600 border-gray-100"}`}
      >
        {roleLabels[role] || role}
      </span>
    );
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-[#86868b]">Loading...</div>
      </div>
    );
  }

  // --- Login wall ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-[18px] p-8 w-full max-w-md shadow-sm">
          <h1 className="text-[28px] font-semibold text-[#1d1d1f] mb-2">
            Admin Login
          </h1>
          <p className="text-[14px] text-[#86868b] mb-6">
            Sign in to access the admin panel
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
                required
              />
            </div>
            {loginError && (
              <p className="text-[14px] text-red-500">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-[#0066cc] text-white py-3 rounded-full text-[15px] font-medium hover:bg-[#0055b3] transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-[14px] text-[#0066cc] hover:underline"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Stats ---
  const totalUsers = users.length;
  const verifiedCount = users.filter((u) => u.isVerified).length;
  const pendingCount = users.filter(
    (u) => !u.isVerified && u.documents.length > 0,
  ).length;

  // --- Dashboard ---
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="bg-white border-b border-[#d2d2d7]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[17px] font-semibold text-[#1d1d1f]">
              ProcureSource
            </Link>
            <span className="text-[#86868b]">/</span>
            <span className="text-[17px] text-[#1d1d1f]">Admin Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[14px] text-[#0066cc] hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[18px] p-6 border border-[#d2d2d7]/30 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider">
                Total Users
              </p>
            </div>
            <p className="text-[32px] font-bold text-[#1d1d1f]">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-[18px] p-6 border border-[#d2d2d7]/30 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider">
                Verified
              </p>
            </div>
            <p className="text-[32px] font-bold text-green-600">
              {verifiedCount}
            </p>
          </div>
          <div className="bg-white rounded-[18px] p-6 border border-[#d2d2d7]/30 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider">
                Pending Review
              </p>
            </div>
            <p className="text-[32px] font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-[18px] p-6 mb-6 border border-[#d2d2d7]/30 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-12 pl-12 pr-4 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                loadUsers(searchQuery, e.target.value);
              }}
              className="h-12 px-4 rounded-[12px] border border-[#d2d2d7] focus:outline-none focus:border-[#0066cc] text-[15px] bg-white min-w-[180px]"
            >
              <option value="">All Roles</option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role] || role}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="h-12 px-6 bg-[#0066cc] text-white rounded-full text-[14px] font-medium hover:bg-[#0055b3] transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[18px] border border-[#d2d2d7]/30 shadow-sm overflow-hidden">
          {isDataLoading ? (
            <div className="p-12 text-center text-[#86868b]">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-[#86868b]">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#d2d2d7]">
                    <th className="text-left py-4 px-6 text-[12px] font-bold text-[#86868b] uppercase tracking-wider"></th>
                    <th className="text-left py-4 px-6 text-[12px] font-bold text-[#86868b] uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left py-4 px-6 text-[12px] font-bold text-[#86868b] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left py-4 px-6 text-[12px] font-bold text-[#86868b] uppercase tracking-wider">
                      Docs
                    </th>
                    <th className="text-left py-4 px-6 text-[12px] font-bold text-[#86868b] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-4 px-6 text-[12px] font-bold text-[#86868b] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr
                        className={`border-b border-[#f5f5f7] hover:bg-[#fbfbfd] transition-colors cursor-pointer ${expandedUser === user.id ? "bg-[#fbfbfd]" : ""}`}
                        onClick={() =>
                          setExpandedUser(
                            expandedUser === user.id ? null : user.id,
                          )
                        }
                      >
                        <td className="py-4 px-6 w-8">
                          {user.documents.length > 0 ? (
                            expandedUser === user.id ? (
                              <ChevronDown className="w-4 h-4 text-[#86868b]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#86868b]" />
                            )
                          ) : (
                            <span className="w-4 h-4 block" />
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-[#1d1d1f]">
                              {user.fullName || "—"}
                            </span>
                            <span className="text-[13px] text-[#86868b]">
                              {user.email}
                            </span>
                            {user.companyName && (
                              <span className="text-[12px] text-[#0066cc]">
                                {user.companyName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                        <td className="py-4 px-6">
                          <span className="text-[14px] text-[#1d1d1f] font-medium">
                            {user.documents.length}
                          </span>
                          <span className="text-[12px] text-[#86868b] ml-1">
                            file{user.documents.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {user.isVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-100">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 font-semibold border border-gray-100">
                              <ShieldX className="w-3.5 h-3.5" /> Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerifyToggle(user.id, user.isVerified);
                            }}
                            disabled={verifyingUser === user.id}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all disabled:opacity-50 ${
                              user.isVerified
                                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"
                            }`}
                          >
                            {verifyingUser === user.id ? (
                              "Processing..."
                            ) : user.isVerified ? (
                              <>
                                <XCircle className="w-4 h-4" /> Unverify
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" /> Verify
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Document Details */}
                      {expandedUser === user.id &&
                        user.documents.length > 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 pb-6 bg-[#fbfbfd]">
                              <div className="ml-8 border border-[#d2d2d7]/30 rounded-[14px] overflow-hidden bg-white">
                                <div className="px-5 py-3 bg-[#f5f5f7] border-b border-[#d2d2d7]/30">
                                  <p className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider">
                                    Submitted Documents ({user.documents.length}
                                    )
                                  </p>
                                </div>
                                <div className="divide-y divide-[#f5f5f7]">
                                  {user.documents.map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="px-5 py-4 flex items-center gap-4"
                                    >
                                      <div className="w-9 h-9 bg-[#f5f5f7] rounded-lg flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-[#86868b]" />
                                      </div>
                                      <div className="flex-grow min-w-0">
                                        <p className="text-[14px] font-medium text-[#1d1d1f] truncate">
                                          {doc.fileName}
                                        </p>
                                        <p className="text-[12px] text-[#86868b]">
                                          {doc.documentType} · Uploaded{" "}
                                          {new Date(
                                            doc.createdAt,
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3 shrink-0">
                                        {doc.verifiedAt ? (
                                          <span className="text-[11px] px-2 py-1 rounded-full bg-green-50 text-green-600 font-medium border border-green-100">
                                            ✓ Verified{" "}
                                            {new Date(
                                              doc.verifiedAt,
                                            ).toLocaleDateString()}
                                          </span>
                                        ) : (
                                          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-600 font-medium border border-amber-100">
                                            Pending
                                          </span>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDocVerify(user.id, doc.id, !!doc.verifiedAt);
                                          }}
                                          disabled={verifyingUser === doc.id}
                                          className={`text-[11px] px-3 py-1.5 rounded-full font-semibold transition-all disabled:opacity-50 ${
                                            doc.verifiedAt
                                              ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                              : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"
                                          }`}
                                        >
                                          {verifyingUser === doc.id
                                            ? "..."
                                            : doc.verifiedAt
                                              ? "Unverify"
                                              : "Verify"}
                                        </button>
                                        <a
                                          href={doc.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-[#0066cc] hover:text-[#0055b3] transition-colors"
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
