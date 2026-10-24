"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Briefcase, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterBrandPage() {
  const router = useRouter();
  const { loginUser } = useRole();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !companyName.trim() || !email.trim() || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the ReelForge Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "brand",
          name: name.trim(),
          companyName: companyName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      loginUser(data.user);
      router.push(data.redirectUrl || "/briefs/new");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#282A24] bg-[#191A17] p-8 sm:p-10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="space-y-2 border-b border-[#282A24] pb-5">
          <div className="flex items-center gap-2 font-mono text-xs text-[#D5AD52] font-semibold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" /> Brand & Agency Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F0E8] font-display">
            Create your Brand Workspace
          </h1>
          <p className="text-[#AAA99F] text-xs sm:text-sm">
            Post commercial AI briefs, discover verified filmmakers, audit tool subscription provenance, and approve deliverables.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            role="alert"
            className="bg-[#B84A4A]/10 border border-[#B84A4A]/30 text-[#E57373] px-4 py-3 rounded-lg text-xs font-mono flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="name" className="font-mono text-xs text-[#AAA99F] block">
                Primary Contact Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full bg-[#111210] border border-[#282A24] rounded-lg px-3.5 py-2.5 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="company" className="font-mono text-xs text-[#AAA99F] block">
                Company / Agency Name *
              </label>
              <input
                id="company"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Zenith Media Labs"
                className="w-full bg-[#111210] border border-[#282A24] rounded-lg px-3.5 py-2.5 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="font-mono text-xs text-[#AAA99F] block">
              Corporate / Work Email Address *
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@zenithmedialabs.com"
              className="w-full bg-[#111210] border border-[#282A24] rounded-lg px-3.5 py-2.5 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="font-mono text-xs text-[#AAA99F] block">
              Password (6+ characters) *
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create secure password"
              className="w-full bg-[#111210] border border-[#282A24] rounded-lg px-3.5 py-2.5 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52] transition-colors"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-[#282A24] bg-[#111210] text-[#D5AD52] focus:ring-0"
              />
              <span className="text-xs text-[#AAA99F] leading-snug">
                I agree to the ReelForge{" "}
                <span className="text-[#D5AD52] underline">Commercial Enterprise Terms</span>,{" "}
                <span className="text-[#D5AD52] underline">Licensing Clearance Protocol</span>, and{" "}
                <span className="text-[#D5AD52] underline">Privacy Policy</span>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary text-xs py-3 justify-center gap-2 font-mono font-semibold mt-4"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#111210] border-t-transparent rounded-full animate-spin"></span>
                Setting Up Brand Workspace...
              </>
            ) : (
              <>
                Complete Brand Registration
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing account footer */}
        <div className="pt-4 border-t border-[#282A24] text-center text-xs text-[#AAA99F]">
          Already have an enterprise account?{" "}
          <Link href="/login" className="text-[#D5AD52] font-semibold hover:underline font-mono">
            Sign in here →
          </Link>
        </div>
      </div>
    </div>
  );
}
