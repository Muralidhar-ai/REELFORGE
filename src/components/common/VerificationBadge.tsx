import React from "react";

export type VerificationLevel = "platform_reviewed" | "proof_attached" | "self_declared";

interface VerificationBadgeProps {
  level: VerificationLevel;
  showTooltip?: boolean;
}

export function VerificationBadge({ level }: VerificationBadgeProps) {
  if (level === "platform_reviewed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Verified Director
      </span>
    );
  }

  if (level === "proof_attached") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Proof Attached
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      Self Declared
    </span>
  );
}
