"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";

const SEEDED_CREATORS = [
  { id: "cr_1", name: "Inbarasan" },
  { id: "cr_2", name: "Padmanathan" },
  { id: "cr_3", name: "Bharathraj" },
  { id: "cr_4", name: "Pugazendhi" },
  { id: "cr_5", name: "Muralidhar" },
];

export function Header() {
  const pathname = usePathname();
  const { role, setRole, activeCreatorId, setActiveCreatorId } = useRole();

  const isBrand = role === "brand";
  const isAdmin = role === "admin";
  const isCreator = role === "creator";

  return (
    <header className="sticky top-0 z-40 bg-[#0C0D12]/95 backdrop-blur-md border-b border-amber-500/15">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href={isBrand ? "/creators" : isAdmin ? "/admin" : "/creator/dashboard"} className="flex items-center gap-3 group">
            {/* Logo Mark */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E2B857] to-[#B8860B] flex items-center justify-center flex-shrink-0 text-black font-bold text-xs tracking-tighter shadow-md shadow-amber-500/20">
              RF
            </div>
            <span className="font-semibold text-lg tracking-tight text-white font-display">
              ReelForge
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {isAdmin ? "Admin Desk" : isBrand ? "Brand Workspace" : "Creator Studio"}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {isBrand ? (
              <>
                <NavLink href="/creators" active={pathname.startsWith("/creators")}>
                  Discover
                </NavLink>
                <NavLink href="/briefs/new" active={pathname.startsWith("/briefs")}>
                  Create Brief
                </NavLink>
              </>
            ) : isCreator ? (
              <NavLink href="/creator/dashboard" active={pathname.startsWith("/creator/dashboard")}>
                Production Desk
              </NavLink>
            ) : null}

            <NavLink href="/admin" active={pathname.startsWith("/admin")}>
              Admin Platform
            </NavLink>
            <NavLink href="/data-model" active={pathname === "/data-model"}>
              Data Model
            </NavLink>
            <NavLink href="/review" active={pathname === "/review"}>
              Review
            </NavLink>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {isCreator && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151620] border border-slate-800">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Creator:</span>
              <select
                suppressHydrationWarning
                value={activeCreatorId}
                onChange={(e) => setActiveCreatorId(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none font-medium p-0 border-none"
              >
                {SEEDED_CREATORS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#151620] text-slate-200">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#151620] border border-amber-500/20 rounded-lg p-0.5">
            <button
              onClick={() => setRole("brand")}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
                isBrand ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Brand
            </button>
            <button
              onClick={() => setRole("creator")}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
                isCreator ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Creator
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
                isAdmin ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
      }`}
    >
      {children}
    </Link>
  );
}
