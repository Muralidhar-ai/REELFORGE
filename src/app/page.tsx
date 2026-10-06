"use client";

import Link from "next/link";
import { PortfolioFrame } from "@/components/common/PortfolioFrame";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { SafetyBadge } from "@/components/common/SafetyBadge";

// Sample frames for the home hero contact sheet (6 mixed aspect ratios)
const HERO_CONTACT_SHEET = [
  { url: "/seed/sneaker_916.mp4", alt: "Hyper-real sneaker fluid flow animation", ratio: "9:16", type: "video" as const, label: "CAM_01 // GEN-3" },
  { url: "/seed/fintech_169.jpg", alt: "Fintech interface motion storyboard frame", ratio: "16:9", type: "image" as const, label: "UI_STORYBOARD" },
  { url: "/seed/jewellery_11.jpg", alt: "Festive gold jewellery macro raytrace", ratio: "1:1", type: "image" as const, label: "MACRO_04" },
  { url: "/seed/fashion_45.jpg", alt: "Cyberpunk neon couture editorial shot", ratio: "4:5", type: "image" as const, label: "LOOKBOOK_09" },
  { url: "/seed/gaming_169.jpg", alt: "Fantasy creature character breakdown keyframe", ratio: "16:9", type: "image" as const, label: "CHAR_RIG_02" },
  { url: "/seed/perfume_916.mp4", alt: "Luxury perfume splash sequence render", ratio: "9:16", type: "video" as const, label: "FLUID_SIM_07" },
];

// Sample 4 recently added creators for home page
const RECENT_CREATORS = [
  {
    id: "cr_1",
    name: "Inbarasan",
    headline: "Generative Commercial Director & ComfyUI Pipeline Architect",
    specialization: ["Product Commercials", "Brand Films"],
    tools: ["Runway Gen-3", "Kling 1.5", "ComfyUI", "Midjourney v6"],
    reviewed: true,
    verificationLevel: "platform_reviewed" as const,
    safetyStatus: "green" as const,
    safetyCause: "Cleared for Global Paid Media",
    avatarUrl: "/seed/avatar_dev.jpg",
    thumbnails: [
      { url: "/seed/sneaker_916.mp4", ratio: "9:16", alt: "Sneaker fluid flow animation" },
      { url: "/seed/sneaker_thumb2.jpg", ratio: "1:1", alt: "Sneaker product render" },
      { url: "/seed/sneaker_thumb3.jpg", ratio: "16:9", alt: "Sneaker commercial slate" },
    ],
  },
  {
    id: "cr_2",
    name: "Padmanathan",
    headline: "3D Character Motion Artist & Virtual Production Designer",
    specialization: ["Explainer Motion", "Fantasy & Gaming"],
    tools: ["Kling 1.5", "ElevenLabs", "After Effects", "Stable Diffusion"],
    reviewed: false,
    verificationLevel: "proof_attached" as const,
    safetyStatus: "amber" as const,
    safetyCause: "Audit Required: Kling Standard",
    avatarUrl: "/seed/avatar_maya.jpg",
    thumbnails: [
      { url: "/seed/fintech_169.jpg", ratio: "16:9", alt: "Fintech explainer frame" },
      { url: "/seed/fintech_thumb2.jpg", ratio: "9:16", alt: "Character rig sequence" },
      { url: "/seed/fintech_thumb3.jpg", ratio: "1:1", alt: "Isometric interface render" },
    ],
  },
  {
    id: "cr_3",
    name: "Bharathraj",
    headline: "Fashion & Luxury Visuals Prompt Director",
    specialization: ["High Fashion", "Short-Form Editorial"],
    tools: ["Midjourney v6", "Luma Dream Machine", "CapCut Pro"],
    reviewed: false,
    verificationLevel: "proof_attached" as const,
    safetyStatus: "green" as const,
    safetyCause: "Cleared for Global Paid Media",
    avatarUrl: "/seed/avatar_kavya.jpg",
    thumbnails: [
      { url: "/seed/jewellery_11.jpg", ratio: "1:1", alt: "Jewellery macro shot" },
      { url: "/seed/fashion_45.jpg", ratio: "4:5", alt: "Couture editorial shot" },
      { url: "/seed/fashion_thumb3.jpg", ratio: "9:16", alt: "Runway model loop" },
    ],
  },
  {
    id: "cr_4",
    name: "Pugazendhi",
    headline: "Experimental Motion Visualizer & Sound Reactivity Specialist",
    specialization: ["Music Visuals", "Brand Idents"],
    tools: ["ComfyUI", "Pika 1.0", "DaVinci Resolve"],
    reviewed: false,
    verificationLevel: "self_declared" as const,
    safetyStatus: "amber" as const,
    safetyCause: "Audit Required: Pika Free Tier",
    avatarUrl: "/seed/avatar_marcus.jpg",
    thumbnails: [
      { url: "/seed/gaming_169.jpg", ratio: "16:9", alt: "Fantasy creature scene" },
      { url: "/seed/music_thumb2.jpg", ratio: "9:16", alt: "Audio reactive visualizer" },
      { url: "/seed/music_thumb3.jpg", ratio: "1:1", alt: "Neon synth wave slate" },
    ],
  },
];

const METRICS = [
  { value: "240+", label: "Vetted Directors", subtext: "Strict workflow verification" },
  { value: "100%", label: "Licence Audited", subtext: "Zero commercial ambiguity" },
  { value: "4.2h", label: "Avg. Brief Match", subtext: "From brief to active pitch" },
  { value: "4K", label: "Master Delivery", subtext: "Full node graphs + source audio" },
];

