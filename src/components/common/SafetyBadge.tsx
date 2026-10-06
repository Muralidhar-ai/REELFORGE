import React from "react";

export type SafetyStatus = "green" | "amber" | "red";

interface SafetyBadgeProps {
  status: SafetyStatus;
  cause?: string;
}

export function SafetyBadge({ status, cause }: SafetyBadgeProps) {
  if (status === "amber") {
    return (
      <span
        data-testid="safety-badge"
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
        title={cause}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span className="truncate max-w-[180px]">{cause || "Audit Required"}</span>
      </span>
    );
  }

  if (status === "red") {
    return (
      <span
        data-testid="safety-badge"
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
        title={cause}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        <span className="truncate max-w-[180px]">{cause || "Licence Restricted"}</span>
      </span>
    );
  }

  return (
    <span
      data-testid="safety-badge"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
      title={cause}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span className="truncate max-w-[180px]">Paid Media Cleared</span>
    </span>
  );
}
