"use client";

import { useLanguage, languages, Language } from "@/lib/language-context";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[#1d1d1f] opacity-80 hover:opacity-100 transition-opacity px-2 py-1 rounded-md"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" strokeWidth={1.8} />
        <span className="text-[12px] font-medium hidden sm:inline">{languages[language].nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-[12px] shadow-lg border border-[#d2d2d7] py-2 min-w-[160px] z-50">
          {(Object.keys(languages) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-[14px] hover:bg-[#f5f5f7] transition-colors flex items-center justify-between ${
                language === lang ? "text-[#0066cc] font-medium" : "text-[#1d1d1f]"
              }`}
              dir={languages[lang].dir}
            >
              <span>{languages[lang].nativeName}</span>
              <span className="text-[12px] text-[#86868b]">{languages[lang].name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
