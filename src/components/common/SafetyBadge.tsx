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
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#C68A36]/10 text-[#E5A853] border border-[#C68A36]/25"
        title={cause}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#C68A36]" />
        <span className="truncate max-w-[180px]">{cause || "Audit Required"}</span>
      </span>
    );
  }

  if (status === "red") {
    return (
      <span
        data-testid="safety-badge"
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#B84A4A]/10 text-[#E57373] border border-[#B84A4A]/25"
        title={cause}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#B84A4A]" />
        <span className="truncate max-w-[180px]">{cause || "Licence Restricted"}</span>
      </span>
    );
  }

  return (
    <span
      data-testid="safety-badge"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#3E895B]/10 text-[#6BCB8B] border border-[#3E895B]/25"
      title={cause}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#3E895B]" />
      <span className="truncate max-w-[180px]">Paid Media Cleared</span>
    </span>
  );
}
