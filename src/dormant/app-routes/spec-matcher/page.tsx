"use client";

import React, { useState } from 'react';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import BackButton from "@/components/ui/back-button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ClipboardCopy,
  Contact,
  FileCheck2,
  MapPin,
  PhoneCall,
  Truck,
} from "lucide-react";

type RequirementConfidence = {
  requirement: string;
  status: "exact" | "exceeds" | "partial" | "missing" | "needs_review";
  confidence: number;
  evidence: string;
};

type SpecMatch = {
  model: string;
  brand: string;
  score: number;
  capacity: string;
  iplv: string;
  certified: boolean;
  verificationStatus?: "verified" | "mismatch" | "stale" | "pending" | "not_found";
  certificationLabel?: string;
  verifiedOn?: string;
  nextReviewOn?: string;
  agentName?: string;
  agentResponseHours?: number;
  agentResponseSampleSize?: number;
  leadTime?: {
    claimedWeeks: number;
    observedAvgWeeks: number;
    sampleSize: number;
    lastObservedOn: string;
  };
  projectSignal?: {
    shortlistedCount: number;
    region: string;
    period: string;
    selectedCount?: number;
    substitutionRequests?: number;
  };
  agentLocation?: {
    city: string;
    country: string;
    hubDistances: Array<{
      hub: string;
      distanceKm: number;
    }>;
  };
  pricing?: {
    currency: string;
    range: string;
    basis: "verified_quote" | "supplier_reported" | "not_recorded";
    lastUpdatedOn?: string;
    source: string;
  };
  currencyDisplay?: {
    primary: string;
    secondary?: string;
    note: string;
    marketLabel: string;
  };
  unitDisplay?: string;
  evidenceBadges?: Array<{
    id: "documents" | "phone";
    label: string;
    value: string;
    detail: string;
    state: "confirmed" | "watch" | "unverified" | "blocked";
  }>;
  sourceCrossReferences?: Array<{
    label: string;
    evidence: string;
    checkedOn: string;
    status: "verified" | "mismatch" | "stale" | "pending";
  }>;
  trustFingerprint?: Array<{
    id: "certificate" | "agent" | "price" | "lead_time";
    label: string;
    value: string;
    detail: string;
    state: "confirmed" | "watch" | "unverified" | "blocked";
  }>;
  lastHumanChecked?: string;
  specLine?: string;
  expiryCountdown?: string;
  noAgentNote?: string | null;
  contactCardUrl?: string;
  lastUpdatedFooter?: string;
  corrections?: Array<{
    date: string;
    originalClaim: string;
    correctedTo: string;
    reason: string;
  }>;
  confidenceBreakdown?: RequirementConfidence[];
  warnings?: string[];
  snapshotUrl?: string;
};

type SpecAnalysis = {
  category: string;
  parameters: Record<string, string>;
  requirements?: RequirementConfidence[];
  regionFlags?: string[];
  standardNotes?: string[];
  matches: SpecMatch[];
};

type SecondOpinionResult = {
  title: string;
  summary: string;
  generatedOn: string;
  verdict: string;
  topMatch?: SpecMatch;
  requirements: RequirementConfidence[];
  regionFlags: string[];
  warnings: string[];
  riskTransferLanguage?: string;
  sourceMode?: string;
};

function verificationBadgeClass(status?: SpecMatch["verificationStatus"]) {
  switch (status) {
    case "verified":
      return "bg-[#e8f5e9] text-[#166534]";
    case "mismatch":
      return "bg-[#fef2f2] text-[#991b1b]";
    case "stale":
      return "bg-[#fffbeb] text-[#92400e]";
    default:
      return "bg-[#eff6ff] text-[#1d4ed8]";
  }
}

