"use client";

import React, { useState, useRef, useId } from "react";
import { Lock, ShieldCheck } from "lucide-react";

interface PortfolioFrameProps {
  mediaUrl: string;
  altText: string;
  aspectRatio: string; // e.g. "9:16", "16:9", "1:1", "4:5"
  mediaType?: "image" | "video";
  className?: string;
  showBadge?: boolean;
  watermarked?: boolean;
  watermarkText?: string;
  brandName?: string;
  onUnlockClick?: () => void;
}

export function PortfolioFrame({
  mediaUrl,
  altText,
  aspectRatio,
  mediaType = "image",
  className = "",
  showBadge = true,
  watermarked = false,
  watermarkText = "REELFORGE PREVIEW",
  brandName,
  onUnlockClick,
}: PortfolioFrameProps) {
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const patternId = useId().replace(/:/g, "_");

  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case "9:16":
        return "aspect-[9/16]";
      case "16:9":
        return "aspect-[16/9]";
      case "1:1":
        return "aspect-square";
      case "4:5":
        return "aspect-[4/5]";
      case "3:4":
        return "aspect-[3/4]";
      default:
        return "aspect-square";
    }
  };

  const isVideoUrl = mediaType === "video" || mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".webm");

  const handleMouseEnter = () => {
    if (videoRef.current && isVideoUrl) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && isVideoUrl) {
      videoRef.current.pause();
    }
  };

  if (error || !mediaUrl) {
    return (
      <div
        className={`bg-[#191A17] border border-[#282A24] flex flex-col items-center justify-center p-3 text-center ${getAspectRatioClass(
          aspectRatio
        )} ${className}`}
        aria-label={altText}
      >
        <span className="font-mono text-xs text-[#AAA99F] font-medium">{altText || "Generative Render"}</span>
        <span className="font-mono text-[10px] text-[#76756D] mt-1">[{aspectRatio}]</span>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => {
        if (watermarked) {
          e.preventDefault();
        }
      }}
      className={`group relative overflow-hidden bg-[#111210] border rounded-xl select-none ${
        watermarked ? "border-[#E5A83B]/40 shadow-lg shadow-black/60" : "border-[#282A24]"
      } ${getAspectRatioClass(aspectRatio)} ${className}`}
    >
      {isVideoUrl ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          controls
          controlsList={watermarked ? "nodownload nofullscreen noplaybackrate" : undefined}
          disablePictureInPicture={watermarked}
          onContextMenu={(e) => watermarked && e.preventDefault()}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl}
          alt={altText}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          onError={() => setError(true)}
          onContextMenu={(e) => watermarked && e.preventDefault()}
          onDragStart={(e) => watermarked && e.preventDefault()}
        />
      )}

      {/* WATERMARK REPEATING DIAGONAL SVG OVERLAY */}
      {watermarked && (
        <>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id={`wm-pattern-${patternId}`}
                width="220"
                height="110"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-25)"
              >
                <text
                  x="15"
                  y="40"
                  fill="#FFFFFF"
                  fillOpacity="0.32"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                  letterSpacing="2"
                >
                  {watermarkText}
                </text>
                <text
                  x="20"
                  y="75"
                  fill="#E5A83B"
                  fillOpacity="0.4"
                  fontSize="8.5"
                  fontFamily="monospace"
                  letterSpacing="1"
                >
                  UNLICENSED DRAFT • DO NOT SHARE
                </text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#wm-pattern-${patternId})`} />
          </svg>

          {/* Centered Holographic Lock Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none select-none z-20">
            <div className="px-3.5 py-2 rounded-xl bg-black/75 backdrop-blur-md border border-[#E5A83B]/50 text-center shadow-2xl space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[#E5A83B] font-mono text-[11px] font-bold tracking-wider uppercase">
                <Lock className="w-3.5 h-3.5 text-[#E5A83B]" />
                <span>Protected Preview</span>
              </div>
              <p className="text-[9.5px] font-mono text-[#F8FAFC]/80 leading-tight">
                Payment required to unlock 4K clean master
              </p>
            </div>
          </div>

          {/* Top-Left Security Stamp */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs border border-[#E5A83B]/40 text-[9px] font-mono text-[#E5A83B] z-20 pointer-events-none select-none flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A83B] animate-pulse" />
            <span>WATERMARKED DRAFT</span>
          </div>

          {/* Bottom Security Fingerprint */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[8px] font-mono text-[#94A3B8]/90 bg-black/70 px-2 py-0.5 rounded border border-white/5 pointer-events-none select-none z-20">
            <span className="truncate">CLIENT: {brandName || "CONFIDENTIAL"}</span>
            <span className="text-[#E5A83B]">NOT FOR BROADCAST</span>
          </div>
        </>
      )}

      {/* Aspect Ratio Badge Overlay (Shown when clean or top right) */}
      {showBadge && !watermarked && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#111210]/85 backdrop-blur-xs border border-[#282A24] text-[10px] font-mono text-[#AAA99F] font-medium pointer-events-none">
          {aspectRatio}
        </div>
      )}

      {/* Clean Unlocked Badge when not watermarked */}
      {!watermarked && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#10B981]/20 backdrop-blur-xs border border-[#10B981]/40 text-[9px] font-mono text-[#34D399] z-10 pointer-events-none select-none flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#34D399]" />
          <span>CLEAN MASTER</span>
        </div>
      )}
    </div>
  );
}

