"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, CheckCircle2, Mail } from "lucide-react";
import { friendlyError } from "@/lib/friendly-error";
import { getDashboardPathForRole, getTagLabel, getTagsForRole } from "@/lib/tags";
import AuthSplitShell from "@/components/auth/auth-split-shell";

const roleOptions = [
  {
    value: "purchase_manager",
    label: "Purchase Manager",
    description: "Create projects, upload specs, invite verified suppliers, and raise RFQs.",
  },
  {
    value: "manufacturer",
    label: "Manufacturer",
    description: "Register your factory profile, product catalog, certifications, and agent network.",
  },
  {
    value: "agent",
    label: "Local Agent",
    description: "Confirm manufacturer relationships, coverage regions, and RFQ response readiness.",
  },
  {
    value: "consultant",
    label: "Consultant",
    description: "Review submittal packages and make approval or resubmission decisions.",
  },
  {
    value: "supplier",
    label: "Supplier",
    description: "List equipment, respond to RFQs, quote, contract, and track delivery.",
  },
] as const;

type DocumentSlot = "primaryDocument" | "secondaryDocument";

const documentRequirements: Record<
  string,
  Array<{ key: DocumentSlot; type: string; label: string; hint: string }>
> = {
  manufacturer: [
    { key: "primaryDocument", type: "trade_license", label: "Trade License", hint: "Company registration evidence" },
    { key: "secondaryDocument", type: "vat_certificate", label: "VAT Certificate", hint: "Tax registration evidence" },
  ],
  agent: [
    { key: "primaryDocument", type: "trade_license", label: "Trade License", hint: "Local operating license" },
    { key: "secondaryDocument", type: "authorization_letter", label: "Authorization Letter", hint: "Manufacturer authorization evidence" },
  ],
  purchase_manager: [
    { key: "primaryDocument", type: "trade_license", label: "Trade License", hint: "Company registration evidence" },
    { key: "secondaryDocument", type: "vat_certificate", label: "VAT Certificate", hint: "Tax registration evidence" },
  ],
  consultant: [
    { key: "primaryDocument", type: "trade_license", label: "Consultancy License", hint: "Company or practice license" },
    { key: "secondaryDocument", type: "professional_certificate", label: "Professional Certificate", hint: "Consultant identity and approval authority" },
  ],
  supplier: [
    { key: "primaryDocument", type: "trade_license", label: "Trade License", hint: "Company registration evidence" },
    { key: "secondaryDocument", type: "vat_certificate", label: "VAT Certificate", hint: "Tax registration evidence" },
  ],
};

function normalizeRole(role: string) {
  return roleOptions.some((option) => option.value === role) ? role : "purchase_manager";
}

function RegisterForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const roleFromQuery = normalizeRole(searchParams.get("role") || "purchase_manager");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    company: "",
    role: roleFromQuery,
    phone: "",
    website: "",
    address: "",
    country: "UAE",
    city: "Dubai",
  });

  const [documents, setDocuments] = useState({
    primaryDocument: null as File | null,
    secondaryDocument: null as File | null,
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const availableTags = getTagsForRole(formData.role);
  const currentDocumentRequirements =
    documentRequirements[formData.role] || documentRequirements.purchase_manager;
  const selectedRoleOption = roleOptions.find((option) => option.value === formData.role);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  useEffect(() => {
    if (roleFromQuery) {
      setFormData((prev) => ({ ...prev, role: roleFromQuery }));
      setSelectedTags([]);
      setDocuments({ primaryDocument: null, secondaryDocument: null });
    }
  }, [roleFromQuery]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "role") {
      setSelectedTags([]);
      setDocuments({ primaryDocument: null, secondaryDocument: null });
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: DocumentSlot,
  ) => {
    const file = e.target.files?.[0];
    if (file) setDocuments((prev) => ({ ...prev, [type]: file }));
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) {
        toast.success("Verification email resent! Check your inbox.");
      } else {
        toast.error("Failed to resend. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const missingDocument = currentDocumentRequirements.find(
      (requirement) => !documents[requirement.key]
    );
    if (missingDocument) {
      toast.error(`${missingDocument.label} is required`);
      return;
    }

    setIsLoading(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, String(value || ""));
      });
      payload.append("tags", JSON.stringify(selectedTags));
      currentDocumentRequirements.forEach((requirement) => {
        const file = documents[requirement.key];
        if (file) {
          payload.append(`document:${requirement.type}`, file, file.name);
        }
      });

      const result = await register(payload);

      if (result.requiresVerification) {
        setVerificationSent(true);
        toast.success("Account created! Check your email to verify.");
        return;
      }

      toast.success("Account created successfully!");
      router.push(getDashboardPathForRole(formData.role));
      router.refresh();
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to create account"));
    } finally {
      setIsLoading(false);
    }
  };

  // Show verification sent state
  if (verificationSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <Mail className="h-8 w-8 text-[#0066cc]" />
        </div>
        <h2 className="mb-3 text-[26px] font-bold text-[#1d1d1f]">
          Check your email
        </h2>
        <p className="mb-1 text-[15px] text-[#69707d]">
          We&apos;ve sent a verification link to
        </p>
        <p className="mb-6 text-[15px] font-semibold text-[#1d1d1f]">
          {formData.email}
        </p>
        <p className="mb-6 text-[14px] leading-6 text-[#69707d]">
          Click the link in your email to activate your account. The link
          expires in 24 hours.
        </p>

        <button
          onClick={handleResendVerification}
          disabled={resendLoading}
          className="mb-4 min-h-[48px] w-full rounded-full border-2 border-[#0066cc] text-[15px] font-semibold text-[#0066cc] transition-colors hover:bg-blue-50 disabled:opacity-50"
        >
          {resendLoading ? "Sending..." : "Resend verification email"}
        </button>

        <div className="mt-4 border-t border-[#d2d2d7] pt-4">
          <p className="text-[14px] text-[#69707d]">
            Already verified?{" "}
            <Link href="/login" className="font-semibold text-[#0066cc] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                {t("common.firstName")}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                autoComplete="given-name"
                className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-[12px] text-[16px] focus:outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                {t("common.lastName")}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                autoComplete="family-name"
                className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-[12px] text-[16px] focus:outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                {t("common.email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-[12px] text-[16px] focus:outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+971 50 123 4567"
                autoComplete="tel"
                className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-[12px] text-[16px] focus:outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Your Industrial Company"
                autoComplete="organization"
                className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-[12px] text-[16px] focus:outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://company.com"
                autoComplete="url"
                className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-[12px] text-[16px] focus:outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-[#1d1d1f]">
              Platform Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="h-[48px] w-full rounded-[12px] border border-[#d2d2d7] px-4 text-[16px] focus:border-[#0066cc] focus:outline-none focus:ring-4 focus:ring-[#0066cc]/10"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-[13px] leading-5 text-[#69707d]">
              {selectedRoleOption?.description}
            </p>
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              Address / Region
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Office 402, Business Bay, Dubai"
              autoComplete="street-address"
              className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-[12px] text-[16px] focus:outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
            />
          </div>

          {/* Business Type Tags */}
          <div className="space-y-3">
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] border-b pb-2">
              {formData.role === "purchase_manager" || formData.role === "consultant"
                ? "Your Role"
                : "Business Type"}
            </h3>
            <p className="text-[13px] text-[#86868b] -mt-1">
              Select all that apply to your organization.
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 sm:px-4 rounded-full text-[13px] font-medium border transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-[#0066cc] text-white border-[#0066cc]"
                      : "bg-white text-[#424245] border-[#d2d2d7] hover:border-[#0066cc]"
                  }`}
                >
                  {getTagLabel(tag)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] border-b pb-2">
              Verification Documents
            </h3>
            <p className="text-[13px] text-[#86868b] -mt-2">
              Required before public listing, RFQ participation, or consultant review access.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentDocumentRequirements.map((requirement) => (
                <div key={requirement.key} className="relative">
                  <label className="block text-[13px] font-medium text-[#424245] mb-2">
                    {requirement.label}
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-[12px] transition-all h-[112px] flex items-center justify-center ${documents[requirement.key] ? "border-green-500 bg-green-50" : "border-[#d2d2d7] hover:border-[#0066cc]"}`}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange(e, requirement.key)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />
                    <div className="p-4 flex flex-col items-center gap-1">
                      {documents[requirement.key] ? (
                        <CheckCircle2 className="text-green-500 w-6 h-6" />
                      ) : (
                        <Upload className="text-[#86868b] w-6 h-6" />
                      )}
                      <span className="text-[12px] text-[#1d1d1f] truncate max-w-[140px] text-center">
                        {documents[requirement.key]
                          ? documents[requirement.key]!.name
                          : "Click to upload"}
                      </span>
                      <span className="text-center text-[11px] leading-4 text-[#86868b]">
                        {requirement.hint}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              {t("common.password")}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className="w-full h-[48px] px-4 border border-[#d2d2d7] rounded-[12px] text-[16px] focus:outline-none focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[52px] bg-[#0066cc] text-white rounded-full text-[16px] sm:text-[17px] font-semibold hover:bg-[#0077ed] transition-all shadow-lg shadow-[#0066cc]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading
              ? "Verifying & Creating..."
              : "Register & Submit Credentials"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#d2d2d7] text-center">
          <p className="text-[14px] text-[#86868b]">
            {t("register.hasAccount")}{" "}
            <Link
              href="/login"
              className="text-[#0066cc] font-medium hover:underline"
            >
              {t("common.signIn")}
            </Link>
          </p>
        </div>
    </>
  );
}

export default function RegisterPage() {
  const { dir } = useLanguage();
  return (
    <AuthSplitShell
      dir={dir}
      mode="register"
      eyebrow="Verified onboarding"
      title="Create your ProcureSource account"
      subtitle="Choose your role and submit the documents needed for verification."
      sideTitle="Follow the master procurement flow from day one."
      sideDescription="Manufacturers, agents, purchase managers, consultants, and suppliers each enter a controlled workflow for verification, RFQs, submittals, contracts, delivery tracking, and disputes."
    >
      <Suspense
        fallback={
          <div className="text-[#0066cc] animate-pulse">
            Loading registration...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthSplitShell>
  );
}