export default function HomePage() {
  return (
    <div className="space-y-24 py-6">

      {/* ── Hero Section ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Editorial & Value Prop */}
        <div className="lg:col-span-6 space-y-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            COMMERCIAL AI FILMMAKING & TALENT MARKETPLACE
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] font-display">
              Hire AI directors with <span className="text-[#E2B857]">verified workflow provenance.</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              The cinema production desk for commercial brands to discover generative directors, inspect seed replays, verify tool licences, and commission broadcast video.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/creators"
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore Director Roster
            </Link>
            <Link
              href="/briefs/new"
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-[#E2B857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Commercial Brief
            </Link>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-amber-500/15">
            {METRICS.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="text-2xl font-bold font-mono text-[#E2B857] tracking-tight">{m.value}</div>
                <div className="text-xs font-semibold text-white">{m.label}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{m.subtext}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Studio Contact Sheet Monitor */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl bg-[#151620] border border-amber-500/20 shadow-2xl overflow-hidden">
            {/* Monitor Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0F1018] border-b border-amber-500/15">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <div className="h-4 w-[1px] bg-slate-800"></div>
                <span className="text-xs font-mono text-amber-300">STUDIO_LIVE_DESK // PROVENANCE VERIFIED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  REC :: 00:04:19:12
                </span>
                <span className="text-[11px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  PRORES 4K
                </span>
              </div>
            </div>

            {/* Frame Grid */}
            <div className="p-4 grid grid-cols-3 gap-3 bg-[#0C0D12]">
              {HERO_CONTACT_SHEET.map((item, idx) => (
                <div key={idx} className="group relative space-y-1.5">
                  <div className="rounded-lg overflow-hidden border border-slate-800 group-hover:border-amber-500/50 transition-colors bg-slate-900">
                    <PortfolioFrame
                      mediaUrl={item.url}
                      altText={item.alt}
                      aspectRatio={item.ratio}
                      mediaType={item.type}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5">
                    <span className="text-amber-300/80">{item.label}</span>
                    <span className="text-slate-500">{item.ratio}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Monitor Footer Bar */}
            <div className="px-4 py-3 bg-[#0F1018] border-t border-amber-500/15 flex items-center justify-between text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#E2B857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-amber-300">COMMERCIAL LICENCE VERIFIED</span>
              </div>
              <span className="text-slate-400">6/6 FRAMES CLEARED</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Creators Section ── */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-500/15 pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Featured AI Filmmakers & Visual Directors
            </h2>
            <p className="text-slate-400 text-sm">
              Directors with audited prompt workflows, verified tool licences, and commercial history.
            </p>
          </div>
          <Link
            href="/creators"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#E2B857] hover:text-amber-300 transition-colors uppercase tracking-wider font-semibold"
          >
            Explore All 240+ Directors
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Creator Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {RECENT_CREATORS.map((creator) => (
            <div
              key={creator.id}
              data-testid="creator-card"
              className="group rounded-xl bg-[#151620] border border-slate-800 hover:border-amber-500/40 p-6 space-y-5 transition-all duration-200 hover:bg-[#1A1B2A]"
            >
              {/* Creator Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/30 bg-slate-800 flex-shrink-0 ring-2 ring-amber-500/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLElement;
                        el.style.display = "none";
                        const parent = el.parentElement;
                        if (parent) {
                          parent.style.background = "#1F1A08";
                          parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#E2B857">${creator.name[0]}</div>`;
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href={`/creators/${creator.id}`}
                      className="font-semibold text-white text-base hover:text-[#E2B857] transition-colors block"
                    >
                      {creator.name}
                    </Link>
                    <p className="text-slate-400 text-xs line-clamp-1">{creator.headline}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <VerificationBadge level={creator.verificationLevel} />
                  <SafetyBadge status={creator.safetyStatus} cause={creator.safetyCause} />
                </div>
              </div>

              {/* Tools & Specialization */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {creator.specialization.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mr-1">TOOL STACK:</span>
                  {creator.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portfolio Frames Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {creator.thumbnails.map((thumb, idx) => (
                  <div key={idx} className="rounded border border-slate-800 overflow-hidden bg-slate-950">
                    <PortfolioFrame
                      mediaUrl={thumb.url}
                      altText={thumb.alt}
                      aspectRatio={thumb.ratio}
                    />
                  </div>
                ))}
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  href={`/creators/${creator.id}`}
                  className="text-xs font-mono text-[#E2B857] hover:text-amber-300 transition-colors flex items-center gap-1 font-medium"
                >
                  Inspect Full Replay & Profile
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <span className="text-[11px] font-mono text-slate-500">ID: {creator.id}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Enterprise Provenance Infrastructure Grid ── */}
      <section className="rounded-2xl bg-[#151620] border border-amber-500/20 p-8 sm:p-10 space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-mono text-[#E2B857] uppercase tracking-widest font-semibold">COMMERCIAL ASSURANCE</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Built for enterprise marketing & agency compliance
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Eliminate legal ambiguity in generative video. Every asset delivered through ReelForge includes audit-ready prompt node graphs and licence clearance logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#E2B857]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1.01 1.01 0 01.707.293l5.414 5.414a1.01 1.01 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Workflow Step Replay</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review full prompt seeds, node execution trees, and upscaling parameters to verify original creation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#E2B857]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Licence Verification Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated auditing against active tool subscriptions (Runway Unlimited Commercial, Midjourney Pro, etc.).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0C0D12] border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#E2B857]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Turn-key Brief Match</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Structured brief builder matches campaign parameters, target aspect ratios, and deadline requirements instantly.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
