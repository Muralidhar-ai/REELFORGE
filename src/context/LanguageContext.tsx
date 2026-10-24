"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, LANGUAGES, LanguageOption, translations, TranslationKey } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
  t: (key: string, params?: Record<string, string | number>, fallback?: string) => string;
}

const STORAGE_KEY = "reelforge_preferred_language";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && (stored === "en" || stored === "ta" || stored === "hi")) {
        setLanguageState(stored);
        document.documentElement.lang = stored;
      } else {
        document.documentElement.lang = "en";
      }
    } catch (e) {
      // localStorage may fail in restricted iframes
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang;
      }
    } catch (e) {
      // ignore
    }
  };

  const t = (key: string, params?: Record<string, string | number>, fallback?: string): string => {
    const langDict = translations[language] as Record<string, string> | undefined;
    const defaultDict = translations.en as Record<string, string>;

    let text = langDict?.[key] || defaultDict?.[key] || fallback || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value));
      });
    }

    return text;
  };

  const currentLanguageOption =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: LANGUAGES,
        currentLanguageOption,
        t,
      }}
    >
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
