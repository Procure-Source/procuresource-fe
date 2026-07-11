"use client";

import React from 'react';
import Link from 'next/link';
import { Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from "@/lib/language-context";

const RoleSelection = () => {
  const { t, dir } = useLanguage();

  return (
    <section className="bg-white py-20 px-4 sm:px-[22px]" dir={dir}>
      <div className="max-w-[980px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Supplier Block */}
          <div className="group relative overflow-hidden bg-[#f5f5f7] rounded-[24px] p-8 sm:p-12 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-[#0066cc]/20">
            <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm text-[#0066cc]">
              <Truck className="w-10 h-10" />
            </div>
            <h3 className="text-[28px] sm:text-[32px] font-semibold text-[#1d1d1f] mb-4">
              Are you a Supplier?
            </h3>
            <p className="text-[17px] text-[#424245] mb-8 leading-relaxed">
              List your products, reach global buyers, and submit RFQs with verified compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link 
                href="/register?role=supplier" 
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-[#0066cc] text-white rounded-full font-semibold hover:bg-[#0077ed] transition-colors"
              >
                Sign Up as Supplier
              </Link>
              <Link 
                href="/login?role=supplier" 
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border border-[#d2d2d7] text-[#1d1d1f] rounded-full font-semibold hover:bg-[#f5f5f7] transition-colors"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Purchase Manager Block */}
          <div className="group relative overflow-hidden bg-[#f5f5f7] rounded-[24px] p-8 sm:p-12 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-[#0066cc]/20">
            <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm text-[#0066cc]">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-[28px] sm:text-[32px] font-semibold text-[#1d1d1f] mb-4">
              Are you a Purchase Manager?
            </h3>
            <p className="text-[17px] text-[#424245] mb-8 leading-relaxed">
              Generate instant RFQs, specify metrics, and share unique links with trusted suppliers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link 
                href="/register?role=purchase_manager" 
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-[#0066cc] text-white rounded-full font-semibold hover:bg-[#0077ed] transition-colors"
              >
                Sign Up as Manager
              </Link>
              <Link 
                href="/login?role=purchase_manager" 
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border border-[#d2d2d7] text-[#1d1d1f] rounded-full font-semibold hover:bg-[#f5f5f7] transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;
