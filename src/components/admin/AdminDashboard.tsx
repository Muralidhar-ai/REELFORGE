"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Creator, Brief, Engagement, ToolLicense, PortfolioItem, AuditEvent } from "@/lib/types";
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
  DollarSign,
  History,
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
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"pipeline" | "creators" | "briefs" | "licensing" | "audit" | "feedback">("pipeline");

  const loadFeedback = () => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.feedback)) {
          setFeedbackList(data.feedback);
        }
      })
      .catch((err) => console.error("Failed to load feedback", err));
  };

  useEffect(() => {
    fetch("/api/audit")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.events)) {
          setAuditEvents(data.events);
        }
      })
      .catch((err) => console.error("Failed to load audit events", err));

    loadFeedback();
  }, []);
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
        <div className="fixed top-20 right-6 z-50 bg-[#D5AD52] text-[#111210] px-4 py-2.5 rounded-lg font-mono text-xs font-semibold shadow-xl border border-[#E2BE6A] flex items-center gap-2 animate-fade-up">
          <CheckCircle2 className="w-4 h-4 text-[#111210]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#282A24] pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#D5AD52] font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> CENTRAL ADMIN OPERATIONS DESK
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F0E8] font-display mt-1">
              Production Lifecycle & Compliance Monitor
            </h1>
            <p className="text-[#AAA99F] text-xs sm:text-sm mt-1">
              Real-time oversight of commercial briefs, director submissions, provenance credentials, and commercial licence compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#111210] border border-[#282A24] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === "pipeline"
                  ? "bg-[#D5AD52]/15 text-[#D5AD52] font-semibold border border-[#D5AD52]/30"
                  : "text-[#AAA99F] hover:text-[#F3F0E8]"
              }`}
            >
              Pipeline ({engagements.length})
            </button>
            <button
              onClick={() => setActiveTab("creators")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === "creators"
                  ? "bg-[#D5AD52]/15 text-[#D5AD52] font-semibold border border-[#D5AD52]/30"
                  : "text-[#AAA99F] hover:text-[#F3F0E8]"
              }`}
            >
              Roster ({creators.length})
            </button>
            <button
              onClick={() => setActiveTab("briefs")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === "briefs"
                  ? "bg-[#D5AD52]/15 text-[#D5AD52] font-semibold border border-[#D5AD52]/30"
                  : "text-[#AAA99F] hover:text-[#F3F0E8]"
              }`}
            >
              Briefs ({briefs.length})
            </button>
            <button
              onClick={() => setActiveTab("licensing")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === "licensing"
                  ? "bg-[#D5AD52]/15 text-[#D5AD52] font-semibold border border-[#D5AD52]/30"
                  : "text-[#AAA99F] hover:text-[#F3F0E8]"
              }`}
            >
              Licence Engine ({licenses.length})
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === "audit"
                  ? "bg-[#D5AD52]/15 text-[#D5AD52] font-semibold border border-[#D5AD52]/30"
                  : "text-[#AAA99F] hover:text-[#F3F0E8]"
              }`}
            >
              Audit Trail ({auditEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "feedback"
                  ? "bg-[#D5AD52]/15 text-[#D5AD52] font-semibold border border-[#D5AD52]/30"
                  : "text-[#AAA99F] hover:text-[#F3F0E8]"
              }`}
            >
              <span>Feedback Inbox</span>
              {feedbackList.filter(f => f.status === "new").length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#E5A83B] text-[#0B0D11] text-[10px] font-bold">
                  {feedbackList.filter(f => f.status === "new").length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SYSTEM STATS METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-[#111210] border border-[#282A24] space-y-1">
            <div className="flex items-center justify-between text-[#AAA99F] text-xs font-mono">
              <span>Active Production</span>
              <Activity className="w-3.5 h-3.5 text-[#D5AD52]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#F3F0E8]">{activeEngagements}</div>
            <div className="text-[11px] text-[#76756D] font-mono">{totalEngagements} total contracts</div>
          </div>

          <div className="p-4 rounded-lg bg-[#111210] border border-[#282A24] space-y-1">
            <div className="flex items-center justify-between text-[#AAA99F] text-xs font-mono">
              <span>Approved & Cleared</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3E895B]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#6BCB8B]">{approvedEngagements}</div>
            <div className="text-[11px] text-[#76756D] font-mono">Master deliverables cleared</div>
          </div>

          <div className="p-4 rounded-lg bg-[#111210] border border-[#282A24] space-y-1">
            <div className="flex items-center justify-between text-[#AAA99F] text-xs font-mono">
              <span>Verified Directors</span>
              <Users className="w-3.5 h-3.5 text-[#D5AD52]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#D5AD52]">{verifiedPercentage}%</div>
            <div className="text-[11px] text-[#76756D] font-mono">{totalVerifiedCreators} / {creators.length} reviewed</div>
          </div>

          <div className="p-4 rounded-lg bg-[#111210] border border-[#282A24] space-y-1">
            <div className="flex items-center justify-between text-[#AAA99F] text-xs font-mono">
              <span>Pending Invites</span>
              <Zap className="w-3.5 h-3.5 text-[#C68A36]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#F3F0E8]">{pendingInvites}</div>
            <div className="text-[11px] text-[#76756D] font-mono">Awaiting director response</div>
          </div>
        </div>
      </div>

      {/* ── TAB 1: PRODUCTION PIPELINE MONITOR ── */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282A24] pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#F3F0E8] font-display">Live Production Pipeline</h2>
              <span className="font-mono text-xs text-[#D5AD52] bg-[#D5AD52]/10 border border-[#D5AD52]/20 px-2 py-0.5 rounded">
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
                  className="bg-[#111210] border border-[#282A24] rounded-lg px-3 py-1.5 pl-8 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52]"
                />
                <Search className="w-3.5 h-3.5 text-[#76756D] absolute left-2.5 top-2.5" />
              </div>

              <select
                value={pipelineStatusFilter}
                onChange={(e) => setPipelineStatusFilter(e.target.value)}
                className="bg-[#111210] border border-[#282A24] text-[#F3F0E8] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D5AD52] font-mono"
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
          <div className="overflow-x-auto border border-[#282A24] bg-[#191A17] rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#20211D] border-b border-[#282A24] text-[#D5AD52] uppercase tracking-wider">
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
              <tbody className="divide-y divide-[#282A24] text-[#AAA99F]">
                {filteredEngagements.map((e) => {
                  const b = briefs.find((br) => br.id === e.brief_id);
                  const c = creators.find((cr) => cr.id === e.creator_id);
                  const latestVer = e.versions.length > 0 ? e.versions[e.versions.length - 1] : null;

                  return (
                    <tr key={e.id} className="hover:bg-[#20211D] transition-colors">
                      <td className="p-4 font-bold">
                        <span className="text-[#F3F0E8] block">#{e.id}</span>
                        <span className="text-[#D5AD52] text-[10px] font-normal">{b?.brand_name || "Commercial Brand"}</span>
                      </td>
                      <td className="p-4">
                        <Link href={`/engagements/${e.id}`} className="text-[#F3F0E8] hover:text-[#D5AD52] font-semibold text-sm line-clamp-1">
                          {b?.title || "Campaign Brief"}
                        </Link>
                        <span className="text-[#76756D] text-[10px] block">[{b?.format || "9:16"} • {b?.content_type}]</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/creators/${c?.id}`} className="text-[#F3F0E8] hover:text-[#D5AD52] font-medium">
                            {c?.name || e.creator_id}
                          </Link>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            e.status === "approved"
                              ? "bg-[#3E895B]/15 text-[#6BCB8B] border border-[#3E895B]/30"
                              : e.status === "delivered"
                              ? "bg-[#D5AD52]/15 text-[#D5AD52] border border-[#D5AD52]/30"
                              : e.status === "in_progress"
                              ? "bg-[#4A6E82]/15 text-[#7BA5BC] border border-[#4A6E82]/30"
                              : "bg-[#20211D] text-[#AAA99F] border border-[#282A24]"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[#F3F0E8] font-bold">v{e.versions.length}</span>
                        {latestVer && (
                          <span className="text-[#76756D] text-[10px] block">({latestVer.state})</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-[#F3F0E8]">
                          {e.revision_rounds_used || 0} / {b?.max_revision_rounds || 3}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <Link
                          href={`/engagements/${e.id}`}
                          className="px-2.5 py-1 rounded bg-[#20211D] border border-[#282A24] hover:border-[#D5AD52]/50 text-[#F3F0E8] text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          View Desk <ExternalLink className="w-3 h-3" />
                        </Link>
                        {e.status !== "approved" && (
                          <button
                            onClick={() => handleOverrideEngagementStatus(e.id, "approved")}
                            className="px-2.5 py-1 rounded bg-[#3E895B]/15 hover:bg-[#3E895B]/25 border border-[#3E895B]/30 text-[#6BCB8B] text-[11px] font-semibold transition-colors"
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
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
            <h2 className="text-xl font-bold text-[#F3F0E8] font-display">Director Roster & Verification Management</h2>
            <span className="font-mono text-xs text-[#AAA99F]">Total Directors: {creators.length}</span>
          </div>

          <div className="overflow-x-auto border border-[#282A24] bg-[#191A17] rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#20211D] border-b border-[#282A24] text-[#D5AD52] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Director</th>
                  <th className="p-4">Headline / Specialization</th>
                  <th className="p-4">Tool Pipeline</th>
                  <th className="p-4">Verification Level</th>
                  <th className="p-4">Legal Safety Status</th>
                  <th className="p-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282A24] text-[#AAA99F]">
                {creators.map((c) => {
                  const cItems = portfolioMap[c.id] || [];
                  const safety = evaluateCreatorSafety(cItems, licenses);

                  return (
                    <tr key={c.id} className="hover:bg-[#20211D] transition-colors">
                      <td className="p-4 font-bold">
                        <Link href={`/creators/${c.id}`} className="text-[#F3F0E8] hover:text-[#D5AD52] text-sm block">
                          {c.name}
                        </Link>
                        <span className="text-[#76756D] text-[10px] font-normal">{c.location}</span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <span className="text-[#AAA99F] block truncate">{c.headline}</span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {c.specialization.map((s) => (
                            <span key={s} className="text-[10px] bg-[#111210] border border-[#282A24] px-1.5 py-0.5 rounded text-[#AAA99F]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tools.map((t) => (
                            <span key={t} className="text-[10px] bg-[#D5AD52]/10 text-[#D5AD52] border border-[#D5AD52]/20 px-1.5 py-0.5 rounded">
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
                          className="bg-[#111210] border border-[#282A24] text-[#F3F0E8] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#D5AD52]"
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
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
            <h2 className="text-xl font-bold text-[#F3F0E8] font-display">Published Campaign Briefs</h2>
            <Link href="/briefs/new" className="btn-primary text-xs">
              + Post New Brief
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefs.map((b) => (
              <div key={b.id} className="border border-[#282A24] bg-[#191A17] rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-[#282A24] pb-3">
                  <div>
                    <span className="font-mono text-xs text-[#D5AD52] uppercase font-semibold">{b.brand_name}</span>
                    <h3 className="text-base font-bold text-[#F3F0E8] font-display leading-snug">{b.title}</h3>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[#76756D] text-[10px] block">Quality Score</span>
                    <span className="text-[#D5AD52] font-bold text-base">{b.quality_score}/100</span>
                  </div>
                </div>

                <p className="text-[#AAA99F] text-xs line-clamp-2">{b.objective}</p>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-[#282A24]">
                  <div>
                    <span className="text-[#76756D] text-[10px] block">Format</span>
                    <span className="text-[#F3F0E8] font-medium">{b.format}</span>
                  </div>
                  <div>
                    <span className="text-[#76756D] text-[10px] block">Content Type</span>
                    <span className="text-[#F3F0E8] font-medium">{b.content_type}</span>
                  </div>
                  <div>
                    <span className="text-[#76756D] text-[10px] block">Max Rounds</span>
                    <span className="text-[#F3F0E8] font-medium">{b.max_revision_rounds}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Link href={`/briefs/${b.id}`} className="text-xs font-mono text-[#D5AD52] hover:text-[#E2BE6A] flex items-center gap-1">
                    View Ranked Matches →
                  </Link>
                  <span className="text-[10px] font-mono text-[#76756D]">ID: {b.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: LICENCE CLEARANCE ENGINE ── */}
      {activeTab === "licensing" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
            <div>
              <h2 className="text-xl font-bold text-[#F3F0E8] font-display">Commercial Licence Audit Registry</h2>
              <p className="text-[#AAA99F] text-xs mt-0.5">Rulebook for tool subscription commercial clearance evaluation.</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#282A24] bg-[#191A17] rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#20211D] border-b border-[#282A24] text-[#D5AD52] uppercase tracking-wider">
                <tr>
                  <th className="p-4">AI Tool</th>
                  <th className="p-4">Subscription Plan</th>
                  <th className="p-4">Commercial Usage Status</th>
                  <th className="p-4">Licence Notes</th>
                  <th className="p-4">Source URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282A24] text-[#AAA99F]">
                {licenses.map((lic, idx) => (
                  <tr key={idx} className="hover:bg-[#20211D] transition-colors">
                    <td className="p-4 font-bold text-[#F3F0E8]">{lic.tool}</td>
                    <td className="p-4 text-[#D5AD52]">{lic.plan}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          lic.commercial_use === "allowed"
                            ? "bg-[#3E895B]/15 text-[#6BCB8B] border border-[#3E895B]/30"
                            : lic.commercial_use === "restricted"
                            ? "bg-[#C68A36]/15 text-[#E5A853] border border-[#C68A36]/30"
                            : "bg-[#B84A4A]/15 text-[#E57373] border border-[#B84A4A]/30"
                        }`}
                      >
                        {lic.commercial_use}
                      </span>
                    </td>
                    <td className="p-4 text-[#AAA99F] max-w-sm leading-relaxed">{lic.notes}</td>
                    <td className="p-4">
                      <a
                        href={lic.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#D5AD52] hover:underline inline-flex items-center gap-1"
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

      {/* ── TAB 5: IMMUTABLE AUDIT TRAIL STREAM ── */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
            <div>
              <h2 className="text-xl font-bold text-[#F3F0E8] font-display">System Operations Audit Trail</h2>
              <p className="text-[#AAA99F] text-xs mt-0.5">
                Cryptographically tracked lifecycle events, brief publications, shortlists, deliverable audits, and approvals.
              </p>
            </div>
            <span className="font-mono text-xs text-[#D5AD52]">
              Total Logged Events: {auditEvents.length}
            </span>
          </div>

          <div className="border border-[#282A24] bg-[#191A17] rounded-xl overflow-hidden">
            <table className="w-full text-left font-mono text-xs text-[#AAA99F]">
              <thead className="bg-[#20211D] text-[#76756D] uppercase text-[10px] tracking-wider border-b border-[#282A24]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282A24]">
                {auditEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#20211D] transition-colors">
                    <td className="p-4 text-[#76756D] whitespace-nowrap text-[11px]">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ev.actor_role === "system"
                          ? "bg-[#20211D] text-[#AAA99F] border border-[#282A24]"
                          : ev.actor_role === "creator"
                          ? "bg-[#D5AD52]/15 text-[#D5AD52] border border-[#D5AD52]/30"
                          : "bg-[#4A6E82]/15 text-[#7BA5BC] border border-[#4A6E82]/30"
                      }`}>
                        {ev.actor_role}: {ev.actor_id}
                      </span>
                    </td>
                    <td className="p-4 text-[#F3F0E8] font-semibold">{ev.action}</td>
                    <td className="p-4 text-[#AAA99F]">
                      {ev.entity_type} #{ev.entity_id}
                    </td>
                    <td className="p-4 text-[#76756D] text-[11px] max-w-md truncate">
                      {JSON.stringify(ev.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: FEEDBACK & BUG INBOX ── */}
      {activeTab === "feedback" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282A24] pb-3">
            <div>
              <h2 className="text-xl font-bold text-[#F3F0E8] font-display">User Feedback & Bug Reports</h2>
              <p className="text-[#AAA99F] text-xs">
                Submissions from creators, brands, and directors via the floating support widget.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#AAA99F]">
                Total: <strong className="text-[#F3F0E8]">{feedbackList.length}</strong>
              </span>
              <button
                onClick={loadFeedback}
                className="btn-secondary text-xs px-2.5 py-1"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="border border-[#282A24] bg-[#191A17] rounded-xl overflow-hidden shadow-xl">
            {feedbackList.length === 0 ? (
              <div className="p-12 text-center text-[#76756D] font-mono text-xs">
                No feedback submissions received yet.
              </div>
            ) : (
              <div className="divide-y divide-[#282A24]">
                {feedbackList.map((fb) => (
                  <div key={fb.id} className="p-5 hover:bg-[#20211D]/50 transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            fb.type === "bug"
                              ? "bg-red-900/30 text-red-400 border border-red-800/40"
                              : fb.type === "feature"
                              ? "bg-blue-900/30 text-blue-400 border border-blue-800/40"
                              : fb.type === "praise"
                              ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40"
                              : "bg-[#D5AD52]/20 text-[#D5AD52] border border-[#D5AD52]/40"
                          }`}>
                            {fb.type}
                          </span>
                          <span className="text-sm font-bold text-[#F3F0E8] font-display">{fb.subject}</span>
                          {fb.rating && (
                            <span className="text-xs font-mono text-[#E5A83B]">
                              {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#AAA99F] leading-relaxed pt-1">
                          {fb.message}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          fb.status === "resolved"
                            ? "bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40"
                            : fb.status === "reviewed"
                            ? "bg-blue-900/20 text-blue-400 border border-blue-800/40"
                            : "bg-[#E5A83B]/20 text-[#E5A83B] border border-[#E5A83B]/40"
                        }`}>
                          {fb.status}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {fb.status !== "reviewed" && (
                            <button
                              onClick={async () => {
                                await fetch("/api/feedback", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: fb.id, status: "reviewed" }),
                                });
                                loadFeedback();
                              }}
                              className="px-2 py-1 rounded bg-[#111210] hover:bg-[#20211D] border border-[#282A24] text-[10px] font-mono text-[#AAA99F]"
                            >
                              Mark Reviewed
                            </button>
                          )}
                          {fb.status !== "resolved" && (
                            <button
                              onClick={async () => {
                                await fetch("/api/feedback", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: fb.id, status: "resolved" }),
                                });
                                loadFeedback();
                              }}
                              className="px-2 py-1 rounded bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/40 text-[10px] font-mono text-[#34D399]"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-mono text-[#76756D] pt-1 border-t border-[#282A24]">
                      <span>Role: <strong className="text-[#AAA99F]">{fb.role || "visitor"}</strong></span>
                      {fb.email && <span>Email: <strong className="text-[#AAA99F]">{fb.email}</strong></span>}
                      {fb.page && <span>Page: <strong className="text-[#AAA99F]">{fb.page}</strong></span>}
                      <span>Submitted: {new Date(fb.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
