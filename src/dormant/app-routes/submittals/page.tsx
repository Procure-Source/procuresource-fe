"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import BackButton from "@/components/ui/back-button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

export default function SubmittalsPage() {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [submittal, setSubmittal] = useState<any>(null);

  const handleGenerate = async () => {
    if (!productName || !brand) return;
    setIsGenerating(true);
    setSubmittal(null);
    try {
      const response = await fetch("/api/generate-submittal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, brand }),
      });
      const data = await response.json();
      if (data.overview) {
        setSubmittal(data);
        toast.success("Submittal summary generated successfully");
      } else {
        throw new Error(data.error || "Failed to generate submittal");
      }
    } catch (error: any) {
      console.error("Error generating submittal:", error);
      toast.error(friendlyError(error, "Failed to generate submittal summary"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[88px]">
        <section className="bg-[#fbfbfd] pt-8 sm:pt-[55px] pb-[40px] border-b border-[#d2d2d7]">
          <div className="max-w-[980px] mx-auto px-4 sm:px-[22px]">
            <div className="mb-4">
              <BackButton label="Home" href="/" />
            </div>
            <div className="text-center">
              <h1 
                className="text-[#1d1d1f] mb-[6px] text-[32px] sm:text-[40px] md:text-[48px]"
                style={{
                  lineHeight: '1.08',
                  fontWeight: '600',
                  letterSpacing: '-0.003em'
                }}
              >
                Submittals
              </h1>
              <p 
                className="text-[#86868b] text-[16px] sm:text-[18px] md:text-[21px]"
                style={{
                  lineHeight: '1.2381',
                  fontWeight: '400',
                  letterSpacing: '.011em'
                }}
              >
                Auto-generate compliant submittal packages with verified data.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-[980px] mx-auto px-4 sm:px-[22px] py-8 sm:py-[55px]">
          <div className="bg-[#000000] rounded-[18px] sm:rounded-[28px] p-6 sm:p-12 text-center text-white mb-8 sm:mb-[55px]">
            <h2 
              className="mb-[6px] text-[24px] sm:text-[28px] md:text-[32px]"
              style={{
                lineHeight: '1.125',
                fontWeight: '600',
                letterSpacing: '0.004em'
              }}
            >
              Submittal Studio
            </h2>
            <p 
              className="text-[#86868b] mb-6 sm:mb-8 max-w-lg mx-auto text-[15px] sm:text-[17px]"
              style={{
                lineHeight: '1.47059',
                fontWeight: '400',
                letterSpacing: '-0.022em'
              }}
            >
              Enter product details to auto-generate a professional submittal package summary using AI.
            </p>
            
            <div className="max-w-md mx-auto space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <input
                type="text"
                placeholder="Product Name (e.g. Centrifugal Chiller)"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full min-h-[44px] bg-[#1d1d1f] border border-[#424245] rounded-full px-5 text-white text-[14px] sm:text-[16px] focus:outline-none focus:border-[#0066cc]"
                aria-label="Product Name"
              />
              <input
                type="text"
                placeholder="Brand (e.g. Carrier)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full min-h-[44px] bg-[#1d1d1f] border border-[#424245] rounded-full px-5 text-white text-[14px] sm:text-[16px] focus:outline-none focus:border-[#0066cc]"
                aria-label="Manufacturer Brand"
              />
              <button 
                onClick={handleGenerate}
                disabled={!productName || !brand || isGenerating}
                className="w-full min-h-[44px] items-center justify-center rounded-full bg-[#0066cc] px-[21px] text-[15px] sm:text-[17px] font-normal text-white hover:bg-[#0077ed] transition-colors disabled:opacity-50"
                aria-busy={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Submittal Summary"}
              </button>
            </div>

              {isGenerating && (
                <div className="text-left bg-[#1d1d1f] rounded-[18px] p-8 border border-[#424245] space-y-6">
                  <Skeleton className="h-8 w-64 bg-[#424245]" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full bg-[#424245]" />
                    <Skeleton className="h-4 w-3/4 bg-[#424245]" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-[#424245]" />
                      <Skeleton className="h-3 w-full bg-[#424245]" />
                      <Skeleton className="h-3 w-5/6 bg-[#424245]" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-[#424245]" />
                      <Skeleton className="h-3 w-full bg-[#424245]" />
                      <Skeleton className="h-3 w-5/6 bg-[#424245]" />
                    </div>
                  </div>
                </div>
              )}

              {submittal && (
              <div className="text-left bg-[#1d1d1f] rounded-[18px] p-8 border border-[#424245] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-[21px] font-semibold mb-4 text-[#30d158] flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submittal Summary Generated
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[14px] text-[#86868b] uppercase tracking-wider mb-2">Overview</h4>
                    <p className="text-[17px] text-white opacity-90">{submittal.overview}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[14px] text-[#86868b] uppercase tracking-wider mb-2">Required Documents</h4>
                      <ul className="list-disc list-inside space-y-1 text-[#d2d2d7]">
                        {submittal.documents.map((doc: string, i: number) => <li key={i}>{doc}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[14px] text-[#86868b] uppercase tracking-wider mb-2">Technical Highlights</h4>
                      <ul className="list-disc list-inside space-y-1 text-[#d2d2d7]">
                        {submittal.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[14px] text-[#86868b] uppercase tracking-wider mb-2">Compliance Statement</h4>
                    <p className="text-[14px] italic text-[#d2d2d7]">{submittal.complianceStatement}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-[12px] mb-[55px]">
            <div className="bg-[#f5f5f7] rounded-[18px] p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1d1d1f] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-2">Package Builder</h3>
              <p className="text-[14px] text-[#86868b]">Auto-compile datasheets, certifications, and shop drawings into professional packages.</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-[18px] p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1d1d1f] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-2">Compliance Matrix</h3>
              <p className="text-[14px] text-[#86868b]">Generate spec compliance matrices automatically from your selected products.</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-[18px] p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1d1d1f] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-2">Approval Workflow</h3>
              <p className="text-[14px] text-[#86868b]">Track revisions, comments, and approval status all in one place.</p>
            </div>
          </div>

          <div className="bg-[#000000] rounded-[28px] p-12 text-center text-white">
            <h2 
              className="mb-[6px]"
              style={{
                fontSize: '32px',
                lineHeight: '1.125',
                fontWeight: '600',
                letterSpacing: '0.004em'
              }}
            >
              Submittal Studio
            </h2>
            <p 
              className="text-[#86868b] mb-8 max-w-lg mx-auto"
              style={{
                fontSize: '17px',
                lineHeight: '1.47059',
                fontWeight: '400',
                letterSpacing: '-0.022em'
              }}
            >
              Create professional submittal packages in minutes. Sign in to access all features.
            </p>
            <div className="flex items-center justify-center gap-[15px]">
              <Link 
                href="/login" 
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#0066cc] px-[21px] text-[17px] font-normal text-white hover:bg-[#0077ed] transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-transparent border border-[#424245] px-[21px] text-[17px] font-normal text-white hover:border-[#86868b] transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="mt-[55px]">
            <h2 
              className="text-[#1d1d1f] text-center mb-[30px]"
              style={{
                fontSize: '28px',
                lineHeight: '1.14286',
                fontWeight: '600',
                letterSpacing: '.007em'
              }}
            >
              How it works
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Select Products', desc: 'Choose products from your project or search the catalog.' },
                { step: '2', title: 'Add to Submittal', desc: 'System auto-pulls datasheets and certifications.' },
                { step: '3', title: 'Generate Matrix', desc: 'AI creates compliance matrix against specifications.' },
                { step: '4', title: 'Submit & Track', desc: 'Send for approval and track status in real-time.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 mx-auto mb-4 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[17px] font-semibold text-[#1d1d1f]">
                    {item.step}
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">{item.title}</h3>
                  <p className="text-[14px] text-[#86868b]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
