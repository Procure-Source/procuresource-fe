"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, Building2, ChevronRight, UserCircle2, ArrowLeft } from "lucide-react";
import { friendlyError } from "@/lib/friendly-error";
import { getDashboardPathForRole, getTagLabel, getTagsForRole, isValidUserRole, type UserRole } from "@/lib/tags";

const onboardingRoles: Array<{
  role: Exclude<UserRole, "admin">;
  title: string;
  description: string;
  icon: typeof Briefcase;
}> = [
  {
    role: "purchase_manager",
    title: "Purchase Manager",
    description: "Create projects, upload specs, invite verified suppliers, and raise RFQs.",
    icon: Briefcase,
  },
  {
    role: "manufacturer",
    title: "Manufacturer",
    description: "Publish product catalogs, certifications, and authorized regional agent links.",
    icon: Building2,
  },
  {
    role: "agent",
    title: "Local Agent",
    description: "Confirm authorization letters, set coverage regions, and respond to RFQs.",
    icon: Building2,
  },
  {
    role: "consultant",
    title: "Consultant",
    description: "Review submittal packages and approve or request resubmission.",
    icon: UserCircle2,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Exclude<UserRole, "admin"> | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // If user already has a role, go to dashboard
    if (isValidUserRole(user.role)) {
      router.push(getDashboardPathForRole(user.role));
    }
  }, [user, loading, router]);

  const handleRoleSelection = (role: Exclude<UserRole, "admin">) => {
    setSelectedRole(role);
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: selectedRole, tags: selectedTags }), credentials: "same-origin" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }
      toast.success("Profile created successfully!");
      router.push(getDashboardPathForRole(selectedRole));
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to create profile"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[17px] text-[#1d1d1f] font-medium">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-grow pt-[120px] pb-20 px-4">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1d1d1f] mb-4">Welcome to ProcureSource</h1>
            <p className="text-[17px] sm:text-[19px] text-[#86868b]">Select your primary role to continue to your dashboard.</p>
          </div>

          {!selectedRole ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {onboardingRoles.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.role}
                    onClick={() => handleRoleSelection(option.role)}
                    className="group flex flex-col items-start gap-6 rounded-[24px] border border-[#d2d2d7]/30 bg-white p-8 text-left shadow-sm transition-all hover:border-[#0066cc]/30 hover:shadow-xl"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0066cc]/10 transition-colors group-hover:bg-[#0066cc] group-hover:text-white">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-[21px] font-bold text-[#1d1d1f]">{option.title}</h3>
                      <p className="text-[15px] leading-relaxed text-[#86868b]">
                        {option.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 font-semibold text-[#0066cc]">
                      Get Started <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-8 border border-[#d2d2d7]/30 shadow-sm max-w-[600px] mx-auto">
              <button
                onClick={() => { setSelectedRole(null); setSelectedTags([]); }}
                className="flex items-center gap-2 text-[14px] text-[#86868b] hover:text-[#1d1d1f] mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to role selection
              </button>

              <h3 className="text-[21px] font-bold text-[#1d1d1f] mb-2">
                {selectedRole === "purchase_manager" || selectedRole === "consultant"
                  ? "What best describes your role?"
                  : "What type of supply-side partner are you?"}
              </h3>
              <p className="text-[15px] text-[#86868b] mb-6">
                Select all that apply to your organization.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {getTagsForRole(selectedRole).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2.5 rounded-full text-[14px] font-medium border transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-[#0066cc] text-white border-[#0066cc]"
                        : "bg-[#f5f5f7] text-[#424245] border-[#d2d2d7] hover:border-[#0066cc]"
                    }`}
                  >
                    {getTagLabel(tag)}
                  </button>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full h-[52px] bg-[#0066cc] text-white rounded-full text-[17px] font-semibold hover:bg-[#0077ed] transition-all shadow-lg shadow-[#0066cc]/20 disabled:opacity-50"
              >
                {isSubmitting ? "Setting up..." : "Continue to Dashboard"}
              </button>
            </div>
          )}

          <div className="mt-12 p-6 bg-white rounded-[24px] border border-[#d2d2d7]/30 flex items-center gap-4 shadow-sm">
            <UserCircle2 className="w-10 h-10 text-[#86868b]" />
            <div className="flex-grow">
              <p className="text-[14px] font-semibold text-[#1d1d1f]">Logged in as</p>
              <p className="text-[13px] text-[#86868b]">{user.email}</p>
            </div>
            <button
              onClick={() => logout().then(() => router.push('/login'))}
              className="text-[13px] font-medium text-[#ff3b30] hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
