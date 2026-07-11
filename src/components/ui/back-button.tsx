"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label, className = "" }: BackButtonProps) {
  const router = useRouter();
  const { t, dir } = useLanguage();
  
  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-[#0066cc] text-[14px] sm:text-[17px] font-normal hover:underline transition-colors mb-4 sm:mb-6 ${className}`}
      dir={dir}
    >
      <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${dir === "rtl" ? "rotate-180" : ""}`} strokeWidth={1.5} />
      <span>{label || t("common.back")}</span>
    </button>
  );
}
