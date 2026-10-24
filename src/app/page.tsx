"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortfolioFrame } from "@/components/common/PortfolioFrame";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { useRole } from "@/context/RoleContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Video,
  Sparkles,
  Briefcase,
  ChevronRight,
  Lock,
  HelpCircle,
  Award
} from "lucide-react";

// Sample Featured Creators
const FEATURED_CREATORS = [
  {
    id: "cr_1",
    name: "Inbarasan",
    headline: "Generative Commercial Director & ComfyUI Pipeline Architect",
    category: "Product ads",
    specialization: ["Product Commercials", "Brand Films"],
    tools: ["Runway Gen-3", "ComfyUI", "Midjourney v6"],
    verificationLevel: "platform_reviewed" as const,
    safetyStatus: "green" as const,
    safetyCause: "Cleared for Global Paid Media",
    avatarUrl: "/seed/avatar_dev.jpg",
    mediaUrl: "/seed/sneaker_916.mp4",
    aspectRatio: "9:16",
    budget: "$2,500 - $4,000",
  },
  {
    id: "cr_2",
    name: "Padmanathan",
    headline: "3D Character Motion Artist & Virtual Production Designer",
    category: "Explainer animation",
    specialization: ["Explainer Motion", "Fantasy & Gaming"],
    tools: ["Kling 1.5", "ElevenLabs", "After Effects"],
    verificationLevel: "proof_attached" as const,
    safetyStatus: "amber" as const,
    safetyCause: "Audit Required: Kling Standard",
    avatarUrl: "/seed/avatar_maya.jpg",
    mediaUrl: "/seed/fintech_169.jpg",
    aspectRatio: "16:9",
    budget: "$1,800 - $3,200",
  },
  {
    id: "cr_3",
    name: "Bharathraj",
    headline: "Fashion & Luxury Visuals Prompt Director",
    category: "Fashion & lifestyle",
    specialization: ["High Fashion", "Short-Form Editorial"],
    tools: ["Midjourney v6", "Luma Dream Machine"],
    verificationLevel: "proof_attached" as const,
    safetyStatus: "green" as const,
    safetyCause: "Cleared for Global Paid Media",
    avatarUrl: "/seed/avatar_kavya.jpg",
    mediaUrl: "/seed/fashion_45.jpg",
    aspectRatio: "4:5",
    budget: "$3,000 - $5,500",
  },
];

