"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { useLanguage } from "@/context/LanguageContext";
import { Brief, Creator, Engagement } from "@/lib/types";
import { PortfolioFrame } from "@/components/common/PortfolioFrame";
import {
  Briefcase,
  Search,
  Plus,
  Send,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Video,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Users,
  Check,
  X,
  AlertCircle
} from "lucide-react";

const SAMPLE_CREATORS = [
  {
    id: "cr_1",
    name: "Inbarasan",
    headline: "Generative Commercial Director & ComfyUI Pipeline Architect",
    category: "Product ads",
    platforms: ["Instagram", "TikTok", "YouTube"],
    budget: "$2,500 - $4,000",
    audience: "Gen-Z & Tech Consumers",
    tools: ["Runway Gen-3", "ComfyUI", "Midjourney"],
    avatarUrl: "/seed/avatar_dev.jpg",
    mediaUrl: "/seed/sneaker_916.mp4",
    aspectRatio: "9:16",
    rating: 4.9,
    deliveriesCount: 38,
  },
  {
    id: "cr_2",
    name: "Padmanathan",
    headline: "3D Character Motion Artist & Virtual Production Designer",
    category: "Explainer animation",
    platforms: ["YouTube", "LinkedIn"],
    budget: "$1,800 - $3,200",
    audience: "B2B & Fintech Professionals",
    tools: ["Kling 1.5", "ElevenLabs", "After Effects"],
    avatarUrl: "/seed/avatar_maya.jpg",
    mediaUrl: "/seed/fintech_169.jpg",
    aspectRatio: "16:9",
    rating: 4.8,
    deliveriesCount: 29,
  },
  {
    id: "cr_3",
    name: "Bharathraj",
    headline: "High Fashion & Editorial Prompt Director",
    category: "Fashion & lifestyle",
    platforms: ["Instagram", "TikTok"],
    budget: "$3,000 - $5,500",
    audience: "Luxury & Fashion Enthusiasts",
    tools: ["Midjourney v6", "Luma Dream Machine"],
    avatarUrl: "/seed/avatar_kavya.jpg",
    mediaUrl: "/seed/fashion_45.jpg",
    aspectRatio: "4:5",
    rating: 5.0,
    deliveriesCount: 44,
  },
  {
    id: "cr_4",
    name: "Pugazendhi",
    headline: "Experimental Motion Visualizer & Sound Reactivity Specialist",
    category: "Music visuals",
    platforms: ["YouTube", "TikTok"],
    budget: "$1,500 - $2,800",
    audience: "Music & Gaming Community",
    tools: ["ComfyUI", "Pika 1.0", "DaVinci"],
    avatarUrl: "/seed/avatar_marcus.jpg",
    mediaUrl: "/seed/gaming_169.jpg",
    aspectRatio: "16:9",
    rating: 4.7,
    deliveriesCount: 22,
  },
];

