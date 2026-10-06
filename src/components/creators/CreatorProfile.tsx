"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Creator, PortfolioItem, ToolLicense, Brief } from "@/lib/types";
import { PortfolioFrame } from "@/components/common/PortfolioFrame";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { SafetyBadge } from "@/components/common/SafetyBadge";
import { evaluateCreatorSafety, evaluateItemSafety } from "@/lib/safety";
import { useRole } from "@/context/RoleContext";
import { X, ExternalLink, Send, CheckCircle } from "lucide-react";

interface CreatorProfileProps {
  creator: Creator;
  portfolio: PortfolioItem[];
  licenses: ToolLicense[];
  publishedBriefs: Brief[];
}

export function CreatorProfile({
  creator,
  portfolio,
  licenses,
  publishedBriefs,
}: CreatorProfileProps) {
  const router = useRouter();
  const { role } = useRole();
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedBriefId, setSelectedBriefId] = useState<string>(
    publishedBriefs[0]?.id || ""
  );
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safety = evaluateCreatorSafety(portfolio, licenses);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedItem(null);
        setInviteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleInviteSubmit = async () => {
    if (!selectedBriefId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief_id: selectedBriefId,
          creator_id: creator.id,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setInviteSuccess(true);
        setTimeout(() => {
          setInviteSuccess(false);
          setInviteModalOpen(false);
          router.push(`/engagements/${data.engagement.id}`);
        }, 1200);
      }
    } catch (err) {
      console.error("Invite error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Profile Header Card */}
      <div className="border border-slate-800/80 bg-slate-900/60 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Avatar & Director Details */}
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-lg border border-slate-700 overflow-hidden bg-slate-800 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={creator.avatar_url}
                alt={creator.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-white font-display leading-tight">{creator.name}</h1>
              <p className="text-slate-300 text-base font-medium">{creator.headline}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                <span>Location: {creator.location}</span>
                <span>•</span>
                <span className={creator.availability === "available" ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                  {creator.availability === "available" ? "Available for Commission" : "Currently Booked"}
                </span>
              </div>
            </div>
          </div>

          {/* Verification & Action Button */}
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <VerificationBadge level={creator.verification_level || "self_declared"} />
              <SafetyBadge status={safety.status} cause={safety.cause} />
            </div>

            {role === "brand" && (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Invite to Campaign Brief
              </button>
            )}
          </div>
        </div>

        {/* Bio Paragraph */}
        <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-800/80 pt-4 max-w-3xl">{creator.bio}</p>

        {/* Specializations & Tools Stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <span className="font-mono text-slate-400 text-[10px] uppercase tracking-wider block mb-1.5 font-medium">Specialization</span>
            <div className="flex flex-wrap gap-1.5">
              {creator.specialization.map((spec) => (
                <span key={spec} className="bg-slate-800 text-slate-200 border border-slate-700/60 px-2 py-0.5 rounded text-[11px]">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-slate-400 text-[10px] uppercase tracking-wider block mb-1.5 font-medium">Generative Pipeline</span>
            <div className="flex flex-wrap gap-1.5">
              {creator.tools.map((t) => (
                <span key={t} className="bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 font-mono px-2 py-0.5 rounded text-[10px]">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-slate-400 text-[10px] uppercase tracking-wider block mb-1.5 font-medium">Core Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {creator.skills.map((s) => (
                <span key={s} className="bg-slate-800/60 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded text-[11px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Policy Explainer */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 font-mono">
          <span className="font-semibold text-slate-200 mr-2">Provenance Standard:</span>
          Platform reviewed directors have passed manual prompt inspection. Tool licence status guarantees legal clearance for commercial distribution.
        </div>
      </div>

      {/* Portfolio Grid Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Work Samples ({portfolio.length})</h2>
          <span className="font-mono text-xs text-slate-500">Select any frame to inspect prompt replay log</span>
        </div>

        {portfolio.length === 0 ? (
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-8 text-center text-slate-400 text-sm">
            No work samples uploaded yet for this creator.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item) => {
              const itemSafety = evaluateItemSafety(item, licenses);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="border border-slate-800/80 bg-slate-900/60 rounded-xl p-4 space-y-3 cursor-pointer hover:border-slate-700 hover:bg-slate-900/90 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <PortfolioFrame
                      mediaUrl={item.media_url}
                      altText={item.alt_text}
                      aspectRatio={item.aspect_ratio}
                      mediaType={item.media_type}
                    />

                    <div className="flex items-start justify-between gap-2 pt-1">
                      <h3 className="font-semibold text-white text-sm line-clamp-1">{item.title}</h3>
                      <span className="font-mono text-[10px] text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded flex-shrink-0 bg-slate-950">
                        {item.aspect_ratio}
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs line-clamp-2">{item.description}</p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Generations:</span>
                      <span className="text-slate-200 font-medium">{item.generation_count} iterations</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Licence Check:</span>
                      <SafetyBadge status={itemSafety.status} cause={itemSafety.causes[0]} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PORTFOLIO ITEM WORKFLOW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative space-y-6 shadow-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Media Presentation */}
              <div className="lg:col-span-6 space-y-3">
                <PortfolioFrame
                  mediaUrl={selectedItem.media_url}
                  altText={selectedItem.alt_text}
                  aspectRatio={selectedItem.aspect_ratio}
                  mediaType={selectedItem.media_type}
                />
                <div className="flex items-center justify-between font-mono text-xs text-slate-400 bg-slate-900 p-2.5 rounded-md border border-slate-800">
                  <span>Aspect Ratio: [{selectedItem.aspect_ratio}]</span>
                  <span>Type: {selectedItem.content_type}</span>
                  <span>{selectedItem.generation_count} iterations</span>
                </div>
              </div>

              {/* Right Column: Workflow Replay Details */}
              <div className="lg:col-span-6 space-y-5 text-left">
                <div>
                  <h2 className="text-2xl font-bold text-white font-display leading-tight">{selectedItem.title}</h2>
                  <p className="text-slate-400 text-sm mt-1">{selectedItem.description}</p>
                </div>

                {/* Tools Used */}
                <div className="space-y-1.5 border-t border-slate-800 pt-3">
                  <span className="font-mono text-xs text-slate-400 block uppercase tracking-wider font-medium">Software Stack & Active Plans</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.tools_used.map((tu, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-800 text-xs font-mono px-2 py-1 rounded text-indigo-300">
                        {tu.tool} ({tu.plan})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Proof Link */}
                {selectedItem.proof_url && (
                  <div className="space-y-1 border-t border-slate-800 pt-3">
                    <span className="font-mono text-xs text-slate-400 block uppercase tracking-wider font-medium">Workflow Repository</span>
                    <a
                      href={selectedItem.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline font-mono"
                    >
                      {selectedItem.proof_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Workflow Replay Step Log */}
                <div className="space-y-3 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-medium">
                      Workflow Step Log ({selectedItem.workflow_steps.length} steps)
                    </span>
                    <span className="font-mono text-xs text-slate-500">{selectedItem.generation_count} total runs</span>
                  </div>

                  <div className="relative border-l border-slate-800 pl-4 space-y-4 py-1">
                    {selectedItem.workflow_steps.map((step, idx) => (
                      <div key={idx} data-testid="workflow-step" className="relative space-y-1">
                        {/* Step Marker */}
                        <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-indigo-500" />

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white">
                            0{idx + 1}. {step.title}
                          </span>
                          {step.tool && (
                            <span className="font-mono text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 rounded">
                              {step.tool}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVITE TO BRIEF MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-white font-display">Invite {creator.name}</h3>
            <p className="text-slate-400 text-xs">
              Select one of your active campaign briefs to issue a pitch invitation.
            </p>

            {inviteSuccess ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-4 rounded-md text-center font-mono text-xs flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Invitation sent! Redirecting to workspace...
              </div>
            ) : publishedBriefs.length === 0 ? (
              <div className="space-y-3 py-2">
                <p className="text-xs text-amber-400">You have no published briefs available to invite.</p>
                <Link href="/briefs/new" className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium block text-center">
                  Create a new brief
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-slate-400 block">Select Target Brief</label>
                  <select
                    suppressHydrationWarning
                    value={selectedBriefId}
                    onChange={(e) => setSelectedBriefId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-md p-2.5 focus:outline-none focus:border-indigo-500"
                  >
                    {publishedBriefs.map((b) => (
                      <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                        {b.brand_name} — {b.title} [{b.format}]
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleInviteSubmit}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Sending invite..." : "Confirm & Send Invitation"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
