"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { Creator, PortfolioItem, Engagement, Brief, WorkflowStep, ToolUsed } from "@/lib/types";
import {
  CONTENT_TYPES,
  FORMATS,
  SKILLS,
  TOOLS,
  STYLE_TAGS,
  Specialization,
  Skill,
  Tool,
  StyleTag,
  ContentType,
  AspectRatioFormat,
} from "@/lib/vocab";
import { PortfolioFrame } from "@/components/common/PortfolioFrame";
import { Plus, Trash2, CheckCircle, XCircle, Send } from "lucide-react";

export default function CreatorDashboardPage() {
  const { role, activeCreatorId } = useRole();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [invites, setInvites] = useState<{ engagement: Engagement; brief: Brief }[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Editor state
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState<"available" | "busy">("available");
  const [profileSaved, setProfileSaved] = useState(false);

  // Add Portfolio Item form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("/seed/sneaker_916.mp4");
  const [newMediaType, setNewMediaType] = useState<"image" | "video">("video");
  const [newAspectRatio, setNewAspectRatio] = useState<AspectRatioFormat>("9:16");
  const [newContentType, setNewContentType] = useState<ContentType>("video");
  const [newGenCount, setNewGenCount] = useState<number>(42);
  const [newProofUrl, setNewProofUrl] = useState("");
  const [newStyleTags, setNewStyleTags] = useState<StyleTag[]>(["photoreal", "cinematic"]);
  const [toolsUsed, setToolsUsed] = useState<ToolUsed[]>([
    { tool: "Runway", plan: "Pro" },
    { tool: "ComfyUI", plan: "Unlimited" },
  ]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { title: "Prompt Engineering", tool: "Midjourney", detail: "Generated 30 seed variations for fluid motion." },
    { title: "Motion Generation", tool: "Runway", detail: "Interpolated camera speed ramp." },
  ]);
  const [portfolioAdded, setPortfolioAdded] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const cRes = await fetch(`/api/creators/${activeCreatorId}`);
        const cData = await cRes.json();
        if (cData.ok && cData.creator) {
          setCreator(cData.creator);
          setHeadline(cData.creator.headline);
          setBio(cData.creator.bio);
          setAvailability(cData.creator.availability);
          setPortfolio(cData.portfolio || []);
        }

        // Load engagements / invites
        const eRes = await fetch("/api/engagements");
        const eData = await eRes.json();
        if (eData.ok && eData.engagements) {
          const myEngagements: Engagement[] = eData.engagements.filter(
            (e: Engagement) => e.creator_id === activeCreatorId
          );
          const briefProms = myEngagements.map(async (e) => {
            const bRes = await fetch(`/api/briefs`);
            const bData = await bRes.json();
            const b = (bData.briefs || []).find((x: Brief) => x.id === e.brief_id);
            return { engagement: e, brief: b };
          });
          const resolved = await Promise.all(briefProms);
          setInvites(resolved.filter((item) => item.brief));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeCreatorId]);

  const handleSaveProfile = async () => {
    if (!creator) return;
    const updated = {
      ...creator,
      headline,
      bio,
      availability,
    };
    try {
      const res = await fetch("/api/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.ok) {
        setCreator(updated);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2000);
      }
    } catch (err) {
      console.error("Save profile error", err);
    }
  };

  const handleAddToolUsed = () => {
    setToolsUsed([...toolsUsed, { tool: "Runway", plan: "Pro" }]);
  };

  const handleRemoveToolUsed = (idx: number) => {
    setToolsUsed(toolsUsed.filter((_, i) => i !== idx));
  };

  const handleAddWorkflowStep = () => {
    setWorkflowSteps([
      ...workflowSteps,
      { title: `Step ${workflowSteps.length + 1}`, tool: "Runway", detail: "Step details..." },
    ]);
  };

  const handleRemoveWorkflowStep = (idx: number) => {
    setWorkflowSteps(workflowSteps.filter((_, i) => i !== idx));
  };

  const handleAddPortfolio = async () => {
    if (!creator || !newTitle.trim()) return;
    const newItem: PortfolioItem = {
      id: `port_${Date.now()}`,
      creator_id: creator.id,
      title: newTitle,
      description: newDesc,
      media_type: newMediaType,
      media_url: newMediaUrl,
      thumbnail_url: newMediaUrl,
      alt_text: newTitle,
      aspect_ratio: newAspectRatio,
      content_type: newContentType,
      style_tags: newStyleTags,
      tools_used: toolsUsed,
      generation_count: newGenCount,
      proof_url: newProofUrl || undefined,
      brand_work: true,
      year: 2026,
      workflow_steps: workflowSteps,
    };

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (data.ok) {
        setPortfolio([newItem, ...portfolio]);
        setPortfolioAdded(true);
        setNewTitle("");
        setNewDesc("");
        setTimeout(() => setPortfolioAdded(false), 2000);
      }
    } catch (err) {
      console.error("Add portfolio error", err);
    }
  };

  const handleInviteAction = async (engagementId: string, newStatus: "accepted" | "in_progress") => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        setInvites(
          invites.map((inv) =>
            inv.engagement.id === engagementId
              ? { ...inv, engagement: { ...inv.engagement, status: newStatus } }
              : inv
          )
        );
      }
    } catch (err) {
      console.error("Invite action error", err);
    }
  };

  if (loading) {
    return <div className="font-mono text-xs text-ink-2 py-8">Loading creator dashboard...</div>;
  }

  if (!creator) {
    return <div className="font-mono text-xs text-ink-2 py-8">Creator profile not found.</div>;
  }

  return (
    <div className="space-y-10">
      {/* Dashboard Title */}
      <div className="border border-line bg-surface rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-accent text-paper px-2 py-0.5 rounded font-bold uppercase">
                Creator Studio
              </span>
              <span className="text-ink-2">•</span>
              <span className="font-mono text-xs text-ink-2">Active Artist: {creator.name}</span>
            </div>
            <h1 className="font-display text-4xl text-ink mt-1">{creator.name} — Production Studio</h1>
            <p className="text-ink-2 text-xs mt-1">
              Manage incoming commercial campaign invites, record workflow step replays, and edit public profile details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link href={`/creators/${creator.id}`} className="btn-secondary text-xs text-center">
              Preview Public Profile ↗
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 1: INCOMING INVITES & ENGAGEMENTS */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl text-ink border-b border-line pb-2">
          Incoming Brief Invites ({invites.length})
        </h2>

        {invites.length === 0 ? (
          <div className="border border-line bg-surface rounded p-6 text-center text-xs text-ink-2">
            No active campaign invites yet. Ensure your portfolio and tools are up to date!
          </div>
        ) : (
          <div className="space-y-3">
            {invites.map(({ engagement, brief }) => (
              <div
                key={engagement.id}
                data-testid="engagement-status"
                className="border border-line bg-surface rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-accent">{brief.brand_name}</span>
                    <span className="text-ink-2">•</span>
                    <span className="font-mono text-xs text-ink-2">Status: {engagement.status}</span>
                  </div>
                  <h3 className="font-medium text-ink text-base">{brief.title}</h3>
                  <p className="text-ink-2 text-xs line-clamp-1">{brief.objective}</p>
                </div>

                <div className="flex items-center gap-3">
                  {engagement.status === "invited" && (
                    <>
                      <button
                        onClick={() => handleInviteAction(engagement.id, "accepted")}
                        className="btn-primary text-xs gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Accept invite
                      </button>
                    </>
                  )}

                  {engagement.status !== "invited" && (
                    <Link
                      href={`/engagements/${engagement.id}`}
                      className="btn-secondary text-xs gap-1"
                    >
                      Open revision board →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: PROFILE EDITOR */}
      <div className="border border-line bg-surface rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="font-display text-2xl text-ink">Profile Editor</h2>
          {profileSaved && (
            <span className="font-mono text-xs text-ok flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Saved successfully
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-mono text-xs text-ink-2 block">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-ink-2 block">Availability Status</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as any)}
              className="w-full bg-paper border border-line rounded p-2 text-xs text-ink focus:outline-none focus:border-accent"
            >
              <option value="available">Available for hire</option>
              <option value="busy">Currently busy</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-mono text-xs text-ink-2 block">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-paper border border-line rounded p-2.5 text-xs text-ink focus:outline-none focus:border-accent"
          />
        </div>

        <button onClick={handleSaveProfile} className="btn-primary text-xs">
          Save profile changes
        </button>
      </div>

      {/* SECTION 3: ADD PORTFOLIO ITEM & WORKFLOW STEP EDITOR */}
      <div className="border border-line bg-surface rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="font-display text-2xl text-ink">Add Portfolio Item with Workflow Replay</h2>
          {portfolioAdded && (
            <span className="font-mono text-xs text-ok flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Portfolio item added
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-mono text-xs text-ink-2 block">Title *</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. AURA Kicks Kinetic Reel"
              className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-ink-2 block">Description</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe concept, lighting, and rendering..."
              className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="font-mono text-xs text-ink-2 block">Media Type</label>
            <select
              value={newMediaType}
              onChange={(e) => setNewMediaType(e.target.value as any)}
              className="w-full bg-paper border border-line rounded p-2 text-xs text-ink"
            >
              <option value="video">video</option>
              <option value="image">image</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-ink-2 block">Aspect Ratio</label>
            <select
              value={newAspectRatio}
              onChange={(e) => setNewAspectRatio(e.target.value as any)}
              className="w-full bg-paper border border-line rounded p-2 text-xs text-ink"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-ink-2 block">Content Type</label>
            <select
              value={newContentType}
              onChange={(e) => setNewContentType(e.target.value as any)}
              className="w-full bg-paper border border-line rounded p-2 text-xs text-ink"
            >
              {CONTENT_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-ink-2 block">Generation Count</label>
            <input
              type="number"
              value={newGenCount}
              onChange={(e) => setNewGenCount(Number(e.target.value))}
              className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink"
            />
          </div>
        </div>

        {/* Tools Used with Plan Names */}
        <div className="space-y-2 border-t border-line pt-4">
          <div className="flex items-center justify-between">
            <label className="font-mono text-xs text-ink-2">Tools Used & Subscription Plans</label>
            <button type="button" onClick={handleAddToolUsed} className="text-xs text-accent underline font-mono">
              + Add tool
            </button>
          </div>

          <div className="space-y-2">
            {toolsUsed.map((tu, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={tu.tool}
                  onChange={(e) => {
                    const copy = [...toolsUsed];
                    copy[idx].tool = e.target.value as Tool;
                    setToolsUsed(copy);
                  }}
                  className="bg-paper border border-line text-xs rounded p-1.5 text-ink"
                >
                  {TOOLS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={tu.plan}
                  placeholder="Plan (Pro, Standard, Unlimited)"
                  onChange={(e) => {
                    const copy = [...toolsUsed];
                    copy[idx].plan = e.target.value;
                    setToolsUsed(copy);
                  }}
                  className="bg-paper border border-line rounded px-2 py-1 text-xs text-ink"
                />
                <button type="button" onClick={() => handleRemoveToolUsed(idx)} className="text-bad hover:opacity-80">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Workflow Steps Editor */}
        <div className="space-y-2 border-t border-line pt-4">
          <div className="flex items-center justify-between">
            <label className="font-mono text-xs text-ink-2">Workflow Replay Steps (Dynamic Editor)</label>
            <button type="button" onClick={handleAddWorkflowStep} className="text-xs text-accent underline font-mono">
              + Add step
            </button>
          </div>

          <div className="space-y-3">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="border border-line bg-paper p-3 rounded space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink">Step 0{idx + 1}</span>
                  <button type="button" onClick={() => handleRemoveWorkflowStep(idx)} className="text-bad text-xs">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={step.title}
                    placeholder="Step Title (e.g. Prompting)"
                    onChange={(e) => {
                      const copy = [...workflowSteps];
                      copy[idx].title = e.target.value;
                      setWorkflowSteps(copy);
                    }}
                    className="bg-surface border border-line rounded p-1.5 text-xs text-ink"
                  />
                  <select
                    value={step.tool || "Runway"}
                    onChange={(e) => {
                      const copy = [...workflowSteps];
                      copy[idx].tool = e.target.value as Tool;
                      setWorkflowSteps(copy);
                    }}
                    className="bg-surface border border-line text-xs rounded p-1.5 text-ink"
                  >
                    {TOOLS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  rows={2}
                  value={step.detail}
                  placeholder="One-line detail of the step parameters..."
                  onChange={(e) => {
                    const copy = [...workflowSteps];
                    copy[idx].detail = e.target.value;
                    setWorkflowSteps(copy);
                  }}
                  className="w-full bg-surface border border-line rounded p-1.5 text-xs text-ink"
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleAddPortfolio} className="btn-primary w-full text-xs">
          Publish portfolio item with workflow replay
        </button>
      </div>
    </div>
  );
}
