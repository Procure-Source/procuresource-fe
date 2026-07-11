"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Language = "en" | "ar" | "hi" | "ur";

export const languages: Record<Language, { name: string; nativeName: string; dir: "ltr" | "rtl" }> = {
  en: { name: "English", nativeName: "English", dir: "ltr" },
  ar: { name: "Arabic", nativeName: "Arabic", dir: "rtl" },
  hi: { name: "Hindi", nativeName: "Hindi", dir: "ltr" },
  ur: { name: "Urdu", nativeName: "Urdu", dir: "rtl" },
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    "common.back": "Back",
  },
  ar: {
    "common.back": "Back",
  },
  hi: {
    "common.back": "Back",
  },
  ur: {
    "common.back": "Back",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function normalizeLanguage(value: string | null): Language {
  return value === "ar" || value === "hi" || value === "ur" ? value : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    setLanguageState(normalizeLanguage(window.localStorage.getItem("procuresource.language")));
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("procuresource.language", nextLanguage);
    document.documentElement.dir = languages[nextLanguage].dir;
  };

  useEffect(() => {
    document.documentElement.dir = languages[language].dir;
  }, [language]);

  const t = (key: string) => translations[language][key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir: languages[language].dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
