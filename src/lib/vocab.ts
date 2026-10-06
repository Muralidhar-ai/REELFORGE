export const CONTENT_TYPES = [
  "video",
  "animation",
  "image",
  "motion_graphics",
  "audio_music",
  "3d",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const FORMATS = ["9:16", "16:9", "1:1", "4:5"] as const;
export type AspectRatioFormat = (typeof FORMATS)[number];

export const SKILLS = [
  "prompt engineering",
  "character consistency",
  "storyboarding",
  "video editing",
  "compositing",
  "color grading",
  "sound design",
  "upscaling",
  "lip sync",
  "motion control",
  "product visualization",
  "ComfyUI workflows",
] as const;
export type Skill = (typeof SKILLS)[number];

export const SPECIALIZATIONS = [
  "Product ads",
  "Short-form social",
  "Brand films",
  "Explainer animation",
  "Fashion & lifestyle",
  "Gaming & fantasy",
  "Music visuals",
] as const;
export type Specialization = (typeof SPECIALIZATIONS)[number];

export const TOOLS = [
  "Runway",
  "Kling",
  "Luma",
  "Pika",
  "Midjourney",
  "Stable Diffusion",
  "ComfyUI",
  "ElevenLabs",
  "After Effects",
  "DaVinci Resolve",
  "CapCut",
] as const;
export type Tool = (typeof TOOLS)[number];

export const STYLE_TAGS = [
  "cinematic",
  "claymation",
  "3d render",
  "anime",
  "photoreal",
  "pastel",
  "neon",
  "minimal",
  "retro",
  "hand-drawn",
  "surreal",
  "documentary",
  "luxury",
  "playful",
] as const;
export type StyleTag = (typeof STYLE_TAGS)[number];

export const USAGE_RIGHTS = [
  "organic_social",
  "paid_ads",
  "broadcast_tv",
  "in_store_digital",
  "website",
] as const;
export type UsageRight = (typeof USAGE_RIGHTS)[number];

export const LICENSE_STATUS = ["allowed", "restricted", "not_allowed", "unknown"] as const;
export type LicenseStatus = (typeof LICENSE_STATUS)[number];

export const PLATFORM_PRESETS = [
  { id: "instagram_reel", label: "Instagram Reel", format: "9:16", defaultDurationSec: 15 },
  { id: "youtube_short", label: "YouTube Short", format: "9:16", defaultDurationSec: 30 },
  { id: "youtube_video", label: "YouTube video", format: "16:9", defaultDurationSec: 60 },
  { id: "instagram_feed", label: "Instagram feed post", format: "4:5", defaultDurationSec: undefined },
  { id: "square_social", label: "Square social post", format: "1:1", defaultDurationSec: undefined },
  { id: "website_hero", label: "Website hero banner", format: "16:9", defaultDurationSec: 10 },
] as const;
export type PlatformPresetId = (typeof PLATFORM_PRESETS)[number]["id"];
