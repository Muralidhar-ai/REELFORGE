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
      <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Avatar & Director Details */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg border border-[#282A24] overflow-hidden bg-[#20211D] flex-shrink-0">
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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F0E8] font-display leading-tight">{creator.name}</h1>
              <p className="text-[#AAA99F] text-sm font-medium">{creator.headline}</p>
              <div className="flex items-center gap-3 text-xs text-[#76756D] font-mono pt-0.5">
                <span>Location: {creator.location}</span>
                <span>•</span>
                <span className={creator.availability === "available" ? "text-[#6BCB8B] font-medium" : "text-[#E5A853] font-medium"}>
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
                className="btn-primary text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Invite to Campaign Brief
              </button>
            )}
          </div>
        </div>

        {/* Bio Paragraph */}
        <p className="text-[#AAA99F] text-xs sm:text-sm leading-relaxed border-t border-[#282A24] pt-4 max-w-3xl">{creator.bio}</p>

        {/* Specializations & Tools Stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-[#282A24] text-xs">
          <div>
            <span className="font-mono text-[#AAA99F] text-[10px] uppercase tracking-wider block mb-1.5 font-medium">Specialization</span>
            <div className="flex flex-wrap gap-1.5">
              {creator.specialization.map((spec) => (
                <span key={spec} className="bg-[#20211D] text-[#F3F0E8] border border-[#282A24] px-2 py-0.5 rounded text-[11px]">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-[#AAA99F] text-[10px] uppercase tracking-wider block mb-1.5 font-medium">Generative Pipeline</span>
            <div className="flex flex-wrap gap-1.5">
              {creator.tools.map((t) => (
                <span key={t} className="bg-[#111210] text-[#D5AD52] border border-[#282A24] font-mono px-2 py-0.5 rounded text-[10px]">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-[#AAA99F] text-[10px] uppercase tracking-wider block mb-1.5 font-medium">Core Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {creator.skills.map((s) => (
                <span key={s} className="bg-[#20211D] text-[#AAA99F] border border-[#282A24] px-2 py-0.5 rounded text-[11px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Policy Explainer */}
        <div className="bg-[#111210] border border-[#282A24] rounded-lg p-3 text-xs text-[#AAA99F] font-mono">
          <span className="font-semibold text-[#F3F0E8] mr-2">Provenance Standard:</span>
          Platform reviewed directors have passed manual prompt seed inspection. Tool licence status guarantees legal clearance for commercial distribution.
        </div>
      </div>

      {/* Portfolio Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#282A24] pb-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F3F0E8] font-display">Work Samples ({portfolio.length})</h2>
          <span className="font-mono text-xs text-[#76756D]">Select any frame to inspect prompt replay log</span>
        </div>

        {portfolio.length === 0 ? (
          <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-8 text-center text-[#AAA99F] text-sm">
            No work samples uploaded yet for this creator.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolio.map((item) => {
              const itemSafety = evaluateItemSafety(item, licenses);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="border border-[#282A24] bg-[#191A17] rounded-xl p-4 space-y-3 cursor-pointer hover:border-[#3D4036] hover:bg-[#20211D] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <PortfolioFrame
                      mediaUrl={item.media_url}
                      altText={item.alt_text}
                      aspectRatio={item.aspect_ratio}
                      mediaType={item.media_type}
                    />

                    <div className="flex items-start justify-between gap-2 pt-1">
                      <h3 className="font-semibold text-[#F3F0E8] text-sm line-clamp-1 group-hover:text-[#D5AD52] transition-colors">{item.title}</h3>
                      <span className="font-mono text-[10px] text-[#AAA99F] border border-[#282A24] px-1.5 py-0.5 rounded flex-shrink-0 bg-[#111210]">
                        {item.aspect_ratio}
                      </span>
                    </div>

                    <p className="text-[#AAA99F] text-xs line-clamp-2">{item.description}</p>
                  </div>

                  <div className="border-t border-[#282A24] pt-2.5 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-[#AAA99F]">
                      <span>Generations:</span>
                      <span className="text-[#F3F0E8] font-medium">{item.generation_count} iterations</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#AAA99F]">Licence Check:</span>
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#191A17] border border-[#282A24] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative space-y-6 shadow-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md border border-[#282A24] bg-[#20211D] text-[#AAA99F] hover:text-[#F3F0E8] transition-colors"
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
                <div className="flex items-center justify-between font-mono text-xs text-[#AAA99F] bg-[#111210] p-2.5 rounded-md border border-[#282A24]">
                  <span>Aspect: [{selectedItem.aspect_ratio}]</span>
                  <span>Type: {selectedItem.content_type}</span>
                  <span>{selectedItem.generation_count} iterations</span>
                </div>
              </div>

              {/* Right Column: Workflow Replay Details */}
              <div className="lg:col-span-6 space-y-5 text-left">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F3F0E8] font-display leading-tight">{selectedItem.title}</h2>
                  <p className="text-[#AAA99F] text-xs sm:text-sm mt-1">{selectedItem.description}</p>
                </div>

                {/* Tools Used */}
                <div className="space-y-1.5 border-t border-[#282A24] pt-3">
                  <span className="font-mono text-xs text-[#AAA99F] block uppercase tracking-wider font-medium">Software Stack & Active Plans</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.tools_used.map((tu, idx) => (
                      <span key={idx} className="bg-[#111210] border border-[#282A24] text-xs font-mono px-2 py-1 rounded text-[#D5AD52]">
                        {tu.tool} ({tu.plan})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Proof Link */}
                {selectedItem.proof_url && (
                  <div className="space-y-1 border-t border-[#282A24] pt-3">
                    <span className="font-mono text-xs text-[#AAA99F] block uppercase tracking-wider font-medium">Workflow Repository</span>
                    <a
                      href={selectedItem.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#D5AD52] hover:underline font-mono"
                    >
                      {selectedItem.proof_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Workflow Replay Step Log */}
                <div className="space-y-3 border-t border-[#282A24] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#AAA99F] uppercase tracking-wider font-medium">
                      Workflow Step Log ({selectedItem.workflow_steps.length} steps)
                    </span>
                    <span className="font-mono text-xs text-[#76756D]">{selectedItem.generation_count} total runs</span>
                  </div>

                  <div className="relative border-l border-[#282A24] pl-4 space-y-3 py-1">
                    {selectedItem.workflow_steps.map((step, idx) => (
                      <div key={idx} data-testid="workflow-step" className="relative space-y-0.5">
                        {/* Step Marker */}
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#D5AD52]" />

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#F3F0E8]">
                            0{idx + 1}. {step.title}
                          </span>
                          {step.tool && (
                            <span className="font-mono text-[10px] bg-[#111210] border border-[#282A24] text-[#AAA99F] px-1.5 rounded">
                              {step.tool}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#AAA99F] leading-relaxed">{step.detail}</p>
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191A17] border border-[#282A24] rounded-xl w-full max-w-md p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md border border-[#282A24] bg-[#20211D] text-[#AAA99F] hover:text-[#F3F0E8]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-[#F3F0E8] font-display">Invite {creator.name}</h3>
            <p className="text-[#AAA99F] text-xs">
              Select one of your active campaign briefs to issue a pitch invitation.
            </p>

            {inviteSuccess ? (
              <div className="bg-[#3E895B]/15 border border-[#3E895B]/30 text-[#6BCB8B] p-4 rounded-md text-center font-mono text-xs flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Invitation sent! Redirecting to workspace...
              </div>
            ) : publishedBriefs.length === 0 ? (
              <div className="space-y-3 py-2">
                <p className="text-xs text-[#E5A853]">You have no published briefs available to invite.</p>
                <Link href="/briefs/new" className="btn-primary text-xs w-full block text-center">
                  Create a new brief
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#AAA99F] block">Select Target Brief</label>
                  <select
                    suppressHydrationWarning
                    value={selectedBriefId}
                    onChange={(e) => setSelectedBriefId(e.target.value)}
                    className="w-full bg-[#111210] border border-[#282A24] text-[#F3F0E8] text-xs rounded-md p-2.5 focus:outline-none focus:border-[#D5AD52]"
                  >
                    {publishedBriefs.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#111210] text-[#F3F0E8]">
                        {b.brand_name} — {b.title} [{b.format}]
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleInviteSubmit}
                  disabled={isSubmitting}
                  className="btn-primary w-full text-xs"
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
