"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CONTENT_TYPES,
  FORMATS,
  SKILLS,
  TOOLS,
  STYLE_TAGS,
  USAGE_RIGHTS,
  PLATFORM_PRESETS,
  ContentType,
  AspectRatioFormat,
  Skill,
  Tool,
  StyleTag,
  UsageRight,
  PlatformPresetId,
} from "@/lib/vocab";
import { computeBriefQualityScore } from "@/lib/scoring";
import { Sparkles, Upload, FileText, Check, AlertCircle } from "lucide-react";

const briefFormSchema = z.object({
  brand_name: z.string().min(1, "Brand name is required"),
  title: z.string().min(1, "Title is required"),
  objective: z.string().min(30, "Objective must be at least 30 characters"),
  idea_text: z.string().optional(),
  content_type: z.enum(CONTENT_TYPES),
  style_tags: z.array(z.string()).min(1, "Select at least one style tag"),
  format: z.enum(FORMATS),
  platform_preset: z.string().optional(),
  duration_sec: z.coerce.number().optional(),
  deliverables: z.string().min(1, "Deliverables are required"),
  budget_range: z.string().optional(),
  deadline: z.string().optional(),
  required_tools: z.array(z.string()),
  required_skills: z.array(z.string()),
  usage_rights: z.array(z.string()).min(1, "Select at least one usage right"),
  territory: z.string().min(1, "Territory is required"),
  usage_duration_months: z.coerce.number().min(1),
  exclusivity: z.boolean(),
  ai_disclosure_required: z.boolean(),
  max_revision_rounds: z.coerce.number().min(1),
});

type BriefFormData = z.infer<typeof briefFormSchema>;

const SAMPLE_IDEA =
  "A fun 15-second reel for a sneaker launch aimed at Gen Z. Liquid neon morphs into the shoe sole, dynamic speed ramps, high energy music beat drop, crisp macro texture detail.";

