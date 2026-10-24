"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brief, Creator, PortfolioItem, ToolLicense } from "@/lib/types";
import { computeMatchScore } from "@/lib/scoring";
import { evaluateCreatorSafety } from "@/lib/safety";
import { generateAutoShortlist, AutoShortlistProposal } from "@/lib/agent/autoShortlist";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { SafetyBadge } from "@/components/common/SafetyBadge";
import {
  Send,
  ArrowLeft,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Bot,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileSearch,
  ExternalLink,
} from "lucide-react";

interface BriefMatchesViewProps {
  brief: Brief;
  creators: Creator[];
  allPortfolio: PortfolioItem[];
  licenses: ToolLicense[];
}

export function BriefMatchesView({
  brief,
  creators,
  allPortfolio,
  licenses,
}: BriefMatchesViewProps) {
  const router = useRouter();
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(["cr_1"]);
  const [activeTab, setActiveTab] = useState<"all" | "shortlist">("all");
  const [loadingShortlist, setLoadingShortlist] = useState(false);

  // Auto-shortlist Agent state
  const [agentProposal, setAgentProposal] = useState<AutoShortlistProposal | null>(null);
  const [agentRunning, setAgentRunning] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentAccepted, setAgentAccepted] = useState(false);

  // Fetch initial shortlist from API
  useEffect(() => {
    async function loadShortlist() {
      try {
        const res = await fetch(`/api/briefs/${brief.id}/shortlist`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.shortlist)) {
          setShortlistedIds(data.shortlist.map((item: any) => item.creator_id));
        }
      } catch (err) {
        console.error("Failed to load shortlist", err);
      }
    }
    loadShortlist();
  }, [brief.id]);

  // Evaluate matches
  const allMatches = creators
    .map((creator) => {
      const cPortfolio = allPortfolio.filter((p) => p.creator_id === creator.id);
      const matchResult = computeMatchScore(creator, brief, cPortfolio);
      const safetyResult = evaluateCreatorSafety(cPortfolio, licenses);

      return {
        creator,
        portfolio: cPortfolio,
        score: matchResult.score,
        matched: matchResult.matched,
        reasons: matchResult.reasons,
        missing: matchResult.missing,
        safety: safetyResult,
      };
    })
    .filter((m) => m.matched)
    .sort((a, b) => b.score - a.score);

  const displayedMatches =
    activeTab === "shortlist"
      ? allMatches.filter((m) => shortlistedIds.includes(m.creator.id))
      : allMatches;

  const handleToggleShortlist = async (creatorId: string) => {
    const isCurrentlyShortlisted = shortlistedIds.includes(creatorId);
    setLoadingShortlist(true);

    try {
      if (isCurrentlyShortlisted) {
        setShortlistedIds((prev) => prev.filter((id) => id !== creatorId));
        await fetch(`/api/briefs/${brief.id}/shortlist?creator_id=${creatorId}`, {
          method: "DELETE",
        });
      } else {
        setShortlistedIds((prev) => [...prev, creatorId]);
        await fetch(`/api/briefs/${brief.id}/shortlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creator_id: creatorId,
            notes: "Curated by Brand Manager",
            added_by: "brand",
          }),
        });
      }
    } catch (err) {
      console.error("Shortlist toggle error", err);
    } finally {
      setLoadingShortlist(false);
    }
  };

  const handleRunAgent = () => {
    setAgentRunning(true);
    setTimeout(() => {
      const proposal = generateAutoShortlist(brief, creators, allPortfolio, licenses);
      setAgentProposal(proposal);
      setAgentRunning(false);
      setShowAgentModal(true);
    }, 600);
  };

  const handleAcceptAgentProposal = async () => {
    if (!agentProposal) return;
    const recommendedIds = agentProposal.candidates.map((c) => c.creator.id);
    setShortlistedIds((prev) => Array.from(new Set([...prev, ...recommendedIds])));
    setAgentAccepted(true);

    // Save to real database
    for (const c of agentProposal.candidates) {
      try {
        await fetch(`/api/briefs/${brief.id}/shortlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creator_id: c.creator.id,
            notes: `Auto-Shortlist Agent proposal (${c.matchScore}% match): ${c.rationale}`,
            added_by: "auto_agent",
          }),
        });
      } catch (err) {
        console.error("Error saving agent shortlist", err);
      }
    }

    setTimeout(() => {
      setShowAgentModal(false);
      setActiveTab("shortlist");
    }, 800);
  };

  const handleInvite = async (creatorId: string) => {
    setInvitingId(creatorId);
    try {
      const res = await fetch("/api/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief_id: brief.id,
          creator_id: creatorId,
        }),
      });
      const data = await res.json();
      if (data.ok && data.engagement) {
        router.push(`/engagements/${data.engagement.id}`);
      }
    } catch (err) {
      console.error("Invite creator error", err);
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Top Back Link & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/briefs"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#AAA99F] hover:text-[#F3F0E8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Campaign Briefs
        </Link>

        {/* Auto-Shortlist Agent Trigger Button */}
        <button
          onClick={handleRunAgent}
          disabled={agentRunning}
          className="btn-secondary text-xs flex items-center gap-2"
        >
          <Bot className="w-3.5 h-3.5 text-[#D5AD52]" />
          {agentRunning ? "Analyzing Platform Roster..." : "Run Auto-Shortlist Agent"}
        </button>
      </div>

      {/* Brief Summary Panel */}
      <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#282A24] pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#D5AD52]">
              <span className="uppercase font-semibold tracking-wider">{brief.brand_name}</span>
              <span className="text-[#3D4036]">•</span>
              <span className="text-[#76756D]">Brief ID: {brief.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F0E8] font-display mt-1">{brief.title}</h1>
          </div>

          <div className="flex flex-col items-end gap-0.5 flex-shrink-0 bg-[#111210] px-4 py-2 rounded-lg border border-[#282A24]">
            <span className="font-mono text-[10px] text-[#76756D] uppercase tracking-wider">Quality Score</span>
            <span data-testid="quality-score" className="font-mono text-2xl font-bold text-[#F3F0E8]">
              {brief.quality_score}
              <span className="text-[#76756D] text-xs font-normal">/100</span>
            </span>
          </div>
        </div>

        <p className="text-[#AAA99F] text-xs sm:text-sm leading-relaxed max-w-3xl">{brief.objective}</p>

        {/* Specifications metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#282A24] pt-4 text-xs font-mono">
          <div className="bg-[#111210] p-2.5 rounded border border-[#282A24]">
            <span className="text-[#76756D] text-[10px] uppercase block">Content Type</span>
            <span className="text-[#F3F0E8] font-medium capitalize">{brief.content_type}</span>
          </div>
          <div className="bg-[#111210] p-2.5 rounded border border-[#282A24]">
            <span className="text-[#76756D] text-[10px] uppercase block">Aspect Ratio</span>
            <span className="text-[#F3F0E8] font-medium">{brief.format}</span>
          </div>
          <div className="bg-[#111210] p-2.5 rounded border border-[#282A24]">
            <span className="text-[#76756D] text-[10px] uppercase block">Deliverables</span>
            <span className="text-[#F3F0E8] font-medium truncate block">{brief.deliverables}</span>
          </div>
          <div className="bg-[#111210] p-2.5 rounded border border-[#282A24]">
            <span className="text-[#76756D] text-[10px] uppercase block">Usage Clearance</span>
            <span className="text-[#6BCB8B] font-medium">{brief.usage_rights.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SHORTLIST COUNTER */}
      <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
              activeTab === "all"
                ? "bg-[#20211D] text-[#F3F0E8] font-semibold border border-[#282A24]"
                : "text-[#AAA99F] hover:text-[#F3F0E8]"
            }`}
          >
            All Ranked Matches ({allMatches.length})
          </button>
          <button
            onClick={() => setActiveTab("shortlist")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "shortlist"
                ? "bg-[#20211D] text-[#F3F0E8] font-semibold border border-[#282A24]"
                : "text-[#AAA99F] hover:text-[#F3F0E8]"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Curated Shortlist ({shortlistedIds.length})
          </button>
        </div>

        <span className="font-mono text-xs text-[#76756D] hidden sm:inline-block">
          Algorithmic multi-factor fit & commercial clearance
        </span>
      </div>

      {/* MATCHES LIST */}
      {displayedMatches.length === 0 ? (
        <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-10 text-center text-[#AAA99F] text-xs space-y-3">
          <AlertCircle className="w-5 h-5 mx-auto text-[#E5A853]" />
          <p>
            {activeTab === "shortlist"
              ? "Your campaign shortlist is currently empty. Star creators from the match list or run the Auto-Shortlist Agent."
              : `No directors currently match the required deliverable format (${brief.content_type}).`}
          </p>
          {activeTab === "shortlist" && (
            <button
              onClick={() => setActiveTab("all")}
              className="text-xs font-mono text-[#D5AD52] hover:underline"
            >
              Browse all candidates
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedMatches.map((m, idx) => {
            const isShortlisted = shortlistedIds.includes(m.creator.id);

            return (
              <div
                key={m.creator.id}
                data-testid="match-row"
                className="border border-[#282A24] bg-[#191A17] hover:border-[#3D4036] rounded-xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                {/* Left: Rank & Creator Meta */}
                <div className="flex items-start gap-4 min-w-[280px]">
                  <span className="font-mono text-sm font-bold text-[#76756D]">#{idx + 1}</span>
                  <div className="w-12 h-12 rounded-lg border border-[#282A24] overflow-hidden bg-[#20211D] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.creator.avatar_url}
                      alt={m.creator.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/creators/${m.creator.id}`}
                        className="font-semibold text-[#F3F0E8] hover:text-[#D5AD52] transition-colors text-base block font-display"
                      >
                        {m.creator.name}
                      </Link>
                      <button
                        onClick={() => handleToggleShortlist(m.creator.id)}
                        title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                        className={`p-1 rounded transition-colors ${
                          isShortlisted ? "text-[#D5AD52]" : "text-[#76756D] hover:text-[#F3F0E8]"
                        }`}
                      >
                        {isShortlisted ? (
                          <BookmarkCheck className="w-4 h-4 fill-[#D5AD52]" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-[#AAA99F] text-xs line-clamp-1">{m.creator.headline}</p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <VerificationBadge level={m.creator.verification_level || "self_declared"} />
                      <SafetyBadge status={m.safety.status} cause={m.safety.cause} />
                    </div>
                  </div>
                </div>

                {/* Middle: Match Reasons & Gaps */}
                <div className="flex-1 space-y-1.5 text-xs">
                  <span className="font-mono text-[10px] text-[#76756D] uppercase tracking-wider block font-medium">
                    Evidence-Backed Fit Rationale:
                  </span>
                  <ul className="space-y-1">
                    {m.reasons.map((r, i) => (
                      <li key={i} data-testid="match-reason" className="text-[#AAA99F] flex items-center gap-1.5">
                        <span className="text-[#6BCB8B] font-bold">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  {m.missing.length > 0 && (
                    <div className="pt-1">
                      <span className="font-mono text-[10px] text-[#E5A853] uppercase tracking-wider block font-medium">
                        Identified Gaps:
                      </span>
                      <ul className="space-y-0.5 text-[#AAA99F] font-mono text-[11px]">
                        {m.missing.map((mis, i) => (
                          <li key={i}>• {mis}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Portfolio workflow proof link */}
                  {m.portfolio.length > 0 && (
                    <div className="pt-1">
                      <Link
                        href={`/creators/${m.creator.id}`}
                        className="text-[11px] font-mono text-[#D5AD52] hover:text-[#E2BE6A] inline-flex items-center gap-1"
                      >
                        <FileSearch className="w-3 h-3" />
                        Inspect {m.portfolio.length} verified portfolio replay(s)
                      </Link>
                    </div>
                  )}
                </div>

                {/* Right: Match Score & Action */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 min-w-[150px] border-t md:border-t-0 border-[#282A24] pt-3 md:pt-0">
                  <div className="text-right font-mono">
                    <span className="text-3xl font-bold text-[#F3F0E8] font-display">{m.score}</span>
                    <span className="text-xs text-[#76756D] block">/ 100 affinity</span>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                    <button
                      onClick={() => handleInvite(m.creator.id)}
                      disabled={invitingId === m.creator.id}
                      className="btn-primary text-xs flex items-center justify-center gap-1.5 font-mono"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {invitingId === m.creator.id ? "Inviting..." : "Invite Director"}
                    </button>
                    <button
                      onClick={() => handleToggleShortlist(m.creator.id)}
                      className="px-3 py-1 rounded bg-[#111210] hover:bg-[#20211D] border border-[#282A24] text-[#AAA99F] hover:text-[#F3F0E8] text-[11px] font-mono transition-colors text-center"
                    >
                      {isShortlisted ? "✓ Shortlisted" : "+ Shortlist"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AUTO-SHORTLIST AGENT MODAL */}
      {showAgentModal && agentProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191A17] border border-[#282A24] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#282A24] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs text-[#D5AD52]">
                  <Bot className="w-4 h-4" />
                  <span className="uppercase font-semibold tracking-wider">Auto-Shortlist Agent Proposal</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#F3F0E8] font-display">
                  Autonomous Candidate Analysis
                </h3>
                <p className="text-[#AAA99F] text-xs">
                  Target Brief: <strong className="text-[#F3F0E8]">{agentProposal.briefTitle}</strong>
                </p>
              </div>

              <button
                onClick={() => setShowAgentModal(false)}
                className="text-[#AAA99F] hover:text-[#F3F0E8] font-mono text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Selection Criteria Applied */}
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase text-[#AAA99F] font-medium block">
                Criteria Evaluated by Agent:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {agentProposal.selectionCriteria.map((crit, idx) => (
                  <div key={idx} className="bg-[#111210] p-2.5 rounded border border-[#282A24] space-y-0.5">
                    <span className="text-[#F3F0E8] text-[11px] font-semibold block">{crit.dimension}</span>
                    <span className="text-[#AAA99F] text-[10px] block">Req: {crit.briefRequirement}</span>
                    <span className="text-[#76756D] text-[9px] block">{crit.evaluationMethod}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Candidates */}
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase text-[#6BCB8B] font-semibold block">
                Recommended Candidates ({agentProposal.candidates.length}):
              </span>
              <div className="space-y-3">
                {agentProposal.candidates.map((cand) => (
                  <div
                    key={cand.creator.id}
                    className="border border-[#282A24] bg-[#111210] rounded-lg p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-[#F3F0E8] text-sm">{cand.creator.name}</span>
                        <span className="px-2 py-0.5 rounded bg-[#3E895B]/10 text-[#6BCB8B] text-[10px] font-mono border border-[#3E895B]/25">
                          {cand.suitability === "strongly_recommended" ? "Strong Fit" : "Alternative"}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#D5AD52]">
                        {cand.matchScore}% Match
                      </span>
                    </div>

                    <p className="text-[#AAA99F] text-xs">{cand.rationale}</p>

                    <div className="text-[11px] font-mono text-[#76756D] space-y-0.5">
                      <div>
                        <strong className="text-[#AAA99F]">Strengths:</strong> {cand.strengths.slice(0, 2).join("; ")}
                      </div>
                      {cand.tradeoffs.length > 0 && (
                        <div>
                          <strong className="text-[#E5A853]">Trade-offs:</strong> {cand.tradeoffs.join("; ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unsuitable Candidates */}
            {agentProposal.unsuitable.length > 0 && (
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase text-[#AAA99F] font-medium block">
                  Disqualified / Incompatible Candidates ({agentProposal.unsuitable.length}):
                </span>
                <div className="bg-[#111210] rounded-lg p-3 border border-[#282A24] space-y-1.5 text-xs">
                  {agentProposal.unsuitable.map((u) => (
                    <div key={u.creator.id} className="text-[#AAA99F] font-mono text-[11px]">
                      <strong className="text-[#F3F0E8]">{u.creator.name}:</strong>{" "}
                      <span className="text-[#E57373]">{u.disqualificationReasons.join("; ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="space-y-1 bg-[#111210] border border-[#282A24] rounded-lg p-3.5 text-xs font-mono">
              <span className="text-[#D5AD52] uppercase font-semibold block text-[11px]">
                Agent Recommended Action:
              </span>
              <ul className="space-y-1 text-[#AAA99F] text-[11px]">
                {agentProposal.nextSteps.map((step, idx) => (
                  <li key={idx}>• {step}</li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#282A24]">
              <button
                onClick={() => setShowAgentModal(false)}
                className="btn-secondary text-xs"
              >
                Dismiss Proposal
              </button>
              <button
                onClick={handleAcceptAgentProposal}
                className="btn-primary text-xs font-mono font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {agentAccepted ? "Shortlist Saved!" : "Accept & Save to Campaign Shortlist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
