"use client";

import React, { useState, useRef } from "react";

interface PortfolioFrameProps {
  mediaUrl: string;
  altText: string;
  aspectRatio: string; // e.g. "9:16", "16:9", "1:1", "4:5"
  mediaType?: "image" | "video";
  className?: string;
  showBadge?: boolean;
}

export function PortfolioFrame({
  mediaUrl,
  altText,
  aspectRatio,
  mediaType = "image",
  className = "",
  showBadge = true,
}: PortfolioFrameProps) {
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
        className={`bg-[#151620] border border-slate-800 flex flex-col items-center justify-center p-3 text-center ${getAspectRatioClass(
          aspectRatio
        )} ${className}`}
        aria-label={altText}
      >
        <span className="font-mono text-xs text-slate-400 font-medium">{altText || "Generative Render"}</span>
        <span className="font-mono text-[10px] text-amber-300/80 mt-1">[{aspectRatio}]</span>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden bg-[#0C0D12] border border-slate-800 rounded-lg ${getAspectRatioClass(
        aspectRatio
      )} ${className}`}
    >
      {isVideoUrl ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          controls
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
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setError(true)}
        />
      )}

      {/* Aspect Ratio Badge Overlay */}
      {showBadge && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-amber-300 font-semibold pointer-events-none">
          {aspectRatio}
        </div>
      )}
    </div>
  );
}
