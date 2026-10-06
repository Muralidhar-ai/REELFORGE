"use client";

import React, { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { Engagement, Brief, Creator, VersionSubmission } from "@/lib/types";
import { PortfolioFrame } from "@/components/common/PortfolioFrame";
import { Check, Upload, CheckCircle2, Zap, SlidersHorizontal, ShieldCheck, Download, FileCode, Layers } from "lucide-react";

interface EngagementBoardProps {
  initialEngagement: Engagement;
  brief: Brief;
  creator: Creator;
}

const STEPPER_STAGES = [
  { id: "invited", label: "01. Invited" },
  { id: "accepted", label: "02. Accepted" },
  { id: "in_progress", label: "03. In Progress" },
  { id: "delivered", label: "04. Delivered" },
  { id: "approved", label: "05. Approved" },
];

export function EngagementBoard({
  initialEngagement,
  brief,
  creator,
}: EngagementBoardProps) {
  const { role, setRole } = useRole();
  const [engagement, setEngagement] = useState<Engagement>(initialEngagement);
  const [activeTab, setActiveTab] = useState<"brand" | "creator">(
    role === "creator" ? "creator" : "brand"
  );
  const [submitting, setSubmitting] = useState(false);

  // A/B Comparison state
  const [abCompareMode, setAbCompareMode] = useState(false);

  // C2PA Modal state
  const [c2paModalOpen, setC2paModalOpen] = useState(false);
  const [c2paVersion, setC2paVersion] = useState<VersionSubmission | null>(null);

  // Creator version submission state
  const [versionNote, setVersionNote] = useState("");
  const [versionMediaUrl, setVersionMediaUrl] = useState("/seed/sneaker_916.mp4");

  // Brand feedback state
  const [brandFeedback, setBrandFeedback] = useState("");

  const updateEngagementState = async (updates: Partial<Engagement>) => {
    setSubmitting(true);
    // Optimistic UI update for instant feedback
    setEngagement((prev) => ({ ...prev, ...updates }));
    try {
      const res = await fetch(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.ok && data.engagement) {
        setEngagement(data.engagement);
      }
    } catch (err) {
      console.error("Update engagement error", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatorSubmitVersion = async () => {
    if (!versionNote.trim()) return;

    const nextVerNum = engagement.versions.length + 1;
    const newVer: VersionSubmission = {
      n: nextVerNum,
      note: versionNote,
      media_url: versionMediaUrl,
      state: "submitted",
    };

    const updatedVersions = [...engagement.versions, newVer];
    const newStatus = nextVerNum >= 1 ? "delivered" : "in_progress";

    await updateEngagementState({
      versions: updatedVersions,
      status: newStatus,
    });

    setVersionNote("");
  };

  const handleBrandRequestChanges = async (verIndex: number) => {
    if (!brandFeedback.trim()) return;

    const currentRounds = engagement.revision_rounds_used || 0;
    if (currentRounds >= brief.max_revision_rounds) return;

    const copy = [...engagement.versions];
    copy[verIndex] = {
      ...copy[verIndex],
      brand_feedback: brandFeedback,
      state: "changes_requested",
    };

    await updateEngagementState({
      versions: copy,
      revision_rounds_used: currentRounds + 1,
      status: "in_progress",
    });

    setBrandFeedback("");
  };

  const handleBrandApprove = async (verIndex: number) => {
    const copy = [...engagement.versions];
    copy[verIndex] = {
      ...copy[verIndex],
      state: "approved",
    };

    await updateEngagementState({
      versions: copy,
      status: "approved",
    });
  };

  // 1-Click Live Walkthrough Preset Actions
  const handlePresetAccept = () => {
    updateEngagementState({ status: "accepted" });
  };

  const handlePresetSubmitV1 = () => {
    const newVer: VersionSubmission = {
      n: (engagement.versions.length || 0) + 1,
      note: "Rendered 9:16 liquid fluid flow sequence using ComfyUI node pipeline",
      media_url: "/seed/sneaker_916.mp4",
      state: "submitted",
    };
    updateEngagementState({
      versions: [...engagement.versions, newVer],
      status: "delivered",
    });
  };

  const handlePresetRequestRevision = () => {
    if (engagement.versions.length === 0) return;
    const copy = [...engagement.versions];
    const lastIdx = copy.length - 1;
    copy[lastIdx] = {
      ...copy[lastIdx],
      brand_feedback: "Please adjust liquid motion contrast on frame 120 beat drop.",
      state: "changes_requested",
    };
    updateEngagementState({
      versions: copy,
      revision_rounds_used: (engagement.revision_rounds_used || 0) + 1,
      status: "in_progress",
    });
  };

  const handlePresetApprove = () => {
    if (engagement.versions.length === 0) return;
    const copy = [...engagement.versions];
    const lastIdx = copy.length - 1;
    copy[lastIdx] = {
      ...copy[lastIdx],
      state: "approved",
    };
    updateEngagementState({
      versions: copy,
      status: "approved",
    });
  };

  const maxRoundsReached = (engagement.revision_rounds_used || 0) >= brief.max_revision_rounds;

  return (
    <div className="space-y-8 py-4">
      {/* FAST DEMO TOOLBAR */}
      <div className="bg-[#151620] border border-amber-500/20 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Interactive Campaign Simulation
          </span>
          <span className="font-mono text-[11px] text-slate-400">Test full brand/creator contract lifecycle</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handlePresetAccept}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
          >
            Accept Brief
          </button>
          <button
            onClick={handlePresetSubmitV1}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
          >
            Submit Render v1
          </button>
          <button
            onClick={handlePresetRequestRevision}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
          >
            Request Revision
          </button>
          <button
            onClick={handlePresetApprove}
            className="btn-primary text-xs font-mono font-medium transition-colors"
          >
            Approve Final Render
          </button>
        </div>
      </div>

      {/* Header Summary Panel */}
      <div className="border border-slate-800 bg-[#151620] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-amber-500/15 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-amber-300">
              <span className="uppercase font-semibold tracking-wider">{brief.brand_name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Engagement #{engagement.id}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-display mt-1">{brief.title}</h1>
            <p className="text-slate-400 text-xs mt-1">
              Director: <strong className="text-white">{creator.name}</strong> • Max Revision Allowance: {brief.max_revision_rounds} Rounds
            </p>
          </div>

          {/* DUAL DESK SWITCHER */}
          <div className="flex items-center bg-[#0C0D12] border border-amber-500/20 rounded-xl p-1 space-x-1">
            <button
              onClick={() => {
                setActiveTab("brand");
                setRole("brand");
              }}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-mono font-medium transition-colors ${
                activeTab === "brand"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Brand Review Desk
            </button>
            <button
              onClick={() => {
                setActiveTab("creator");
                setRole("creator");
              }}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-mono font-medium transition-colors ${
                activeTab === "creator"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Creator Studio Desk
            </button>
          </div>
        </div>

        {/* STATUS STEPPER */}
        <div data-testid="engagement-status" className="space-y-2">
          <span className="font-mono text-xs text-slate-400 block uppercase tracking-wider font-medium">Production Lifecycle:</span>
          <div className="grid grid-cols-5 gap-2">
            {STEPPER_STAGES.map((stage) => {
              const stagesOrder = ["invited", "accepted", "in_progress", "delivered", "approved"];
              const currentIdx = stagesOrder.indexOf(engagement.status);
              const stageIdx = stagesOrder.indexOf(stage.id);

              const isCompleted = stageIdx < currentIdx || engagement.status === "approved";
              const isCurrent = stage.id === engagement.status;

              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-colors ${
                    isCurrent
                      ? "border-amber-500/50 text-amber-300 bg-amber-500/15 font-semibold"
                      : isCompleted
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/20"
                      : "border-slate-800 text-slate-500 bg-[#0C0D12]"
                  }`}
                >
                  <span className="truncate block">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MASTER STEMS HANDOFF VAULT (Shown when status is approved) */}
        {engagement.status === "approved" && (
          <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> MASTER COMMERCIAL DELIVERY VAULT CLEARED
              </span>
              <span className="text-[11px] font-mono text-slate-400">STATUS: APPROVED & CLEARED</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              All revision rounds completed. High-resolution master deliverables and full ComfyUI prompt node execution manifests are ready for download.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono border border-emerald-500/40 flex items-center gap-1.5 transition-colors">
                <Download className="w-3.5 h-3.5" /> 4K ProRes Video Master (.mov)
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors">
                <Layers className="w-3.5 h-3.5" /> Audio Stems (Voice / SFX / BGM)
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors">
                <FileCode className="w-3.5 h-3.5" /> ComfyUI Workflow Graph (.json)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: BRAND REVIEW DESK */}
      {activeTab === "brand" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white font-display">Brand Review & Quality Clearance</h2>
              {engagement.versions.length >= 2 && (
                <button
                  onClick={() => setAbCompareMode(!abCompareMode)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
                    abCompareMode
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                      : "bg-slate-900 text-slate-300 border border-slate-700 hover:border-amber-500/30"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {abCompareMode ? "Exit A/B Diff View" : "A/B Compare Versions"}
                </button>
              )}
            </div>
            <span className="font-mono text-xs text-slate-400">
              Revisions Used: {engagement.revision_rounds_used || 0} / {brief.max_revision_rounds}
            </span>
          </div>

          {/* A/B VERSION DIFF VIEW */}
          {abCompareMode && engagement.versions.length >= 2 && (
            <div className="border border-amber-500/30 bg-[#151620] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
                <span className="font-mono text-xs text-amber-300 uppercase font-bold tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> A/B Side-by-Side Version Inspector
                </span>
                <span className="font-mono text-[11px] text-slate-400">Comparing Version v1 vs Version v{engagement.versions.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Version A (v1) */}
                <div className="space-y-3 p-4 rounded-xl bg-[#0C0D12] border border-slate-800">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-slate-300">Version v1 (Original Draft)</span>
                    <span className="text-slate-500">State: {engagement.versions[0].state}</span>
                  </div>
                  <PortfolioFrame
                    mediaUrl={engagement.versions[0].media_url || "/seed/sneaker_916.mp4"}
                    altText="Version v1"
                    aspectRatio={brief.format}
                    mediaType={brief.content_type === "video" ? "video" : "image"}
                  />
                  <p className="text-slate-400 text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                    {engagement.versions[0].note}
                  </p>
                </div>

                {/* Version B (Latest) */}
                <div className="space-y-3 p-4 rounded-xl bg-[#0C0D12] border border-amber-500/30">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-amber-300">Version v{engagement.versions.length} (Latest Revision)</span>
                    <span className="text-amber-400 font-semibold">State: {engagement.versions[engagement.versions.length - 1].state}</span>
                  </div>
                  <PortfolioFrame
                    mediaUrl={engagement.versions[engagement.versions.length - 1].media_url || "/seed/sneaker_916.mp4"}
                    altText={`Version v${engagement.versions.length}`}
                    aspectRatio={brief.format}
                    mediaType={brief.content_type === "video" ? "video" : "image"}
                  />
                  <p className="text-slate-200 text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                    {engagement.versions[engagement.versions.length - 1].note}
                  </p>
                </div>
              </div>
            </div>
          )}

          {engagement.status === "invited" && (
            <div className="border border-slate-800 bg-[#151620] rounded-2xl p-6 space-y-3">
              <span className="font-mono text-xs text-amber-400 uppercase font-semibold block">Awaiting Director Acceptance</span>
              <p className="text-slate-300 text-sm">
                Invitation issued to <strong>{creator.name}</strong>. Once they log into Creator Studio and accept the brief, work on Version 1 will commence.
              </p>
              <button
                onClick={() => {
                  setActiveTab("creator");
                  setRole("creator");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-mono hover:bg-slate-700"
              >
                Switch to Creator Studio Desk →
              </button>
            </div>
          )}

          {engagement.versions.length === 0 && engagement.status !== "invited" && (
            <div className="border border-slate-800 bg-[#151620] rounded-2xl p-8 text-center text-xs text-slate-400 space-y-2">
              <p>Creator is currently generating Version 1 renders.</p>
              <button
                onClick={() => {
                  setActiveTab("creator");
                  setRole("creator");
                }}
                className="text-[#E2B857] underline font-mono"
              >
                Switch to Creator Desk to submit Version 1 →
              </button>
            </div>
          )}

          {/* BRAND FEEDBACK & VERSION LIST */}
          <div className="space-y-6">
            {engagement.versions.map((ver, idx) => (
              <div key={idx} className="border border-slate-800 bg-[#151620] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="font-bold bg-slate-800 text-white px-2.5 py-0.5 rounded border border-slate-700">
                      Version v{ver.n}
                    </span>
                    <span className="text-slate-400">
                      State: <strong className="text-white">{ver.state}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setC2paVersion(ver);
                        setC2paModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-amber-300 hover:border-amber-500/40 flex items-center gap-1 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Inspect C2PA Provenance
                    </button>

                    {ver.state === "approved" && (
                      <span className="font-mono text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> APPROVED FOR COMMERCE
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Media */}
                  {ver.media_url && (
                    <div className="lg:col-span-5">
                      <PortfolioFrame
                        mediaUrl={ver.media_url}
                        altText={`Version v${ver.n}`}
                        aspectRatio={brief.format}
                        mediaType={brief.content_type === "video" ? "video" : "image"}
                      />
                    </div>
                  )}

                  {/* Right Note & Feedback */}
                  <div className={`${ver.media_url ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
                    <div className="space-y-1">
                      <span className="font-mono text-xs text-slate-400 block font-medium">Director Submission Notes:</span>
                      <p className="text-slate-200 text-xs bg-[#0C0D12] border border-slate-800 p-3 rounded-lg leading-relaxed font-mono">
                        {ver.note}
                      </p>
                    </div>

                    {ver.brand_feedback && (
                      <div className="space-y-1 border-t border-slate-800 pt-3">
                        <span className="font-mono text-xs text-[#E2B857] block font-medium">Brand Feedback Notes:</span>
                        <p className="text-slate-300 text-xs bg-[#0C0D12] border border-slate-800 p-3 rounded-lg leading-relaxed">
                          {ver.brand_feedback}
                        </p>
                      </div>
                    )}

                    {/* BRAND ACTIONS FOR SUBMITTED VERSIONS */}
                    {ver.state === "submitted" && (
                      <div className="border-t border-slate-800 pt-4 space-y-3">
                        <span className="font-mono text-xs text-white block font-semibold">Brand Review Decisions:</span>

                        {maxRoundsReached ? (
                          <div className="bg-amber-950/30 border border-amber-500/30 text-amber-300 p-3 rounded-lg text-xs font-mono">
                            Maximum revision rounds ({brief.max_revision_rounds}) reached for this brief.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={brandFeedback}
                              onChange={(e) => setBrandFeedback(e.target.value)}
                              placeholder="Specify feedback for requested revision changes..."
                              className="w-full bg-[#0C0D12] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#E2B857]"
                            />
                            <button
                              onClick={() => handleBrandRequestChanges(idx)}
                              disabled={submitting || !brandFeedback.trim()}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                            >
                              Request Revision with Feedback
                            </button>
                          </div>
                        )}

                        <div>
                          <button
                            onClick={() => handleBrandApprove(idx)}
                            disabled={submitting}
                            className="btn-primary text-xs flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Approve Version v{ver.n}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CREATOR DELIVERY DESK */}
      {activeTab === "creator" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
            <h2 className="text-2xl font-bold text-white font-display">Creator Studio & Version Delivery</h2>
            <span className="font-mono text-xs text-slate-400">Director: {creator.name}</span>
          </div>

          {/* CREATOR ACTION: Accept when invited */}
          {engagement.status === "invited" && (
            <div className="border border-slate-800 bg-[#151620] rounded-2xl p-6 space-y-4 text-center">
              <h3 className="text-xl font-bold text-white font-display">Campaign Brief Invitation Received</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Review the brief requirements and accept the engagement to begin submitting renders.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => updateEngagementState({ status: "accepted" })}
                  disabled={submitting}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Accept Brief as {creator.name}
                </button>
              </div>
            </div>
          )}

          {/* CREATOR SUBMIT VERSION FORM */}
          {engagement.status !== "approved" && engagement.status !== "invited" && (
            <div className="border border-slate-800 bg-[#151620] p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-white font-display">
                Submit Render Version v{(engagement.versions.length || 0) + 1}
              </h3>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-slate-400 block">Render Notes & Step Log Details *</label>
                  <textarea
                    rows={3}
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                    placeholder="Describe prompt seed parameters, upscaling tools, or color grading updates in this version..."
                    className="w-full bg-[#0C0D12] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#E2B857]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-slate-400 block">Render File Path / Media URL</label>
                  <input
                    type="text"
                    value={versionMediaUrl}
                    onChange={(e) => setVersionMediaUrl(e.target.value)}
                    className="w-full bg-[#0C0D12] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#E2B857] font-mono"
                  />
                </div>

                <button
                  onClick={handleCreatorSubmitVersion}
                  disabled={submitting || !versionNote.trim()}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Submit Version v{(engagement.versions.length || 0) + 1}
                </button>
              </div>
            </div>
          )}

          {/* VERSIONS REVISION FEED */}
          {engagement.versions.length === 0 ? (
            <div className="border border-slate-800 bg-[#151620] rounded-2xl p-8 text-center text-xs text-slate-400">
              No versions submitted yet. Director will submit initial render v1.
            </div>
          ) : (
            <div className="space-y-6">
              {engagement.versions.map((ver, idx) => (
                <div key={idx} className="border border-slate-800 bg-[#151620] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="font-bold bg-slate-800 text-white px-2.5 py-0.5 rounded border border-slate-700">
                        Version v{ver.n}
                      </span>
                      <span className="text-slate-400">
                        State: <strong className="text-white">{ver.state}</strong>
                      </span>
                    </div>

                    {ver.state === "approved" && (
                      <span className="font-mono text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> APPROVED FOR COMMERCE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Media */}
                    {ver.media_url && (
                      <div className="lg:col-span-5">
                        <PortfolioFrame
                          mediaUrl={ver.media_url}
                          altText={`Version v${ver.n}`}
                          aspectRatio={brief.format}
                          mediaType={brief.content_type === "video" ? "video" : "image"}
                        />
                      </div>
                    )}

                    {/* Right Note & Feedback */}
                    <div className={`${ver.media_url ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
                      <div className="space-y-1">
                        <span className="font-mono text-xs text-slate-400 block font-medium">Director Submission Notes:</span>
                        <p className="text-slate-200 text-xs bg-[#0C0D12] border border-slate-800 p-3 rounded-lg leading-relaxed font-mono">
                          {ver.note}
                        </p>
                      </div>

                      {ver.brand_feedback && (
                        <div className="space-y-1 border-t border-slate-800 pt-3">
                          <span className="font-mono text-xs text-[#E2B857] block font-medium">Brand Feedback Notes:</span>
                          <p className="text-slate-300 text-xs bg-[#0C0D12] border border-slate-800 p-3 rounded-lg leading-relaxed">
                            {ver.brand_feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* C2PA PROVENANCE MANIFEST MODAL */}
      {c2paModalOpen && c2paVersion && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0D12] border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setC2paModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 text-amber-300 font-mono text-xs uppercase tracking-wider font-bold">
              <ShieldCheck className="w-4 h-4" /> C2PA Content Credentials Manifest
            </div>
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-[#151620] rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Manifest Digest:</span>
                  <span className="text-amber-300 font-bold">urn:c2pa:2026:rf_ver_{c2paVersion.n}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Generator Model:</span>
                  <span className="text-white font-medium">Runway Gen-3 Alpha // ComfyUI Local</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seed Parameter:</span>
                  <span className="text-white font-medium">4820193850</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Licence Check:</span>
                  <span className="text-emerald-400 font-medium">ACTIVE COMMERCIAL SUBSCRIPTION</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Watermark Status:</span>
                  <span className="text-emerald-400 font-medium font-semibold">AUTHENTIC & CLEARED</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Cryptographically signed metadata confirms this render was generated by director <strong>{creator.name}</strong> under verified paid commercial tool tier.
              </p>
            </div>
            <button
              onClick={() => setC2paModalOpen(false)}
              className="btn-primary w-full text-xs text-center"
            >
              Close Manifest Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
