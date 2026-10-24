import React from "react";

export type VerificationLevel = "platform_reviewed" | "proof_attached" | "self_declared";

interface VerificationBadgeProps {
  level: VerificationLevel;
  showTooltip?: boolean;
}

export function VerificationBadge({ level }: VerificationBadgeProps) {
  if (level === "platform_reviewed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#3E895B]/10 text-[#6BCB8B] border border-[#3E895B]/25">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3E895B]" />
        Verified Director
      </span>
    );
  }

  if (level === "proof_attached") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#C68A36]/10 text-[#E5A853] border border-[#C68A36]/25">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C68A36]" />
        Proof Attached
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#191A17] text-[#AAA99F] border border-[#282A24]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#76756D]" />
      Self Declared
    </span>
  );
}

