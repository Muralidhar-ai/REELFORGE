"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Film,
  Briefcase,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Layers,
} from "lucide-react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const { loginUser } = useRole();
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<"creator" | "brand">("creator");
  const [email, setEmail] = useState("inbarasan@reelforge.com");
  const [password, setPassword] = useState("creator123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick switch role preset
  const handleRoleSelect = (role: "creator" | "brand") => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === "creator") {
      setEmail("inbarasan@reelforge.com");
      setPassword("creator123");
    } else {
      setEmail("brand@aurakicks.com");
      setPassword("brand123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      // Sync role context
      loginUser(data.user);

      // Safe redirect validation: prevent open-redirect vulnerabilities
      const safeRedirect =
        redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
          ? redirectParam
          : data.redirectUrl || (selectedRole === "creator" ? "/creator/dashboard" : "/brand/dashboard");

      router.push(safeRedirect);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-[#282A24] bg-[#191A17] overflow-hidden shadow-2xl">
        {/* LEFT COLUMN: Brand Identity & Creative Collaboration Spotlight */}
        <div className="lg:col-span-5 bg-[#111210] p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-[#282A24] flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* Logo Mark */}
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded bg-[#D5AD52] flex items-center justify-center text-[#111210] font-bold text-sm tracking-tight transition-transform group-hover:scale-95">
                RF
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-lg tracking-tight text-[#F3F0E8] font-display">
                  ReelForge
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#AAA99F]">
                  Studio Desk
                </span>
              </div>
            </Link>

            {/* Headline & Editorial Copy */}
            <div className="space-y-3 pt-4">
              <span className="font-mono text-xs text-[#D5AD52] uppercase tracking-wider font-semibold">
                Creative Marketplace
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F0E8] font-display leading-[1.15]">
                {t("auth.leftTitle")}
              </h1>
              <p className="text-[#AAA99F] text-xs sm:text-sm leading-relaxed">
                {t("auth.leftSubtitle")}
              </p>
            </div>
          </div>

          {/* Tasteful, Restrained Collaboration Preview Element */}
          <div className="border border-[#282A24] bg-[#191A17] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#AAA99F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3E895B]"></span>
                Live Collaboration Workspace
              </span>
              <span className="text-[#D5AD52]">ProRes 4K</span>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#282A24] bg-[#111210]">
              <video
                src="/seed/sneaker_916.mp4"
                poster="/seed/avatars/avatar1.jpg"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#111210]/90 border border-[#282A24] text-[10px] font-mono text-[#F3F0E8]">
                Format: 9:16 Reel
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded bg-[#111210]/90 border border-[#282A24] text-[10px] font-mono">
                <span className="text-[#AAA99F]">Director: Inbarasan</span>
                <span className="text-[#6BCB8B] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#3E895B]" /> C2PA Verified
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#76756D] font-mono leading-snug">
              Commercial provenance credentials and tool subscription licensing verified for broadcast and paid advertising.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication & Role Selection Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F0E8] font-display">
                {t("auth.welcomeBack")}
              </h2>
              <p className="text-[#AAA99F] text-xs sm:text-sm">
                {t("auth.signInDesc")}
              </p>
            </div>

            {/* Error Announcement */}
            {errorMessage && (
              <div
                role="alert"
                className="bg-[#B84A4A]/10 border border-[#B84A4A]/30 text-[#E57373] px-4 py-3 rounded-lg text-xs font-mono flex items-start gap-2.5 animate-fade-up"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="space-y-3">
              <label className="font-mono text-xs text-[#AAA99F] block">{t("auth.selectWorkspace")}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Creator Option */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("creator")}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    selectedRole === "creator"
                      ? "bg-[#20211D] border-[#D5AD52] shadow-md"
                      : "bg-[#111210] border-[#282A24] hover:border-[#3D4036]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 font-display text-base font-bold text-[#F3F0E8]">
                      <Film className={`w-4 h-4 ${selectedRole === "creator" ? "text-[#D5AD52]" : "text-[#AAA99F]"}`} />
                      {t("nav.creator")}
                    </span>
                    {selectedRole === "creator" && (
                      <CheckCircle2 className="w-4 h-4 text-[#D5AD52]" />
                    )}
                  </div>
                  <p className="text-xs text-[#AAA99F] line-clamp-2 leading-relaxed">
                    {t("auth.creatorDesc")}
                  </p>
                  <div className="mt-3 pt-2 border-t border-[#282A24] text-[11px] font-mono text-[#D5AD52] font-semibold flex items-center gap-1">
                    {t("auth.continueAs", { role: t("nav.creator") })} <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                {/* Brand Option */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("brand")}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    selectedRole === "brand"
                      ? "bg-[#20211D] border-[#D5AD52] shadow-md"
                      : "bg-[#111210] border-[#282A24] hover:border-[#3D4036]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 font-display text-base font-bold text-[#F3F0E8]">
                      <Briefcase className={`w-4 h-4 ${selectedRole === "brand" ? "text-[#D5AD52]" : "text-[#AAA99F]"}`} />
                      {t("nav.brand")}
                    </span>
                    {selectedRole === "brand" && (
                      <CheckCircle2 className="w-4 h-4 text-[#D5AD52]" />
                    )}
                  </div>
                  <p className="text-xs text-[#AAA99F] line-clamp-2 leading-relaxed">
                    {t("auth.brandDesc")}
                  </p>
                  <div className="mt-3 pt-2 border-t border-[#282A24] text-[11px] font-mono text-[#D5AD52] font-semibold flex items-center gap-1">
                    {t("auth.continueAs", { role: t("nav.brand") })} <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label htmlFor="email" className="font-mono text-xs text-[#AAA99F] block">
                  {selectedRole === "brand" ? t("auth.workEmail") : t("auth.email")} *
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === "brand" ? "name@company.com" : "creator@reelforge.com"}
                  className="w-full bg-[#111210] border border-[#282A24] rounded-lg px-3.5 py-2.5 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="font-mono text-xs text-[#AAA99F] block">
                    {t("auth.password")} *
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-mono text-[11px] text-[#D5AD52] hover:text-[#E2BE6A] transition-colors"
                  >
                    {t("auth.forgot")}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full bg-[#111210] border border-[#282A24] rounded-lg px-3.5 py-2.5 pr-10 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-2.5 text-[#AAA99F] hover:text-[#F3F0E8] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Demo Autofill Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#282A24] bg-[#111210] text-[#D5AD52] focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs font-mono text-[#AAA99F]">{t("auth.rememberDevice")}</span>
                </label>

                {/* Quick 1-click test preset */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedRole === "creator") {
                      setEmail("inbarasan@reelforge.com");
                      setPassword("creator123");
                    } else {
                      setEmail("brand@aurakicks.com");
                      setPassword("brand123");
                    }
                  }}
                  className="font-mono text-[11px] text-[#D5AD52] hover:underline self-start sm:self-auto"
                >
                  {t("auth.fillDemo")}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary text-xs py-3 justify-center gap-2 font-mono font-semibold"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#111210] border-t-transparent rounded-full animate-spin"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    {t("auth.signInAs", { role: selectedRole === "creator" ? t("nav.creator") : t("nav.brand") })}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Registration Options */}
            <div className="pt-2 text-center text-xs text-[#AAA99F]">
              <span>{t("auth.noAccount")} </span>
              {selectedRole === "creator" ? (
                <Link
                  href="/register/creator"
                  className="text-[#D5AD52] font-semibold hover:underline font-mono"
                >
                  {t("auth.registerAsCreator")}
                </Link>
              ) : (
                <Link
                  href="/register/brand"
                  className="text-[#D5AD52] font-semibold hover:underline font-mono"
                >
                  {t("auth.registerAsBrand")}
                </Link>
              )}
            </div>
          </div>

          {/* Discreet Admin Sign In Link */}
          <div className="pt-6 border-t border-[#282A24] flex items-center justify-between text-xs font-mono text-[#76756D]">
            <span className="text-[11px]">ReelForge Enterprise Security</span>
            <Link
              href="/admin/login"
              className="text-[#AAA99F] hover:text-[#D5AD52] transition-colors flex items-center gap-1.5 text-[11px]"
            >
              <Lock className="w-3 h-3 text-[#D5AD52]" />
              {t("auth.adminPortal")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090C]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