function trustSignalClass(state: "confirmed" | "watch" | "unverified" | "blocked") {
  switch (state) {
    case "confirmed":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "blocked":
      return "border-red-200 bg-red-50 text-red-800";
    case "watch":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function trustIcon(id: "certificate" | "agent" | "price" | "lead_time") {
  switch (id) {
    case "certificate":
      return BadgeCheck;
    case "agent":
      return PhoneCall;
    case "price":
      return CircleDollarSign;
    default:
      return Truck;
  }
}

function evidenceIcon(id: "documents" | "phone") {
  return id === "documents" ? FileCheck2 : PhoneCall;
}

export default function SpecMatcherPage() {
  const [specText, setSpecText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SpecMatch[] | null>(null);
  const [analysis, setAnalysis] = useState<SpecAnalysis | null>(null);
  const [originalSpec, setOriginalSpec] = useState("");
  const [proposedSubstitution, setProposedSubstitution] = useState("");
  const [isSecondOpinionLoading, setIsSecondOpinionLoading] = useState(false);
  const [secondOpinion, setSecondOpinion] = useState<SecondOpinionResult | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [copiedSpecLine, setCopiedSpecLine] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!specText.trim()) {
      toast.error("Please enter a specification to analyze");
      return;
    }
    setIsAnalyzing(true);
    setResults(null);
    setAnalysis(null);
    try {
      const response = await fetch("/api/analyze-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specText }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.matches) {
        setResults(data.matches);
        setAnalysis(data);
        toast.success(`Found ${data.matches.length} matching products`);
      } else {
        throw new Error(data.error || "No matching products found for this specification");
      }
    } catch (error: unknown) {
      console.error("Error analyzing spec:", error);
      toast.error(friendlyError(error, "An unexpected error occurred during analysis"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copySpecLine = async (line: string) => {
    try {
      await navigator.clipboard.writeText(line);
      setCopiedSpecLine(line);
      toast.success("Spec-ready line copied");
    } catch {
      toast.error("Could not copy spec line");
    }
  };

  const handleSecondOpinion = async () => {
    if (!originalSpec.trim() || !proposedSubstitution.trim()) {
      toast.error("Add both the original spec and proposed substitution");
      return;
    }

    setIsSecondOpinionLoading(true);
    setSecondOpinion(null);

    try {
      const response = await fetch("/api/specs/second-opinion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalSpec, proposedSubstitution }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      setSecondOpinion(data);
      toast.success("Second opinion generated");
    } catch (error: unknown) {
      console.error("Error generating second opinion:", error);
      toast.error(friendlyError(error, "Failed to generate second opinion"));
    } finally {
      setIsSecondOpinionLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[88px]">
        <section className="bg-[#000000] pt-8 sm:pt-[55px] pb-[40px]">
          <div className="max-w-[980px] mx-auto px-4 sm:px-[22px]">
            <div className="mb-4">
              <BackButton label="Home" href="/" className="text-[#2997ff]" />
            </div>
            <div className="text-center">
              <h1 
                className="text-white mb-[6px] text-[32px] sm:text-[40px] md:text-[48px]"
                style={{ lineHeight: '1.08', fontWeight: '600', letterSpacing: '-0.003em' }}
              >
                AI Spec Matcher
              </h1>
              <p 
                className="text-[#86868b] text-[16px] sm:text-[18px] md:text-[21px]"
                style={{ lineHeight: '1.2381', fontWeight: '400', letterSpacing: '.011em' }}
              >
                Paste your technical specification and find compliant products instantly
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-[980px] mx-auto px-4 sm:px-[22px] py-8 sm:py-[55px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-[13px] sm:text-[14px] font-medium text-[#1d1d1f] mb-2">
                Technical Specification
              </label>
              <textarea
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder="Paste your specification text here...

Example:
Water cooled centrifugal chiller, 500 TR nominal cooling capacity at ARI conditions. Unit shall be AHRI certified to Standard 550/590 with IPLV not exceeding 0.450 kW/ton. Refrigerant shall be R-134a or R-513A."
                className="w-full h-[250px] sm:h-[300px] p-4 border border-[#d2d2d7] rounded-[12px] text-[14px] font-mono resize-none focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]"
              />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={!specText.trim() || isAnalyzing}
                  className="w-full sm:flex-1 min-h-[44px] bg-[#0066cc] text-white rounded-full text-[15px] sm:text-[17px] font-normal hover:bg-[#0077ed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Find matching products"
                >
                  {isAnalyzing ? "Analyzing..." : "Find Matching Products"}
                </button>
                <button
                  onClick={() => toast.info("Bulk matching is available for Pro accounts", {
                    description: "Upload a PDF or Excel file to analyze multiple specs at once.",
                  })}
                  className="w-full sm:w-auto px-6 min-h-[44px] border border-[#d2d2d7] text-[#1d1d1f] rounded-full text-[15px] font-normal hover:bg-[#f5f5f7] transition-colors whitespace-nowrap"
                  aria-label="Bulk match specifications"
                >
                  Bulk Match
                </button>
              </div>
              <p className="mt-3 text-[11px] sm:text-[12px] text-[#86868b] flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tip: Use Cmd+K from anywhere to quickly search products.
              </p>
            </div>

            <div>
              {results === null && !isAnalyzing && (
                <div className="h-full flex items-center justify-center bg-[#f5f5f7] rounded-[18px] p-8">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-[17px] text-[#86868b]">Enter a specification to find matching products</p>
                  </div>
                </div>
              )}

                {isAnalyzing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-[#fbfbfd] rounded-[12px] p-5 border border-[#d2d2d7]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <div className="flex gap-4 mt-3">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {results && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{results.length} Matching Products</h3>
                    <Link href="/products/compare" className="text-[14px] text-[#0066cc] hover:underline">Compare all</Link>
                  </div>
                  {analysis?.requirements?.length > 0 && (
                    <div className="mb-4 rounded-[14px] border border-[#d2d2d7] bg-white p-4">
                      <h4 className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
                        Requirement confidence
                      </h4>
                      <div className="space-y-3">
                        {analysis.requirements.map((item) => (
                          <div key={item.requirement} className="rounded-[12px] bg-[#f5f5f7] p-3">
                            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[13px] font-semibold text-[#1d1d1f]">{item.requirement}</span>
                              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#0066cc]">
                                {item.confidence}% {String(item.status).replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-[12px] leading-5 text-[#69707d]">{item.evidence}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis?.regionFlags?.length > 0 && (
                    <div className="mb-4 rounded-[14px] border border-amber-200 bg-amber-50 p-4">
                      <h4 className="mb-2 text-[14px] font-semibold text-amber-900">Region-aware flags</h4>
                      <ul className="list-disc space-y-1 pl-5 text-[12px] leading-5 text-amber-800">
                        {analysis.regionFlags.map((flag: string) => (
                          <li key={flag}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis?.standardNotes?.length > 0 && (
                    <div className="mb-4 rounded-[14px] border border-[#bfdbfe] bg-[#eff6ff] p-4">
                      <h4 className="mb-2 text-[14px] font-semibold text-[#1d4ed8]">Standard wording note</h4>
                      <ul className="list-disc space-y-1 pl-5 text-[12px] leading-5 text-[#1e40af]">
                        {analysis.standardNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.map((product, i) => (
                    <div key={product.model} className="bg-[#fbfbfd] rounded-[12px] p-5 border border-[#d2d2d7]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#86868b]">#{i + 1}</span>
                            <span className="text-[21px] font-semibold text-[#1d1d1f]">{product.score}%</span>
                            <span className="text-[12px] text-[#86868b]">match</span>
                          </div>
                          <h4 className="text-[17px] font-medium text-[#1d1d1f]">{product.model}</h4>
                          <p className="text-[14px] text-[#86868b]">{product.brand}</p>
                        </div>
                        {product.certificationLabel && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] ${verificationBadgeClass(product.verificationStatus)}`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {product.certificationLabel}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-[#86868b]">
                        <span>Capacity: {product.unitDisplay || product.capacity}</span>
                        <span>IPLV: {product.iplv}</span>
                        {product.verifiedOn && <span>Verified on: {product.verifiedOn}</span>}
                        {product.nextReviewOn && <span>Next review: {product.nextReviewOn}</span>}
                        {product.expiryCountdown && <span>{product.expiryCountdown}</span>}
                      </div>
                      {product.evidenceBadges && product.evidenceBadges.length > 0 && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {product.evidenceBadges.map((badge) => {
                            const Icon = evidenceIcon(badge.id);
                            return (
                              <div
                                key={`${product.model}-${badge.id}`}
                                title={badge.detail}
                                className={`rounded-[10px] border p-2.5 ${trustSignalClass(badge.state)}`}
                              >
                                <div className="mb-1 flex items-center gap-1.5">
                                  <Icon className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-bold uppercase">{badge.label}</span>
                                </div>
                                <p className="text-[12px] font-semibold leading-4">{badge.value}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {product.sourceCrossReferences && product.sourceCrossReferences.length > 0 && (
                        <div className="mt-4 rounded-[10px] border border-[#e8e8ed] bg-white p-3">
                          <p className="mb-2 text-[12px] font-semibold text-[#1d1d1f]">Also verified by</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {product.sourceCrossReferences.slice(0, 4).map((source) => (
                              <div key={`${product.model}-${source.label}-${source.checkedOn}`} className="rounded-[8px] bg-[#f5f5f7] p-2">
                                <p className="text-[11px] font-semibold text-[#1d1d1f]">{source.label}</p>
                                <p className="text-[10px] leading-4 text-[#69707d]">{source.evidence}</p>
                                <p className="mt-1 text-[10px] font-semibold uppercase text-[#0066cc]">{source.status} - {source.checkedOn}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {product.trustFingerprint && product.trustFingerprint.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {product.trustFingerprint.map((signal) => {
                            const Icon = trustIcon(signal.id);
                            return (
                              <div
                                key={`${product.model}-${signal.id}`}
                                title={signal.detail}
                                className={`min-h-[66px] rounded-[10px] border p-2.5 ${trustSignalClass(signal.state)}`}
                              >
                                <div className="mb-1 flex items-center gap-1.5">
                                  <Icon className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-bold uppercase">{signal.label}</span>
                                </div>
                                <p className="text-[11px] font-semibold leading-4">{signal.value}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {(product.lastHumanChecked || product.specLine) && (
                        <div className="mt-4 rounded-[10px] border border-[#e8e8ed] bg-white p-3">
                          {product.lastHumanChecked && (
                            <p className="text-[12px] font-semibold text-[#1d1d1f]">{product.lastHumanChecked}</p>
                          )}
                          {product.specLine && (
                            <button
                              type="button"
                              onClick={() => copySpecLine(product.specLine as string)}
                              className="mt-2 inline-flex min-h-[34px] items-center justify-center gap-2 rounded-full border border-[#d2d2d7] px-3 text-[12px] font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
                            >
                              <ClipboardCopy className="h-3.5 w-3.5" />
                              {copiedSpecLine === product.specLine ? "Copied spec line" : "Copy spec line"}
                            </button>
                          )}
                        </div>
                      )}
                      {product.corrections && product.corrections.length > 0 && (
                        <div className="mt-4 rounded-[10px] border border-red-200 bg-red-50 p-3">
                          <p className="mb-1 text-[12px] font-semibold text-red-950">Manual override visible</p>
                          {product.corrections.map((correction) => (
                            <p key={`${product.model}-${correction.date}`} className="text-[11px] leading-5 text-red-900">
                              {correction.originalClaim}; {correction.correctedTo} after verification on {correction.date}. {correction.reason}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-[10px] bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase text-[#86868b]">Ask the agent</p>
                          <p className="mt-1 text-[13px] font-semibold text-[#1d1d1f]">
                            {product.agentResponseHours ? `${product.agentResponseHours}h avg` : "No data yet"}
                          </p>
                          <p className="text-[11px] text-[#86868b]">
                            {product.agentName || "Agent not attached"}
                          </p>
                          {product.noAgentNote && (
                            <p className="mt-2 rounded-[8px] bg-amber-50 p-2 text-[10px] font-semibold leading-4 text-amber-900">
                              {product.noAgentNote}
                            </p>
                          )}
                        </div>
                        <div className="rounded-[10px] bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase text-[#86868b]">Lead time reality</p>
                          <p className="mt-1 text-[13px] font-semibold text-[#1d1d1f]">
                            {product.leadTime?.sampleSize
                              ? `${product.leadTime.claimedWeeks}w claimed | ${product.leadTime.observedAvgWeeks}w actual`
                              : "No observed average yet"}
                          </p>
                          <p className="text-[11px] text-[#86868b]">
                            {product.leadTime?.sampleSize ? `${product.leadTime.sampleSize} project report(s)` : "Awaiting reports"}
                          </p>
                        </div>
                        <div className="rounded-[10px] bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase text-[#86868b]">Agent pin</p>
                          <p className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-[#1d1d1f]">
                            <MapPin className="h-3.5 w-3.5 text-[#0066cc]" />
                            {product.agentLocation ? `${product.agentLocation.city}, ${product.agentLocation.country}` : "Not mapped"}
                          </p>
                          <p className="text-[11px] text-[#86868b]">
                            {product.agentLocation?.hubDistances
                              .filter((hub) => hub.distanceKm > 0)
                              .slice(0, 2)
                              .map((hub) => `${hub.hub} ${hub.distanceKm}km`)
                              .join(" / ") || "Hub distance pending"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-[10px] bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase text-[#86868b]">Price freshness</p>
                          <p className="mt-1 text-[13px] font-semibold text-[#1d1d1f]">
                            {product.currencyDisplay?.primary || (product.pricing?.lastUpdatedOn ? `Updated ${product.pricing.lastUpdatedOn}` : "No price date")}
                          </p>
                          <p className="text-[11px] text-[#86868b]">
                            {product.currencyDisplay
                              ? `${product.currencyDisplay.secondary ? `${product.currencyDisplay.secondary} - ` : ""}${product.currencyDisplay.note}`
                              : product.pricing
                                ? `${product.pricing.range} - ${product.pricing.source}`
                                : "Pricing evidence not attached"}
                          </p>
                        </div>
                        <div className="rounded-[10px] bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase text-[#86868b]">Similar projects</p>
                          <p className="mt-1 text-[13px] font-semibold text-[#1d1d1f]">
                            {product.projectSignal
                              ? `${product.projectSignal.shortlistedCount} shortlist(s)`
                              : "No signal yet"}
                          </p>
                          <p className="text-[11px] text-[#86868b]">
                            {product.projectSignal
                              ? `${product.projectSignal.region} ${product.projectSignal.period}`
                              : "Usage data builds over time"}
                          </p>
                        </div>
                      </div>
                      {product.confidenceBreakdown && product.confidenceBreakdown.length > 0 && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedReasoning((current) => ({
                                ...current,
                                [product.model]: !current[product.model],
                              }))
                            }
                            className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-full border border-[#d2d2d7] px-3 text-[12px] font-semibold text-[#1d1d1f] transition-colors hover:bg-white"
                          >
                            {expandedReasoning[product.model] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            Show reasoning
                          </button>
                          {expandedReasoning[product.model] && (
                            <div className="mt-3 space-y-2">
                              {product.confidenceBreakdown.map((item) => (
                                <div key={`${product.model}-${item.requirement}`} className="rounded-[10px] border border-[#e8e8ed] bg-white p-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-[12px] font-semibold text-[#1d1d1f]">{item.requirement}</p>
                                    <span className="rounded-full bg-[#f5f5f7] px-2 py-1 text-[11px] font-bold text-[#0066cc]">
                                      {item.confidence}% {item.status.replace("_", " ")}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-[11px] leading-5 text-[#69707d]">{item.evidence}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {product.warnings && product.warnings.length > 0 && (
                        <div className="mt-4 rounded-[10px] border border-amber-200 bg-amber-50 p-3">
                          <p className="mb-1 text-[12px] font-semibold text-amber-950">Honest uncertainty</p>
                          <ul className="list-disc space-y-1 pl-4 text-[11px] leading-5 text-amber-900">
                            {product.warnings.map((warning) => (
                              <li key={warning}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(product.snapshotUrl || product.contactCardUrl) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {product.snapshotUrl && (
                            <a
                              href={product.snapshotUrl}
                              className="inline-flex min-h-[36px] items-center justify-center rounded-full bg-[#0066cc] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#0055b3]"
                            >
                              Download compliance snapshot
                            </a>
                          )}
                          {product.contactCardUrl && (
                            <a
                              href={product.contactCardUrl}
                              className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-full border border-[#d2d2d7] bg-white px-4 text-[12px] font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
                            >
                              <Contact className="h-3.5 w-3.5" />
                              Contact .vcf
                            </a>
                          )}
                        </div>
                      )}
                      {product.lastUpdatedFooter && (
                        <p className="mt-4 border-t border-[#e8e8ed] pt-3 text-[11px] font-semibold text-[#86868b]">
                          {product.lastUpdatedFooter}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <section className="mt-10 rounded-[18px] border border-[#d2d2d7] bg-[#fbfbfd] p-5 sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-[12px] font-bold uppercase text-[#0066cc]">Second opinion for contested substitutions</p>
              <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Is this substitute actually equivalent?</h2>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#69707d]">
                Frame the contractor-consultant argument as evidence: requirement confidence, verification status, region flags, risk language, and a neutral verdict.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">Original specification</label>
                <textarea
                  value={originalSpec}
                  onChange={(event) => setOriginalSpec(event.target.value)}
                  className="h-[180px] w-full resize-none rounded-[12px] border border-[#d2d2d7] p-4 text-[13px] font-mono focus:border-[#0066cc] focus:outline-none"
                  placeholder="Paste consultant requirement, schedule, or rejected basis..."
                />
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">Proposed substitution</label>
                <textarea
                  value={proposedSubstitution}
                  onChange={(event) => setProposedSubstitution(event.target.value)}
                  className="h-[180px] w-full resize-none rounded-[12px] border border-[#d2d2d7] p-4 text-[13px] font-mono focus:border-[#0066cc] focus:outline-none"
                  placeholder="Paste proposed brand/model, claimed certs, lead time, and agent evidence..."
                />
              </div>
            </div>
            <button
              onClick={handleSecondOpinion}
              disabled={isSecondOpinionLoading || !originalSpec.trim() || !proposedSubstitution.trim()}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0066cc] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#0055b3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSecondOpinionLoading ? "Reviewing equivalency..." : "Generate second opinion"}
            </button>

            {secondOpinion && (
              <div className="mt-6 rounded-[16px] border border-[#e8e8ed] bg-white p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[12px] font-bold uppercase text-[#0066cc]">Verdict</p>
                    <h3 className="text-[21px] font-semibold text-[#1d1d1f]">{secondOpinion.verdict}</h3>
                    <p className="mt-1 text-[13px] text-[#69707d]">Generated {secondOpinion.generatedOn} via {secondOpinion.sourceMode || "ProcureSource analysis"}.</p>
                  </div>
                  {secondOpinion.topMatch?.snapshotUrl && (
                    <a
                      href={secondOpinion.topMatch.snapshotUrl}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-full bg-[#0066cc] px-4 text-[12px] font-semibold text-white"
                    >
                      Evidence snapshot
                    </a>
                  )}
                </div>
                {secondOpinion.topMatch && (
                  <div className="mb-4 rounded-[12px] bg-[#f5f5f7] p-4">
                    <p className="text-[14px] font-semibold text-[#1d1d1f]">
                      {secondOpinion.topMatch.brand} {secondOpinion.topMatch.model}
                    </p>
                    <p className="mt-1 text-[12px] text-[#69707d]">
                      {secondOpinion.topMatch.score}% match, {secondOpinion.topMatch.certificationLabel || "verification pending"}.
                    </p>
                  </div>
                )}
                {secondOpinion.requirements.length > 0 && (
                  <div className="space-y-2">
                    {secondOpinion.requirements.slice(0, 4).map((item) => (
                      <div key={`second-${item.requirement}`} className="rounded-[12px] border border-[#e8e8ed] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[12px] font-semibold text-[#1d1d1f]">{item.requirement}</p>
                          <span className="rounded-full bg-[#f5f5f7] px-2 py-1 text-[11px] font-bold text-[#0066cc]">
                            {item.confidence}% {item.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-[#69707d]">{item.evidence}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(secondOpinion.warnings.length > 0 || secondOpinion.regionFlags.length > 0) && (
                  <div className="mt-4 rounded-[12px] border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-2 text-[12px] font-semibold text-amber-950">Conditions and flags</p>
                    <ul className="list-disc space-y-1 pl-4 text-[11px] leading-5 text-amber-900">
                      {[...secondOpinion.warnings, ...secondOpinion.regionFlags].map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {secondOpinion.riskTransferLanguage && (
                  <div className="mt-4 rounded-[12px] bg-[#f5f5f7] p-4">
                    <p className="mb-1 text-[12px] font-semibold uppercase text-[#0066cc]">Contract language</p>
                    <p className="text-[12px] leading-5 text-[#424245]">{secondOpinion.riskTransferLanguage}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
