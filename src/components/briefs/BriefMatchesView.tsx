"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brief, Creator, PortfolioItem, ToolLicense } from "@/lib/types";
import { computeMatchScore } from "@/lib/scoring";
import { evaluateCreatorSafety } from "@/lib/safety";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { SafetyBadge } from "@/components/common/SafetyBadge";
import { Send, ArrowLeft, AlertCircle } from "lucide-react";

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

  // Evaluate matches
  const matches = creators
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
    <div className="space-y-8 py-4">
      {/* Top Back Link */}
      <div>
        <Link href="/creators" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Roster Directory
        </Link>
      </div>

      {/* Brief Summary Panel */}
      <div className="border border-slate-800/80 bg-slate-900/60 rounded-xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-indigo-400">
              <span className="uppercase font-semibold tracking-wider">{brief.brand_name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Brief ID: {brief.id}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-display mt-1">{brief.title}</h1>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Quality Score</span>
            <span data-testid="quality-score" className="font-mono text-2xl font-bold text-white">
              {brief.quality_score}<span className="text-slate-500 text-sm font-normal">/100</span>
            </span>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">{brief.objective}</p>

        {/* Specifications metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 pt-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Content Type</span>
            <span className="text-slate-200 font-medium">{brief.content_type}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Aspect Ratio</span>
            <span className="text-slate-200 font-medium">{brief.format}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Deliverables</span>
            <span className="text-slate-200 font-medium truncate block">{brief.deliverables}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Usage Rights</span>
            <span className="text-slate-200 font-medium">{brief.usage_rights.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Ranked Matches Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Ranked Matches ({matches.length})</h2>
          <span className="font-mono text-xs text-slate-500">Ordered by weighted tool & safety compatibility</span>
        </div>

        {matches.length === 0 ? (
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-8 text-center text-slate-400 text-sm space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-amber-400" />
            <p>No directors currently match the required deliverable format ({brief.content_type}).</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((m, idx) => (
              <div
                key={m.creator.id}
                data-testid="match-row"
                className="border border-slate-800/80 bg-slate-900/60 rounded-xl p-6 hover:border-slate-700 hover:bg-slate-900/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Rank & Creator Meta */}
                <div className="flex items-start gap-4 min-w-[260px]">
                  <span className="font-mono text-base font-bold text-slate-500">#{idx + 1}</span>
                  <div className="w-12 h-12 rounded-lg border border-slate-700 overflow-hidden bg-slate-800 flex-shrink-0">
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
                    <Link
                      href={`/creators/${m.creator.id}`}
                      className="font-semibold text-white hover:text-indigo-400 transition-colors text-base block"
                    >
                      {m.creator.name}
                    </Link>
                    <p className="text-slate-400 text-xs line-clamp-1">{m.creator.headline}</p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <VerificationBadge level={m.creator.verification_level || "self_declared"} />
                      <SafetyBadge status={m.safety.status} cause={m.safety.cause} />
                    </div>
                  </div>
                </div>

                {/* Middle: Match Reasons & Gaps */}
                <div className="flex-1 space-y-1 text-xs">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Score Evaluation Reasons:</span>
                  <ul className="space-y-1">
                    {m.reasons.map((r, i) => (
                      <li key={i} data-testid="match-reason" className="text-slate-300 flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  {m.missing.length > 0 && (
                    <div className="pt-1.5">
                      <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block font-medium">Identified Gaps:</span>
                      <ul className="space-y-0.5 text-slate-400 font-mono text-[11px]">
                        {m.missing.map((mis, i) => (
                          <li key={i}>• {mis}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right: Match Score & Action */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 min-w-[140px] border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <div className="text-right font-mono">
                    <span className="text-2xl font-bold text-white">{m.score}</span>
                    <span className="text-xs text-slate-500 block">/ 100 match</span>
                  </div>

                  <button
                    onClick={() => handleInvite(m.creator.id)}
                    disabled={invitingId === m.creator.id}
                    className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {invitingId === m.creator.id ? "Inviting..." : "Invite Creator"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
