"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Creator, Brief, Engagement, ToolLicense, PortfolioItem } from "@/lib/types";
import { evaluateCreatorSafety } from "@/lib/safety";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { SafetyBadge } from "@/components/common/SafetyBadge";
import { PortfolioFrame } from "@/components/common/PortfolioFrame";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Film,
  Search,
  Check,
  X,
  ExternalLink,
  Activity,
  Sliders,
  DollarSign
} from "lucide-react";

interface AdminDashboardProps {
  initialCreators: Creator[];
  initialBriefs: Brief[];
  initialEngagements: Engagement[];
  licenses: ToolLicense[];
  portfolioMap: Record<string, PortfolioItem[]>;
}

export function AdminDashboard({
  initialCreators,
  initialBriefs,
  initialEngagements,
  licenses,
  portfolioMap,
}: AdminDashboardProps) {
  const [creators, setCreators] = useState<Creator[]>(initialCreators);
  const [engagements, setEngagements] = useState<Engagement[]>(initialEngagements);
  const [briefs] = useState<Brief[]>(initialBriefs);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"pipeline" | "creators" | "briefs" | "licensing">("pipeline");
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Metrics computation
  const totalEngagements = engagements.length;
  const activeEngagements = engagements.filter((e) => e.status === "in_progress" || e.status === "delivered").length;
  const approvedEngagements = engagements.filter((e) => e.status === "approved").length;
  const pendingInvites = engagements.filter((e) => e.status === "invited").length;

  const totalVerifiedCreators = creators.filter((c) => c.verification_level === "platform_reviewed").length;
  const verifiedPercentage = Math.round((totalVerifiedCreators / (creators.length || 1)) * 100);

  // Admin Override Actions
  const handleOverrideEngagementStatus = async (engagementId: string, newStatus: Engagement["status"]) => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.ok && data.engagement) {
        setEngagements((prev) =>
          prev.map((e) => (e.id === engagementId ? data.engagement : e))
        );
        showNotification(`Engagement #${engagementId} status updated to '${newStatus}'`);
      }
    } catch (err) {
      console.error("Admin override error", err);
    }
  };

  const handleUpdateCreatorVerification = (creatorId: string, level: Creator["verification_level"]) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === creatorId ? { ...c, verification_level: level, reviewed: level === "platform_reviewed" } : c))
    );
    showNotification(`Creator ${creatorId} verification level updated to '${level}'`);
  };

  // Filtered lists
  const filteredEngagements = engagements.filter((e) => {
    if (pipelineStatusFilter !== "all" && e.status !== pipelineStatusFilter) return false;
    if (searchTerm) {
      const b = briefs.find((br) => br.id === e.brief_id);
      const c = creators.find((cr) => cr.id === e.creator_id);
      const matchesSearch =
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b?.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c?.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }
    return true;
  });

  return (
    <div className="space-y-8 py-4">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-amber-500/90 text-black px-4 py-2.5 rounded-xl font-mono text-xs font-semibold shadow-xl border border-amber-300 flex items-center gap-2 animate-fade-up">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="border border-amber-500/20 bg-[#151620] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-amber-300 font-semibold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> CENTRAL ADMIN OPERATIONS DESK
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-display mt-1">
              Production Lifecycle & Compliance Monitor
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time oversight of commercial briefs, director submissions, C2PA provenance credentials, and licence compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0C0D12] border border-amber-500/20 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeTab === "pipeline"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pipeline ({engagements.length})
            </button>
            <button
              onClick={() => setActiveTab("creators")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeTab === "creators"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Roster ({creators.length})
            </button>
            <button
              onClick={() => setActiveTab("briefs")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeTab === "briefs"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Briefs ({briefs.length})
            </button>
            <button
              onClick={() => setActiveTab("licensing")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeTab === "licensing"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Licence Engine ({licenses.length})
            </button>
          </div>
        </div>

        {/* SYSTEM STATS METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Active Production</span>
              <Activity className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{activeEngagements}</div>
            <div className="text-[11px] text-slate-500 font-mono">{totalEngagements} total contracts tracked</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Approved & Cleared</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{approvedEngagements}</div>
            <div className="text-[11px] text-slate-500 font-mono">Master deliverables released</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Verified Directors</span>
              <Users className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300">{verifiedPercentage}%</div>
            <div className="text-[11px] text-slate-500 font-mono">{totalVerifiedCreators} / {creators.length} directors reviewed</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Pending Invites</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{pendingInvites}</div>
            <div className="text-[11px] text-slate-500 font-mono">Awaiting creator acceptance</div>
          </div>
        </div>
      </div>

      {/* ── TAB 1: PRODUCTION PIPELINE MONITOR ── */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/15 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white font-display">Live Production Pipeline</h2>
              <span className="font-mono text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                {filteredEngagements.length} items
              </span>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by brand, title, creator..."
                  className="bg-[#151620] border border-slate-800 rounded-lg px-3 py-1.5 pl-8 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#E2B857]"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={pipelineStatusFilter}
                onChange={(e) => setPipelineStatusFilter(e.target.value)}
                className="bg-[#151620] border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#E2B857] font-mono"
              >
                <option value="all">All Statuses</option>
                <option value="invited">Invited</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          {/* Engagement Table */}
          <div className="overflow-x-auto border border-slate-800 bg-[#151620] rounded-2xl shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0C0D12] border-b border-slate-800 text-amber-300 uppercase tracking-wider">
                <tr>
                  <th className="p-4">ID & Brand</th>
                  <th className="p-4">Campaign Title</th>
                  <th className="p-4">Assigned Director</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">Renders</th>
                  <th className="p-4">Revisions</th>
                  <th className="p-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredEngagements.map((e) => {
                  const b = briefs.find((br) => br.id === e.brief_id);
                  const c = creators.find((cr) => cr.id === e.creator_id);
                  const latestVer = e.versions.length > 0 ? e.versions[e.versions.length - 1] : null;

                  return (
                    <tr key={e.id} className="hover:bg-[#1A1B2A] transition-colors">
                      <td className="p-4 font-bold">
                        <span className="text-white block">#{e.id}</span>
                        <span className="text-amber-300 text-[10px] font-normal">{b?.brand_name || "Commercial Brand"}</span>
                      </td>
                      <td className="p-4">
                        <Link href={`/engagements/${e.id}`} className="text-white hover:text-amber-300 font-semibold text-sm line-clamp-1">
                          {b?.title || "Campaign Brief"}
                        </Link>
                        <span className="text-slate-500 text-[10px] block">[{b?.format || "9:16"} • {b?.content_type}]</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/creators/${c?.id}`} className="text-slate-200 hover:text-amber-300 font-medium">
                            {c?.name || e.creator_id}
                          </Link>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            e.status === "approved"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : e.status === "delivered"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : e.status === "in_progress"
                              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-bold">v{e.versions.length}</span>
                        {latestVer && (
                          <span className="text-slate-500 text-[10px] block">({latestVer.state})</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-slate-300">
                          {e.revision_rounds_used || 0} / {b?.max_revision_rounds || 3}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <Link
                          href={`/engagements/${e.id}`}
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-slate-200 text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          View Desk <ExternalLink className="w-3 h-3" />
                        </Link>
                        {e.status !== "approved" && (
                          <button
                            onClick={() => handleOverrideEngagementStatus(e.id, "approved")}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition-colors"
                          >
                            Force Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: DIRECTOR ROSTER MONITOR ── */}
      {activeTab === "creators" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-4">
            <h2 className="text-2xl font-bold text-white font-display">Director Roster & Verification Management</h2>
            <span className="font-mono text-xs text-slate-400">Total Directors: {creators.length}</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 bg-[#151620] rounded-2xl shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0C0D12] border-b border-slate-800 text-amber-300 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Director</th>
                  <th className="p-4">Headline / Specialization</th>
                  <th className="p-4">Tool Pipeline</th>
                  <th className="p-4">Verification Level</th>
                  <th className="p-4">Legal Safety Status</th>
                  <th className="p-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {creators.map((c) => {
                  const cItems = portfolioMap[c.id] || [];
                  const safety = evaluateCreatorSafety(cItems, licenses);

                  return (
                    <tr key={c.id} className="hover:bg-[#1A1B2A] transition-colors">
                      <td className="p-4 font-bold">
                        <Link href={`/creators/${c.id}`} className="text-white hover:text-amber-300 text-sm block">
                          {c.name}
                        </Link>
                        <span className="text-slate-500 text-[10px] font-normal">{c.location}</span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <span className="text-slate-300 block truncate">{c.headline}</span>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {c.specialization.map((s) => (
                            <span key={s} className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tools.map((t) => (
                            <span key={t} className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <VerificationBadge level={c.verification_level || "self_declared"} />
                      </td>
                      <td className="p-4">
                        <SafetyBadge status={safety.status} cause={safety.cause} />
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <select
                          value={c.verification_level || "self_declared"}
                          onChange={(e) => handleUpdateCreatorVerification(c.id, e.target.value as any)}
                          className="bg-[#0C0D12] border border-slate-800 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-[#E2B857]"
                        >
                          <option value="platform_reviewed">Platform Reviewed</option>
                          <option value="proof_attached">Proof Attached</option>
                          <option value="self_declared">Self Declared</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: CAMPAIGN BRIEFS MONITOR ── */}
      {activeTab === "briefs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-4">
            <h2 className="text-2xl font-bold text-white font-display">Published Campaign Briefs</h2>
            <Link href="/briefs/new" className="btn-primary text-xs">
              + Post New Brief
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {briefs.map((b) => (
              <div key={b.id} className="border border-slate-800 bg-[#151620] rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-xs text-amber-300 uppercase font-semibold">{b.brand_name}</span>
                    <h3 className="text-lg font-bold text-white font-display leading-snug">{b.title}</h3>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-slate-400 text-[10px] block">Quality Score</span>
                    <span className="text-amber-300 font-bold text-lg">{b.quality_score}/100</span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2">{b.objective}</p>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Format</span>
                    <span className="text-white font-medium">{b.format}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Content Type</span>
                    <span className="text-white font-medium">{b.content_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Max Rounds</span>
                    <span className="text-white font-medium">{b.max_revision_rounds}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Link href={`/briefs/${b.id}`} className="text-xs font-mono text-amber-300 hover:underline flex items-center gap-1">
                    View Ranked Matches →
                  </Link>
                  <span className="text-[10px] font-mono text-slate-500">ID: {b.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: LICENCE CLEARANCE ENGINE ── */}
      {activeTab === "licensing" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white font-display">Commercial Licence Audit Registry</h2>
              <p className="text-slate-400 text-xs mt-1">Rulebook for tool subscription commercial clearance evaluation.</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 bg-[#151620] rounded-2xl shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0C0D12] border-b border-slate-800 text-amber-300 uppercase tracking-wider">
                <tr>
                  <th className="p-4">AI Tool</th>
                  <th className="p-4">Subscription Plan</th>
                  <th className="p-4">Commercial Usage Status</th>
                  <th className="p-4">Licence Notes</th>
                  <th className="p-4">Source URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {licenses.map((lic, idx) => (
                  <tr key={idx} className="hover:bg-[#1A1B2A] transition-colors">
                    <td className="p-4 font-bold text-white">{lic.tool}</td>
                    <td className="p-4 text-amber-300">{lic.plan}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          lic.commercial_use === "allowed"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : lic.commercial_use === "restricted"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {lic.commercial_use}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 max-w-sm leading-relaxed">{lic.notes}</td>
                    <td className="p-4">
                      <a
                        href={lic.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-300 hover:underline inline-flex items-center gap-1"
                      >
                        Terms <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
