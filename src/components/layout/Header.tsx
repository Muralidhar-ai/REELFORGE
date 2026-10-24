"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/common/LanguageSelector";

const SEEDED_CREATORS = [
  { id: "cr_1", name: "Inbarasan" },
  { id: "cr_2", name: "Padmanathan" },
  { id: "cr_3", name: "Bharathraj" },
  { id: "cr_4", name: "Pugazendhi" },
  { id: "cr_5", name: "Muralidhar" },
];

export function Header() {
  const pathname = usePathname();
  const { role, setRole, activeCreatorId, setActiveCreatorId, user, logoutUser } = useRole();
  const { t } = useLanguage();

  const isBrand = role === "brand";
  const isAdmin = role === "admin";
  const isCreator = role === "creator";

  return (
    <header className="sticky top-0 z-40 bg-[#0B0D11]/90 backdrop-blur-md border-b border-[#1E2536] shadow-md">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand & Primary Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E5A83B] to-[#D99525] flex items-center justify-center flex-shrink-0 text-[#0B0D11] font-bold text-sm tracking-tight transition-transform group-hover:scale-95 shadow-sm">
              RF
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight text-[#F8FAFC] font-display">
                ReelForge
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Studio Desk
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={pathname === "/"}>
              {t("nav.home")}
            </NavLink>
            <NavLink href="/#how-it-works" active={pathname.includes("#how-it-works")}>
              {t("nav.howItWorks")}
            </NavLink>
            <NavLink href="/creators" active={pathname.startsWith("/creators")}>
              {t("nav.exploreCreators")}
            </NavLink>
            <NavLink href="/briefs" active={pathname.startsWith("/briefs")}>
              {t("nav.campaigns")}
            </NavLink>
            <NavLink
              href={isCreator ? "/creator/dashboard" : "/brand/dashboard"}
              active={pathname.startsWith("/creator/dashboard") || pathname.startsWith("/brand/dashboard")}
            >
              {t("nav.dashboard")}
            </NavLink>
            <NavLink href="/engagements" active={pathname.startsWith("/engagements")}>
              {t("nav.reviews")}
            </NavLink>
            <NavLink href="/admin" active={pathname.startsWith("/admin")}>
              {t("nav.admin")}
            </NavLink>
          </nav>
        </div>

        {/* Right Utility, Language Selector & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Language Selector */}
          <LanguageSelector />

          {/* Creator switcher if in creator mode */}
          {isCreator && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12151D] border border-[#1E2536]">
              <span className="font-mono text-[11px] text-[#94A3B8] uppercase tracking-wider">{t("nav.creatorLabel")}</span>
              <select
                suppressHydrationWarning
                value={activeCreatorId}
                onChange={(e) => setActiveCreatorId(e.target.value)}
                className="bg-transparent text-[#F8FAFC] text-xs focus:outline-none font-semibold p-0 border-none cursor-pointer"
              >
                {SEEDED_CREATORS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#12151D] text-[#F8FAFC]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* System Links */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
            <Link
              href="/review"
              className={`hover:text-[#F8FAFC] transition-colors px-2.5 py-1 rounded-md ${
                pathname === "/review" ? "text-[#E5A83B] bg-[#1A1E29] font-medium" : ""
              }`}
            >
              Rubric
            </Link>
            <span className="text-[#1E2536]">/</span>
            <Link
              href="/data-model"
              className={`hover:text-[#F8FAFC] transition-colors px-2.5 py-1 rounded-md ${
                pathname === "/data-model" ? "text-[#E5A83B] bg-[#1A1E29] font-medium" : ""
              }`}
            >
              Data Model
            </Link>
          </div>

          {/* Role Segmented Controller */}
          <div className="hidden sm:flex items-center bg-[#12151D] border border-[#1E2536] rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setRole("brand")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                isBrand
                  ? "bg-[#1E2536] text-[#E5A83B] font-bold shadow-sm border border-[#E5A83B]/30"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              {t("nav.brand")}
            </button>
            <button
              onClick={() => setRole("creator")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                isCreator
                  ? "bg-[#1E2536] text-[#E5A83B] font-bold shadow-sm border border-[#E5A83B]/30"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              {t("nav.creator")}
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                isAdmin
                  ? "bg-[#1E2536] text-[#E5A83B] font-bold shadow-sm border border-[#E5A83B]/30"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              {t("nav.admin")}
            </button>
          </div>

          {/* User Account / Auth Status */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#1E2536]">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-[#F8FAFC] leading-tight truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono text-[#E5A83B] uppercase font-bold tracking-wider">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => logoutUser()}
                title="Sign out of ReelForge session"
                className="px-3 py-1.5 rounded-lg bg-[#1A1E29] border border-[#1E2536] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#E5A83B]/50 transition-colors shadow-sm"
              >
                {t("nav.signOut")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-[#1A1E29] text-[#F8FAFC] font-semibold border border-[#1E2536] shadow-sm"
          : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#12151D]"
      }`}
    >
      {children}
    </Link>
  );
}