export default function BrandDashboardPage() {
  const { user, role } = useRole();
  const { t } = useLanguage();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedBudget, setSelectedBudget] = useState("all");

  // Create Campaign Modal state
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [newCampaignBudget, setNewCampaignBudget] = useState("3500");
  const [newCampaignDeadline, setNewCampaignDeadline] = useState("2026-11-20");
  const [newCampaignFormat, setNewCampaignFormat] = useState("9:16");
  const [campaignSuccessMsg, setCampaignSuccessMsg] = useState<string | null>(null);

  // Send Collaboration Request Modal
  const [collabModalCreator, setCollabModalCreator] = useState<any | null>(null);
  const [collabMsg, setCollabMsg] = useState("");
  const [collabSuccessMsg, setCollabSuccessMsg] = useState<string | null>(null);

  // Collaboration tracking list
  const [collaborations, setCollaborations] = useState([
    {
      id: "eng_sneaker_001",
      campaignTitle: "AURA Kicks — Gen-Z Neon Sneaker Launch",
      creatorName: "Inbarasan",
      creatorAvatar: "/seed/avatar_dev.jpg",
      budget: "$3,500",
      deadline: "2026-11-15",
      status: "in_progress", // "pending" | "accepted" | "in_progress" | "completed"
      stageLabel: "Version v1 In Review",
      link: "/engagements/eng_sneaker_001",
    },
    {
      id: "eng_fintech_002",
      campaignTitle: "Velox Pay — Autonomous AI Cashflow Explainer",
      creatorName: "Padmanathan",
      creatorAvatar: "/seed/avatar_maya.jpg",
      budget: "$2,800",
      deadline: "2026-11-25",
      status: "accepted",
      stageLabel: "Scope Confirmed",
      link: "/briefs/brief_fintech_001",
    },
    {
      id: "eng_fashion_003",
      campaignTitle: "LUMIERE Paris — Holographic Autumn Couture",
      creatorName: "Bharathraj",
      creatorAvatar: "/seed/avatar_kavya.jpg",
      budget: "$4,200",
      deadline: "2026-12-05",
      status: "pending",
      stageLabel: "Awaiting Creator Review",
      link: "/briefs",
    },
    {
      id: "eng_perfume_004",
      campaignTitle: "CYBER-NOIR Perfume — Fluid Glass Ad Slate",
      creatorName: "Inbarasan",
      creatorAvatar: "/seed/avatar_dev.jpg",
      budget: "$3,000",
      deadline: "2026-10-18",
      status: "completed",
      stageLabel: "Masters Released",
      link: "/engagements/eng_sneaker_001",
    },
  ]);

  // Filter creators
  const filteredCreators = SAMPLE_CREATORS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tools.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      c.category.toLowerCase().replace(/\s+/g, "") === selectedCategory.toLowerCase().replace(/\s+/g, "");

    const matchesPlatform =
      selectedPlatform === "all" || c.platforms.includes(selectedPlatform);

    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim() || !newCampaignDesc.trim()) return;

    const newCollab = {
      id: `eng_${Date.now()}`,
      campaignTitle: newCampaignName,
      creatorName: "Pending Assignment",
      creatorAvatar: "/seed/avatars/avatar1.jpg",
      budget: `$${Number(newCampaignBudget).toLocaleString()}`,
      deadline: newCampaignDeadline,
      status: "pending",
      stageLabel: "Broadcast to Shortlist",
      link: "/briefs",
    };

    setCollaborations([newCollab, ...collaborations]);
    setCampaignSuccessMsg(`Campaign "${newCampaignName}" published successfully! AI matches generated.`);
    setTimeout(() => {
      setCampaignSuccessMsg(null);
      setCampaignModalOpen(false);
      setNewCampaignName("");
      setNewCampaignDesc("");
    }, 2000);
  };

  const handleSendCollabRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabModalCreator) return;

    const newCollab = {
      id: `eng_${Date.now()}`,
      campaignTitle: "New Commercial Campaign Request",
      creatorName: collabModalCreator.name,
      creatorAvatar: collabModalCreator.avatarUrl,
      budget: collabModalCreator.budget,
      deadline: "2026-11-30",
      status: "pending",
      stageLabel: "Invitation Sent",
      link: `/creators/${collabModalCreator.id}`,
    };

    setCollaborations([newCollab, ...collaborations]);
    setCollabSuccessMsg(`Collaboration invitation sent to ${collabModalCreator.name}!`);
    setTimeout(() => {
      setCollabSuccessMsg(null);
      setCollabModalCreator(null);
      setCollabMsg("");
    }, 1800);
  };

  return (
    <div className="space-y-8 py-4">
      {/* ── Brand Workspace Header ── */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#121526] via-[#151932] to-[#0D1020] border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> {t("brandDash.badge")}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {t("brandDash.loggedIn")} <strong className="text-white">{user?.name || "AURA Global Brand Manager"}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              {t("brandDash.title")}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t("brandDash.desc")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCampaignModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t("brandDash.createBtn")}</span>
            </button>
            <Link
              href="/briefs/new"
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>{t("brandDash.aiGenerator")}</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </Link>
          </div>
        </div>

        {/* Brand Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 mt-6 font-mono">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t("brandDash.activeCampaigns")}</span>
            <span className="text-xl font-black text-white">4 Live</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t("brandDash.collaborations")}</span>
            <span className="text-xl font-black text-indigo-400">6 Directors</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t("brandDash.escrowVault")}</span>
            <span className="text-xl font-black text-emerald-400">$10,500 USD</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t("brandDash.compliance")}</span>
            <span className="text-xl font-black text-purple-400">100% C2PA</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Active Collaborations & Campaign Status Tracking ── */}
      <div className="rounded-2xl p-6 bg-[#0E111A] border border-slate-800/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              {t("brandDash.collabTitle")}
            </h2>
            <p className="text-xs text-slate-400">
              {t("brandDash.collabSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">{t("status.pending")}</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">{t("status.accepted")}</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">{t("status.inProgress")}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">{t("status.completed")}</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {collaborations.map((collab) => {
            const getStatusBadge = (st: string) => {
              switch (st) {
                case "pending":
                  return "bg-amber-500/15 text-amber-300 border-amber-500/30";
                case "accepted":
                  return "bg-blue-500/15 text-blue-300 border-blue-500/30";
                case "in_progress":
                  return "bg-purple-500/15 text-purple-300 border-purple-500/30";
                case "completed":
                  return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
                default:
                  return "bg-slate-800 text-slate-300 border-slate-700";
              }
            };

            return (
              <div
                key={collab.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-900/30 px-3 -mx-3 rounded-xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={collab.creatorAvatar}
                      alt={collab.creatorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {collab.campaignTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                      <span>{t("brandDash.director")} <strong className="text-slate-200">{collab.creatorName}</strong></span>
                      <span>•</span>
                      <span>{t("brandDash.budget")} <strong className="text-emerald-400">{collab.budget}</strong></span>
                      <span>•</span>
                      <span>{t("brandDash.deadline")} {collab.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto font-mono text-xs">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-500 uppercase block">{t("brandDash.milestone")}</span>
                    <span className="text-slate-300 font-semibold">{collab.stageLabel}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                      collab.status
                    )}`}
                  >
                    {collab.status.replace("_", " ")}
                  </span>

                  <Link
                    href={collab.link}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors"
                    title="Open Collaboration Board"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: Search & Filter Content Creators ── */}
      <div className="rounded-2xl p-6 bg-[#0E111A] border border-slate-800/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              {t("brandDash.discoverTitle")}
            </h2>
            <p className="text-xs text-slate-400">
              {t("brandDash.discoverSubtitle")}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("brandDash.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> {t("brandDash.filters")}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">{t("brandDash.allCategories")}</option>
            <option value="Product ads">Product Commercials</option>
            <option value="Explainer animation">Explainer Animation</option>
            <option value="Fashion & lifestyle">Fashion & Lifestyle</option>
            <option value="Music visuals">Music Visuals</option>
          </select>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">{t("brandDash.allPlatforms")}</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>

          <span className="text-xs font-mono text-slate-500 ml-auto">
            {t("brandDash.showing", { count: filteredCreators.length })}
          </span>
        </div>

        {/* Creator Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          {filteredCreators.map((creator) => (
            <div
              key={creator.id}
              className="rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 p-4 space-y-4 flex flex-col justify-between transition-all group shadow-md"
            >
              <div className="space-y-3">
                {/* Media Preview Frame */}
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video border border-slate-800">
                  <PortfolioFrame
                    mediaUrl={creator.mediaUrl}
                    altText={creator.headline}
                    aspectRatio="16:9"
                    mediaType={creator.mediaUrl.endsWith(".mp4") ? "video" : "image"}
                    showBadge={false}
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-indigo-300 border border-indigo-500/30">
                    ★ {creator.rating} ({creator.deliveriesCount})
                  </div>
                </div>

                {/* Creator Profile Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                    />
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {creator.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {creator.headline}
                  </p>
                </div>

                {/* Tags & Tools */}
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {creator.tools.slice(0, 3).map((tool, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Platforms:</span>
                    <span className="text-slate-200">{creator.platforms.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget Range:</span>
                    <span className="text-emerald-400 font-semibold">{creator.budget}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setCollabModalCreator(creator)}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{t("brandDash.requestCollab")}</span>
                </button>
                <Link
                  href={`/creators/${creator.id}`}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                  title="View Full Portfolio"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CREATE CAMPAIGN MODAL ── */}
      {campaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0F1322] border border-indigo-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">{t("brandDash.createTitle")}</h3>
                  <p className="text-xs font-mono text-slate-400">{t("brandDash.createDesc")}</p>
                </div>
              </div>
              <button
                onClick={() => setCampaignModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {campaignSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{campaignSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase font-bold block">{t("brandDash.campaignTitle")} *</label>
                  <input
                    type="text"
                    required
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="e.g. Liquid Tech Running Shoe TikTok Video"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase font-bold block">{t("brandDash.campaignObjective")} *</label>
                  <textarea
                    rows={3}
                    required
                    value={newCampaignDesc}
                    onChange={(e) => setNewCampaignDesc(e.target.value)}
                    placeholder="Describe the mood, target audience, visual style, and key messaging..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 uppercase block font-bold">Budget ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={newCampaignBudget}
                      onChange={(e) => setNewCampaignBudget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 uppercase block font-bold">Deadline</label>
                    <input
                      type="date"
                      required
                      value={newCampaignDeadline}
                      onChange={(e) => setNewCampaignDeadline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 uppercase block font-bold">Aspect Ratio</label>
                    <select
                      value={newCampaignFormat}
                      onChange={(e) => setNewCampaignFormat(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="9:16">9:16 Vertical Reel</option>
                      <option value="16:9">16:9 Landscape</option>
                      <option value="1:1">1:1 Square</option>
                      <option value="4:5">4:5 Portrait</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCampaignModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs hover:bg-slate-700 transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t("brandDash.publishCampaign")}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── COLLABORATION REQUEST MODAL ── */}
      {collabModalCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0F1322] border border-purple-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={collabModalCreator.avatarUrl}
                  alt={collabModalCreator.name}
                  className="w-10 h-10 rounded-full border border-purple-500/40 object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {t("brandDash.inviteToCollab", { name: collabModalCreator.name })}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Category: {collabModalCreator.category} • Budget: {collabModalCreator.budget}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCollabModalCreator(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {collabSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{collabSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendCollabRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase font-bold block">
                    {t("brandDash.invitationNote")}
                  </label>
                  <textarea
                    rows={4}
                    value={collabMsg}
                    onChange={(e) => setCollabMsg(e.target.value)}
                    placeholder={`Hi ${collabModalCreator.name}, we reviewed your generative portfolio and would love to hire you for our upcoming commercial video project...`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>{t("brandDash.escrowGuarantee")}</span>
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    {t("brandDash.escrowDesc")}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCollabModalCreator(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs hover:bg-slate-700 transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t("brandDash.sendInvitation")}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
