"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please provide a valid account email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      setSuccessMessage(
        data.message ||
          "If an account exists for this email address, password reset instructions have been dispatched."
      );
    } catch (err: any) {
      setSuccessMessage(
        "If an account exists for this email address, password reset instructions have been dispatched."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#282A24] bg-[#191A17] p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2 border-b border-[#282A24] pb-6">
          <div className="w-12 h-12 rounded-xl bg-[#20211D] border border-[#282A24] mx-auto flex items-center justify-center text-[#D5AD52]">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F0E8] font-display">
            Reset Account Password
          </h1>
          <p className="text-[#AAA99F] text-xs max-w-xs mx-auto leading-relaxed">
            Enter the email associated with your Creator or Brand workspace to receive password recovery instructions.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="bg-[#B84A4A]/10 border border-[#B84A4A]/30 text-[#E57373] px-4 py-3 rounded-lg text-xs font-mono flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4">
            <div className="bg-[#3E895B]/10 border border-[#3E895B]/30 text-[#6BCB8B] p-4 rounded-xl text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#3E895B]" /> Request Registered
              </div>
              <p className="text-[#AAA99F] leading-relaxed">{successMessage}</p>
            </div>

            <Link
              href="/login"
              className="w-full btn-primary text-xs py-2.5 justify-center font-mono block text-center"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="font-mono text-xs text-[#AAA99F] block">
                Account Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#111210] border border-[#282A24] rounded-lg px-3.5 py-2.5 text-xs text-[#F3F0E8] placeholder:text-[#76756D] focus:outline-none focus:border-[#D5AD52] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary text-xs py-3 justify-center gap-2 font-mono font-semibold"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#111210] border-t-transparent rounded-full animate-spin"></span>
                  Processing Request...
                </>
              ) : (
                <>
                  Send Recovery Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#282A24] text-center text-xs text-[#AAA99F]">
          Remember your password?{" "}
          <Link href="/login" className="text-[#D5AD52] font-semibold hover:underline font-mono">
            Sign in here →
          </Link>
        </div>
      </div>
    </div>
  );
}