export default function NewBriefPage() {
  const router = useRouter();
  const [roughIdea, setRoughIdea] = useState("");
  const [isStructuring, setIsStructuring] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BriefFormData>({
    resolver: zodResolver(briefFormSchema),
    defaultValues: {
      brand_name: "AURA Kicks",
      title: "Gen-Z Neon Sneaker Launch Reel",
      objective: "Produce a high-energy 15-second vertical video reel for paid Instagram and TikTok ad campaigns launching our flagship liquid-tech running shoe.",
      idea_text: SAMPLE_IDEA,
      content_type: "video",
      style_tags: ["photoreal", "cinematic", "neon", "luxury"],
      format: "9:16",
      platform_preset: "instagram_reel",
      duration_sec: 15,
      deliverables: "1x 9:16 hero 4K video reel, 2x short story cutdowns (6s each)",
      budget_range: "$2,500 - $4,000",
      deadline: "2026-11-15",
      required_tools: ["Runway", "ComfyUI", "DaVinci Resolve"],
      required_skills: ["prompt engineering", "product visualization", "color grading"],
      usage_rights: ["paid_ads", "organic_social"],
      territory: "Worldwide",
      usage_duration_months: 12,
      exclusivity: true,
      ai_disclosure_required: true,
      max_revision_rounds: 2,
    },
  });

  const formValues = watch();
  const quality = computeBriefQualityScore(formValues);

  // Auto set format & duration when platform preset changes
  const handlePresetChange = (presetId: string) => {
    const preset = PLATFORM_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setValue("platform_preset", preset.id);
      setValue("format", preset.format as AspectRatioFormat);
      if (preset.defaultDurationSec) {
        setValue("duration_sec", preset.defaultDurationSec);
      }
    }
  };

  const handleStructureBrief = async () => {
    if (!roughIdea.trim()) return;
    setIsStructuring(true);
    setAiNotice(null);
    try {
      const res = await fetch("/api/briefs/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_text: roughIdea,
          reference_style_tags: formValues.style_tags,
        }),
      });
      const data = await res.json();
      if (data.ok && data.brief) {
        const b = data.brief;
        if (data.notice) setAiNotice(data.notice);

        if (b.brand_name) setValue("brand_name", b.brand_name);
        if (b.title) setValue("title", b.title);
        if (b.objective) setValue("objective", b.objective);
        if (b.content_type) setValue("content_type", b.content_type);
        if (b.style_tags) setValue("style_tags", b.style_tags);
        if (b.format) setValue("format", b.format);
        if (b.platform_preset) setValue("platform_preset", b.platform_preset);
        if (b.duration_sec) setValue("duration_sec", b.duration_sec);
        if (b.deliverables) setValue("deliverables", b.deliverables);
        if (b.required_tools) setValue("required_tools", b.required_tools);
        if (b.required_skills) setValue("required_skills", b.required_skills);
        if (b.usage_rights) setValue("usage_rights", b.usage_rights);
        if (b.territory) setValue("territory", b.territory);
        if (b.usage_duration_months) setValue("usage_duration_months", b.usage_duration_months);
        if (typeof b.exclusivity === "boolean") setValue("exclusivity", b.exclusivity);
        if (typeof b.ai_disclosure_required === "boolean")
          setValue("ai_disclosure_required", b.ai_disclosure_required);
        if (b.max_revision_rounds) setValue("max_revision_rounds", b.max_revision_rounds);
        setValue("idea_text", roughIdea);
      }
    } catch (err) {
      setAiNotice("Showing an offline sample");
    } finally {
      setIsStructuring(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setAiNotice(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/briefs/style-from-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok && data.style_tags) {
        if (data.notice) setAiNotice(data.notice);
        const merged = Array.from(new Set([...(formValues.style_tags || []), ...data.style_tags]));
        setValue("style_tags", merged);
      }
    } catch (err) {
      setAiNotice("Showing an offline sample");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: BriefFormData) => {
    setIsPublishing(true);
    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "published" }),
      });
      const resData = await res.json();
      if (resData.ok && resData.brief) {
        router.push(`/briefs/${resData.brief.id}`);
      }
    } catch (err) {
      console.error("Publish brief error", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleArrayValue = (field: "style_tags" | "required_tools" | "required_skills" | "usage_rights", val: string) => {
    const current = (formValues[field] as string[]) || [];
    const updated = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    setValue(field, updated);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-4xl text-ink">Define a Campaign Brief</h1>
        <p className="text-ink-2 text-sm mt-1">
          Structure commercial requirements, verify tool licences, and generate quality-matched creator rankings.
        </p>
      </div>

      {/* AI Notice Banner */}
      {aiNotice && (
        <div className="bg-surface border border-warn text-warn px-4 py-2 rounded text-meta flex items-center justify-between">
          <span className="font-mono">Notice: {aiNotice}</span>
          <button onClick={() => setAiNotice(null)} className="underline hover:text-ink">
            Dismiss
          </button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Rough Idea & Reference Image AI Assistant */}
        <div className="lg:col-span-5 space-y-6 border border-line bg-surface p-6 rounded-lg sticky top-20">
          <div className="space-y-1">
            <h2 className="font-display text-2xl text-ink flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              AI Brief Builder
            </h2>
            <p className="text-ink-2 text-xs">
              Type a rough campaign idea or upload a reference image. We will structure the technical requirements automatically.
            </p>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-mono text-ink-2">Rough Campaign Idea</label>
              <button
                type="button"
                onClick={() => {
                  setRoughIdea(SAMPLE_IDEA);
                  setValue("idea_text", SAMPLE_IDEA);
                }}
                className="text-accent underline font-mono text-[11px] hover:opacity-80"
              >
                Use sample idea
              </button>
            </div>
            <textarea
              rows={5}
              value={roughIdea}
              onChange={(e) => setRoughIdea(e.target.value)}
              placeholder="Describe your campaign concept, style, or message here..."
              className="w-full bg-paper border border-line rounded p-3 text-xs text-ink focus:outline-none focus:border-accent"
            />
          </div>

          {/* Action: Structure Brief */}
          <button
            type="button"
            onClick={handleStructureBrief}
            disabled={isStructuring || !roughIdea.trim()}
            className="btn-primary w-full gap-2 text-xs"
          >
            {isStructuring ? "Structuring brief..." : "Structure brief with AI"}
          </button>

          {/* Reference Image Style Matching */}
          <div className="border-t border-line pt-4 space-y-2">
            <label className="font-mono text-xs text-ink-2 block">Reference Image Style Matching</label>
            <p className="text-ink-2 text-[11px]">
              Upload a keyframe or moodboard image to extract matching style tags.
            </p>
            <label className="border border-dashed border-line bg-paper rounded p-4 text-center block cursor-pointer hover:border-ink transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex flex-col items-center gap-1.5 text-xs text-ink-2">
                <Upload className="w-4 h-4 text-ink" />
                <span>{isUploadingImage ? "Extracting style tags..." : "Click to upload reference image"}</span>
              </div>
            </label>
          </div>

          {/* Quality Meter Sidebar Summary */}
          <div className="border-t border-line pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-ink-2">Live Brief Quality Score</span>
              <span data-testid="quality-score" className="font-mono text-sm font-bold text-accent">
                {quality.score}/100
              </span>
            </div>
            <div className="w-full bg-paper border border-line h-2 rounded overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${quality.score}%` }}
              />
            </div>
            {quality.hints.length > 0 && (
              <div className="space-y-1 pt-1 text-[11px] text-ink-2">
                <span className="font-mono text-ink-2 block">Recommendations to reach 100%:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {quality.hints.slice(0, 3).map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Full Brief Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="border border-line bg-surface p-6 rounded-lg space-y-6">
              <h2 className="font-display text-2xl text-ink border-b border-line pb-2">Campaign Details</h2>

              {/* Brand & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs text-ink-2 block">Brand Name *</label>
                  <input
                    {...register("brand_name")}
                    className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
                  />
                  {errors.brand_name && <p className="text-bad text-[11px] font-mono">{errors.brand_name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs text-ink-2 block">Campaign Title *</label>
                  <input
                    {...register("title")}
                    className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
                  />
                  {errors.title && <p className="text-bad text-[11px] font-mono">{errors.title.message}</p>}
                </div>
              </div>

              {/* Objective */}
              <div className="space-y-1">
                <label className="font-mono text-xs text-ink-2 block">Objective (at least 30 chars) *</label>
                <textarea
                  rows={3}
                  {...register("objective")}
                  className="w-full bg-paper border border-line rounded p-2.5 text-xs text-ink focus:outline-none focus:border-accent"
                />
                {errors.objective && <p className="text-bad text-[11px] font-mono">{errors.objective.message}</p>}
              </div>

              {/* Platform Presets & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-line pt-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs text-ink-2 block">Platform Preset</label>
                  <select
                    value={formValues.platform_preset || ""}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="w-full bg-paper border border-line text-xs rounded p-2 text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="">Select platform preset...</option>
                    {PLATFORM_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} [{p.format}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs text-ink-2 block">Aspect Ratio Format *</label>
                  <select
                    {...register("format")}
                    className="w-full bg-paper border border-line text-xs rounded p-2 text-ink focus:outline-none focus:border-accent"
                  >
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content Type & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs text-ink-2 block">Content Type *</label>
                  <select
                    {...register("content_type")}
                    className="w-full bg-paper border border-line text-xs rounded p-2 text-ink focus:outline-none focus:border-accent"
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs text-ink-2 block">Duration (seconds)</label>
                  <input
                    type="number"
                    {...register("duration_sec")}
                    className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Deliverables & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs text-ink-2 block">Deliverables *</label>
                  <input
                    {...register("deliverables")}
                    placeholder="e.g. 1x 9:16 master video reel"
                    className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
                  />
                  {errors.deliverables && (
                    <p className="text-bad text-[11px] font-mono">{errors.deliverables.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs text-ink-2 block">Budget Range</label>
                  <input
                    {...register("budget_range")}
                    placeholder="e.g. $2,500 - $4,000"
                    className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Style Tags Selection */}
              <div className="space-y-1.5 border-t border-line pt-4">
                <label className="font-mono text-xs text-ink-2 block">Style Tags *</label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_TAGS.map((tag) => {
                    const selected = formValues.style_tags?.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleArrayValue("style_tags", tag)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          selected
                            ? "bg-accent text-paper font-medium"
                            : "bg-paper border border-line text-ink-2 hover:text-ink"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                {errors.style_tags && <p className="text-bad text-[11px] font-mono">{errors.style_tags.message}</p>}
              </div>

              {/* Required Tools & Skills */}
              <div className="space-y-3 border-t border-line pt-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs text-ink-2 block">Required AI Tools</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TOOLS.map((t) => {
                      const selected = formValues.required_tools?.includes(t);
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => toggleArrayValue("required_tools", t)}
                          className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                            selected
                              ? "bg-ink text-paper font-medium"
                              : "bg-paper border border-line text-ink-2 hover:text-ink"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="font-mono text-xs text-ink-2 block">Required Skills</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILLS.map((s) => {
                      const selected = formValues.required_skills?.includes(s);
                      return (
                        <button
                          type="button"
                          key={s}
                          onClick={() => toggleArrayValue("required_skills", s)}
                          className={`px-2 py-0.5 rounded text-xs transition-colors ${
                            selected
                              ? "bg-ink text-paper font-medium"
                              : "bg-paper border border-line text-ink-2 hover:text-ink"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* COMMERCIAL USE SAFETY CHECKLIST */}
              <div className="border-t border-line pt-4 space-y-4">
                <h3 className="font-display text-xl text-ink">Commercial-Use Safety Clearance</h3>

                <div className="space-y-2">
                  <label className="font-mono text-xs text-ink-2 block">Campaign Usage Rights *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {USAGE_RIGHTS.map((ur) => {
                      const checked = formValues.usage_rights?.includes(ur);
                      return (
                        <label key={ur} className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                          <input
                            type="checkbox"
                            value={ur}
                            checked={Boolean(checked)}
                            onChange={() => toggleArrayValue("usage_rights", ur)}
                            className="accent-accent"
                          />
                          <span>{ur}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.usage_rights && (
                    <p className="text-bad text-[11px] font-mono">{errors.usage_rights.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs text-ink-2 block">Territory *</label>
                    <input
                      {...register("territory")}
                      placeholder="e.g. Worldwide"
                      className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs text-ink-2 block">Duration (months) *</label>
                    <input
                      type="number"
                      {...register("usage_duration_months")}
                      className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs text-ink-2 block">Max Revision Rounds *</label>
                    <input
                      type="number"
                      {...register("max_revision_rounds")}
                      className="w-full bg-paper border border-line rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="exclusivity"
                      {...register("exclusivity")}
                      className="accent-accent w-4 h-4"
                    />
                    <label htmlFor="exclusivity" className="text-xs text-ink cursor-pointer">
                      Require category exclusivity
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="ai_disclosure"
                      {...register("ai_disclosure_required")}
                      className="accent-accent w-4 h-4"
                    />
                    <label htmlFor="ai_disclosure" className="text-xs text-ink cursor-pointer">
                      Require AI model disclosure
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-line pt-4">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="btn-primary w-full text-sm"
                >
                  {isPublishing ? "Publishing brief..." : "Publish campaign brief →"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
