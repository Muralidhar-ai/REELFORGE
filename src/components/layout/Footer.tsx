"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 py-8 border-t border-[#1E2536] bg-[#0B0D11]/90 backdrop-blur-md">
      <div className="max-w-[1240px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-[#E5A83B] to-[#D99525] flex items-center justify-center text-[#0B0D11] font-bold text-[10px]">
            RF
          </div>
          <span className="text-[#F8FAFC] text-xs font-mono font-medium">ReelForge</span>
          <span className="text-[#64748B] text-xs font-mono">{t("footer.tagline")}</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono text-[#94A3B8]">
          <Link
            href="/review"
            className="hover:text-[#F8FAFC] hover:text-[#E5A83B] transition-colors"
          >
            {t("footer.rubric")}
          </Link>
          <Link
            href="/data-model"
            className="hover:text-[#F8FAFC] hover:text-[#E5A83B] transition-colors"
          >
            {t("footer.dataModel")}
          </Link>
          <span className="text-[#64748B]">{t("footer.copyright")}</span>
        </div>
      </div>
    </footer>
  );
}