export default function HomePage() {
  const { role } = useRole();
  const { t } = useLanguage();
  const [selectedStepId, setSelectedStepId] = useState<string>("step-1");
  const [activeJourneyRole, setActiveJourneyRole] = useState<"brand" | "creator">("brand");

  // Dynamic translated workflow steps
  const workflowSteps = [
    {
      id: "step-1",
      number: 1,
      label: t("flow.step1.label"),
      shortDesc: t("flow.step1.desc"),
      details: {
        title: t("flow.step1.title"),
        description: t("flow.step1.detail"),
        keyChecklist: [t("flow.step1.c1"), t("flow.step1.c2"), t("flow.step1.c3")],
        actionLabel: t("flow.step1.action"),
        actionHref: "/creators",
      },
    },
    {
      id: "step-2",
      number: 2,
      label: t("flow.step2.label"),
      shortDesc: t("flow.step2.desc"),
      details: {
        title: t("flow.step2.title"),
        description: t("flow.step2.detail"),
        keyChecklist: [t("flow.step2.c1"), t("flow.step2.c2"), t("flow.step2.c3")],
        actionLabel: t("flow.step2.action"),
        actionHref: "/login",
      },
    },
    {
      id: "step-3",
      number: 3,
      label: t("flow.step3.label"),
      shortDesc: t("flow.step3.desc"),
      details: {
        title: t("flow.step3.title"),
        description: t("flow.step3.detail"),
        keyChecklist: [t("flow.step3.c1"), t("flow.step3.c2"), t("flow.step3.c3")],
        actionLabel: t("flow.step3.action"),
        actionHref: "/login",
      },
    },
    {
      id: "step-4",
      number: 4,
      label: t("flow.step4.label"),
      shortDesc: t("flow.step4.desc"),
      details: {
        title: t("flow.step4.title"),
        description: t("flow.step4.detail"),
        keyChecklist: [t("flow.step4.c1"), t("flow.step4.c2")],
        actionLabel: t("flow.step4.action"),
        actionHref: "/brand/dashboard",
      },
    },
    {
      id: "step-5",
      number: 5,
      label: t("flow.step5.label"),
      shortDesc: t("flow.step5.desc"),
      details: {
        title: t("flow.step5.title"),
        description: t("flow.step5.detail"),
        keyChecklist: [t("flow.step5.c1"), t("flow.step5.c2"), t("flow.step5.c3")],
        actionLabel: t("flow.step5.action"),
        actionHref: "/engagements/eng_sneaker_001",
      },
    },
    {
      id: "step-6",
      number: 6,
      label: t("flow.step6.label"),
      shortDesc: t("flow.step6.desc"),
      details: {
        title: t("flow.step6.title"),
        description: t("flow.step6.detail"),
        keyChecklist: [t("flow.step6.c1"), t("flow.step6.c2"), t("flow.step6.c3"), t("flow.step6.c4")],
        actionLabel: t("flow.step6.action"),
        actionHref: "/engagements",
      },
    },
  ];

  const currentStep = workflowSteps.find((s) => s.id === selectedStepId) || workflowSteps[0];

  return (
    <div className="space-y-24 py-4">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative rounded-3xl p-8 sm:p-14 lg:p-16 overflow-hidden bg-gradient-to-b from-[#0D1022] via-[#0B0D18] to-[#080911] border border-indigo-500/30 shadow-2xl">
        {/* Modern SaaS Blue & Purple Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Category Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 border border-indigo-500/30 backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-indigo-200 tracking-wide uppercase">
              {t("hero.badge")}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white font-display tracking-tight leading-[1.08]">
            {t("hero.titlePrefix")}{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              {t("hero.titleHighlight")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Action Buttons: Get Started, Login, How to Use */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-mono text-sm font-bold transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 group transform hover:-translate-y-0.5"
            >
              <span>{t("hero.getStarted")}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/login"
              className="px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-indigo-400/50 text-white font-mono text-sm font-semibold transition-all shadow-md"
            >
              {t("hero.login")}
            </Link>

            <a
              href="#how-it-works"
              className="px-7 py-3.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 font-mono text-sm font-semibold transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>{t("hero.howToUse")}</span>
            </a>
          </div>

          {/* Real-Time Platform Signals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 border-t border-slate-800/80 font-mono text-left">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/90 backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t("signals.creatorsLabel")}</span>
              <span className="text-xl font-black text-white">{t("signals.creatorsValue")}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/90 backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t("signals.escrowLabel")}</span>
              <span className="text-xl font-black text-emerald-400">{t("signals.escrowValue")}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/90 backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t("signals.speedLabel")}</span>
              <span className="text-xl font-black text-indigo-400">{t("signals.speedValue")}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/90 backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t("signals.licensingLabel")}</span>
              <span className="text-xl font-black text-purple-400">{t("signals.licensingValue")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. INTERACTIVE WORKFLOW FLOWCHART DIAGRAM ── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> {t("flow.badge")}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {t("flow.title")}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              {t("flow.subtitle")}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
            <span className="text-indigo-400 font-bold">{t("flow.stepProgress", { current: currentStep.number })}</span>
            <span className="text-white font-semibold truncate max-w-[140px]">{currentStep.label}</span>
          </div>
        </div>

        {/* Horizontal Timeline on Desktop / Vertical Flow on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
          {workflowSteps.map((step, idx) => {
            const isSelected = step.id === selectedStepId;
            return (
              <button
                key={step.id}
                onClick={() => setSelectedStepId(step.id)}
                className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-b from-[#181D38] to-[#101326] border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500"
                    : "bg-[#0E111D] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                {/* Connecting arrow indicator on desktop */}
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-slate-600"}`} />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                      }`}
                    >
                      {step.number}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    )}
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-bold font-display ${
                        isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {step.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono mt-3">
                  <span className={isSelected ? "text-indigo-300 font-semibold" : "text-slate-500"}>
                    {isSelected ? t("flow.inspecting") : t("flow.clickToView")}
                  </span>
                  <ArrowRight className={`w-3 h-3 ${isSelected ? "text-indigo-400" : "text-slate-600"}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Deep-Dive Inspector Card */}
        <div className="rounded-2xl p-6 sm:p-8 bg-[#0F1322] border border-indigo-500/30 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-mono text-lg font-bold shadow-md shadow-indigo-600/30">
                0{currentStep.number}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                  {currentStep.details.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  {currentStep.details.description}
                </p>
              </div>
            </div>

            <Link
              href={currentStep.details.actionHref}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <span>{currentStep.details.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            {currentStep.details.keyChecklist.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. DETAILED "HOW IT WORKS" WITH STEP 4A & 4B GUIDED PATHS ── */}
      <section id="how-it-works" className="space-y-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> {t("how.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            {t("how.title")}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t("how.subtitle")}
          </p>
        </div>

        {/* Step 1 to 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="rounded-2xl p-6 bg-[#0E111D] border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono text-xs font-bold flex items-center justify-center">
                01
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{t("how.step1.badge")}</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors font-display">
              {t("how.step1.title")}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("how.step1.desc")}
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <Link href="/creators" className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>{t("how.step1.link")}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl p-6 bg-[#0E111D] border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono text-xs font-bold flex items-center justify-center">
                02
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{t("how.step2.badge")}</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors font-display">
              {t("how.step2.title")}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("how.step2.desc")}
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <Link href="/login" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>{t("how.step2.link")}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl p-6 bg-[#0E111D] border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono text-xs font-bold flex items-center justify-center">
                03
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{t("how.step3.badge")}</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors font-display">
              {t("how.step3.title")}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("how.step3.desc")}
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <Link href="/register/brand" className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1">
                <span>{t("how.step3.link")}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── STEP 4: INTERACTIVE DUAL JOURNEY (BRAND 4A vs CREATOR 4B) ── */}
        <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-[#101426] via-[#0E111E] to-[#0A0C16] border border-indigo-500/30 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                {t("how.pathway.badge")}
              </span>
              <h3 className="text-2xl font-bold text-white font-display">
                {t("how.pathway.title")}
              </h3>
            </div>

            {/* Role Toggle Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 p-1.5 rounded-xl shadow-inner font-mono text-xs">
              <button
                onClick={() => setActiveJourneyRole("brand")}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  activeJourneyRole === "brand"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{t("how.tabBrand")}</span>
              </button>
              <button
                onClick={() => setActiveJourneyRole("creator")}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  activeJourneyRole === "creator"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{t("how.tabCreator")}</span>
              </button>
            </div>
          </div>

          {/* PATHWAY 4A: BRAND */}
          {activeJourneyRole === "brand" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300 flex items-center justify-between">
                <span>{t("brandJourney.banner")}</span>
                <Link href="/brand/dashboard" className="underline font-bold text-white hover:text-blue-300">
                  {t("brandJourney.link")}
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-indigo-400 font-mono text-xs font-bold">{t("brandJourney.s1.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("brandJourney.s1.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("brandJourney.s1.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-indigo-400 font-mono text-xs font-bold">{t("brandJourney.s2.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("brandJourney.s2.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("brandJourney.s2.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-indigo-400 font-mono text-xs font-bold">{t("brandJourney.s3.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("brandJourney.s3.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("brandJourney.s3.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-indigo-400 font-mono text-xs font-bold">{t("brandJourney.s4.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("brandJourney.s4.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("brandJourney.s4.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-indigo-400 font-mono text-xs font-bold">{t("brandJourney.s5.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("brandJourney.s5.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("brandJourney.s5.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-indigo-400 font-mono text-xs font-bold">{t("brandJourney.s6.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("brandJourney.s6.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("brandJourney.s6.desc")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PATHWAY 4B: CREATOR */}
          {activeJourneyRole === "creator" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-center justify-between">
                <span>{t("creatorJourney.banner")}</span>
                <Link href="/creator/dashboard" className="underline font-bold text-white hover:text-purple-300">
                  {t("creatorJourney.link")}
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-purple-400 font-mono text-xs font-bold">{t("creatorJourney.s1.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("creatorJourney.s1.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("creatorJourney.s1.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-purple-400 font-mono text-xs font-bold">{t("creatorJourney.s2.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("creatorJourney.s2.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("creatorJourney.s2.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-purple-400 font-mono text-xs font-bold">{t("creatorJourney.s3.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("creatorJourney.s3.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("creatorJourney.s3.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-purple-400 font-mono text-xs font-bold">{t("creatorJourney.s4.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("creatorJourney.s4.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("creatorJourney.s4.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-purple-400 font-mono text-xs font-bold">{t("creatorJourney.s5.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("creatorJourney.s5.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("creatorJourney.s5.desc")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-purple-400 font-mono text-xs font-bold">{t("creatorJourney.s6.step")}</div>
                  <h4 className="text-sm font-bold text-white">{t("creatorJourney.s6.title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("creatorJourney.s6.desc")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Steps 5 & 6 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 5 */}
          <div className="rounded-2xl p-6 sm:p-8 bg-[#0E111D] border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono text-sm font-bold flex items-center justify-center">
                05
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {t("how.step5.badge")}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-display">
              {t("how.step5.title")}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t("how.step5.desc")}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <Video className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                <span>{t("how.step5.feature1")}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <Lock className="w-3.5 h-3.5 text-amber-400 mb-1" />
                <span>{t("how.step5.feature2")}</span>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="rounded-2xl p-6 sm:p-8 bg-[#0E111D] border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono text-sm font-bold flex items-center justify-center">
                06
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {t("how.step6.badge")}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-display">
              {t("how.step6.title")}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t("how.step6.desc")}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs pt-1">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <span className="block font-bold">{t("status.pending")}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t("status.pendingSub")}</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
                <span className="block font-bold">{t("status.accepted")}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t("status.acceptedSub")}</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                <span className="block font-bold">{t("status.inProgress")}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t("status.inProgressSub")}</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <span className="block font-bold">{t("status.completed")}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t("status.completedSub")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED CREATORS SPOTLIGHT ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              {t("featured.badge")}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
              {t("featured.title")}
            </h2>
          </div>
          <Link
            href="/creators"
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
          >
            <span>{t("featured.exploreAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_CREATORS.map((creator) => (
            <div
              key={creator.id}
              className="rounded-2xl bg-[#0E111D] border border-slate-800 hover:border-indigo-500/50 p-5 space-y-4 flex flex-col justify-between transition-all group shadow-xl"
            >
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 relative">
                  <PortfolioFrame
                    mediaUrl={creator.mediaUrl}
                    altText={creator.headline}
                    aspectRatio="16:9"
                    mediaType={creator.mediaUrl.endsWith(".mp4") ? "video" : "image"}
                    showBadge={false}
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <VerificationBadge level={creator.verificationLevel} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                    />
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {creator.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {creator.headline}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {creator.tools.map((tItem, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700"
                    >
                      {tItem}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">{t("featured.rateRange")}</span>
                  <span className="text-emerald-400 font-bold">{creator.budget}</span>
                </div>
                <Link
                  href={`/creators/${creator.id}`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>{t("featured.viewPortfolio")}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. FINAL CALL TO ACTION BANNER ── */}
      <section className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-blue-900/30 via-indigo-900/40 to-purple-900/30 border border-indigo-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            {t("cta.title")}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t("cta.desc")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/register/brand"
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>{t("cta.brandBtn")}</span>
            </Link>

            <Link
              href="/register/creator"
              className="px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Video className="w-4 h-4 text-purple-400" />
              <span>{t("cta.creatorBtn")}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
