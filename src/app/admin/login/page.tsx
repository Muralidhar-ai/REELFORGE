"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginUser } = useRole();

  const [email, setEmail] = useState("admin@reelforge.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Administrative email and password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Administrative authentication failed. Access denied.");
      }

      loginUser(data.user);
      router.push("/admin");
    } catch (err: any) {
      setErrorMessage(err.message || "Access restricted. Administrative privileges required.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#282A24] bg-[#191A17] p-8 sm:p-10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 border-b border-[#282A24] pb-6">
          <div className="w-12 h-12 rounded-xl bg-[#20211D] border border-[#282A24] mx-auto flex items-center justify-center text-[#D5AD52]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono text-[10px] text-[#D5AD52] uppercase tracking-widest font-semibold">
              Restricted Operations Desk
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F3F0E8] font-display mt-1">
              Platform Administration
            </h1>
          </div>
          <p className="text-[#AAA99F] text-xs leading-relaxed max-w-xs mx-auto">
            Authorized personnel only. All access attempts, licence clearance actions, and contract overrides are logged.
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

        {/* Admin Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="font-mono text-xs text-[#AAA99F] block">
              Admin Work Identifier *
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@reelforge.com"
              className="w-full bg-[#111210] border border-[#282A24] rounded-lg px-3.5 py-2.5 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52] font-mono transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="font-mono text-xs text-[#AAA99F] block">
              Security Key / Password *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-[#111210] border border-[#282A24] rounded-lg px-3.5 py-2.5 pr-10 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52] font-mono transition-colors"
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

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@reelforge.com");
                setPassword("admin123");
              }}
              className="font-mono text-[11px] text-[#D5AD52] hover:underline"
            >
              Fill demo admin credentials
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary text-xs py-3 justify-center gap-2 font-mono font-semibold mt-4"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#111210] border-t-transparent rounded-full animate-spin"></span>
                Verifying Security Credentials...
              </>
            ) : (
              <>
                Authenticate Administrator
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-4 border-t border-[#282A24] text-center text-xs text-[#AAA99F]">
          <Link href="/login" className="text-[#AAA99F] hover:text-[#F3F0E8] transition-colors font-mono">
            ← Return to Public Workspace Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
